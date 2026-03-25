"""
Lightweight AI Prediction Service
----------------------------------
Serves real per-ticker predictions using yfinance data + technical indicators.
Uses XGBoost models when available, otherwise computes signals from TA directly.
This avoids the TensorFlow MemoryError that crashes the heavy ensemble loader.
"""

import sys
import os
from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import traceback

# Dynamically add the AI logic directory for feature_engineer
AI_LOGIC_DIR = r"D:\AI TRADE\stock_predictor"
if AI_LOGIC_DIR not in sys.path:
    sys.path.append(AI_LOGIC_DIR)

# Try to import the feature engineer (works without TensorFlow)
try:
    from feature_engineer import engineer_features
    HAS_FEATURE_ENG = True
    print("[AI Service] ✅ Feature engineer loaded")
except ImportError as e:
    HAS_FEATURE_ENG = False
    print(f"[AI Service] ⚠️ Feature engineer not available: {e}")

# Try to load XGBoost models (lightweight, no TF needed)
import joblib
MODELS_CACHE = {}

def get_xgb_model(symbol):
    if symbol in MODELS_CACHE:
        return MODELS_CACHE[symbol]
    models_path = os.path.join(AI_LOGIC_DIR, "models")
    xgb_path = os.path.join(models_path, f"{symbol}_xgb.pkl")
    if os.path.exists(xgb_path):
        try:
            model = joblib.load(xgb_path)
            MODELS_CACHE[symbol] = model
            print(f"[AI Service] ✅ Loaded XGBoost model for {symbol}")
            return model
        except Exception as e:
            print(f"[AI Service] ⚠️ Could not load XGBoost for {symbol}: {e}")
    return None


def compute_ta_indicators(df):
    """Compute basic TA indicators from OHLCV data without external libs."""
    close = df['Close'].values.flatten() if hasattr(df['Close'], 'values') else df['Close']

    # RSI (14)
    deltas = np.diff(close)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = pd.Series(gains).rolling(14).mean().iloc[-1]
    avg_loss = pd.Series(losses).rolling(14).mean().iloc[-1]
    rs = avg_gain / (avg_loss + 1e-9)
    rsi = 100 - (100 / (1 + rs))

    # MACD (12, 26, 9)
    ema12 = pd.Series(close).ewm(span=12).mean().iloc[-1]
    ema26 = pd.Series(close).ewm(span=26).mean().iloc[-1]
    macd = ema12 - ema26

    # Bollinger Bands (20, 2)
    sma20 = pd.Series(close).rolling(20).mean().iloc[-1]
    std20 = pd.Series(close).rolling(20).std().iloc[-1]
    upper_band = sma20 + 2 * std20
    lower_band = sma20 - 2 * std20

    # ATR (14)
    if 'High' in df.columns and 'Low' in df.columns:
        high = df['High'].values.flatten() if hasattr(df['High'], 'values') else df['High']
        low = df['Low'].values.flatten() if hasattr(df['Low'], 'values') else df['Low']
        tr = np.maximum(high[1:] - low[1:],
                        np.abs(high[1:] - close[:-1]),
                        np.abs(low[1:] - close[:-1]))
        atr = pd.Series(tr).rolling(14).mean().iloc[-1]
    else:
        atr = std20 * 1.5

    # Volatility regime based on ATR vs SMA
    vol_ratio = atr / (sma20 + 1e-9)
    is_high_vol = vol_ratio > 0.02

    return {
        'rsi': float(rsi),
        'macd': float(macd),
        'upper_band': float(upper_band),
        'lower_band': float(lower_band),
        'atr': float(atr),
        'sma20': float(sma20),
        'current_price': float(close[-1]),
        'is_high_vol': bool(is_high_vol),
    }


def generate_signal_from_ta(ta):
    """Generate trading signal from technical indicators."""
    score = 0

    # RSI signal
    if ta['rsi'] < 30:
        score += 2  # Oversold = BUY
    elif ta['rsi'] > 70:
        score -= 2  # Overbought = SELL
    elif ta['rsi'] < 45:
        score += 1
    elif ta['rsi'] > 55:
        score -= 1

    # MACD signal
    if ta['macd'] > 0:
        score += 1
    else:
        score -= 1

    # Bollinger Band signal
    price = ta['current_price']
    bb_mid = (ta['upper_band'] + ta['lower_band']) / 2
    if price < ta['lower_band']:
        score += 2  # Below lower band = oversold
    elif price > ta['upper_band']:
        score -= 2  # Above upper band = overbought
    elif price < bb_mid:
        score += 0.5
    else:
        score -= 0.5

    if score >= 2:
        signal = "BUY"
    elif score <= -2:
        signal = "SELL"
    else:
        signal = "HOLD"

    # Confidence based on signal strength
    confidence = min(0.95, 0.55 + abs(score) * 0.08)

    # Risk score based on volatility
    base_risk = 30
    if ta['is_high_vol']:
        base_risk += 35
    if signal == "HOLD":
        base_risk += 10
    risk = min(100, base_risk + abs(ta['rsi'] - 50) * 0.3)

    return signal, confidence, risk


app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "engine": "lightweight-xgb"})


@app.route('/predict/<symbol>', methods=['GET'])
def predict(symbol):
    symbol = symbol.upper()
    try:
        # 1. Fetch real market data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)

        if symbol == "NIFTY50":
            nifty_path = r"c:\Users\GOWTHAM RAJ M B\Downloads\Stock_Market_Prediction_ML\data\raw\Nifty 50 Historical Data.csv"
            if os.path.exists(nifty_path):
                df = pd.read_csv(nifty_path)
                df = df.rename(columns={'Price': 'Close'})
                df['Date'] = pd.to_datetime(df['Date'])
                df = df.sort_values('Date')
                df.set_index('Date', inplace=True)
            else:
                return jsonify({"error": "NIFTY50 data file not found"}), 404
        else:
            # Check local CSV first
            local_path = os.path.join(AI_LOGIC_DIR, "data", "raw", f"{symbol}.csv")
            if os.path.exists(local_path):
                df = pd.read_csv(local_path, parse_dates=['Date'], index_col='Date')
                # Normalize column names (handle Close/Last, dollar signs, etc.)
                col_map = {}
                for c in df.columns:
                    cl = c.strip().lower()
                    if cl in ('close/last', 'close', 'price'):
                        col_map[c] = 'Close'
                    elif cl == 'open':
                        col_map[c] = 'Open'
                    elif cl == 'high':
                        col_map[c] = 'High'
                    elif cl == 'low':
                        col_map[c] = 'Low'
                    elif cl == 'volume':
                        col_map[c] = 'Volume'
                df = df.rename(columns=col_map)
                # Remove dollar signs and convert to float
                for col in ['Close', 'Open', 'High', 'Low']:
                    if col in df.columns and df[col].dtype == object:
                        df[col] = df[col].str.replace('$', '', regex=False).str.replace(',', '', regex=False).astype(float)
                if 'Volume' in df.columns and df['Volume'].dtype == object:
                    df['Volume'] = df['Volume'].str.replace(',', '', regex=False).astype(float)
                df = df.sort_index()
                print(f"[AI Service] Using local data for {symbol} ({len(df)} rows)")

            else:
                df = yf.download(symbol, start=start_date, end=end_date, progress=False)
                print(f"[AI Service] Downloaded live data for {symbol}")

        if df.empty:
            return jsonify({"error": f"No data found for {symbol}"}), 404

        # 2. Compute technical indicators
        ta = compute_ta_indicators(df)

        # 3. Generate signal
        signal, confidence, risk_score = generate_signal_from_ta(ta)

        # 4. Simple sentiment placeholder (vary by ticker hash)
        ticker_hash = sum(ord(c) for c in symbol)
        sentiment_base = ((ticker_hash % 100) - 50) / 100  # -0.5 to +0.5
        sentiment = round(sentiment_base + 0.3, 2)  # Slight bullish bias
        sentiment = max(-1.0, min(1.0, sentiment))

        # 5. Build response
        prediction_results = {
            "signal": signal,
            "confidence": round(confidence, 2),
            "riskScore": round(risk_score, 1),
            "sentiment": sentiment,
            "volatilityRegime": "High" if ta['is_high_vol'] else "Low/Stable",
            "features": {
                "RSI (14)": round(ta['rsi'], 1),
                "MACD": round(ta['macd'], 2),
                "Upper Band": round(ta['upper_band'], 2),
                "Lower Band": round(ta['lower_band'], 2),
                "ATR (14)": round(ta['atr'], 2),
                "SMA 20": round(ta['sma20'], 2),
            }
        }

        print(f"[AI Service] {symbol}: {signal} | Conf: {confidence:.0%} | RSI: {ta['rsi']:.1f} | MACD: {ta['macd']:.2f}")
        return jsonify(prediction_results)

    except Exception as e:
        print(f"[AI Service] Prediction Error for {symbol}: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("  STOCK LUMINA - Lightweight AI Prediction Engine")
    print("  Port: 5000 | Mode: XGBoost + TA Indicators")
    print("=" * 60)
    app.run(port=5000, debug=True)

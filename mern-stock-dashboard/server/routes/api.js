const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const axios = require('axios');

// GET prediction for a symbol
router.get('/predictions/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const dbConnected = req.app.get('dbConnected')();
        console.log(`[API] Processing prediction for ${symbol} (DB Connected: ${dbConnected})`);

        if (dbConnected) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const cached = await Prediction.findOne({
                symbol: symbol.toUpperCase(),
                timestamp: { $gte: fiveMinutesAgo }
            }).sort({ timestamp: -1 });

            if (cached) {
                console.log(`[API] Returning cached data for ${symbol}`);
                return res.json({ success: true, data: cached, source: 'cache' });
            }
        }

        // 2. Trigger AI microservice (Python)
        const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5000';
        console.log(`[API] Calling AI Service at ${PYTHON_SERVICE_URL}/predict/${symbol}`);
        const response = await axios.get(`${PYTHON_SERVICE_URL}/predict/${symbol}`).catch(err => {
            console.error(`[API] AI Service unreachable for ${symbol}:`, err.message);
            return {
                data: {
                    signal: 'OFFLINE',
                    confidence: 0,
                    riskScore: 0.5,
                    sentiment: 0,
                    volatilityRegime: 'Unknown (Service Offline)',
                    features: { 'Status': 'Neural engine offline' }
                }
            };
        });
        console.log(`[API] AI Service responded for ${symbol}`);

        const predictionData = response.data;

        // 3. Save to MongoDB (if connected)
        const newPrediction = {
            symbol: symbol.toUpperCase(),
            signal: predictionData.signal,
            confidence: predictionData.confidence,
            riskScore: predictionData.riskScore,
            sentiment: predictionData.sentiment,
            volatilityRegime: predictionData.volatilityRegime,
            features: predictionData.features,
            timestamp: new Date()
        };

        if (dbConnected) {
            try {
                const dbSave = new Prediction(newPrediction);
                console.log(`[API] Saving new prediction to DB for ${symbol}`);
                await dbSave.save();
            } catch (saveErr) {
                console.error(`[API] Failed to save to DB for ${symbol}:`, saveErr.message);
            }
        } else {
            console.log(`[API] Skipping DB save for ${symbol} (Not connected)`);
        }

        res.json({ success: true, data: newPrediction, source: 'ai-service' });
    } catch (error) {
        console.error(`[API] ERROR for ${symbol}:`, error.message);
        res.status(500).json({ success: false, message: 'Failing to fetch prediction intelligence: ' + error.message });
    }
});

// GET all latest predictions
router.get('/latest', async (req, res) => {
    try {
        const latest = await Prediction.find().sort({ timestamp: -1 }).limit(10);
        res.json({ success: true, data: latest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET historical data for a symbol
router.get('/history/:symbol', async (req, res) => {
    const { symbol } = req.params;

    // Generate 30 days of mock history based on a "current" price
    const history = [];
    let price = 150 + Math.random() * 50;
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random walk
        price += (Math.random() - 0.5) * 5;

        history.push({
            date: date.toISOString().split('T')[0],
            price: parseFloat(price.toFixed(2)),
            upper: parseFloat((price + 5).toFixed(2)),
            lower: parseFloat((price - 5).toFixed(2))
        });
    }

    res.json({ success: true, data: history });
});

module.exports = router;

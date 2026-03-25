const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Purchase = require('../models/Purchase');
const axios = require('axios');

// @route   POST api/portfolio
// @desc    Add a stock purchase
router.post('/', auth, async (req, res) => {
    const { symbol, quantity, buyPrice, date } = req.body;
    const dbConnected = req.app.get('dbConnected')();

    if (!dbConnected) {
        return res.json({
            _id: 'mock_purchase_' + Date.now(),
            userId: req.user.id,
            symbol,
            quantity,
            buyPrice,
            date,
            message: 'PREVIEW_MODE: Data not saved'
        });
    }

    try {
        const newPurchase = new Purchase({
            userId: req.user.id,
            symbol,
            quantity,
            buyPrice,
            date
        });
        const purchase = await newPurchase.save();
        res.json(purchase);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/portfolio
// @desc    Get user's portfolio with AI advice
router.get('/', auth, async (req, res) => {
    const dbConnected = req.app.get('dbConnected')();

    try {
        let purchases = [];
        if (dbConnected) {
            purchases = await Purchase.find({ userId: req.user.id }).sort({ date: -1 });
        } else {
            console.log('⚠️ DB Offline: Returning Mock Portfolio');
            purchases = [
                { _id: 'mock_1', symbol: 'AAPL', quantity: 10, buyPrice: 150, date: new Date() },
                { _id: 'mock_2', symbol: 'TSLA', quantity: 5, buyPrice: 200, date: new Date() }
            ];
        }

        const portfolioWithAdvice = await Promise.all(purchases.map(async (p) => {
            try {
                const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5000';
                const aiRes = await axios.get(`${PYTHON_SERVICE_URL}/predict/${p.symbol}`);
                const aiData = aiRes.data;

                const currentPrice = aiData.features['SMA 20'] || p.buyPrice;
                const profitLoss = (currentPrice - p.buyPrice) * p.quantity;
                const plPercentage = ((currentPrice - p.buyPrice) / p.buyPrice) * 100;

                let advice = "HOLD";
                if (aiData.signal === "SELL" || plPercentage > 20) {
                    advice = "SELL (TAKE PROFIT/CUT LOSS)";
                } else if (aiData.signal === "BUY" && plPercentage < -5) {
                    advice = "BUY MORE (AVG DOWN)";
                }

                const baseData = p._doc || p;

                return {
                    ...baseData,
                    currentPrice,
                    aiSignal: aiData.signal,
                    aiConfidence: aiData.confidence,
                    profitLoss,
                    plPercentage,
                    advice
                };
            } catch (aiErr) {
                return { ...(p._doc || p), advice: "AI Service Unavailable" };
            }
        }));

        res.json(portfolioWithAdvice);
    } catch (err) {
        console.error('Portfolio Error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/portfolio/:id
// @desc    Delete a purchase
router.delete('/:id', auth, async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

        if (purchase.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await purchase.deleteOne();
        res.json({ message: 'Purchase removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;

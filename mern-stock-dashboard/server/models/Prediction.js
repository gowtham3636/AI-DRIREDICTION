const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    symbol: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    signal: { type: String, enum: ['BUY', 'SELL', 'HOLD'], required: true },
    confidence: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    sentiment: { type: Number, required: true },
    volatilityRegime: { type: String, required: true },
    features: { type: Map, of: Number }, // To store 15+ indicators
    pipelineStatus: { type: String, default: 'completed' }
});

module.exports = mongoose.model('Prediction', PredictionSchema);

const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);

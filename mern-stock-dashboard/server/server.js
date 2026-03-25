const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Connection
let dbConnected = false;
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // 5 second timeout for local fallback
})
    .then(() => {
        dbConnected = true;
        console.log('✅ Connected to MongoDB Atlas');
    })
    .catch(err => {
        dbConnected = false;
        if (err.name === 'MongooseServerSelectionError') {
            console.error('❌ MongoDB Atlas Connection Error: Could not connect to any servers.');
            console.error('👉 TIP: Check if your current IP address is whitelisted in MongoDB Atlas Network Access.');
        } else {
            console.warn('⚠️ MongoDB Connection Error (Running in Local Fallback Mode):', err.message);
        }
    });

// Export dbConnected for routes
app.set('dbConnected', () => dbConnected);

app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        mongodb: dbConnected ? 'connected' : 'disconnected (Local Fallback Mode)',
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

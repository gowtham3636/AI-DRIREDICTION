const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Purchase = require('../models/Purchase');

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Administrative privileges required' });
    }
    next();
};

// @route   GET api/admin/users
// @desc    Get all users (Admin only)
router.get('/users', [auth, adminOnly], async (req, res) => {
    const dbConnected = req.app.get('dbConnected')();
    if (!dbConnected) {
        return res.json([
            { _id: 'guest_admin', username: 'Guest Admin', email: 'admin@system.local', role: 'admin' },
            { _id: 'guest_user', username: 'Guest Operator', email: 'operator@system.local', role: 'user' }
        ]);
    }

    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user and their portfolio (Admin only)
router.get('/users/delete/:id', [auth, adminOnly], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Don't allow deleting yourself
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Admins cannot delete their own accounts' });
        }

        // Delete user's purchases first
        await Purchase.deleteMany({ userId: req.params.id });
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User and associated data removed successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/stats
// @desc    Get system-wide stats (Admin only)
router.get('/stats', [auth, adminOnly], async (req, res) => {
    const dbConnected = req.app.get('dbConnected')();

    if (!dbConnected) {
        return res.json({
            totalUsers: 2,
            totalPurchases: 5,
            totalInvestment: 12500,
            systemStatus: 'Optimal (Local Fallback)',
            dbStatus: 'Local Fallback'
        });
    }

    try {
        const totalUsers = await User.countDocuments();
        const totalPurchases = await Purchase.countDocuments();

        // Simple aggregation for total volume if DB is connected
        const purchases = await Purchase.find();
        const totalInvestment = purchases.reduce((acc, curr) => acc + (curr.buyPrice * curr.quantity), 0);

        res.json({
            totalUsers,
            totalPurchases,
            totalInvestment,
            systemStatus: 'Optimal',
            dbStatus: 'Connected'
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;

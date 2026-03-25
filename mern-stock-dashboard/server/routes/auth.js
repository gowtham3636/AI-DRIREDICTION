const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    const dbConnected = req.app.get('dbConnected')();

    if (!dbConnected) {
        console.log('⚠️ DB Offline: Issuing emergency Guest Token for Registration');
        const payload = { user: { id: 'guest_id_' + Date.now(), role: role || 'user' } };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            res.json({ token, user: { id: payload.user.id, username: username || 'Guest', role: payload.user.role }, message: 'GUEST_MODE_ACTIVE' });
        });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ username, email, password, role });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
        });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).json({ message: 'Database error: ' + err.message });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const dbConnected = req.app.get('dbConnected')();

    if (!dbConnected) {
        console.log('⚠️ DB Offline: Issuing emergency Guest Token for Login');
        const payload = { user: { id: 'guest_id_login', role: 'user' } };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            res.json({ token, user: { id: payload.user.id, username: 'Guest Operator', role: payload.user.role }, message: 'GUEST_MODE_ACTIVE' });
        });
    }

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ message: 'Database error: ' + err.message });
    }
});

module.exports = router;

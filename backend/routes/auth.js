const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send OTP to email
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Generate OTP
        const otp = '123456'; // Fixed for testing
        // const otp = generateOTP();
        console.log('DEBUG OTP:', otp); // Temporary logging for testing
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Store OTP
        otpStorage.set(email, { otp, expiresAt });

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Vedic Astrology App - OTP Verification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Vedic Astrology App</h2>
                    <p>Your One-Time Password (OTP) for login is:</p>
                    <h1 style="color: #6366f1; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'OTP sent successfully to your email',
            expiresIn: 600 // 10 minutes in seconds
        });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        // Check if OTP exists
        const storedData = otpStorage.get(email);

        if (!storedData) {
            return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
        }

        // Check if OTP expired
        if (Date.now() > storedData.expiresAt) {
            otpStorage.delete(email);
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
        }

        // OTP verified successfully - delete it
        otpStorage.delete(email);

        // Check if user exists in database
        const user = await User.findOne({ email });

        res.json({
            success: true,
            message: 'OTP verified successfully',
            isNewUser: !user,
            email: email
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, name, phone, address } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        user = await User.create({
            email,
            name,
            phone: phone || '',
            address: address || '',
            authProvider: 'email'
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            },
            token: token
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register. Please try again.' });
    }
});

// Login existing user
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Fetch user from database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            },
            token: token
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to login. Please try again.' });
    }
});

// Clean up expired OTPs periodically
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStorage.entries()) {
        if (now > data.expiresAt) {
            otpStorage.delete(email);
        }
    }
}, 60000); // Clean up every minute

module.exports = router;

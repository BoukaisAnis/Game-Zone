const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Register page
router.get('/register', (req, res) => {
    res.render('register');
});

// Register handle
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, password2 } = req.body;
        
        // Validation
        if (password !== password2) {
            return res.render('register', { 
                error: 'Passwords do not match',
                username,
                email
            });
        }

        if (password.length < 6) {
            return res.render('register', {
                error: 'Password must be at least 6 characters',
                username,
                email
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.render('register', {
                error: 'User already exists with this email or username',
                username,
                email
            });
        }

        // Create user
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('register', { 
            error: 'Error creating account',
            ...req.body
        });
    }
});

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: false
    })(req, res, next);
});

// Logout handle
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
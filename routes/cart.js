const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Cart page
router.get('/', authMiddleware.ensureAuthenticated, (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.render('cart', {
        cart,
        total: total.toFixed(2),
        user: req.user
    });
});

// Add to cart
router.post('/add/:id', authMiddleware.ensureAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingItem = req.session.cart.find(item => item.id === req.params.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            req.session.cart.push({
                id: product._id.toString(),
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }

        res.json({ success: true, cartCount: req.session.cart.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error adding to cart' });
    }
});

// Remove from cart
router.post('/remove/:id', authMiddleware.ensureAuthenticated, (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id !== req.params.id);
    }
    res.redirect('/cart');
});

// Checkout
router.post('/checkout', authMiddleware.ensureAuthenticated, (req, res) => {
    // In a real application, you would process payment and update inventory here
    req.session.cart = [];
    res.render('checkout-success', { user: req.user });
});

module.exports = router;
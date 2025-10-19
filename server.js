const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'gaming-shop-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Initialize cart in session if it doesn't exist
app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sample products data
const sampleProducts = [
    {
        _id: '1',
        name: 'Call of Duty: Modern Warfare',
        description: 'Intense first-person shooter with realistic graphics and immersive gameplay',
        price: 59.99,
        category: 'Action',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7y.jpg',
        featured: true
    },
    {
        _id: '2',
        name: 'FIFA 2024',
        description: 'Latest football simulation with updated teams and enhanced gameplay',
        price: 49.99,
        category: 'Sports',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5x98.jpg',
        featured: false
    },
    {
        _id: '3',
        name: 'The Legend of Zelda: Tears of the Kingdom',
        description: 'Epic adventure in the kingdom of Hyrule with new abilities and story',
        price: 54.99,
        category: 'Adventure',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5x8v.jpg',
        featured: true
    },
    {
        _id: '4',
        name: 'Cyberpunk 2077: Phantom Liberty',
        description: 'Open-world RPG set in Night City with enhanced gameplay and story',
        price: 49.99,
        category: 'RPG',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6wxo.jpg',
        featured: true
    },
    {
        _id: '5',
        name: 'Minecraft Legends',
        description: 'Action strategy game set in the Minecraft universe',
        price: 39.99,
        category: 'Strategy',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5x8t.jpg',
        featured: false
    },
    {
        _id: '6',
        name: 'Starfield',
        description: 'Epic space exploration RPG from Bethesda Game Studios',
        price: 69.99,
        category: 'RPG',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4q8k.jpg',
        featured: true
    },
    {
        _id: '7',
        name: 'Spider-Man 2',
        description: 'Swing through NYC as both Peter Parker and Miles Morales',
        price: 59.99,
        category: 'Action',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6hx4.jpg',
        featured: true
    },
    {
        _id: '8',
        name: 'Baldur\'s Gate 3',
        description: 'Critically acclaimed RPG with deep storytelling and combat',
        price: 54.99,
        category: 'RPG',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4k7m.jpg',
        featured: true
    },
    {
        _id: '9',
        name: 'Forza Horizon 5',
        description: 'Open-world racing game set in beautiful Mexico',
        price: 49.99,
        category: 'Racing',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg',
        featured: false
    },
    {
        _id: '10',
        name: 'Resident Evil 4 Remake',
        description: 'Survival horror classic rebuilt from the ground up',
        price: 54.99,
        category: 'Horror',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5x8w.jpg',
        featured: true
    },
    {
        _id: '11',
        name: 'Super Mario Bros. Wonder',
        description: 'New 2D Mario adventure with wonder flowers and elephant power-up',
        price: 49.99,
        category: 'Platformer',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6hx8.jpg',
        featured: false
    },
    {
        _id: '12',
        name: 'Alan Wake 2',
        description: 'Survival horror with dual protagonist storyline',
        price: 54.99,
        category: 'Horror',
        image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6hx6.jpg',
        featured: true
    }
];

// Helper function to find product by ID
function findProductById(id) {
    return sampleProducts.find(product => product._id === id);
}

// Routes
app.get('/', (req, res) => {
    res.render('home', { 
        user: null,
        cartCount: req.session.cart.length
    });
});

app.get('/shop', (req, res) => {
    res.render('shop', { 
        products: sampleProducts,
        user: null,
        cartCount: req.session.cart.length
    });
});

app.get('/products/add', (req, res) => {
    res.render('add-product', { 
        user: null,
        cartCount: req.session.cart.length
    });
});

// Cart routes
app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.render('cart', {
        cart: cart,
        total: total.toFixed(2),
        user: null,
        cartCount: req.session.cart.length
    });
});

// Add to cart route
app.post('/cart/add/:id', (req, res) => {
    const productId = req.params.id;
    const product = findProductById(productId);
    
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check if product already in cart
    const existingItem = req.session.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        req.session.cart.push({
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }

    res.json({ 
        success: true, 
        cartCount: req.session.cart.length,
        message: `${product.name} added to cart!`
    });
});

// Remove from cart route
app.post('/cart/remove/:id', (req, res) => {
    const productId = req.params.id;
    req.session.cart = req.session.cart.filter(item => item.id !== productId);
    res.redirect('/cart');
});

// Checkout route
app.post('/cart/checkout', (req, res) => {
    req.session.cart = [];
    res.render('checkout-success', { 
        user: null,
        cartCount: 0
    });
});

app.get('/login', (req, res) => {
    res.render('login', { 
        user: null,
        cartCount: req.session.cart.length
    });
});

app.get('/register', (req, res) => {
    res.render('register', { 
        user: null,
        cartCount: req.session.cart.length
    });
});

// Checkout success page
app.get('/checkout-success', (req, res) => {
    res.render('checkout-success', { 
        user: null,
        cartCount: 0
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Gaming Shop running on http://localhost:${PORT}`);
    console.log('✅ Cart functionality is now working!');
});
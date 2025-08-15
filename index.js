import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cartRoutes from './routes/Cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import productRoutes from './routes/product.routes.js';
import productByCategoryRoutes from './routes/products.by.category.routes.js';
import searchProductsRoutes from './routes/search.products.routes.js'; // Import the search products routes
import wishlistRoutes from './routes/Wishlist.routes.js';

import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

dotenv.config()

// Security HTTP headers

const app = express();

app.use(helmet());

// Logging
app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

// Rate limiter (to protect from brute-force attacks)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

const allowedOrigins = [
    'http://localhost:5173',
    'https://hardayfunkeh-online-shopping.vercel.app',
];
// 'http://localhost:5174', 
// Configure CORS middleware
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow access
    } else {
        callback(new Error('Not allowed by CORS')); // Deny access
    }
},
    credentials: true,  // Allow cookies if needed
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
};
  
// Apply CORS middleware
app.use(cors(corsOptions));

// Immediately Invoked Async Function Expression (IIFE)
(async () => {
  try {
    // Wait for MongoDB to connect before continuing
    await connectDB();

    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1); // Exit if DB connection fails
  }
})();

app.get("/",(req, res,) => {
    res.send('Hello World');
});

app.use('/api/auth', userRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/products', productRoutes);
app.use('/api/products', productByCategoryRoutes);
app.use('/api/products/searchs', searchProductsRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use('/api/orders', orderRoutes);

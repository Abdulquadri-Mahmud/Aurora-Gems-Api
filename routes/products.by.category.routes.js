// 📁 routes/productRoutes.js
import express from 'express';
import { getProductsByCategory } from '../controller/get.products.by.category.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(auth); // Ensure authentication middleware is applied

// GET /api/products/category/:category
router.get('/category/:category', getProductsByCategory);

export default router;

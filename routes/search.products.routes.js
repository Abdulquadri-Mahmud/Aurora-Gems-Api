// routes/productRoutes.js
import express from 'express';
import { searchAndFilterProducts } from '../controller/search.products.controller.js';

const router = express.Router();

router.get('/search', searchAndFilterProducts);

export default router;

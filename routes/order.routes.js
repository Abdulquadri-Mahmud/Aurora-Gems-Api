// routes/orderRoutes.js
import express from 'express';
import { checkout } from '../controller/order.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/checkout', auth, checkout);

export default router;

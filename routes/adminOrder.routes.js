import express from 'express';
import auth from '../middleware/auth.middleware.js';
import isAdmin from '../middleware/role.middleware.js';
import { getAllOrders, getOrderById, getOrderStats, 
    updateOrderStatus } from '../controller/adminOrder.controller.js';



const router = express.Router();

// All admin routes protected
router.use(auth, isAdmin);

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/order-stats', getOrderStats); // dashboard

export default router;

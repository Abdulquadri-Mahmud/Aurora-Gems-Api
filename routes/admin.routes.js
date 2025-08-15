// routes/admin.routes.js
import express from 'express';
import isAdmin from '../middleware/role.middleware.js';
import { getAllUsers } from '../controller/admin.controller.js';
import auth from '../middleware/auth.middleware.js';
import { getAllOrders, getOrderById, getOrderStats, 
    updateOrderStatus } 
from '../controller/adminOrder.controller.js';

const router = express.Router();
router.use(auth, isAdmin);

router.get('/all-users', getAllUsers);

// All admin routes protected

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/order-stats', getOrderStats); // dashboard

export default router;

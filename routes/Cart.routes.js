import express from 'express';
import { addToCart, deleteCartItem, getUserCart, 
    updateCartItem } 
    from '../controller/cart.controler.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/add',auth, addToCart);
router.post('/get-cart', auth, getUserCart);
router.patch('/update-cart',auth, updateCartItem);
router.delete('/delete-cart',auth, deleteCartItem);

export default router;
import express from 'express';
import { addToWishList, getWishlist, removeFromWishlist 

} from '../controller/wishlist.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/add-wishlist',auth, addToWishList);
router.post('/get-wishlist', auth, getWishlist);
router.delete('/delete-wishlist', auth, removeFromWishlist);

export default router;
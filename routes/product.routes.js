import express from 'express';
import { createProduct, deleteProduct,
     getAllProducts, getProductById, 
     updateProduct 
} from '../controller/product.controller.js';
import isAdmin from '../middleware/role.middleware.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(auth, isAdmin);

router.post('/create', createProduct);           // Create

router.get('/all', getAllProducts);           // Read all
router.get('/single/:id', getProductById);        // Read single
router.patch('/update', updateProduct);         // Update
router.delete('/delete', deleteProduct);      // Delete

export default router;

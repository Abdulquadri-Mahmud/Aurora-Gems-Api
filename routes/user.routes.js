// routes/user.routes.js
import express from 'express';
import { forgotPassword, getProfile, 
    login, resetPassword, signup, verifyEmail, 
    verifyOtp
} from '../controller/user.controller.js';
import auth from '../middleware/auth.middleware.js';
import { verifyOTP } from '../controller/otp.verification.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/verify-otp', verifyOtp);

router.post('/login', login);
router.post('/verify-account', verifyOTP);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', auth, getProfile);

export default router;
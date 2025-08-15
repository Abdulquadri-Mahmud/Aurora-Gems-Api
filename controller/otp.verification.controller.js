import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // OTP is valid – clear it and issue JWT
    user.otp = null;
    user.otpExpires = null;
    await user.save();


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

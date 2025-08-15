import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../model/user.model.js';
import { sendMail } from '../config/mailer.js';

// In-memory token storage (or use DB in production)
let verificationTokens = new Map();

// 📧 Email Verification

export const verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    //Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //Set OTP expiry to 10 minutes from now
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendMail({
      to: email,
      subject: 'Verify Your Email - Aurora Gems',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center;">
              <div style="background-color: #319795; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Aurora Gems</h1>
              </div>
              <h2 style="color: #444;">Email Verification</h2>
              <p style="color: #666; font-size: 15px;">Use the OTP below to verify your email:</p>
              <div style="font-size: 32px; font-weight: bold; margin: 20px 0; color: #9C27B0;">
                ${otp}
              </div>
              <p style="color: #666;">This OTP will expire in 10 minutes.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #aaa; text-align: center;">
              &copy; ${new Date().getFullYear()} Aurora Gems. All rights reserved.
          </p>
        </div>
      </div>
      `
    });

    return res.json({ message: 'OTP sent to your email for verification' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send verification OTP', error: error.message });
  }
};

// Activate Email
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Check if OTP matches and is still valid
    if ( !user.otp || String(user.otp) !== String(otp) || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // 3. Set new password and clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: 'Email successfully verified' });

  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    //Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //Set OTP expiry to 10 minutes from now
    const otpExpires = Date.now() + 10 * 60 * 1000;

    //Save OTP to the user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    //Send OTP to email
    await sendMail({
      to: email,
      subject: 'Reset Your Password - Aurora Gems',
      html: `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <div style="background-color: #319795; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Aurora Gems</h1>
          </div>

          <div style="padding: 30px; color: #333;">
              <h2 style="color: #319795;">Reset Password OTP</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password. Use the OTP below to proceed:</p>

              <div style="text-align: center; font-size: 28px; font-weight: bold; color: #319795; margin: 20px 0;">
                  ${otp}
              </div>

              <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>

              <p>Thanks,<br/>The Aurora Gems Team</p>
          </div>

          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} Aurora Gems. All rights reserved.
          </div>
        </div>
      </div>
      `
    });

    return res.json({ message: 'OTP has been sent to your email' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
};


// Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    // 1. Find the user
    const user = await User.findOne({ email });

    console.log(user);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Check if OTP matches and is still valid
    if ( !user.otp || String(user.otp) !== String(otp) || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // 3. Set new password and clear OTP
    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};



// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// User signup controller
export const signup = async (req, res) => {
  const { firstname,lastname, email, password, phone, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    
    const existingPhoneNumber = await User.findOne({ phone });
    if (existingPhoneNumber) {
      return res.status(400).json({message: 'Phone number already exist!'});
    }
    const user = await User.create({ firstname, lastname, email, password, phone, role });

    res.status(201).json({
      message: 'Signup successful',
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// User login controller

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP and expiry time to DB
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Send OTP to user's email
    
    console.log("user info: ", user);
    console.log("user info: ", user.email);

    await sendMail({
      to: user.email,
      subject: 'Your Login OTP - Aurora Gems',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

            <div style="background-color: #319795; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Aurora Gems</h1>
            </div>

            <div style="padding: 30px; color: #333;">
              <h2 style="color: #319795;">Login Verification OTP</h2>
              <p>Hello,</p>
              <p>To continue logging into your account, please use the OTP code below. This code will expire in 10 minutes:</p>

              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #319795;">${otp}</p>
              </div>

              <p>If you didn’t try to log in, please ignore this message.</p>

              <p>Thanks,<br/>The Aurora Gems Team</p>
            </div>

            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} Aurora Gems. All rights reserved.
            </div>
          </div>
        </div>
      `
    });

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete login.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

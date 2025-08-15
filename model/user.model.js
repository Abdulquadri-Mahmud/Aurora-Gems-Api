// models/user.model.js
// Defines User schema with password hashing

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstname: {
        type: String, required: true 
    },
    lastname: {
        type: String, required: true 
    },
    phone: {
        type: String 
    },
    email: {
        type: String, required: true, unique: true 
    },
    password: {
        type: String, required: true 
    },
    role: {
        type: String, enum: ['user', 'admin'], default: 'user' 
    },
    isVerified: {
        type: Boolean, default: false 
    },
    // OTP for login verification
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },

}, { timestamps: true });

// Hash password before saving to DB
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare plain password with hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.model('User', userSchema);
export default User;

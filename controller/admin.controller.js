// controllers/admin.controller.js

import User from "../model/user.model.js";

// Admin-only: Get all users
export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

import mongoose from "mongoose";
import User from "../model/user.model.js";
import Cart from "../model/cart.model.js";

// ==================== Add to Cart ====================
export const addToCart = async (req, res) => {
  const { product } = req.body;

  const userId = req.user._id; // Get authenticated user from middleware

  // Validate input
  if (!product || !product.productId) {
    return res.status(400).json({ success: false, message: "Missing required product fields" });
  }

  try {
    // Confirm user exists (optional if already confirmed in middleware)
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId: new mongoose.Types.ObjectId(userId),
        products: [product],
      });
    } else {
      // Check if product already exists
      const alreadyExists = cart.products.some(
        (p) =>
          p.productId === product.productId &&
          p.selectedSize === product.selectedSize
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: 'Product already exists in cart',
        });
      }

      // Add new product to cart
      cart.products.push(product);
    }

    const saved = await cart.save();

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


export const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = await Cart.findOne({ userId }).populate(
      'userId',
      '-password -avatar -resetPasswordExpires -resetPasswordToken'
    );

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateCartItem = async (req, res) => {
  const { productId, quantity, selectedSize } = req.body;

  try {
    const userId = req.user._id;

    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.products.find(
      (item) => String(item.productId) === String(productId)
    );
    if (!item) return res.status(404).json({ success: false, message: "Product not found in cart" });

    if (quantity !== undefined) item.quantity = quantity;
    if (selectedSize !== undefined) item.selectedSize = selectedSize;

    const updated = await cart.save();

    if (!updated) return res.status(500).json({ success: false, message: "Failed to update cart" });

    res.status(200).json({ success: true, message: "Cart updated", cart: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteCartItem = async (req, res) => {
  const { productId, selectedSize } = req.body;

  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) =>
        !(String(item.productId) === String(productId) && item.selectedSize === selectedSize)
    );

    const updated = await cart.save();

    res.status(200).json({ success: true, message: "Item removed", cart: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

import User from "../model/user.model.js";
import WishList from "../model/wishlist.model.js";

export const addToWishList = async (req, res) => {
  const { product } = req.body;
  const userId = req.user._id;

  if (!product || !product.productId) {
    return res.status(400).json({ success: false, message: "Missing required product fields" });
  }

  try {
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let wishlist = await WishList.findOne({ userId });

    if (!wishlist) {
      wishlist = new WishList({
        userId,
        products: [product],
      });
    } else {
      const alreadyExists = wishlist.products.some(
        (p) =>
          p.productId === product.productId &&
          p.selectedSize === product.selectedSize
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist',
        });
      }

      wishlist.products.push(product);
    }

    const saved = await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: saved,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


// ==================== Get Wish List ====================
export const getWishlist = async (req, res) => {
  const userId = req.user._id;

  try {
    const wishlist = await WishList.findOne({ userId }).populate('userId', '-password -avatar');

    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    res.status(200).json({ success: true, wishlist });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};



// ==================== Remove From Wish List ====================
export const removeFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    const wishlist = await WishList.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    const initialLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      item => String(item.productId) !== String(productId)
    );

    if (wishlist.products.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    const updated = await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      wishlist: updated,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

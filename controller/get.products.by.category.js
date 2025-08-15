// 📁 controllers/productController.js

import productModel from "../model/product.model.js";

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const products = await productModel.find({ category });

    if (!products.length) {
      return res.status(404).json({ success: false, message: `No products found in ${category} category.` });
    }

    res.status(200).json({
      success: true,
      message: `Products in ${category} category fetched successfully.`,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error('Error fetching products by category:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

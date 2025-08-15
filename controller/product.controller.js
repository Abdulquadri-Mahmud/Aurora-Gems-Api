import productModel from "../model/product.model.js";

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const { name, price, description,size,oldPrice, category, images, countInStock } = req.body;

    const product = await productModel.create({
      name,
      price,
      description,
      category,
      size,
      oldPrice,
      images,
      countInStock,
    });

    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
  }
};

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: err.message });
  }
};

// GET single product
export const getProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: err.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    // Destructure 'id' from the request body, and collect the rest as 'updates'
    const { id, ...updates } = req.body;

    // Check if 'id' was provided in the body
    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required in the body' });
    }

    // Attempt to find the product by ID and apply updates; return the new version (updated doc)
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,           // The ID of the product to update
      updates,      // The fields to update
      { new: true } // Option to return the updated document instead of the original
    );

    // If no product was found with the given ID, return a 404 response
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Respond with success and the updated product
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (err) {
    // Catch any errors and return a 500 server error response
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: err.message // Include the error message for debugging
    });
  }
};


// DELETE product
// 📁 controllers/productController.js
export const deleteProduct = async (req, res) => {
  const { id } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
  }
};

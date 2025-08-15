import productModel from "../model/product.model.js";

export const searchAndFilterProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      size,
      inStock,         // true or false
      hasOldPrice,     // true or false
      sortBy,          // e.g. 'newest', 'priceAsc', 'priceDesc'
    } = req.query;

    const query = {};

    // Keyword search in name or description
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by size (any of the sizes should match)
    if (size) {
      query.size = { $in: Array.isArray(size) ? size : [size] };
    }

    // Filter by countInStock > 0
    if (inStock === 'true') {
      query.countInStock = { $gt: 0 };
    }

    // Filter by whether oldPrice is set (discounted)
    if (hasOldPrice === 'true') {
      query.oldPrice = { $ne: null };
    }

    // Sorting options
    let sortOption = {};
    if (sortBy === 'newest') sortOption = { createdAt: -1 };
    else if (sortBy === 'priceAsc') sortOption = { price: 1 };
    else if (sortBy === 'priceDesc') sortOption = { price: -1 };

    // Find matching products
    const products = await productModel.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      message: 'Products retrieved',
      count: products.length,
      products,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

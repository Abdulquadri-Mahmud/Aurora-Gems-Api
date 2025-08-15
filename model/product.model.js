import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
    default: null, // Optional: to show discount comparison
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
  },
  size: {
    type: [String], // e.g., ['S', 'M', 'L', 'XL'] or shoe sizes
    default: [],
  },
  images: {
    type: [String], // array of image URLs
    default: [],
  },
  countInStock: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

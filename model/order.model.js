// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      image: [String],
    },
  ],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: {
    type: String,
    enum: ['pay_on_delivery', 'card'],
    default: 'pay_on_delivery',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  totalAmount: Number,
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending',
  },
    orderId: {
    type: String,
    required: true,
    unique: true
  }

}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);

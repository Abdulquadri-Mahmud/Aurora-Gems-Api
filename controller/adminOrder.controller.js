import { sendMail } from '../config/mailer.js';
import orderModel from '../model/order.model.js';
import User from '../model/user.model.js';

// GET all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 }).populate('userId', 'firstname lastname email');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// GET a specific order
export const getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id).populate('userId', 'firstname lastname email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Helper to generate email template
const getOrderStatusEmail = (user, order, status) => {
  const base = {
    to: user.email,
    subject: "",
    html: "",
  };

  const styledTemplate = (title, message, extra = "") => `
    <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; color: #333; background: #fff; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #eee;">
      <div style="background: linear-gradient(135deg, #319795, #319795); color: white; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Aurora Gems</h1>
        <p style="margin: 5px 0 0;">${title}</p>
      </div>
      <div style="padding: 20px;">
        <p>Hi <strong>${user.firstname}</strong>,</p>
        <p>${message}</p>
        <p style="margin: 20px 0;">Order ID: <strong style="color: #319795;">${order.orderId}</strong></p>
        ${extra}
        <p style="margin-top: 30px;">Thanks for choosing <strong>Aurora Gems</strong>! 💎</p>
        <p style="font-size: 13px; color: #777;">This is an automated message, do not reply directly.</p>
      </div>
      <div style="background: #f9f9f9; text-align: center; padding: 10px; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} Aurora Gems. All rights reserved.
      </div>
    </div>
  `;

  switch (status) {
    case "processing":
      base.subject = "🔄 Your Aurora Gems Order is Now Processing";
      base.html = styledTemplate(
        "Your Order is Processing",
        `We’ve received your order and it's currently being processed. We’ll notify you once it ships.`,
      );
      break;

    case "shipped":
      base.subject = "📦 Your Aurora Gems Order Has Been Shipped";
      base.html = styledTemplate(
        "Your Order Has Been Shipped 🚚",
        `Great news! Your order has been shipped and is on its way.`,
        `<p><strong>Estimated Delivery:</strong> 3–5 business days</p>`
      );
      break;

    case "delivered":
      base.subject = "🎁 Your Aurora Gems Order Has Been Delivered";
      base.html = styledTemplate(
        "Your Order Was Delivered",
        `We’re thrilled to inform you that your order has been delivered successfully. We hope you love your new purchase! 💖`,
      );
      break;

    case "cancelled":
      base.subject = "❌ Your Aurora Gems Order Was Cancelled";
      base.html = styledTemplate(
        "Order Cancelled",
        `Unfortunately, your order has been cancelled. If you believe this was in error or you need support, please contact us.`,
      );
      break;

    default:
      base.subject = "ℹ️ Aurora Gems - Order Status Update";
      base.html = styledTemplate(
        "Order Update",
        `The status of your order has been updated to: <strong>${status}</strong>.`,
      );
  }

  return base;
};


export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Update order status
    order.orderStatus = status;
    const updatedOrder = await order.save();

    // Get user
    const user = await User.findById(order.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Send status update email
    const emailPayload = getOrderStatusEmail(user, order, status);
    await sendMail(emailPayload);

    res.json({
      success: true,
      message: `Order status updated to "${status}" and notification sent`,
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// GET summary stats for dashboard
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const totalSales = await orderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const ordersByStatus = await orderModel.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalSales: totalSales[0]?.total || 0,
        ordersByStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

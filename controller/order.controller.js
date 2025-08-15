import { sendMail } from '../config/mailer.js';
import { getOrderStatusEmail } from '../config/orderStatusTemplate.js';
import orderModel from '../model/order.model.js';
import User from '../model/user.model.js';
// 1. Create order
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

export const checkout = async (req, res) => {
  const validation = orderSchema.validate(req.body);
  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error.details[0].message });
  }

  const { items, shippingInfo, totalAmount, paymentMethod, userId, orderId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existingOrder = await orderModel.findOne({ orderId });
    if (existingOrder) {
      return res.status(409).json({ success: false, message: 'Duplicate orderId' });
    }

    for (const item of items) {
      const product = await productModel.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Product unavailable: ${item.productId}` });
      }
    }

    const order = await orderModel.create({
      items,
      shippingInfo,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'pay_on_delivery' ? 'paid' : 'pending',
      orderStatus: paymentMethod === 'pay_on_delivery' ? 'pending' : 'initiated',
      userId,
      orderId,
    });

    if (paymentMethod === 'pay_on_delivery') {
      const emailContent = getOrderStatusEmail(user, order, 'pay_on_delivery');
      await sendMail(emailContent);
      return res.status(201).json({ success: true, message: 'Order created', order });
    } else {
      const paystackRes = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: user.email,
          amount: totalAmount * 100,
          metadata: {
            userId,
            orderId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Order created. Redirect user to payment.',
        authorization_url: paystackRes.data.data.authorization_url,
        order,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// 2. Verify Card Payment
export const verifyCardPayment = async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await orderModel.findOne({ orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.orderStatus = 'pending';
    await order.save();

    const user = await User.findById(order.userId);
    const emailContent = getOrderStatusEmail(user, order, 'paid');
    await sendMail(emailContent);

    res.json({ success: true, message: 'Payment verified and order confirmed', order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// 3. Admin updates order status (processing, shipped, delivered)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Prevent shipping if payment is not completed
    if (status === 'shipped' && order.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot ship unpaid order' });
    }

    order.orderStatus = status;
    await order.save();

    const user = await User.findById(order.userId);
    if (user) {
      const emailContent = getOrderStatusEmail(user, order, status);
      await sendMail(emailContent);
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

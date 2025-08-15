import { sendMail } from "../config/mailer";
import { getOrderStatusEmail } from "../config/orderStatusTemplate";
import User from "../model/user.model";

export const paystackWebhook = async (req, res) => {
  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference, metadata, status, channel } = event.data;
    const { orderId, userId } = metadata;

    try {
      const order = await orderModel.findOne({ orderId });
      if (!order || order.paymentStatus === 'paid') return res.status(200).send('Already processed');

      order.paymentStatus = 'paid';
      order.orderStatus = 'pending';
      await order.save();

      await transactionModel.create({
        orderId,
        userId,
        reference, 
        status,
        channel,
      });

      const user = await User.findById(userId);
      const emailContent = getOrderStatusEmail(user, order, 'card_payment');
      await sendMail(emailContent);

      res.status(200).send('Webhook received');
    } catch (err) {
      console.error('Webhook error:', err.message);
      res.status(500).send('Server error');
    }
  } else {
    res.status(200).send('Unhandled event');
  }
};
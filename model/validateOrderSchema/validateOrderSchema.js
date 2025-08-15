import Joi from 'joi';

export const orderValidateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
    })
  ).required(),
  shippingInfo: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
  }).required(),
  totalAmount: Joi.number().min(1).required(),
  paymentMethod: Joi.string().valid('pay_on_delivery', 'card', 'transfer').required(),
  userId: Joi.string().required(),
  orderId: Joi.string().required(),
});

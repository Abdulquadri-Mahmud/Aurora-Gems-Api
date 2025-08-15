import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use any email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email
export const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Aurora Gems" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

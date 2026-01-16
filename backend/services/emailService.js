const nodemailer = require('nodemailer');

// Create transporter with SMTP settings
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER;

// Send email helper
const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Password Reset Email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🌱 AgriConnect</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Password Reset Request</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          You have requested to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AgriConnect. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, 'Password Reset - AgriConnect', html);
};

// Email Verification Email
const sendEmailVerificationEmail = async (email, name, verificationToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🌱 AgriConnect</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Welcome, ${name}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Thank you for signing up for AgriConnect. Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AgriConnect. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, 'Verify Your Email - AgriConnect', html);
};

// Welcome Email
const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🌱 Welcome to AgriConnect!</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${name}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Your email has been verified successfully. Thank you for joining AgriConnect. We're excited to have you as part of our agricultural community.
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Start exploring our marketplace and connect with farmers and merchants across Ethiopia.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" 
             style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Get Started
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AgriConnect. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, 'Welcome to AgriConnect!', html);
};

// Order Created Email - Sent to Farmer
const sendOrderCreatedEmail = async (order, farmer, merchant) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const orderUrl = `${process.env.FRONTEND_URL}/orders/${order._id}`;
  
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.productId?.nameEn || 'Product'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price?.toLocaleString() || 0} ETB</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🌱 AgriConnect</h1>
        <p style="color: white; margin: 10px 0 0 0;">New Order Received!</p>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${farmer.fullName}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Great news! You have received a new order from <strong>${merchant.fullName}</strong>.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 0 0 10px 0;"><strong>Buyer:</strong> ${merchant.fullName}</p>
          ${merchant.businessName ? `<p style="margin: 0 0 10px 0;"><strong>Business:</strong> ${merchant.businessName}</p>` : ''}
          ${order.deliveryAddress ? `<p style="margin: 0 0 10px 0;"><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>` : ''}
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #22c55e;">
            <p style="margin: 0; font-size: 20px; font-weight: bold; color: #22c55e; text-align: right;">
              Total: ${order.totalAmount?.toLocaleString() || 0} ETB
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${orderUrl}" 
             style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View Order Details
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Please review and confirm this order as soon as possible.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AgriConnect. Connecting Ethiopian Farmers with Markets.
        </p>
      </div>
    </div>
  `;

  return sendEmail(farmer.email, `New Order Received #${orderId} - AgriConnect`, html);
};

// Order Confirmation Email - Sent to Merchant (Buyer)
const sendOrderConfirmationEmail = async (order, merchant, farmer) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const orderUrl = `${process.env.FRONTEND_URL}/orders/${order._id}`;
  
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.productId?.nameEn || 'Product'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price?.toLocaleString() || 0} ETB</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🌱 AgriConnect</h1>
        <p style="color: white; margin: 10px 0 0 0;">Order Confirmation</p>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: #dcfce7; border-radius: 50%; padding: 15px;">
            <span style="font-size: 40px;">✓</span>
          </div>
        </div>
        
        <h2 style="color: #1f2937; text-align: center;">Thank you for your order!</h2>
        <p style="color: #4b5563; line-height: 1.6; text-align: center;">
          Hi ${merchant.fullName}, your order has been placed successfully!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 0 0 10px 0;"><strong>Seller:</strong> ${farmer.fullName}</p>
          ${farmer.farmName ? `<p style="margin: 0 0 10px 0;"><strong>Farm:</strong> ${farmer.farmName}</p>` : ''}
          <p style="margin: 0 0 10px 0;"><strong>Status:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px;">Pending</span></p>
          ${order.deliveryAddress ? `<p style="margin: 0 0 10px 0;"><strong>Delivery To:</strong> ${order.deliveryAddress}</p>` : ''}
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #22c55e;">
            <p style="margin: 0; font-size: 20px; font-weight: bold; color: #22c55e; text-align: right;">
              Total: ${order.totalAmount?.toLocaleString() || 0} ETB
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${orderUrl}" 
             style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Track Your Order
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          You will receive updates when the seller confirms and ships your order.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AgriConnect. Connecting Ethiopian Farmers with Markets.
        </p>
      </div>
    </div>
  `;

  return sendEmail(merchant.email, `Order Confirmed #${orderId} - AgriConnect`, html);
};

// Order Status Update Email
const sendOrderStatusUpdateEmail = async (order, merchant, newStatus) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const orderUrl = `${process.env.FRONTEND_URL}/orders/${order._id}`;
  
  const statusLabels = {
    pending: { label: 'Pending', color: '#fef3c7', textColor: '#92400e' },
    confirmed: { label: 'Confirmed', color: '#dbeafe', textColor: '#1e40af' },
    processing: { label: 'Processing', color: '#e0e7ff', textColor: '#3730a3' },
    shipped: { label: 'Shipped', color: '#cffafe', textColor: '#0e7490' },
    delivered: { label: 'Delivered', color: '#dcfce7', textColor: '#166534' },
    cancelled: { label: 'Cancelled', color: '#fee2e2', textColor: '#991b1b' }
  };
  
  const status = statusLabels[newStatus] || { label: newStatus, color: '#f3f4f6', textColor: '#374151' };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🌱 AgriConnect</h1>
        <p style="color: white; margin: 10px 0 0 0;">Order Update</p>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${merchant.fullName}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          Your order status has been updated.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0 0 15px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 0 0 10px 0; color: #6b7280;">New Status:</p>
          <span style="background: ${status.color}; color: ${status.textColor}; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 16px;">
            ${status.label}
          </span>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${orderUrl}" 
             style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View Order Details
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AgriConnect. Connecting Ethiopian Farmers with Markets.
        </p>
      </div>
    </div>
  `;

  return sendEmail(merchant.email, `Order #${orderId} Status: ${status.label} - AgriConnect`, html);
};

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendWelcomeEmail,
  sendOrderCreatedEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};

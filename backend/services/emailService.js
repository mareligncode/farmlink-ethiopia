const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const templates = {
  orderCreated: (order, recipient, language = 'en') => ({
    subject: language === 'am' ? 'አዲስ ትዕዛዝ ደርሷል - AgriConnect' : 'New Order Received - AgriConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .total { font-size: 24px; color: #2d6a4f; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgriConnect</h1>
            <p>${language === 'am' ? 'አዲስ ትዕዛዝ ደርሷል!' : 'New Order Received!'}</p>
          </div>
          <div class="content">
            <p>${language === 'am' ? 'ሰላም' : 'Hello'} ${recipient.name},</p>
            <p>${language === 'am' 
              ? 'አዲስ ትዕዛዝ ደርሶዎታል። እባክዎ ዝርዝሮቹን ይመልከቱ:' 
              : 'You have received a new order. Please review the details below:'}</p>
            
            <div class="order-details">
              <p><strong>${language === 'am' ? 'የትዕዛዝ ቁጥር' : 'Order ID'}:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
              <p><strong>${language === 'am' ? 'ንጥሎች ብዛት' : 'Items'}:</strong> ${order.items.length}</p>
              <p class="total">${language === 'am' ? 'ጠቅላላ' : 'Total'}: ${order.totalAmount.toLocaleString()} ${order.currency}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">
              ${language === 'am' ? 'ትዕዛዝ ይመልከቱ' : 'View Order'}
            </a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AgriConnect - ${language === 'am' ? 'የኢትዮጵያ ገበሬዎችን ከገበያ ጋር ማገናኘት' : 'Connecting Ethiopian Farmers with Markets'}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderStatusUpdate: (order, recipient, newStatus, language = 'en') => {
    const statusLabels = {
      pending: { en: 'Pending', am: 'በመጠባበቅ ላይ' },
      confirmed: { en: 'Confirmed', am: 'ተረጋግጧል' },
      processing: { en: 'Processing', am: 'በሂደት ላይ' },
      shipped: { en: 'Shipped', am: 'ተልኳል' },
      delivered: { en: 'Delivered', am: 'ደርሷል' },
      cancelled: { en: 'Cancelled', am: 'ተሰርዟል' },
    };

    const statusLabel = statusLabels[newStatus]?.[language] || newStatus;

    return {
      subject: language === 'am' 
        ? `የትዕዛዝ ሁኔታ ተዘምኗል: ${statusLabel} - AgriConnect` 
        : `Order Status Updated: ${statusLabel} - AgriConnect`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .status-badge { display: inline-block; padding: 8px 16px; background: #2d6a4f; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 AgriConnect</h1>
              <p>${language === 'am' ? 'የትዕዛዝ ዝመና' : 'Order Update'}</p>
            </div>
            <div class="content">
              <p>${language === 'am' ? 'ሰላም' : 'Hello'} ${recipient.name},</p>
              <p>${language === 'am' 
                ? 'የትዕዛዝዎ ሁኔታ ተዘምኗል:' 
                : 'Your order status has been updated:'}</p>
              
              <p><strong>${language === 'am' ? 'የትዕዛዝ ቁጥር' : 'Order ID'}:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
              <p><strong>${language === 'am' ? 'አዲስ ሁኔታ' : 'New Status'}:</strong></p>
              <span class="status-badge">${statusLabel}</span>
              
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">
                ${language === 'am' ? 'ትዕዛዝ ይከታተሉ' : 'Track Order'}
              </a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AgriConnect</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  passwordReset: (user, resetUrl, language = 'en') => ({
    subject: language === 'am' ? 'የይለፍ ቃል ዳግም ማስጀመር - AgriConnect' : 'Password Reset - AgriConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; margin-top: 15px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgriConnect</h1>
            <p>${language === 'am' ? 'የይለፍ ቃል ዳግም ማስጀመር' : 'Password Reset'}</p>
          </div>
          <div class="content">
            <p>${language === 'am' ? 'ሰላም' : 'Hello'} ${user.fullName},</p>
            <p>${language === 'am' 
              ? 'ለ AgriConnect መለያዎ የይለፍ ቃል ዳግም ማስጀመር ጠይቀዋል።' 
              : 'You requested a password reset for your AgriConnect account.'}</p>
            
            <a href="${resetUrl}" class="button">
              ${language === 'am' ? 'የይለፍ ቃል ቀይር' : 'Reset Password'}
            </a>
            
            <div class="warning">
              <p>${language === 'am' 
                ? 'ይህ ሊንክ በ1 ሰዓት ውስጥ ያበቃል። ይህንን ካልጠየቁ፣ እባክዎ ይህን ኢሜል ችላ ይበሉ።' 
                : 'This link will expire in 1 hour. If you did not request this, please ignore this email.'}</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AgriConnect</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcome: (user, language = 'en') => ({
    subject: language === 'am' ? 'ወደ AgriConnect እንኳን ደህና መጡ!' : 'Welcome to AgriConnect!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .features { display: grid; gap: 15px; margin: 20px 0; }
          .feature { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2d6a4f; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 8px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 AgriConnect</h1>
            <h2>${language === 'am' ? 'እንኳን ደህና መጡ!' : 'Welcome!'}</h2>
          </div>
          <div class="content">
            <p>${language === 'am' ? 'ሰላም' : 'Hello'} ${user.fullName},</p>
            <p>${language === 'am' 
              ? 'ወደ AgriConnect እንኳን ደህና መጡ! የኢትዮጵያ ገበሬዎችን ከገበያ ጋር የሚያገናኝ መድረክ።' 
              : 'Welcome to AgriConnect! The platform connecting Ethiopian farmers with markets.'}</p>
            
            <div class="features">
              <div class="feature">
                <strong>${language === 'am' ? '🌾 ምርቶችን ያስሱ' : '🌾 Browse Products'}</strong>
                <p>${language === 'am' ? 'ትኩስ ምርቶችን በቀጥታ ከገበሬዎች ያግኙ' : 'Find fresh produce directly from farmers'}</p>
              </div>
              <div class="feature">
                <strong>${language === 'am' ? '🔒 ደህንነቱ የተጠበቀ ክፍያ' : '🔒 Secure Payments'}</strong>
                <p>${language === 'am' ? 'ፈጣንና ደህንነቱ የተጠበቀ የክፍያ ሂደት' : 'Fast and secure payment processing'}</p>
              </div>
              <div class="feature">
                <strong>${language === 'am' ? '📦 ትዕዛዝ ክትትል' : '📦 Order Tracking'}</strong>
                <p>${language === 'am' ? 'ትዕዛዞችዎን በቀጥታ ይከታተሉ' : 'Track your orders in real-time'}</p>
              </div>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
              ${language === 'am' ? 'ጀምር' : 'Get Started'}
            </a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AgriConnect</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const { subject, html } = templates[template](data.order || data.user, data.recipient || data.user, data.status || data.resetUrl, data.language);

    const info = await transporter.sendMail({
      from: `"AgriConnect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
const sendOrderCreatedEmail = async (order, farmer, merchant) => {
  // Send to farmer
  if (farmer.email && farmer.notificationPreferences?.email !== false) {
    await sendEmail(farmer.email, 'orderCreated', {
      order,
      recipient: { name: farmer.fullName },
      language: farmer.languagePreference || 'en',
    });
  }
};

const sendOrderStatusUpdateEmail = async (order, merchant, newStatus) => {
  if (merchant.email && merchant.notificationPreferences?.orderUpdates !== false) {
    await sendEmail(merchant.email, 'orderStatusUpdate', {
      order,
      recipient: { name: merchant.fullName },
      status: newStatus,
      language: merchant.languagePreference || 'en',
    });
  }
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  await sendEmail(user.email, 'passwordReset', {
    user,
    resetUrl,
    language: user.languagePreference || 'en',
  });
};

const sendWelcomeEmail = async (user) => {
  await sendEmail(user.email, 'welcome', {
    user,
    language: user.languagePreference || 'en',
  });
};

module.exports = {
  sendEmail,
  sendOrderCreatedEmail,
  sendOrderStatusUpdateEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};

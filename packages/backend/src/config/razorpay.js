const Razorpay = require('razorpay');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  // Do not throw in dev to avoid crash when not configured; handlers will check
  // console.warn('Razorpay keys not configured');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'missing_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'missing_secret',
});

module.exports = razorpay;



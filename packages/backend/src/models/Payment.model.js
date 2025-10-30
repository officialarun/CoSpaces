const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  amountInINR: { type: Number, required: true },
  status: { type: String, enum: ['created', 'captured', 'failed'], default: 'captured' },
  gateway: { type: String, default: 'razorpay' },
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },
}, { timestamps: true });

paymentSchema.index({ project: 1, status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;



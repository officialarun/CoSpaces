const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Project = require('../models/Project.model');
const Payment = require('../models/Payment.model');
const AuditLog = require('../models/AuditLog.model');

exports.createOrder = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: 'Razorpay not configured' });
    }

    const userId = req.user?._id;
    let { projectId, amountInINR } = req.body;
    if (!projectId || amountInINR === undefined || amountInINR === null) {
      return res.status(400).json({ success: false, error: 'projectId and amountInINR are required' });
    }

    // Normalize amount (string -> number), disallow commas/units
    if (typeof amountInINR === 'string') {
      amountInINR = amountInINR.replace(/[,\s]/g, '');
    }
    const amountNum = Number(amountInINR);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amountInINR' });
    }

    // Validate projectId format to avoid cast errors
    const isValidId = typeof projectId === 'string' && projectId.match(/^[a-fA-F0-9]{24}$/);
    if (!isValidId) {
      return res.status(400).json({ success: false, error: 'Invalid projectId' });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    // Business validations: min/max/remaining/razorpay cap
    const minInv = Number(project.financials?.minimumInvestment || 0);
    if (minInv && amountNum < minInv) {
      return res.status(400).json({ success: false, error: `Amount below minimum investment (₹${minInv.toLocaleString()})` });
    }
    const maxInv = Number(project.financials?.maximumInvestment || 0);
    if (maxInv && amountNum > maxInv) {
      return res.status(400).json({ success: false, error: `Amount exceeds maximum investment (₹${maxInv.toLocaleString()})` });
    }

    // Remaining target (optional guard)
    try {
      const Subscription = require('../models/Subscription.model');
      const Payment = require('../models/Payment.model');
      const [subAgg, payAgg] = await Promise.all([
        Subscription.aggregate([
          { $match: { project: project._id, status: { $in: ['payment_confirmed', 'shares_allocated', 'completed'] } } },
          { $group: { _id: '$project', totalPaid: { $sum: { $ifNull: ['$paidAmount', 0] } } } }
        ]),
        Payment.aggregate([
          { $match: { project: project._id, status: 'captured' } },
          { $group: { _id: '$project', total: { $sum: { $ifNull: ['$amountInINR', 0] } } } }
        ])
      ]);
      const raisedSoFar = (subAgg?.[0]?.totalPaid || 0) + (payAgg?.[0]?.total || 0);
      const target = Number(project.financials?.targetRaise || 0);
      if (target && amountNum + raisedSoFar > target) {
        return res.status(400).json({ success: false, error: `Amount exceeds remaining target. Remaining: ₹${Math.max(0, target - raisedSoFar).toLocaleString()}` });
      }
    } catch (_) {}

    // Razorpay per order hard cap safeguard (approx 10L INR)
    const amountPaise = Math.round(amountNum * 100);
    if (amountPaise > 100000000) { // 100,000,000 paise = ₹10,00,000
      return res.status(400).json({ success: false, error: 'Amount exceeds gateway per-order limit (₹10,00,000)' });
    }

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `proj_${project.projectCode}_${Date.now()}`,
      notes: { projectId: project._id.toString(), userId: userId?.toString() || '' },
    };

    const order = await razorpay.orders.create(options);

    await AuditLog.logEvent({
      eventType: 'payment_order_created',
      eventCategory: 'payment',
      performedBy: userId,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'Razorpay order created',
      metadata: { orderId: order.id, amount: options.amount },
    });

    return res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID } });
  } catch (err) {
    // Return clearer error for debugging
    const msg = err?.error?.description || err?.message || 'Order create error';
    return res.status(500).json({ success: false, error: msg });
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: 'Razorpay not configured' });
    }
    const userId = req.user?._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId, amountInINR } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !projectId || !amountInINR) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const signPayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(signPayload).digest('hex');
    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    await AuditLog.logEvent({
      eventType: 'payment_confirmed',
      eventCategory: 'payment',
      performedBy: userId,
      targetEntity: { entityType: 'project', entityId: projectId },
      action: 'Razorpay payment verified',
      metadata: { razorpay_order_id, razorpay_payment_id, amountInINR },
    });

    // Record lightweight payment for funding progress
    await Payment.create({
      user: userId,
      project: projectId,
      amountInINR: Number(amountInINR),
      status: 'captured',
      gateway: 'razorpay',
      razorpay: { orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature },
    });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};



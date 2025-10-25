const SPV = require('../models/SPV.model');
const Subscription = require('../models/Subscription.model');

exports.handleDepositWebhook = async (req, res, next) => {
  try {
    const { transactionId, amount, spvId, subscriptionId } = req.body;
    
    // Verify webhook signature (implementation depends on payment gateway)
    // TODO: Verify webhook signature
    
    if (subscriptionId) {
      await Subscription.findByIdAndUpdate(subscriptionId, {
        $set: {
          'payment.escrowTransactionId': transactionId,
          'payment.escrowDepositDate': new Date(),
          status: 'payment_processing'
        }
      });
    }
    
    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    next(error);
  }
};

exports.getEscrowBalance = async (req, res, next) => {
  try {
    const spv = await SPV.findById(req.params.spvId);
    
    // In production, query escrow bank API
    const balance = {
      spvId: spv._id,
      spvName: spv.spvName,
      committedAmount: spv.fundraising.committedAmount,
      raisedAmount: spv.fundraising.raisedAmount,
      escrowAccount: spv.escrowAccount
    };
    
    res.json({ success: true, data: { balance } });
  } catch (error) {
    next(error);
  }
};

exports.releaseEscrow = async (req, res, next) => {
  try {
    const { spvId, amount, purpose, recipientDetails } = req.body;
    
    const spv = await SPV.findById(spvId);
    
    // Check conditions
    if (!spv.isMinimumRaiseAchieved()) {
      return res.status(400).json({ error: 'Minimum raise not achieved' });
    }
    
    // In production, call escrow bank API
    // const releaseResult = await escrowBankAPI.releaseEscrow(...)
    
    res.json({ success: true, message: 'Escrow release initiated' });
  } catch (error) {
    next(error);
  }
};

exports.refundEscrow = async (req, res, next) => {
  try {
    const { subscriptionId, reason } = req.body;
    
    const subscription = await Subscription.findById(subscriptionId);
    
    // In production, call escrow bank API for refund
    
    subscription.cancellation.refundStatus = 'initiated';
    await subscription.save();
    
    res.json({ success: true, message: 'Refund initiated' });
  } catch (error) {
    next(error);
  }
};

exports.getEscrowTransactions = async (req, res, next) => {
  try {
    const { spvId, page = 1, limit = 20 } = req.query;
    
    // In production, query escrow bank API or local transaction log
    const transactions = [];
    
    res.json({ success: true, data: { transactions } });
  } catch (error) {
    next(error);
  }
};


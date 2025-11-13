const Distribution = require('../models/Distribution.model');
const BankDetails = require('../models/BankDetails.model');
const Payment = require('../models/Payment.model');
const User = require('../models/User.model');
const csvGenerator = require('../services/csvGenerator.service');
const bankPaymentService = require('../services/bankPayment.service');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog.model');

/**
 * Process bulk payments via bank CSV
 * POST /api/v1/bank-payments/process-bulk
 */
exports.processBulkPayments = async (req, res, next) => {
  try {
    const { distributionId } = req.body;

    if (!distributionId) {
      return res.status(400).json({ error: 'Distribution ID is required' });
    }

    // Fetch distribution with populated investors
    const distribution = await Distribution.findById(distributionId)
      .populate('investorDistributions.investor', 'firstName lastName email')
      .populate('spv', 'spvName')
      .populate('project', 'projectName');

    if (!distribution) {
      return res.status(404).json({ error: 'Distribution not found' });
    }

    // Check if distribution is approved
    if (!distribution.areAllApprovalsGranted()) {
      return res.status(400).json({ 
        error: 'Distribution must be approved by all approvers before processing payments' 
      });
    }

    // Get pending investors
    const pendingInvestors = distribution.investorDistributions.filter(
      inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing'
    );

    if (pendingInvestors.length === 0) {
      return res.status(400).json({ error: 'No pending payments to process' });
    }

    // Fetch bank details for all investors
    const investorIds = pendingInvestors.map(inv => inv.investor._id || inv.investor);
    const bankDetailsArray = await BankDetails.find({
      user: { $in: investorIds },
      isActive: true
    }).select('+accountNumber'); // Include encrypted account number

    // Match bank details with investors
    const investorsWithBankDetails = pendingInvestors.map(inv => {
      const investor = inv.investor;
      const investorId = (investor._id || investor).toString();
      const bankDetails = bankDetailsArray.find(bd => bd.user.toString() === investorId);
      
      if (!bankDetails) {
        throw new Error(`Bank details not found for investor ${investorId}`);
      }

      return {
        investor: investor,
        netAmount: inv.netAmount,
        numberOfShares: inv.numberOfShares,
        ownershipPercentage: inv.ownershipPercentage,
        bankDetails: bankDetails
      };
    });

    // Generate CSV
    const csvContent = csvGenerator.generateBankPaymentCSV(distribution, bankDetailsArray);

    // Send to mock bank API
    const bankResponse = await bankPaymentService.sendBulkPaymentCSV(
      csvContent,
      investorsWithBankDetails
    );

    // Update payment statuses based on bank response
    const updatePromises = bankResponse.transactions.map(async (transaction) => {
      const investorId = transaction.investorId;
      const updateData = {
        'investorDistributions.$.paymentStatus': transaction.status === 'success' ? 'completed' : 'failed',
        'investorDistributions.$.processedAt': new Date(transaction.processedAt)
      };

      if (transaction.status === 'success') {
        updateData['investorDistributions.$.utr'] = transaction.utr;
        updateData['investorDistributions.$.transactionId'] = transaction.transactionId;
        updateData['investorDistributions.$.paymentDate'] = new Date(transaction.processedAt);
        updateData['investorDistributions.$.confirmationSent'] = true;
        updateData['investorDistributions.$.confirmationSentAt'] = new Date();
      } else {
        updateData['investorDistributions.$.paymentFailureReason'] = transaction.failureReason;
      }

      await Distribution.findOneAndUpdate(
        { 
          _id: distributionId, 
          'investorDistributions.investor': investorId 
        },
        { $set: updateData },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    // Check if all payments completed
    const updatedDistribution = await Distribution.findById(distributionId);
    const allCompleted = updatedDistribution.investorDistributions.every(
      inv => inv.paymentStatus === 'completed'
    );

    if (allCompleted) {
      updatedDistribution.status = 'completed';
      updatedDistribution.completedAt = new Date();
      await updatedDistribution.save();
    }

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'bulk_payment_processed',
      eventCategory: 'payment',
      performedBy: req.user._id,
      targetEntity: {
        entityType: 'distribution',
        entityId: distributionId
      },
      action: 'Bulk payments processed via bank',
      metadata: {
        batchId: bankResponse.batchId,
        totalTransactions: bankResponse.totalTransactions,
        successful: bankResponse.successfulTransactions,
        failed: bankResponse.failedTransactions
      }
    });

    logger.info(`Bulk payment processing completed for distribution ${distributionId}: ${bankResponse.successfulTransactions} successful, ${bankResponse.failedTransactions} failed`);

    res.json({
      success: true,
      message: `Processed ${bankResponse.totalTransactions} payments: ${bankResponse.successfulTransactions} successful, ${bankResponse.failedTransactions} failed`,
      data: {
        batchId: bankResponse.batchId,
        distribution: updatedDistribution,
        bankResponse: bankResponse
      }
    });
  } catch (error) {
    logger.error('Error processing bulk payments:', error);
    next(error);
  }
};

/**
 * Get transaction history for a user
 * GET /api/v1/bank-payments/history/:userId
 */
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Get investment payments (made by user)
    const investments = await Payment.find({
      user: userId,
      status: 'captured'
    })
      .populate('project', 'projectName projectCode')
      .sort({ createdAt: -1 });

    // Get distributions (received by user)
    const distributions = await Distribution.find({
      'investorDistributions.investor': userId
    })
      .populate('spv', 'spvName')
      .populate('project', 'projectName')
      .sort({ createdAt: -1 });

    // Format transactions
    const transactions = [];

    // Add investment payments
    investments.forEach(payment => {
      transactions.push({
        id: payment._id,
        type: 'investment',
        date: payment.createdAt,
        amount: payment.amountInINR,
        status: payment.status,
        reference: payment.razorpay?.paymentId || payment._id.toString(),
        project: payment.project?.projectName || 'N/A',
        description: `Investment in ${payment.project?.projectName || 'Project'}`
      });
    });

    // Add distribution payments
    distributions.forEach(distribution => {
      const investorDist = distribution.investorDistributions.find(
        inv => (inv.investor._id || inv.investor).toString() === userId.toString()
      );

      if (investorDist) {
        transactions.push({
          id: distribution._id,
          type: 'distribution',
          date: investorDist.paymentDate || distribution.createdAt,
          amount: investorDist.netAmount,
          status: investorDist.paymentStatus || 'pending',
          reference: investorDist.utr || investorDist.transactionId || distribution.distributionNumber,
          project: distribution.project?.projectName || distribution.spv?.spvName || 'N/A',
          description: `Distribution payment - ${distribution.distributionType?.replace(/_/g, ' ') || 'Payment'}`,
          distributionNumber: distribution.distributionNumber,
          utr: investorDist.utr,
          transactionId: investorDist.transactionId
        });
      }
    });

    // Sort by date (most recent first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        transactions: transactions,
        summary: {
          totalInvestments: investments.length,
          totalDistributions: distributions.length,
          totalInvested: investments.reduce((sum, p) => sum + (p.amountInINR || 0), 0),
          totalReceived: distributions.reduce((sum, d) => {
            const invDist = d.investorDistributions.find(
              inv => (inv.investor._id || inv.investor).toString() === userId.toString()
            );
            return sum + (invDist?.netAmount || 0);
          }, 0)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    next(error);
  }
};


/**
 * Mock Bank Payment Service
 * Simulates bank API for bulk payment processing
 */

const logger = require('../utils/logger');

/**
 * Mock bank API call to process bulk payments
 * @param {String} csvContent - CSV content with payment details
 * @param {Array} investors - Array of investor objects with their distribution data
 * @returns {Promise<Object>} Mock bank response
 */
exports.sendBulkPaymentCSV = async (csvContent, investors) => {
  // Simulate API delay (2-3 seconds)
  const delay = Math.random() * 1000 + 2000; // 2000-3000ms
  await new Promise(resolve => setTimeout(resolve, delay));

  logger.info(`Processing bulk payment for ${investors.length} investors`);

  // Generate batch ID
  const batchId = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Process each investor payment
  const transactions = investors.map((investor, index) => {
    const investorId = investor.investor._id || investor.investor;
    const netAmount = investor.netAmount || 0;

    // Randomly assign success/failure (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;

    // Simulate processing delay variation
    const processingDelay = index * 100; // Staggered processing

    if (isSuccess) {
      // Generate mock UTR (12 digits)
      const utr = `UTR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`.substring(0, 12);
      
      // Generate mock Transaction ID
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 11).toUpperCase()}`.substring(0, 16);

      return {
        investorId: investorId.toString(),
        status: 'success',
        utr: utr,
        transactionId: transactionId,
        amount: netAmount,
        processedAt: new Date(Date.now() + processingDelay).toISOString(),
        failureReason: null
      };
    } else {
      // Generate failure reasons
      const failureReasons = [
        'Invalid IFSC code',
        'Account number mismatch',
        'Insufficient balance in payer account',
        'Bank server timeout',
        'Invalid beneficiary details'
      ];
      const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

      return {
        investorId: investorId.toString(),
        status: 'failed',
        utr: null,
        transactionId: null,
        amount: netAmount,
        processedAt: new Date(Date.now() + processingDelay).toISOString(),
        failureReason: failureReason
      };
    }
  });

  // Calculate summary
  const successful = transactions.filter(t => t.status === 'success').length;
  const failed = transactions.filter(t => t.status === 'failed').length;

  logger.info(`Bank payment processing completed: ${successful} successful, ${failed} failed`);

  return {
    success: true,
    batchId: batchId,
    processedAt: new Date().toISOString(),
    totalTransactions: transactions.length,
    successfulTransactions: successful,
    failedTransactions: failed,
    transactions: transactions
  };
};

/**
 * Mock bank API call to check payment status
 * @param {String} batchId - Batch ID from previous request
 * @returns {Promise<Object>} Payment status
 */
exports.checkPaymentStatus = async (batchId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    batchId: batchId,
    status: 'completed',
    checkedAt: new Date().toISOString()
  };
};


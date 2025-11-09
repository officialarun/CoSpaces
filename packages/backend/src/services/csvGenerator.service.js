/**
 * CSV Generator Service
 * Generates CSV files for bank bulk payments
 */

/**
 * Generate CSV for bank bulk payment
 * @param {Object} distribution - Distribution object
 * @param {Array} bankDetailsArray - Array of bank details for each investor
 * @returns {String} CSV content
 */
exports.generateBankPaymentCSV = (distribution, bankDetailsArray) => {
  // CSV Headers
  const headers = [
    'Beneficiary Name',
    'Account Number',
    'IFSC Code',
    'Bank Name',
    'Branch Name',
    'Amount',
    'Payment Reference',
    'Remarks'
  ];

    // CSV Rows
    const rows = distribution.investorDistributions
      .filter(inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing')
      .map(inv => {
        const investor = inv.investor;
        const investorId = (investor._id || investor).toString();
        const bankDetails = bankDetailsArray.find(bd => 
          bd.user.toString() === investorId
        );

        if (!bankDetails) {
          throw new Error(`Bank details not found for investor ${investorId}`);
        }

        // Get account number (decrypted if available)
        let accountNumber = '';
        try {
          accountNumber = bankDetails.getDecryptedAccountNumber?.() || '';
          // If still empty or looks encrypted, try direct decrypt
          if (!accountNumber || accountNumber.length > 20) {
            const { decrypt } = require('../utils/encryption');
            accountNumber = decrypt(bankDetails.accountNumber) || '';
          }
        } catch (error) {
          // Silently handle decryption errors - continue without account number
          accountNumber = '';
        }

        return [
          `"${bankDetails.accountHolderName || (investor.firstName && investor.lastName ? `${investor.firstName} ${investor.lastName}` : investor.email || 'Investor')}"`,
          `"${accountNumber}"`,
          `"${bankDetails.ifscCode || ''}"`,
          `"${bankDetails.bankName || ''}"`,
          `"${bankDetails.branchName || ''}"`,
          `"${inv.netAmount?.toFixed(2) || '0.00'}"`,
          `"${distribution.distributionNumber}"`,
          `"Distribution payment - ${distribution.distributionType?.replace(/_/g, ' ') || 'Payment'}"`
        ];
      });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Generate payment summary CSV (for admin records)
 * @param {Object} distribution - Distribution object
 * @returns {String} CSV content
 */
exports.generatePaymentSummaryCSV = (distribution) => {
  const headers = [
    'Investor Name',
    'Investor Email',
    'Account Number',
    'IFSC Code',
    'Bank Name',
    'Net Amount',
    'Payment Status',
    'UTR',
    'Transaction ID',
    'Payment Date',
    'Remarks'
  ];

  const rows = distribution.investorDistributions.map(inv => {
    const investor = inv.investor;
    const bankAccount = inv.bankAccount || {};

    return [
      `"${investor?.firstName && investor?.lastName ? `${investor.firstName} ${investor.lastName}` : investor?.email || 'Investor'}"`,
      `"${investor?.email || ''}"`,
      `"${bankAccount.accountNumber ? `****${String(bankAccount.accountNumber).slice(-4)}` : ''}"`,
      `"${bankAccount.ifscCode || bankAccount.ifsc || ''}"`,
      `"${bankAccount.bankName || ''}"`,
      `"${inv.netAmount?.toFixed(2) || '0.00'}"`,
      `"${inv.paymentStatus || 'pending'}"`,
      `"${inv.utr || ''}"`,
      `"${inv.transactionId || ''}"`,
      `"${inv.paymentDate ? new Date(inv.paymentDate).toISOString().split('T')[0] : ''}"`,
      `"${distribution.distributionNumber}"`
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};


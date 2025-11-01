const Payment = require('../models/Payment.model');
const SPVEquityDistribution = require('../models/SPVEquityDistribution.model');
const ShareholderAgreement = require('../models/ShareholderAgreement.model');
const SPV = require('../models/SPV.model');
const Project = require('../models/Project.model');
const User = require('../models/User.model');
const pdfGenerator = require('../services/pdfGenerator.service');
const diditService = require('../services/didit.service');
const AuditLog = require('../models/AuditLog.model');
const logger = require('../utils/logger');

/**
 * Distribute equity among investors when SPV is assigned to project
 * @param {String} spvId - SPV ID
 * @param {String} projectId - Project ID
 * @param {String} performedBy - User ID who triggered the action (admin)
 * @returns {Promise<Object>} - Distribution results
 */
exports.distributeEquity = async (spvId, projectId, performedBy) => {
  try {
    logger.info(`Starting equity distribution for SPV ${spvId} and Project ${projectId}`);

    // Fetch SPV and Project
    const spv = await SPV.findById(spvId);
    const project = await Project.findById(projectId).populate('spv');

    if (!spv) {
      throw new Error('SPV not found');
    }
    if (!project) {
      throw new Error('Project not found');
    }

    // Fetch all payments for this project
    const payments = await Payment.find({
      project: projectId,
      status: 'captured'
    }).populate('user');

    if (payments.length === 0) {
      logger.warn(`No payments found for project ${projectId}`);
      return {
        success: true,
        message: 'No investors found for equity distribution',
        distributions: [],
        agreements: []
      };
    }

    // Calculate total investment
    const totalInvestment = payments.reduce((sum, payment) => {
      return sum + (payment.amountInINR || 0);
    }, 0);

    if (totalInvestment === 0) {
      throw new Error('Total investment is zero, cannot distribute equity');
    }

    logger.info(`Total investment pool: ₹${totalInvestment.toLocaleString()}`);

    // Get SPV share details
    const faceValuePerShare = spv.shareStructure?.faceValuePerShare || 10;
    const authorizedCapital = spv.shareStructure?.authorizedCapital || totalInvestment;

    // Group payments by investor to calculate per-investor totals
    const investorPayments = {};
    payments.forEach(payment => {
      const userId = payment.user._id.toString();
      if (!investorPayments[userId]) {
        investorPayments[userId] = {
          user: payment.user,
          totalAmount: 0,
          paymentIds: []
        };
      }
      investorPayments[userId].totalAmount += payment.amountInINR || 0;
      investorPayments[userId].paymentIds.push(payment._id);
    });

    const distributions = [];
    const agreements = [];

    // Create equity distribution for each investor
    for (const [userId, investorData] of Object.entries(investorPayments)) {
      const investmentAmount = investorData.totalAmount;
      const equityPercentage = (investmentAmount / totalInvestment) * 100;

      // Calculate number of shares
      // Assuming shares are calculated based on investment amount and face value
      const premiumPerShare = (investmentAmount / authorizedCapital) * faceValuePerShare - faceValuePerShare;
      const numberOfShares = Math.floor(investmentAmount / faceValuePerShare);

      logger.info(`Distributing equity for investor ${userId}:`, {
        investmentAmount,
        equityPercentage: equityPercentage.toFixed(2),
        numberOfShares
      });

      // Check if distribution already exists
      let distribution = await SPVEquityDistribution.findOne({
        spv: spvId,
        project: projectId,
        investor: userId
      });

      if (distribution) {
        // Update existing distribution
        distribution.investmentAmount = investmentAmount;
        distribution.equityPercentage = equityPercentage;
        distribution.numberOfShares = numberOfShares;
        distribution.premiumPerShare = premiumPerShare;
        distribution.totalInvestmentPool = totalInvestment;
        distribution.payments = investorData.paymentIds;
        await distribution.save();
      } else {
        // Create new distribution
        distribution = await SPVEquityDistribution.create({
          spv: spvId,
          project: projectId,
          investor: userId,
          investmentAmount,
          equityPercentage,
          numberOfShares,
          faceValuePerShare,
          premiumPerShare,
          totalInvestmentPool: totalInvestment,
          payments: investorData.paymentIds,
          status: 'distributed',
          createdBy: performedBy
        });
      }

      distributions.push(distribution);

      // Generate SHA document
      try {
        // Fetch full investor data
        const investor = await User.findById(userId).select('firstName lastName email entityName phone');

        // Generate PDF
        const pdfResult = await pdfGenerator.generateShareholderAgreement({
          investor,
          spv,
          project,
          investmentAmount,
          equityPercentage,
          numberOfShares,
          faceValuePerShare
        });

        // Check if agreement already exists
        let agreement = await ShareholderAgreement.findOne({
          spv: spvId,
          project: projectId,
          investor: userId
        });

        if (agreement) {
          // Update existing agreement with new PDF
          agreement.documentUrl = pdfResult.url;
          agreement.documentHash = pdfResult.hash;
          agreement.documentVersion += 1;
          agreement.status = 'generated';
          await agreement.save();
        } else {
          // Create new agreement
          agreement = await ShareholderAgreement.create({
            spv: spvId,
            project: projectId,
            investor: userId,
            equityDistribution: distribution._id,
            documentUrl: pdfResult.url,
            documentHash: pdfResult.hash,
            status: 'generated',
            generatedAt: new Date(),
            generatedBy: performedBy
          });
        }

        // Initiate eSign process
        try {
          const signerDetails = {
            name: investor.entityName || `${investor.firstName || ''} ${investor.lastName || ''}`.trim() || investor.email,
            email: investor.email,
            phone: investor.phone || ''
          };

          const eSignResult = await diditService.initiateESign(
            pdfResult.url,
            signerDetails,
            userId,
            {
              agreementId: agreement._id.toString(),
              projectId: projectId.toString(),
              spvId: spvId.toString()
            }
          );

          // Update agreement with eSign details
          agreement.eSign.diditRequestId = eSignResult.eSignRequestId;
          agreement.eSign.diditHash = eSignResult.hash;
          agreement.eSign.signingUrl = eSignResult.signingUrl;
          agreement.eSign.status = 'initiated';
          agreement.eSign.initiatedAt = new Date();
          agreement.eSign.expiredAt = eSignResult.expiresAt;
          agreement.eSign.signerDetails = signerDetails;
          agreement.status = 'pending_signature';
          await agreement.save();

          logger.info(`SHA eSign initiated for investor ${userId}`, {
            agreementId: agreement._id,
            eSignRequestId: eSignResult.eSignRequestId
          });

          // Log audit event
          await AuditLog.logEvent({
            eventType: 'sha_esign_initiated',
            eventCategory: 'document',
            performedBy: performedBy,
            targetEntity: {
              entityType: 'shareholder_agreement',
              entityId: agreement._id
            },
            action: 'SHA eSign initiated',
            metadata: {
              investorId: userId,
              spvId: spvId.toString(),
              projectId: projectId.toString(),
              eSignRequestId: eSignResult.eSignRequestId
            }
          });

          agreements.push(agreement);
        } catch (eSignError) {
          logger.error(`Failed to initiate eSign for investor ${userId}:`, eSignError);
          // Continue with other investors even if one fails
          agreement.eSign.status = 'failed';
          await agreement.save();
        }
      } catch (shaError) {
        logger.error(`Failed to generate SHA for investor ${userId}:`, shaError);
        // Continue with other investors
      }
    }

    // Log audit event for equity distribution
    await AuditLog.logEvent({
      eventType: 'equity_distributed',
      eventCategory: 'spv',
      performedBy: performedBy,
      targetEntity: {
        entityType: 'spv',
        entityId: spvId
      },
      action: 'Equity distributed among investors',
      metadata: {
        projectId: projectId.toString(),
        totalInvestors: distributions.length,
        totalInvestment: totalInvestment
      }
    });

    logger.info(`Equity distribution completed: ${distributions.length} investors, ${agreements.length} SHAs generated`);

    return {
      success: true,
      message: `Equity distributed to ${distributions.length} investors`,
      distributions,
      agreements,
      totalInvestment
    };
  } catch (error) {
    logger.error('Error distributing equity:', error);
    throw error;
  }
};

/**
 * Get equity distribution for a specific investor
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - Array of equity distributions
 */
exports.getInvestorEquity = async (userId) => {
  try {
    const distributions = await SPVEquityDistribution.find({
      investor: userId
    })
      .populate('spv', 'spvName spvCode registrationDetails')
      .populate('project', 'projectName projectCode')
      .sort({ distributionDate: -1 });

    return distributions;
  } catch (error) {
    logger.error('Error fetching investor equity:', error);
    throw error;
  }
};

/**
 * Get equity distribution for a specific SPV
 * @param {String} spvId - SPV ID
 * @returns {Promise<Array>} - Array of equity distributions
 */
exports.getSPVEquity = async (spvId) => {
  try {
    const distributions = await SPVEquityDistribution.find({
      spv: spvId
    })
      .populate('investor', 'firstName lastName email entityName')
      .populate('project', 'projectName projectCode')
      .sort({ equityPercentage: -1 });

    return distributions;
  } catch (error) {
    logger.error('Error fetching SPV equity:', error);
    throw error;
  }
};


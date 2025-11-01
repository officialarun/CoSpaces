const CapTable = require('../models/CapTable.model');
const Distribution = require('../models/Distribution.model');
const SPVEquityDistribution = require('../models/SPVEquityDistribution.model');
const SPV = require('../models/SPV.model');
const Project = require('../models/Project.model');
const User = require('../models/User.model');

exports.getTaxReport = async (req, res, next) => {
  try {
    const distributions = await Distribution.find({
      'investorDistributions.investor': req.params.userId
    }).populate('spv project');
    
    const taxReport = {
      userId: req.params.userId,
      financialYear: req.query.financialYear || new Date().getFullYear(),
      distributions: distributions.map(dist => {
        const investorDist = dist.investorDistributions.find(
          inv => inv.investor.toString() === req.params.userId
        );
        return {
          distributionNumber: dist.distributionNumber,
          spv: dist.spv.spvName,
          project: dist.project.projectName,
          grossAmount: investorDist.grossAmount,
          tdsAmount: investorDist.tdsAmount,
          netAmount: investorDist.netAmount,
          paymentDate: investorDist.paymentDate
        };
      })
    };
    
    res.json({ success: true, data: { taxReport } });
  } catch (error) {
    next(error);
  }
};

exports.getCapitalAccountStatement = async (req, res, next) => {
  try {
    const capTableEntries = await CapTable.find({
      shareholder: req.params.userId
    }).populate('spv', 'spvName');
    
    const statement = capTableEntries.map(entry => ({
      spv: entry.spv.spvName,
      numberOfShares: entry.numberOfShares,
      investmentAmount: entry.investmentAmount,
      capitalAccount: entry.capitalAccount,
      acquisitionDate: entry.acquisitionDate,
      status: entry.status
    }));
    
    res.json({ success: true, data: { statement } });
  } catch (error) {
    next(error);
  }
};

exports.getPortfolioReport = async (req, res, next) => {
  try {
    // Fetch equity distributions for the user (projects with assigned SPV)
    const equityDistributions = await SPVEquityDistribution.find({
      investor: req.user._id
    })
      .populate({
        path: 'spv',
        select: 'spvName spvCode project',
        populate: {
          path: 'project',
          select: 'projectName projectCode'
        }
      })
      .populate('project', 'projectName projectCode')
      .sort({ distributionDate: -1 });

    // Also fetch CapTable entries for backwards compatibility
    const capTableEntries = await CapTable.find({
      shareholder: req.user._id,
      status: 'active'
    }).populate('spv');
    
    const portfolio = {
      totalInvested: 0,
      totalDistributions: 0,
      activeInvestments: 0,
      investments: []
    };

    // Process equity distributions (preferred - for projects with SPV assigned)
    for (const distribution of equityDistributions) {
      // Only include if project has SPV assigned
      if (distribution.spv && distribution.spv.project) {
        portfolio.totalInvested += distribution.investmentAmount;
        
        // Get distributions received from CapTable if available
        const capEntry = capTableEntries.find(
          entry => entry.spv._id.toString() === distribution.spv._id.toString()
        );
        const distributionsReceived = capEntry?.totalDistributionsReceived || 0;
        portfolio.totalDistributions += distributionsReceived;

        portfolio.investments.push({
          spv: distribution.spv.spvName,
          spvId: distribution.spv._id,
          projectId: distribution.project._id,
          projectName: distribution.project.projectName,
          invested: distribution.investmentAmount,
          shares: distribution.numberOfShares,
          equityPercentage: distribution.equityPercentage,
          distributionsReceived: distributionsReceived,
          hasSPV: true
        });
        portfolio.activeInvestments++;
      }
    }

    // Process CapTable entries that don't have equity distribution (older entries or different structure)
    for (const entry of capTableEntries) {
      // Skip if already included from equity distributions
      const alreadyIncluded = portfolio.investments.some(
        inv => inv.spvId?.toString() === entry.spv._id.toString()
      );
      
      if (!alreadyIncluded) {
        portfolio.totalInvested += entry.investmentAmount;
        portfolio.totalDistributions += entry.totalDistributionsReceived;
        
        portfolio.investments.push({
          spv: entry.spv.spvName,
          spvId: entry.spv._id,
          projectId: entry.spv.project,
          invested: entry.investmentAmount,
          shares: entry.numberOfShares,
          equityPercentage: entry.ownershipPercentage || null, // Use ownershipPercentage from CapTable if available
          distributionsReceived: entry.totalDistributionsReceived,
          hasSPV: !!entry.spv.project
        });
        portfolio.activeInvestments++;
      }
    }
    
    res.json({ success: true, data: { portfolio } });
  } catch (error) {
    next(error);
  }
};

exports.getPlatformSummary = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalSPVs = await SPV.countDocuments();
    
    const spvs = await SPV.find({});
    const totalRaised = spvs.reduce((sum, spv) => sum + spv.fundraising.raisedAmount, 0);
    const totalInvestors = spvs.reduce((sum, spv) => sum + spv.fundraising.investorCount, 0);
    
    const summary = {
      users: totalUsers,
      projects: totalProjects,
      spvs: totalSPVs,
      totalRaised,
      totalInvestors
    };
    
    res.json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};

exports.getSPVSummary = async (req, res, next) => {
  try {
    const spv = await SPV.findById(req.params.spvId).populate('project');
    const capTable = await CapTable.find({ spv: req.params.spvId, status: 'active' });
    const distributions = await Distribution.find({ spv: req.params.spvId });
    
    const summary = {
      spv: {
        name: spv.spvName,
        status: spv.status,
        incorporationDate: spv.importantDates.incorporationDate
      },
      project: {
        name: spv.project.projectName,
        landValue: spv.project.financials.landValue
      },
      fundraising: {
        targetAmount: spv.fundraising.targetAmount,
        raisedAmount: spv.fundraising.raisedAmount,
        investorCount: spv.fundraising.investorCount,
        percentage: spv.fundraisingPercentage
      },
      distributions: {
        count: distributions.length,
        totalDistributed: distributions.reduce((sum, d) => sum + d.netDistributableAmount, 0)
      },
      capTable: {
        totalShares: capTable.reduce((sum, e) => sum + e.numberOfShares, 0),
        totalInvestment: capTable.reduce((sum, e) => sum + e.investmentAmount, 0)
      }
    };
    
    res.json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};


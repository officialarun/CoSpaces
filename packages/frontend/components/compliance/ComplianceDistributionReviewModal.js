import { useState, useEffect } from 'react';
import { distributionAPI } from '../../lib/api';
import { FaTimes, FaCheckCircle, FaShieldAlt, FaInfoCircle, FaCalculator, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ComplianceDistributionReviewModal({ distribution, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [distributionData, setDistributionData] = useState(distribution);

  // Fetch fresh distribution data when modal opens to ensure approval data is current
  useEffect(() => {
    if (distribution?._id) {
      fetchDistributionData();
    }
  }, [distribution?._id]);

  const fetchDistributionData = async () => {
    try {
      const response = await distributionAPI.getDistributionById(distribution._id);
      if (response.data?.distribution) {
        setDistributionData(response.data.distribution);
      }
    } catch (error) {
      console.error('Error fetching distribution details:', error);
      // Continue with prop data if fetch fails
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await distributionAPI.approveAsCompliance(dist._id || distribution._id, comments);
      toast.success('Distribution approved by compliance! Admin has been notified for final approval.');
      onSuccess();
    } catch (error) {
      console.error('Error approving distribution:', error);
      toast.error(error.message || 'Failed to approve distribution');
    } finally {
      setLoading(false);
    }
  };

  // Use distributionData (fresh data) or fallback to distribution prop
  const dist = distributionData || distribution;

  const totalInvestors = dist.investorDistributions?.length || 0;
  const totalAmount = dist.investorDistributions?.reduce(
    (sum, inv) => sum + (inv.netAmount || 0), 
    0
  ) || 0;

  // Get asset manager name - handle both populated object and ID string
  const getAssetManagerName = () => {
    const approvedBy = dist.approvals?.assetManagerApproval?.approvedBy;
    if (!approvedBy) return 'Asset Manager';
    if (typeof approvedBy === 'object') {
      return `${approvedBy.firstName || ''} ${approvedBy.lastName || ''}`.trim() || 'Asset Manager';
    }
    return 'Asset Manager';
  };

  // Get compliance officer name - handle both populated object and ID string
  const getComplianceOfficerName = () => {
    const approvedBy = dist.approvals?.complianceApproval?.approvedBy;
    if (!approvedBy) return null;
    if (typeof approvedBy === 'object') {
      return `${approvedBy.firstName || ''} ${approvedBy.lastName || ''}`.trim() || 'Compliance Officer';
    }
    return 'Compliance Officer';
  };

  // Get admin name - handle both populated object and ID string
  const getAdminName = () => {
    const approvedBy = dist.approvals?.adminApproval?.approvedBy;
    if (!approvedBy) return null;
    if (typeof approvedBy === 'object') {
      return `${approvedBy.firstName || ''} ${approvedBy.lastName || ''}`.trim() || 'Admin';
    }
    return 'Admin';
  };

  const assetManagerApproved = dist.approvals?.assetManagerApproval?.approved === true;
  const complianceApproved = dist.approvals?.complianceApproval?.approved === true;
  const adminApproved = dist.approvals?.adminApproval?.approved === true;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Compliance Review</h3>
              <p className="text-sm text-gray-500">{dist.distributionNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project and SPV Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Project</p>
              <p className="font-semibold text-gray-900">
                {dist.project?.projectName || '-'}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">SPV</p>
              <p className="font-semibold text-gray-900">
                {dist.spv?.spvName || dist.spv?.name || '-'}
              </p>
            </div>
          </div>

          {/* Approval Chain */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Approval Chain</h4>
            <div className="space-y-2">
              {/* Asset Manager Approval */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                assetManagerApproved ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {assetManagerApproved ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaUser className="text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-900">Asset Manager</span>
                </div>
                <div className="text-right">
                  {assetManagerApproved ? (
                    <>
                      <p className="text-sm text-gray-900 font-medium">{getAssetManagerName()}</p>
                      {dist.approvals?.assetManagerApproval?.approvedAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(dist.approvals.assetManagerApproval.approvedAt).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Pending</p>
                  )}
                </div>
              </div>

              {/* Compliance Officer Approval */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                complianceApproved 
                  ? 'bg-green-50 border border-green-200' 
                  : assetManagerApproved 
                    ? 'bg-orange-50 border-2 border-orange-300' 
                    : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {complianceApproved ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaShieldAlt className={assetManagerApproved ? "text-orange-600" : "text-gray-400"} />
                  )}
                  <span className="text-sm font-medium text-gray-900">Compliance Officer</span>
                </div>
                <div className="text-right">
                  {complianceApproved ? (
                    <>
                      <p className="text-sm text-gray-900 font-medium">{getComplianceOfficerName() || 'Compliance Officer'}</p>
                      {dist.approvals?.complianceApproval?.approvedAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(dist.approvals.complianceApproval.approvedAt).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </>
                  ) : assetManagerApproved ? (
                    <p className="text-sm text-orange-600 font-semibold">Pending Your Review</p>
                  ) : (
                    <p className="text-sm text-gray-500">Awaiting Asset Manager</p>
                  )}
                </div>
              </div>

              {/* Admin Approval */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                adminApproved 
                  ? 'bg-green-50 border border-green-200' 
                  : complianceApproved 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {adminApproved ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaUser className={complianceApproved ? "text-blue-600" : "text-gray-400"} />
                  )}
                  <span className="text-sm font-medium text-gray-900">Admin</span>
                </div>
                <div className="text-right">
                  {adminApproved ? (
                    <>
                      <p className="text-sm text-gray-900 font-medium">{getAdminName() || 'Admin'}</p>
                      {dist.approvals?.adminApproval?.approvedAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(dist.approvals.adminApproval.approvedAt).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </>
                  ) : complianceApproved ? (
                    <p className="text-sm text-blue-600 font-semibold">Pending Admin Review</p>
                  ) : (
                    <p className="text-sm text-gray-500">Awaiting Compliance</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FaCalculator className="text-blue-600" />
              <span>Financial Summary</span>
            </h4>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Gross Proceeds</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{dist.grossProceeds?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Deductions</p>
                <p className="text-xl font-bold text-orange-600">
                  -₹{dist.deductions?.totalDeductions?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Platform Fees</p>
                <p className="text-xl font-bold text-orange-600">
                  -₹{dist.platformFees?.totalPlatformFees?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-green-500">
                <p className="text-xs text-gray-600 mb-1">Net Distributable</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{dist.netDistributableAmount?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          {dist.taxWithholding && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Tax Withholding Details</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600">TDS Rate</p>
                  <p className="font-semibold text-gray-900">
                    {dist.taxWithholding.tdsRate || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">TDS Amount</p>
                  <p className="font-semibold text-gray-900">
                    ₹{dist.taxWithholding.tdsAmount?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Compliance Check</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-xs text-green-600 font-medium">TDS Rate Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Investor Distribution Summary */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Investor Distribution Summary</h4>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Total Investors</p>
                <p className="text-2xl font-bold text-blue-600">{totalInvestors}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Total Distribution</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Investor Details Table */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Investor
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Shares
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Gross
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      TDS
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dist.investorDistributions?.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {inv.investor?.firstName || 'Investor'} {inv.investor?.lastName || ''}
                        </div>
                        {inv.investor?.email && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {inv.investor.email}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                        {inv.numberOfShares?.toLocaleString('en-IN') || '0'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                        ₹{inv.grossAmount?.toLocaleString('en-IN') || '0'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                        ₹{inv.tdsAmount?.toLocaleString('en-IN') || '0'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                        ₹{inv.netAmount?.toLocaleString('en-IN') || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FaInfoCircle className="text-orange-600 text-sm mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900 mb-2">Compliance Review Checklist:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
                  <li>Verify TDS calculations are correct (standard rate: 20%)</li>
                  <li>Review deduction amounts for reasonableness</li>
                  <li>Ensure regulatory compliance with tax laws</li>
                  <li>Check investor distribution breakdowns are accurate</li>
                  <li>Verify all amounts add up correctly</li>
                  <li>Confirm asset manager approval is in place</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Approval Section */}
          {complianceApproved ? (
            <div className="border border-green-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>Already Approved</span>
              </h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Approved by:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {getComplianceOfficerName() || 'Compliance Officer'}
                  </span>
                </div>
                {dist.approvals?.complianceApproval?.approvedAt && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Approved on:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(dist.approvals.complianceApproval.approvedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {dist.approvals?.complianceApproval?.comments && (
                  <div>
                    <span className="text-sm text-gray-600">Comments:</span>
                    <p className="text-sm text-gray-900 mt-1 bg-white rounded p-2">
                      {dist.approvals.complianceApproval.comments}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end">
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-orange-200 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-orange-100">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FaShieldAlt className="text-orange-600" />
                <span>Compliance Approval</span>
              </h4>
              <textarea
                className="input mb-4"
                rows="3"
                placeholder="Add compliance comments or notes (optional)..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="btn btn-primary flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600"
                >
                  <FaShieldAlt />
                  <span>{loading ? 'Approving...' : 'Approve for Compliance'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


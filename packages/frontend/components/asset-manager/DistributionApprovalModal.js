import { useState } from 'react';
import { distributionAPI } from '../../lib/api';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaCalculator } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function DistributionApprovalModal({ distribution, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      await distributionAPI.approveAsAssetManager(distribution._id, comments);
      toast.success('Distribution approved successfully! Compliance officers have been notified.');
      onSuccess();
    } catch (error) {
      console.error('Error approving distribution:', error);
      toast.error(error.message || 'Failed to approve distribution');
    } finally {
      setLoading(false);
    }
  };

  const totalInvestors = distribution.investorDistributions?.length || 0;
  const totalAmount = distribution.investorDistributions?.reduce(
    (sum, inv) => sum + (inv.netAmount || 0), 
    0
  ) || 0;

  // Check if already approved by asset manager
  const isAlreadyApproved = distribution.approvals?.assetManagerApproval?.approved || false;
  const approvalDate = distribution.approvals?.assetManagerApproval?.approvedAt;
  const approvalComments = distribution.approvals?.assetManagerApproval?.comments;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Review Distribution</h3>
            <p className="text-sm text-gray-500">{distribution.distributionNumber}</p>
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
                {distribution.project?.projectName || '-'}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">SPV</p>
              <p className="font-semibold text-gray-900">
                {distribution.spv?.spvName || distribution.spv?.name || '-'}
              </p>
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
                  ₹{distribution.grossProceeds?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Deductions</p>
                <p className="text-xl font-bold text-orange-600">
                  -₹{distribution.deductions?.totalDeductions?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Platform Fees</p>
                <p className="text-xl font-bold text-orange-600">
                  -₹{distribution.platformFees?.totalPlatformFees?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-green-500">
                <p className="text-xs text-gray-600 mb-1">Net Distributable</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{distribution.netDistributableAmount?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          {distribution.taxWithholding && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Tax Withholding</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">TDS Rate</p>
                  <p className="font-semibold text-gray-900">
                    {distribution.taxWithholding.tdsRate || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">TDS Amount</p>
                  <p className="font-semibold text-gray-900">
                    ₹{distribution.taxWithholding.tdsAmount?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Investor Distribution Summary */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Investor Distribution Summary</h4>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Total Investors</p>
                <p className="text-2xl font-bold text-blue-600">{totalInvestors}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Total Distribution</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Investor Details Table */}
            <div className="max-h-64 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Investor</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Shares</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Gross</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">TDS</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {distribution.investorDistributions?.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {inv.investor?.firstName && inv.investor?.lastName
                                ? `${inv.investor.firstName} ${inv.investor.lastName}`
                                : inv.investor?.email || 'Investor'}
                            </span>
                            {inv.investor?.email && (
                              <span className="text-xs text-gray-500 mt-0.5">
                                {inv.investor.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {inv.numberOfShares?.toLocaleString('en-IN') || '0'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            ₹{inv.grossAmount?.toLocaleString('en-IN') || '0'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            ₹{inv.tdsAmount?.toLocaleString('en-IN') || '0'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                            ₹{inv.netAmount?.toLocaleString('en-IN') || '0'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FaInfoCircle className="text-blue-600 text-sm mt-0.5" />
              <div className="flex-1 text-sm text-blue-800">
                <p className="font-medium mb-1">Review Checklist:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Verify the gross proceeds amount is correct</li>
                  <li>Check that deductions and fees are accurate</li>
                  <li>Confirm investor distribution calculations</li>
                  <li>Ensure TDS calculations are correct</li>
                  <li>Review that the net distributable amount matches expected values</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Approval Section */}
          {isAlreadyApproved ? (
            <div className="border border-green-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>Already Approved</span>
              </h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Approved on:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {approvalDate ? new Date(approvalDate).toLocaleString('en-IN') : 'N/A'}
                  </span>
                </div>
                {approvalComments && (
                  <div>
                    <span className="text-sm text-gray-600">Comments:</span>
                    <p className="text-sm text-gray-900 mt-1 bg-white rounded p-2">
                      {approvalComments}
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
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Approval Comments (Optional)</h4>
              <textarea
                className="input mb-4"
                rows="3"
                placeholder="Add any comments or notes about this distribution..."
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
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <FaCheckCircle />
                  <span>{loading ? 'Approving...' : 'Approve Distribution'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


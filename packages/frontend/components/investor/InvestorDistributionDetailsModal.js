import { FaTimes, FaDownload, FaInfoCircle, FaCheckCircle, FaClock, FaMoneyBillWave, FaTimesCircle } from 'react-icons/fa';

export default function InvestorDistributionDetailsModal({ distribution, onClose }) {
  // Find this investor's distribution details
  const myDistribution = distribution.investorDistributions?.find(inv => {
    // In a real scenario, we'd match by authenticated user ID
    return inv;
  }) || distribution.investorDistributions?.[0];

  const getStatusBadge = (status) => {
    const badges = {
      draft: <span className="badge badge-gray">Draft</span>,
      calculated: <span className="badge badge-info">Calculated</span>,
      under_review: <span className="badge badge-warning">Under Review</span>,
      approved: <span className="badge badge-success">Approved</span>,
      processing: <span className="badge badge-info">Processing</span>,
      completed: <span className="badge badge-success">Completed</span>,
      cancelled: <span className="badge badge-gray">Cancelled</span>,
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge badge-gray flex items-center space-x-1"><FaClock className="text-xs" /><span>Pending</span></span>,
      initiated: <span className="badge badge-info flex items-center space-x-1"><FaClock className="text-xs" /><span>Initiated</span></span>,
      processing: <span className="badge badge-info flex items-center space-x-1"><FaClock className="text-xs" /><span>Processing</span></span>,
      completed: <span className="badge badge-success flex items-center space-x-1"><FaCheckCircle className="text-xs" /><span>Paid</span></span>,
      failed: <span className="badge badge-danger flex items-center space-x-1"><FaTimesCircle className="text-xs" /><span>Failed</span></span>,
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Distribution Details</h3>
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
              {distribution.project?.projectCode && (
                <p className="text-xs text-gray-500 mt-1">
                  Code: {distribution.project.projectCode}
                </p>
              )}
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">SPV</p>
              <p className="font-semibold text-gray-900">
                {distribution.spv?.spvName || distribution.spv?.name || '-'}
              </p>
              {distribution.spv?.spvCode && (
                <p className="text-xs text-gray-500 mt-1">
                  Code: {distribution.spv.spvCode}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Distribution Status</p>
              <div className="mt-2">{getStatusBadge(distribution.status)}</div>
            </div>
            {myDistribution && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <div className="mt-2">{getPaymentStatusBadge(myDistribution.paymentStatus || 'pending')}</div>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          {myDistribution && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FaMoneyBillWave className="text-blue-600" />
                <span>Your Distribution Breakdown</span>
              </h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Gross Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{myDistribution.grossAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">TDS Deducted</p>
                  <p className="text-xl font-bold text-red-600">
                    -₹{myDistribution.tdsAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-green-500">
                  <p className="text-xs text-gray-600 mb-1">Net Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{myDistribution.netAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Your Shares</p>
                  <p className="text-xl font-bold text-gray-900">
                    {myDistribution.numberOfShares?.toLocaleString('en-IN') || '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {myDistribution.ownershipPercentage?.toFixed(2) || '0'}% ownership
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {myDistribution && myDistribution.paymentStatus === 'completed' && (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-medium text-green-900 mb-3 flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>Payment Details</span>
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {myDistribution.utr && (
                  <div>
                    <p className="text-sm text-gray-600">UTR</p>
                    <p className="font-mono font-semibold text-gray-900">{myDistribution.utr}</p>
                  </div>
                )}
                {myDistribution.transactionId && (
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono font-semibold text-gray-900">{myDistribution.transactionId}</p>
                  </div>
                )}
                {myDistribution.paymentDate && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(myDistribution.paymentDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {myDistribution.paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {myDistribution.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distribution Timeline */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Timeline</h4>
            <div className="space-y-3">
              {distribution.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Distribution Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(distribution.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
              {distribution.approvedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Distribution Approved</p>
                    <p className="text-xs text-gray-500">
                      {new Date(distribution.approvedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
              {myDistribution?.paymentDate && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment Completed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(myDistribution.paymentDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Documents</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <FaDownload className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Distribution Statement</span>
                </div>
                <span className="text-xs text-gray-500">PDF</span>
              </button>
              {myDistribution?.form16Document && (
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <FaDownload className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Form 16 Certificate</span>
                  </div>
                  <span className="text-xs text-gray-500">PDF</span>
                </button>
              )}
              {!myDistribution?.form16Document && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    Form 16 certificate will be available after tax processing is complete.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FaInfoCircle className="text-blue-600 text-sm mt-0.5" />
              <div className="flex-1 text-sm text-blue-800">
                <p className="font-medium mb-1">Need Help?</p>
                <p className="text-xs">
                  If you have questions about this distribution or payment, please contact our support team.
                  All distributions are processed in accordance with regulatory requirements and your investment agreements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


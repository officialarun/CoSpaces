import { useState } from 'react';
import { adminDistributionAPI } from '../lib/api';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaClock, FaEdit, FaBan, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function DistributionDetailsModal({ distribution, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [approvalComments, setApprovalComments] = useState('');

  const getStatusBadge = (status) => {
    const badges = {
      draft: <span className="badge badge-gray flex items-center space-x-1"><FaClock className="text-xs" /><span>Draft</span></span>,
      calculated: <span className="badge badge-info flex items-center space-x-1"><FaClock className="text-xs" /><span>Calculated</span></span>,
      under_review: <span className="badge badge-warning flex items-center space-x-1"><FaClock className="text-xs" /><span>Under Review</span></span>,
      approved: <span className="badge badge-success flex items-center space-x-1"><FaCheckCircle className="text-xs" /><span>Approved</span></span>,
      processing: <span className="badge badge-info flex items-center space-x-1"><FaClock className="text-xs" /><span>Processing</span></span>,
      completed: <span className="badge badge-success flex items-center space-x-1"><FaCheckCircle className="text-xs" /><span>Completed</span></span>,
      cancelled: <span className="badge badge-gray flex items-center space-x-1"><FaTimesCircle className="text-xs" /><span>Cancelled</span></span>,
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  const canEdit = ['draft', 'calculated'].includes(distribution.status) && 
                  !distribution.approvals?.assetManagerApproval?.approved &&
                  !distribution.approvals?.complianceApproval?.approved &&
                  !distribution.approvals?.adminApproval?.approved;

  const canCancel = ['draft', 'calculated'].includes(distribution.status) &&
                    !distribution.approvals?.assetManagerApproval?.approved &&
                    !distribution.approvals?.complianceApproval?.approved &&
                    !distribution.approvals?.adminApproval?.approved;

  const handleApprove = async (approvalType) => {
    setActionLoading(`approve_${approvalType}`);
    try {
      let response;
      switch (approvalType) {
        case 'asset_manager':
          response = await adminDistributionAPI.approveAsAssetManager(distribution._id, approvalComments);
          break;
        case 'compliance':
          response = await adminDistributionAPI.approveAsCompliance(distribution._id, approvalComments);
          break;
        case 'admin':
          response = await adminDistributionAPI.approveAsAdmin(distribution._id, approvalComments);
          break;
      }
      toast.success(`Distribution approved as ${approvalType.replace('_', ' ')}`);
      setApprovalComments('');
      onSuccess();
    } catch (error) {
      console.error('Error approving distribution:', error);
      toast.error(error.response?.data?.error || 'Failed to approve distribution');
    } finally {
      setActionLoading('');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setActionLoading('cancel');
    try {
      await adminDistributionAPI.cancelDistribution(distribution._id, cancelReason);
      toast.success('Distribution cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      onSuccess();
    } catch (error) {
      console.error('Error cancelling distribution:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel distribution');
    } finally {
      setActionLoading('');
    }
  };

  const totalInvestors = distribution.investorDistributions?.length || 0;
  const totalAmount = distribution.investorDistributions?.reduce((sum, inv) => sum + (inv.netAmount || 0), 0) || 0;
  const completedPayments = distribution.investorDistributions?.filter(inv => inv.paymentStatus === 'completed').length || 0;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
            {/* Status and Overview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <div className="mt-2">{getStatusBadge(distribution.status)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {distribution.distributionType?.replace(/_/g, ' ') || '-'}
                </p>
              </div>
            </div>

            {/* Project and SPV Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Project</p>
                <p className="font-semibold text-gray-900">
                  {distribution.project?.projectName || '-'}
                </p>
                {distribution.project?.assetManager && (
                  <p className="text-xs text-gray-500 mt-1">
                    Asset Manager: {distribution.project.assetManager.firstName} {distribution.project.assetManager.lastName}
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

            {/* Financial Summary */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Proceeds</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{distribution.grossProceeds?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
                  <p className="text-xl font-bold text-orange-600">
                    -₹{distribution.deductions?.totalDeductions?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Platform Fees</p>
                  <p className="text-xl font-bold text-orange-600">
                    -₹{distribution.platformFees?.totalPlatformFees?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Net Distributable</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{distribution.netDistributableAmount?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Asset Manager</p>
                    {distribution.approvals?.assetManagerApproval?.approvedAt && (
                      <p className="text-xs text-gray-500">
                        {new Date(distribution.approvals.assetManagerApproval.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {distribution.approvals?.assetManagerApproval?.approved ? (
                    <span className="badge badge-success flex items-center space-x-1">
                      <FaCheckCircle className="text-xs" />
                      <span>Approved</span>
                    </span>
                  ) : (
                    <span className="badge badge-gray">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Compliance Officer</p>
                    {distribution.approvals?.complianceApproval?.approvedAt && (
                      <p className="text-xs text-gray-500">
                        {new Date(distribution.approvals.complianceApproval.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {distribution.approvals?.complianceApproval?.approved ? (
                    <span className="badge badge-success flex items-center space-x-1">
                      <FaCheckCircle className="text-xs" />
                      <span>Approved</span>
                    </span>
                  ) : (
                    <span className="badge badge-gray">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Admin</p>
                    {distribution.approvals?.adminApproval?.approvedAt && (
                      <p className="text-xs text-gray-500">
                        {new Date(distribution.approvals.adminApproval.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {distribution.approvals?.adminApproval?.approved ? (
                    <span className="badge badge-success flex items-center space-x-1">
                      <FaCheckCircle className="text-xs" />
                      <span>Approved</span>
                    </span>
                  ) : (
                    <span className="badge badge-gray">Pending</span>
                  )}
                </div>
              </div>
            </div>

            {/* Investor Distributions Summary */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Investor Distributions</h4>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total Investors</p>
                  <p className="text-2xl font-bold text-blue-600">{totalInvestors}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Payments Completed</p>
                  <p className="text-2xl font-bold text-purple-600">{completedPayments}/{totalInvestors}</p>
                </div>
              </div>

              {/* Investor List */}
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
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700">Status</th>
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
                            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                              ₹{inv.netAmount?.toLocaleString('en-IN') || '0'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {inv.paymentStatus === 'completed' ? (
                              <span className="badge badge-success">Paid</span>
                            ) : (
                              <span className="badge badge-gray">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment Processing Button */}
            {distribution.status === 'approved' && 
             distribution.approvals?.assetManagerApproval?.approved &&
             distribution.approvals?.complianceApproval?.approved &&
             distribution.approvals?.adminApproval?.approved && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Payment Processing</h4>
                    <p className="text-sm text-gray-500">Manage investor payments</p>
                  </div>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = `/distributions/${distribution._id}/payments`;
                      }
                    }}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <FaMoneyBillWave />
                    <span>Process Payments</span>
                  </button>
                </div>
              </div>
            )}

            {/* Admin Actions */}
            {canCancel && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Admin Actions</h4>
                    <p className="text-sm text-gray-500">Edit or cancel this distribution</p>
                  </div>
                  <div className="flex space-x-2">
                    {canEdit && (
                      <button
                        onClick={() => {
                          // TODO: Open edit modal
                          toast.info('Edit functionality coming soon');
                        }}
                        className="btn btn-secondary flex items-center space-x-2"
                      >
                        <FaEdit />
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="btn btn-secondary flex items-center space-x-2"
                    >
                      <FaBan />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Approval */}
            {distribution.status === 'under_review' && 
             distribution.approvals?.assetManagerApproval?.approved &&
             distribution.approvals?.complianceApproval?.approved &&
             !distribution.approvals?.adminApproval?.approved && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Final Approval Required</h4>
                <textarea
                  className="input mb-3"
                  placeholder="Add comments (optional)"
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  rows="3"
                />
                <button
                  onClick={() => handleApprove('admin')}
                  disabled={actionLoading === 'approve_admin'}
                  className="btn btn-primary w-full"
                >
                  {actionLoading === 'approve_admin' ? 'Approving...' : 'Approve Distribution'}
                </button>
              </div>
            )}
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

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Distribution</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this distribution? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input"
                rows="3"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="btn btn-secondary"
                disabled={actionLoading === 'cancel'}
              >
                Keep Distribution
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-danger"
                disabled={actionLoading === 'cancel' || !cancelReason.trim()}
              >
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Distribution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


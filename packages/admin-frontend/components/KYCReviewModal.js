import { useState } from 'react';
import { adminKYCAPI } from '../lib/api';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function KYCReviewModal({ user, onClose, onSuccess }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve KYC for ${user.email}?`)) {
      return;
    }

    setLoading(true);
    try {
      await adminKYCAPI.approveKYC(user._id);
      toast.success('KYC approved successfully');
      onSuccess();
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error(error.response?.data?.error || 'Failed to approve KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      await adminKYCAPI.rejectKYC(user._id, rejectionReason);
      toast.success('KYC rejected successfully');
      onSuccess();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error(error.response?.data?.error || 'Failed to reject KYC');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.pincode,
      address.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <FaShieldAlt className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">KYC Review</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Basic Info */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">User Information</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {user.firstName || user.profile?.firstName} {user.lastName || user.profile?.lastName}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-base font-medium text-gray-900 mt-1">{user.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-base font-medium text-gray-900 mt-1">{user.phone || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* DIDIT Verification */}
          {user.diditVerification?.isVerified && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaCheckCircle className="text-green-600 mr-2" />
                DIDIT Verification Details
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Aadhaar Verified</p>
                  <p className="text-base font-medium text-green-900 mt-1">
                    {user.diditVerification.aadhaarVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Age Verified</p>
                  <p className="text-base font-medium text-green-900 mt-1">
                    {user.diditVerification.ageVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Address Verified</p>
                  <p className="text-base font-medium text-green-900 mt-1">
                    {user.diditVerification.addressVerified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Professional Details */}
          {user.professionalDetails && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Occupation</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {user.professionalDetails.occupation || 'Not provided'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {user.professionalDetails.company || 'Not provided'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Annual Income</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {user.professionalDetails.annualIncome || 'Not provided'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {user.professionalDetails.yearsOfExperience ? `${user.professionalDetails.yearsOfExperience} years` : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Address</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-base text-gray-900">{formatAddress(user.address)}</p>
            </div>
          </div>

          {/* Investment Preferences */}
          {user.investmentPreferences && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Investment Preferences</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Land Types</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {user.investmentPreferences.landTypes?.join(', ') || 'Not specified'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Risk Appetite</p>
                  <p className="text-base font-medium text-gray-900 mt-1 capitalize">
                    {user.investmentPreferences.riskAppetite || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                className="input min-h-[100px]"
                placeholder="Provide a detailed reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Close
            </button>
            
            {user.kycStatus !== 'approved' && (
              <>
                {!showRejectForm ? (
                  <>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="btn btn-danger"
                      disabled={loading}
                    >
                      <FaTimesCircle className="inline mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : (
                        <>
                          <FaCheckCircle className="inline mr-2" />
                          Approve KYC
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason('');
                      }}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Cancel Rejection
                    </button>
                    <button
                      onClick={handleReject}
                      className="btn btn-danger"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                  </>
                )}
              </>
            )}

            {user.kycStatus === 'approved' && (
              <div className="flex items-center space-x-2 text-green-600">
                <FaCheckCircle />
                <span className="font-medium">KYC Already Approved</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


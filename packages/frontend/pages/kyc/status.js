import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { kycAPI } from '../../lib/api';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaClock } from 'react-icons/fa';

function KYCStatus() {
  const { user, loadUser } = useAuth();
  const [kycData, setKYCData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKYCStatus();
    // Refresh user data to ensure KYC status is up to date
    loadUser();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const response = await kycAPI.getKYCStatus();
      setKYCData(response.data.kyc);
    } catch (error) {
      console.error('Error loading KYC:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500 text-4xl" />;
      case 'under_review':
      case 'submitted':
        return <FaHourglassHalf className="text-yellow-500 text-4xl" />;
      default:
        return <FaClock className="text-gray-400 text-4xl" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'under_review':
      case 'submitted':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>KYC Status - Verification Progress</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">KYC Verification Status</h1>

          {/* Status Card */}
          <div className={`card border-2 ${getStatusColor(user.kycStatus)} mb-6`}>
            <div className="flex items-center gap-6">
              <div>
                {getStatusIcon(user.kycStatus)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold capitalize mb-2">
                  {user.kycStatus.replace('_', ' ')}
                </h2>
                <p className="text-gray-600">
                  {user.kycStatus === 'pending' && 'Please submit your KYC documents to start investing.'}
                  {user.kycStatus === 'submitted' && 'Your documents are submitted and awaiting review.'}
                  {user.kycStatus === 'under_review' && 'Our compliance team is reviewing your documents.'}
                  {user.kycStatus === 'approved' && 'Your KYC is approved! You can now invest in projects.'}
                  {user.kycStatus === 'rejected' && 'Your KYC was rejected. Please resubmit with correct information.'}
                </p>
              </div>
            </div>
          </div>

          {/* KYC Details */}
          {kycData ? (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Submitted Information</h3>
              
              <div className="space-y-4">
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="font-medium">{user.displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Documents Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>PAN Card</span>
                      <span className={`badge ${kycData.individualKYC?.panVerified ? 'badge-success' : 'badge-warning'}`}>
                        {kycData.individualKYC?.panVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Aadhaar Card</span>
                      <span className={`badge ${kycData.individualKYC?.aadhaarVerified ? 'badge-success' : 'badge-warning'}`}>
                        {kycData.individualKYC?.aadhaarVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Address Proof</span>
                      <span className={`badge ${kycData.individualKYC?.addressProofVerified ? 'badge-success' : 'badge-warning'}`}>
                        {kycData.individualKYC?.addressProofVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AML Screening */}
                {kycData.amlScreening?.screenedAt && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">AML Screening</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Risk Level</span>
                        <span className={`badge ${kycData.amlScreening.riskLevel === 'low' ? 'badge-success' : 'badge-warning'}`}>
                          {kycData.amlScreening.riskLevel || 'Not screened'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sanctions Match</span>
                        <span>{kycData.amlScreening.sanctionsMatch ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>PEP Match</span>
                        <span>{kycData.amlScreening.pepMatch ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t pt-4 text-sm text-gray-500">
                  {kycData.submittedAt && (
                    <p>Submitted: {new Date(kycData.submittedAt).toLocaleDateString()}</p>
                  )}
                  {kycData.verifiedAt && (
                    <p>Verified: {new Date(kycData.verifiedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">You haven't submitted your KYC yet.</p>
              <a href="/kyc/onboarding" className="btn-primary inline-block">
                Complete KYC
              </a>
            </div>
          )}

          {/* Rejection Reason */}
          {user.kycStatus === 'rejected' && kycData?.rejectionReason && (
            <div className="card border-2 border-red-200 bg-red-50 mt-6">
              <h3 className="text-lg font-bold text-red-900 mb-2">Rejection Reason</h3>
              <p className="text-red-800">{kycData.rejectionReason}</p>
              {kycData.rejectionDetails && (
                <p className="text-red-700 text-sm mt-2">{kycData.rejectionDetails}</p>
              )}
              <a href="/kyc/onboarding" className="btn-primary inline-block mt-4">
                Resubmit KYC
              </a>
            </div>
          )}

          {/* Next Steps */}
          {user.kycStatus === 'approved' && (
            <div className="card bg-green-50 border-2 border-green-200 mt-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">🎉 You're all set!</h3>
              <p className="text-green-800 mb-4">
                Your KYC is approved. You can now browse and invest in available projects.
              </p>
              <a href="/projects" className="btn-primary inline-block">
                Browse Projects
              </a>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

export default function KYCStatusPage() {
  return (
    <ProtectedRoute>
      <KYCStatus />
    </ProtectedRoute>
  );
}


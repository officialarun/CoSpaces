import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import { diditAPI } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import DiditVerification from '../../components/DiditVerification';
import VerificationBadge from '../../components/VerificationBadge';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

function VerifyDiditPage() {
  const router = useRouter();
  const { user, loadUser } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await diditAPI.getVerificationStatus();
      setIsVerified(response.data.isVerified);
      setVerificationData(response.data.verifiedData);
      setLoading(false);
    } catch (error) {
      console.error('Error checking verification status:', error);
      setLoading(false);
    }
  };

  const handleVerificationComplete = async (data) => {
    setIsVerified(true);
    await loadUser(); // Reload user data
    await checkVerificationStatus(); // Refresh verification data
    toast.success('Verification completed successfully!');
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>DIDIT Verification - Dashboard</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-6"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Identity Verification
            </h1>
            <p className="text-gray-600">
              Verify your identity with DIDIT to unlock full access to investment opportunities
            </p>
          </div>

          {!isVerified ? (
            <>
              {/* Why Verify Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Why verify your identity?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-600 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Compliance Requirement</h3>
                      <p className="text-sm text-gray-600">
                        KYC verification is mandatory for all investors as per SEBI and PMLA regulations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-600 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Quick & Secure</h3>
                      <p className="text-sm text-gray-600">
                        Instant verification using Aadhaar - no document uploads needed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-600 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Unlock Investments</h3>
                      <p className="text-sm text-gray-600">
                        Access all investment opportunities once verified
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-600 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Data Privacy</h3>
                      <p className="text-sm text-gray-600">
                        Your data is encrypted and stored securely per Indian data protection laws
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DIDIT Verification Component */}
              <DiditVerification
                isVerified={false}
                onVerificationComplete={handleVerificationComplete}
                showSkip={false}
              />

              {/* Help Section */}
              <div className="bg-gray-50 rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>What do I need?</strong> Your Aadhaar number and access to the mobile number linked to your Aadhaar.
                  </p>
                  <p>
                    <strong>How long does it take?</strong> Verification typically completes in under 2 minutes.
                  </p>
                  <p>
                    <strong>Is my data safe?</strong> Yes, we use DIDIT's secure platform which is compliant with UIDAI guidelines. We only store encrypted, minimal data.
                  </p>
                  <p>
                    <strong>Having issues?</strong> Contact our support team at support@fractionalland.com
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Already Verified Section */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                <FaCheckCircle className="text-green-600 text-6xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  You're Already Verified!
                </h2>
                <p className="text-green-700 mb-4">
                  Your identity has been verified with DIDIT. You have full access to all investment opportunities.
                </p>
                <VerificationBadge 
                  status="verified" 
                  verifiedAt={user?.diditVerification?.verifiedAt} 
                  size="lg" 
                />
              </div>

              {/* Verified Data Display */}
              {verificationData && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Verified Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {verificationData.name && (
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium text-gray-900">{verificationData.name}</p>
                      </div>
                    )}
                    {verificationData.dob && (
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-medium text-gray-900">
                          {new Date(verificationData.dob).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {verificationData.age && (
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium text-gray-900">{verificationData.age} years</p>
                      </div>
                    )}
                    {verificationData.gender && (
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-medium text-gray-900">{verificationData.gender}</p>
                      </div>
                    )}
                    {verificationData.address && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">
                          {verificationData.address.street}, {verificationData.address.city}<br />
                          {verificationData.address.state} - {verificationData.address.pincode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

export default function VerifyDidit() {
  return (
    <ProtectedRoute>
      <VerifyDiditPage />
    </ProtectedRoute>
  );
}


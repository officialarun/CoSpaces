import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { shaAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { FaFileSignature, FaCheckCircle, FaClock, FaExclamationTriangle, FaDownload } from 'react-icons/fa';

function SHASigning() {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingAgreement, setSigningAgreement] = useState(null);

  useEffect(() => {
    loadAgreements();
  }, []);

  const loadAgreements = async () => {
    try {
      const response = await shaAPI.getMyAgreements();
      setAgreements(response.data.agreements || []);
    } catch (error) {
      console.error('Error loading agreements:', error);
      toast.error(error.response?.data?.error || 'Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (agreement) => {
    try {
      // Fetch PDF with authentication using the API client
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/esign/sha/${agreement._id}/document`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in new window
      window.open(url, '_blank');
      
      // Clean up blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to load document. Please try again.');
    }
  };

  const handleSignAgreement = async (agreement) => {
    try {
      setSigningAgreement(agreement._id);
      
      // For mock eSign, we sign directly without external redirect
      // User can view document first, then confirm to sign
      const confirmed = window.confirm(
        'Are you sure you want to sign this Shareholder Agreement? Please review the document before signing.\n\n' +
        'By clicking OK, you confirm that you have read and agree to the terms of this agreement.'
      );
      
      if (!confirmed) {
        setSigningAgreement(null);
        return;
      }

      // Perform mock signing
      const response = await shaAPI.mockSignSHA(agreement._id);
      
      if (response.data.success) {
        toast.success('Agreement signed successfully!');
        loadAgreements(); // Reload list to update status
      } else {
        toast.error(response.data.error || 'Failed to sign agreement');
      }
    } catch (error) {
      console.error('Error signing agreement:', error);
      toast.error(error.response?.data?.error || 'Failed to sign agreement');
    } finally {
      setSigningAgreement(null);
    }
  };

  const checkAgreementStatus = async (agreementId) => {
    try {
      const response = await shaAPI.getSHAStatus(agreementId);
      const agreement = response.data.agreement;
      
      if (agreement.eSign.status === 'signed') {
        toast.success('Agreement signed successfully!');
        loadAgreements(); // Reload list
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'signed':
        return <FaCheckCircle className="text-green-600" />;
      case 'pending':
      case 'initiated':
      case 'sent':
      case 'viewed':
        return <FaClock className="text-yellow-600" />;
      case 'rejected':
      case 'failed':
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaFileSignature className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'signed':
        return 'Signed';
      case 'pending':
        return 'Pending';
      case 'initiated':
        return 'Signing Initiated';
      case 'sent':
        return 'Sent for Signing';
      case 'viewed':
        return 'Viewed';
      case 'rejected':
        return 'Rejected';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'initiated':
      case 'sent':
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const pendingAgreements = agreements.filter(
    a => a.eSign.status !== 'signed' && a.status !== 'signed'
  );
  const signedAgreements = agreements.filter(
    a => a.eSign.status === 'signed' || a.status === 'signed'
  );

  return (
    <>
      <Head>
        <title>Sign Agreements - Dashboard</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Shareholder Agreements</h1>
            {pendingAgreements.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {pendingAgreements.length} Pending
              </span>
            )}
          </div>

          {/* Pending Agreements */}
          {pendingAgreements.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Pending Signatures</h2>
              {pendingAgreements.map((agreement) => (
                <div key={agreement._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(agreement.eSign.status)}
                        <div>
                          <h3 className="text-xl font-bold">
                            {agreement.spv?.spvName || 'SPV'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {agreement.project?.projectName || 'Project'}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Investment Amount</p>
                          <p className="text-lg font-bold">
                            ₹{agreement.equityDistribution?.investmentAmount?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Equity Percentage</p>
                          <p className="text-lg font-bold text-primary-600">
                            {agreement.equityDistribution?.equityPercentage?.toFixed(2) || 'N/A'}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agreement.eSign.status)}`}>
                            {getStatusText(agreement.eSign.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {agreement._id && (
                          <button
                            onClick={() => handleViewDocument(agreement)}
                            className="btn-secondary text-sm flex items-center gap-2"
                          >
                            <FaDownload className="text-xs" />
                            View Document
                          </button>
                        )}
                        <button
                          onClick={() => handleSignAgreement(agreement)}
                          disabled={signingAgreement === agreement._id}
                          className="btn-primary text-sm"
                        >
                          {signingAgreement === agreement._id ? 'Signing...' : 'Confirm & Sign'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <FaCheckCircle className="text-green-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Agreements Signed</h3>
              <p className="text-gray-600">
                You have no pending shareholder agreements to sign.
              </p>
            </div>
          )}

          {/* Signed Agreements */}
          {signedAgreements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Signed Agreements</h2>
              {signedAgreements.map((agreement) => (
                <div key={agreement._id} className="card bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FaCheckCircle className="text-green-600" />
                        <div>
                          <h3 className="text-xl font-bold">
                            {agreement.spv?.spvName || 'SPV'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {agreement.project?.projectName || 'Project'}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Investment Amount</p>
                          <p className="text-lg font-bold">
                            ₹{agreement.equityDistribution?.investmentAmount?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Equity Percentage</p>
                          <p className="text-lg font-bold text-primary-600">
                            {agreement.equityDistribution?.equityPercentage?.toFixed(2) || 'N/A'}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Signed On</p>
                          <p className="text-sm font-medium">
                            {agreement.eSign.signedAt
                              ? new Date(agreement.eSign.signedAt).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {agreement._id && (
                        <button
                          onClick={() => handleViewDocument(agreement)}
                          className="btn-secondary text-sm inline-flex items-center gap-2"
                        >
                          <FaDownload className="text-xs" />
                          Download Signed Document
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

export default function SHASigningPage() {
  return (
    <ProtectedRoute>
      <SHASigning />
    </ProtectedRoute>
  );
}


import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { adminDistributionAPI, bankPaymentAPI } from '../../../lib/api';
import { FaDownload, FaUpload, FaCheckCircle, FaTimesCircle, FaClock, FaFileCsv, FaMoneyBillWave, FaSpinner, FaHistory, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import MarkPaymentModal from '../../../components/admin/MarkPaymentModal';
import BulkPaymentUploadModal from '../../../components/admin/BulkPaymentUploadModal';
import TransactionHistoryModal from '../../../components/admin/TransactionHistoryModal';

export default function DistributionPayments() {
  const router = useRouter();
  const { id } = router.query;
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayments, setProcessingPayments] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [showMarkPaymentModal, setShowMarkPaymentModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedInvestorForHistory, setSelectedInvestorForHistory] = useState(null);
  const [csvContent, setCsvContent] = useState(null);

  useEffect(() => {
    // Wait for router to be ready and id to be available
    if (router.isReady && id) {
      fetchDistribution();
    } else if (router.isReady && !id) {
      console.error('Distribution ID not found in URL');
      toast.error('Invalid distribution ID');
      setDistribution(null);
      setLoading(false);
    }
  }, [id, router.isReady]);

  useEffect(() => {
    // Auto-generate CSV when distribution is loaded
    if (distribution) {
      // Check if payments can be processed
      const canProcess = distribution.status === 'approved' && 
                         distribution.approvals?.assetManagerApproval?.approved &&
                         distribution.approvals?.complianceApproval?.approved &&
                         distribution.approvals?.adminApproval?.approved;
      
      if (canProcess) {
        generateCSV();
      }
    }
  }, [distribution]);

  const fetchDistribution = async () => {
    try {
      setLoading(true);
      console.log('Fetching distribution with ID:', id);
      const response = await adminDistributionAPI.getDistributionById(id);
      console.log('Distribution API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);
      console.log('Response data.data.distribution:', response.data?.data?.distribution);
      
      // Check multiple possible response structures
      const distribution = response.data?.data?.distribution || response.data?.distribution || response.data;
      
      if (distribution && distribution._id) {
        setDistribution(distribution);
        console.log('Distribution set successfully:', distribution);
      } else {
        console.error('Distribution not found in response. Full response:', response);
        console.error('Response structure:', {
          'response.data': response.data,
          'response.data.data': response.data?.data,
          'response.data.distribution': response.data?.distribution,
          'response.data.data.distribution': response.data?.data?.distribution
        });
        toast.error('Distribution not found in response');
        setDistribution(null);
      }
    } catch (error) {
      console.error('Error fetching distribution:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      if (error.response?.status === 404) {
        toast.error('Distribution not found');
      } else {
        toast.error(error.response?.data?.error || error.message || 'Failed to load distribution details');
      }
      setDistribution(null);
      // Don't redirect immediately, let user see the error state
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = () => {
    try {
      if (!distribution || !distribution.investorDistributions || !Array.isArray(distribution.investorDistributions)) {
        return;
      }

      // Bank bulk payment CSV format
      const headers = [
        'Beneficiary Name',
        'Account Number',
        'IFSC Code',
        'Bank Name',
        'Branch Name',
        'Amount',
        'Payment Reference',
        'Remarks'
      ];

      const rows = distribution.investorDistributions
        .filter(inv => inv && (inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing'))
        .map(inv => {
          try {
            const investor = inv.investor || {};
            const bankDetails = inv.bankDetails || {};
            
            return [
              `"${bankDetails.accountHolderName || (investor?.firstName && investor?.lastName ? `${investor.firstName} ${investor.lastName}` : investor?.email || 'Investor')}"`,
              `"${bankDetails.accountNumber || ''}"`,
              `"${bankDetails.ifscCode || ''}"`,
              `"${bankDetails.bankName || ''}"`,
              `"${bankDetails.branchName || ''}"`,
              `"${(inv.netAmount || 0).toFixed(2)}"`,
              `"${distribution.distributionNumber || ''}"`,
              `"Distribution payment - ${(distribution.distributionType || 'Payment').replace(/_/g, ' ')}"`
            ];
          } catch (error) {
            console.error('Error processing investor row:', error);
            return null;
          }
        })
        .filter(row => row !== null); // Remove any null rows from errors

      if (rows.length === 0) {
        setCsvContent(null);
        return;
      }

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      setCsvContent(csvContent);
    } catch (error) {
      console.error('Error generating CSV:', error);
      setCsvContent(null);
    }
  };

  const downloadCSV = () => {
    if (!csvContent) {
      toast.error('CSV not generated yet');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bank_payment_${distribution.distributionNumber}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV file downloaded successfully!');
  };

  const processPaymentsViaBank = async () => {
    if (!distribution) {
      toast.error('Distribution not loaded');
      return;
    }

    const pendingInvestors = distribution.investorDistributions.filter(
      inv => inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing'
    );

    if (pendingInvestors.length === 0) {
      toast.error('No pending payments to process');
      return;
    }

    // Check if all investors have bank details
    const missingBankDetails = pendingInvestors.filter(inv => !inv.bankDetails);
    if (missingBankDetails.length > 0) {
      toast.error(`${missingBankDetails.length} investor(s) missing bank details. Please ensure all investors have bank accounts added.`);
      return;
    }

    setProcessingPayments(true);
    try {
      const response = await bankPaymentAPI.processBulkPayments(distribution._id);
      
      if (response.data.bankResponse) {
        const { successfulTransactions, failedTransactions, totalTransactions } = response.data.bankResponse;
        
        toast.success(
          `Payment processing completed: ${successfulTransactions} successful, ${failedTransactions} failed out of ${totalTransactions} total`,
          { duration: 5000 }
        );

        // Refresh distribution data
        await fetchDistribution();
      }
    } catch (error) {
      console.error('Error processing payments:', error);
      toast.error(error.response?.data?.error || 'Failed to process payments via bank');
    } finally {
      setProcessingPayments(false);
    }
  };

  const handleMarkPaymentSuccess = () => {
    setShowMarkPaymentModal(false);
    setSelectedInvestor(null);
    fetchDistribution();
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUploadModal(false);
    fetchDistribution();
  };

  const handleViewHistory = (investor) => {
    setSelectedInvestorForHistory(investor);
    setShowHistoryModal(true);
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge badge-gray flex items-center space-x-1"><FaClock className="text-xs" /><span>Pending</span></span>,
      initiated: <span className="badge badge-info flex items-center space-x-1"><FaClock className="text-xs" /><span>Initiated</span></span>,
      processing: <span className="badge badge-info flex items-center space-x-1"><FaClock className="text-xs" /><span>Processing</span></span>,
      completed: <span className="badge badge-success flex items-center space-x-1"><FaCheckCircle className="text-xs" /><span>Completed</span></span>,
      failed: <span className="badge badge-danger flex items-center space-x-1"><FaTimesCircle className="text-xs" /><span>Failed</span></span>,
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  if (loading) {
    return (
      <AdminLayout activeTab="distributions">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!distribution) {
    return (
      <AdminLayout activeTab="distributions">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Distribution not found</p>
            <button
              onClick={() => router.push('/dashboard?tab=distributions')}
              className="btn btn-primary"
            >
              Back to Distributions
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const paymentStats = {
    total: (distribution.investorDistributions && Array.isArray(distribution.investorDistributions)) ? distribution.investorDistributions.length : 0,
    completed: (distribution.investorDistributions && Array.isArray(distribution.investorDistributions)) ? distribution.investorDistributions.filter(inv => inv && inv.paymentStatus === 'completed').length : 0,
    pending: (distribution.investorDistributions && Array.isArray(distribution.investorDistributions)) ? distribution.investorDistributions.filter(inv => inv && inv.paymentStatus === 'pending').length : 0,
    processing: (distribution.investorDistributions && Array.isArray(distribution.investorDistributions)) ? distribution.investorDistributions.filter(inv => inv && inv.paymentStatus === 'processing').length : 0,
    failed: (distribution.investorDistributions && Array.isArray(distribution.investorDistributions)) ? distribution.investorDistributions.filter(inv => inv && inv.paymentStatus === 'failed').length : 0,
  };

  const canProcessPayments = distribution.status === 'approved' && 
                              distribution.approvals?.assetManagerApproval?.approved &&
                              distribution.approvals?.complianceApproval?.approved &&
                              distribution.approvals?.adminApproval?.approved;

  const pendingInvestors = (distribution.investorDistributions && Array.isArray(distribution.investorDistributions)) 
    ? distribution.investorDistributions.filter(
        inv => inv && (inv.paymentStatus === 'pending' || inv.paymentStatus === 'processing')
      )
    : [];

  const hasMissingBankDetails = pendingInvestors.some(inv => !inv.bankDetails);

  return (
    <>
      <Head>
        <title>Payment Processing - {distribution.distributionNumber} - CoSpaces Admin</title>
      </Head>

      <AdminLayout activeTab="distributions">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <FaMoneyBillWave className="text-green-600" />
                <span>Payment Processing</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Distribution: <span className="font-semibold">{distribution.distributionNumber}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Project: {distribution.project?.projectName || '-'}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard?tab=distributions')}
              className="btn btn-secondary"
            >
              Back to Distributions
            </button>
          </div>

          {/* Payment Stats */}
          <div className="grid md:grid-cols-5 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900">{paymentStats.total}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{paymentStats.completed}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{paymentStats.processing}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{paymentStats.failed}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {canProcessPayments && (
            <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Processing Actions</h3>
                  <p className="text-sm text-gray-600">
                    {hasMissingBankDetails 
                      ? '⚠️ Some investors are missing bank details. Please ensure all investors have bank accounts before processing.'
                      : 'CSV generated automatically. Process payments via bank API or download CSV manually.'}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={downloadCSV}
                    disabled={!csvContent || processingPayments}
                    className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
                    title={csvContent ? 'Download CSV file' : 'CSV not generated yet'}
                  >
                    <FaDownload />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={processPaymentsViaBank}
                    disabled={processingPayments || hasMissingBankDetails || pendingInvestors.length === 0}
                    className="btn btn-success flex items-center space-x-2 disabled:opacity-50"
                  >
                    {processingPayments ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaMoneyBillWave />
                        <span>Process Payments via Bank</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <FaUpload />
                    <span>Upload Payment Confirmation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!canProcessPayments && (
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-3">
                <FaClock className="text-yellow-600 text-2xl" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Distribution Not Approved</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This distribution must be approved by Asset Manager, Compliance Officer, and Admin before payments can be processed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Investor Payment List */}
          <div className="card overflow-x-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Investor Payments</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage individual investor payment status and view transaction history
              </p>
            </div>

            {(!distribution.investorDistributions || !Array.isArray(distribution.investorDistributions) || distribution.investorDistributions.length === 0) ? (
              <div className="p-8 text-center text-gray-500">
                <p>No investors found for this distribution.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 sticky top-0">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Investor</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Account Number</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IFSC</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Net Amount</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Payment Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">UTR</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Date</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(distribution.investorDistributions && Array.isArray(distribution.investorDistributions) ? distribution.investorDistributions : []).map((inv, idx) => {
                      if (!inv) return null;
                      const investor = inv.investor || {};
                      const bankDetails = inv.bankDetails || {};
                      
                      return (
                        <tr key={idx} className={`hover:bg-gray-50 transition-colors ${inv.paymentStatus === 'completed' ? 'bg-green-50' : inv.paymentStatus === 'failed' ? 'bg-red-50' : ''}`}>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-gray-900">
                              {investor?.firstName && investor?.lastName
                                ? `${investor.firstName} ${investor.lastName}`
                                : investor?.email || 'Investor'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{investor?.email || '-'}</span>
                          </td>
                          <td className="py-3 px-4">
                            {bankDetails.accountNumber ? (
                              <span className="font-mono text-sm text-gray-700">
                                {bankDetails.accountNumber}
                              </span>
                            ) : (
                              <span className="text-sm text-red-600 font-medium">Missing</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-gray-700">{bankDetails.ifscCode || '-'}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-green-600 whitespace-nowrap">
                              ₹{inv.netAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getPaymentStatusBadge(inv.paymentStatus || 'pending')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-gray-600">{inv.utr || '-'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-gray-600">{inv.transactionId || '-'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {inv.paymentDate 
                                ? new Date(inv.paymentDate).toLocaleDateString('en-IN')
                                : '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleViewHistory(investor)}
                                className="btn btn-sm btn-secondary flex items-center space-x-1"
                                title="View Transaction History"
                              >
                                <FaHistory className="text-xs" />
                                <span>History</span>
                              </button>
                              {inv.paymentStatus !== 'completed' && canProcessPayments && (
                                <button
                                  onClick={() => {
                                    setSelectedInvestor(inv);
                                    setShowMarkPaymentModal(true);
                                  }}
                                  className="btn btn-sm btn-primary whitespace-nowrap"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>

      {/* Mark Payment Modal */}
      {showMarkPaymentModal && selectedInvestor && (
        <MarkPaymentModal
          distribution={distribution}
          investor={selectedInvestor}
          onClose={() => {
            setShowMarkPaymentModal(false);
            setSelectedInvestor(null);
          }}
          onSuccess={handleMarkPaymentSuccess}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkPaymentUploadModal
          distribution={distribution}
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={handleBulkUploadSuccess}
        />
      )}

      {/* Transaction History Modal */}
      {showHistoryModal && selectedInvestorForHistory && (
        <TransactionHistoryModal
          investor={selectedInvestorForHistory}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedInvestorForHistory(null);
          }}
        />
      )}
    </>
  );
}

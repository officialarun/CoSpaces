import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { adminDistributionAPI } from '../../../lib/api';
import { FaDownload, FaUpload, FaCheckCircle, FaTimesCircle, FaClock, FaFileCsv, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import MarkPaymentModal from '../../../components/admin/MarkPaymentModal';
import BulkPaymentUploadModal from '../../../components/admin/BulkPaymentUploadModal';

export default function DistributionPayments() {
  const router = useRouter();
  const { id } = router.query;
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [showMarkPaymentModal, setShowMarkPaymentModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDistribution();
    }
  }, [id]);

  const fetchDistribution = async () => {
    try {
      setLoading(true);
      const response = await adminDistributionAPI.getDistributionById(id);
      setDistribution(response.data.distribution);
    } catch (error) {
      console.error('Error fetching distribution:', error);
      toast.error('Failed to load distribution details');
      router.push('/dashboard?tab=distributions').catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentCSV = () => {
    if (!distribution || !distribution.investorDistributions) {
      toast.error('No investor data available');
      return;
    }

    // CSV Header
    const headers = [
      'Investor Name',
      'Account Number',
      'IFSC Code',
      'Bank Name',
      'Account Holder Name',
      'Payment Amount',
      'UTR',
      'Transaction ID',
      'Payment Date',
      'Remarks'
    ];

    // CSV Rows
    const rows = distribution.investorDistributions.map(inv => {
      const investor = inv.investor;
      const bankAccount = inv.bankAccount || investor?.bankDetails?.[0] || {};
      
      return [
        `${investor?.firstName || ''} ${investor?.lastName || ''}`.trim(),
        bankAccount.accountNumber || '',
        bankAccount.ifscCode || bankAccount.ifsc || '',
        bankAccount.bankName || '',
        bankAccount.accountHolderName || `${investor?.firstName || ''} ${investor?.lastName || ''}`.trim(),
        inv.netAmount?.toFixed(2) || '0.00',
        inv.utr || '',
        inv.transactionId || '',
        inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString('en-IN') : '',
        `Distribution ${distribution.distributionNumber}`
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `distribution_${distribution.distributionNumber}_payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Payment CSV file downloaded successfully!');
  };

  const generateBankBulkPaymentCSV = () => {
    if (!distribution || !distribution.investorDistributions) {
      toast.error('No investor data available');
      return;
    }

    // Standard bank bulk payment format (example format, adjust as per bank requirements)
    const headers = [
      'Beneficiary Name',
      'Account Number',
      'IFSC',
      'Amount',
      'Payment Reference',
      'Payment Remarks'
    ];

    const rows = distribution.investorDistributions.map(inv => {
      const investor = inv.investor;
      const bankAccount = inv.bankAccount || investor?.bankDetails?.[0] || {};
      
      return [
        `${investor?.firstName || ''} ${investor?.lastName || ''}`.trim(),
        bankAccount.accountNumber || '',
        bankAccount.ifscCode || bankAccount.ifsc || '',
        inv.netAmount?.toFixed(2) || '0.00',
        distribution.distributionNumber,
        `Distribution payment - ${distribution.distributionType?.replace(/_/g, ' ') || 'Payment'}`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_payment_${distribution.distributionNumber}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Bank bulk payment CSV downloaded!');
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
    return null;
  }

  const paymentStats = {
    total: distribution.investorDistributions?.length || 0,
    completed: distribution.investorDistributions?.filter(inv => inv.paymentStatus === 'completed').length || 0,
    pending: distribution.investorDistributions?.filter(inv => inv.paymentStatus === 'pending').length || 0,
    processing: distribution.investorDistributions?.filter(inv => inv.paymentStatus === 'processing').length || 0,
    failed: distribution.investorDistributions?.filter(inv => inv.paymentStatus === 'failed').length || 0,
  };

  const canProcessPayments = distribution.status === 'approved' && 
                              distribution.approvals?.assetManagerApproval?.approved &&
                              distribution.approvals?.complianceApproval?.approved &&
                              distribution.approvals?.adminApproval?.approved;

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
                  <p className="text-sm text-gray-600">Generate payment files and manage investor payments</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={generatePaymentCSV}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Download Payment CSV</span>
                  </button>
                  <button
                    onClick={generateBankBulkPaymentCSV}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <FaFileCsv />
                    <span>Download Bank Bulk CSV</span>
                  </button>
                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="btn btn-success flex items-center space-x-2"
                  >
                    <FaUpload />
                    <span>Upload Payment Confirmation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Investor Payment List */}
          <div className="card overflow-x-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Investor Payments</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage individual investor payment status
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
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
                  {distribution.investorDistributions?.map((inv, idx) => {
                    const investor = inv.investor;
                    const bankAccount = inv.bankAccount || investor?.bankDetails?.[0] || {};
                    
                    return (
                      <tr key={idx} className={`hover:bg-gray-50 transition-colors ${inv.paymentStatus === 'completed' ? 'bg-green-50' : ''}`}>
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
                          <span className="font-mono text-sm text-gray-700">
                            {bankAccount.accountNumber ? `****${bankAccount.accountNumber.slice(-4)}` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-gray-700">{bankAccount.ifscCode || bankAccount.ifsc || '-'}</span>
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
    </>
  );
}


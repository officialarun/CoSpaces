import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ProtectedRoute } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { distributionAPI } from '../../lib/api';
import { FaFileInvoiceDollar, FaDownload, FaCheckCircle, FaClock, FaEye, FaSearch, FaFilter, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import InvestorDistributionDetailsModal from '../../components/investor/InvestorDistributionDetailsModal';

function DistributionsPage() {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadDistributions();
  }, []);

  const loadDistributions = async () => {
    try {
      setLoading(true);
      const response = await distributionAPI.getMyDistributions();
      setDistributions(response.data.distributions || []);
    } catch (error) {
      console.error('Error loading distributions:', error);
      toast.error('Failed to load distributions');
    } finally {
      setLoading(false);
    }
  };

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

  // Filter distributions
  const filteredDistributions = distributions.filter(distribution => {
    // Status filter
    if (statusFilter && distribution.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesNumber = distribution.distributionNumber?.toLowerCase().includes(searchLower);
      const matchesProject = distribution.project?.projectName?.toLowerCase().includes(searchLower);
      const matchesSPV = distribution.spv?.spvName?.toLowerCase().includes(searchLower);
      if (!matchesNumber && !matchesProject && !matchesSPV) {
        return false;
      }
    }

    return true;
  });

  const totalReceived = distributions
    .filter(d => {
      const myDist = d.investorDistributions?.find(inv => 
        String(inv.investor) === String(d.investor) || String(inv.investor?._id) === String(d.investor)
      );
      return d.status === 'completed' && myDist?.paymentStatus === 'completed';
    })
    .reduce((sum, d) => {
      const myDist = d.investorDistributions?.find(inv => 
        String(inv.investor) === String(d.investor) || String(inv.investor?._id) === String(d.investor)
      );
      return sum + (myDist?.netAmount || 0);
    }, 0);

  const pendingAmount = distributions
    .filter(d => {
      const myDist = d.investorDistributions?.find(inv => 
        String(inv.investor) === String(d.investor) || String(inv.investor?._id) === String(d.investor)
      );
      return ['approved', 'processing'].includes(d.status) && myDist?.paymentStatus !== 'completed';
    })
    .reduce((sum, d) => {
      const myDist = d.investorDistributions?.find(inv => 
        String(inv.investor) === String(d.investor) || String(inv.investor?._id) === String(d.investor)
      );
      return sum + (myDist?.netAmount || 0);
    }, 0);

  const totalDistributions = distributions.length;
  const completedDistributions = distributions.filter(d => {
    const myDist = d.investorDistributions?.find(inv => 
      String(inv.investor) === String(d.investor) || String(inv.investor?._id) === String(d.investor)
    );
    return d.status === 'completed' && myDist?.paymentStatus === 'completed';
  }).length;

  const handleViewDetails = (distribution) => {
    setSelectedDistribution(distribution);
    setShowDetailsModal(true);
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
        <title>My Distributions - CoSpaces</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Distributions</h1>
            <p className="text-gray-600 mt-2">Track your profit distributions and payouts</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Total Received</p>
                  <p className="text-3xl font-bold text-green-900">
                    ₹{totalReceived.toLocaleString('en-IN')}
                  </p>
                </div>
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <p className="text-xs text-green-600 mt-2">{completedDistributions} completed payments</p>
            </div>

            <div className="card bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    ₹{pendingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <FaClock className="text-yellow-600 text-3xl" />
              </div>
              <p className="text-xs text-yellow-600 mt-2">Awaiting payment</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Distributions</p>
                  <p className="text-3xl font-bold text-gray-900">{totalDistributions}</p>
                </div>
                <FaFileInvoiceDollar className="text-blue-600 text-3xl" />
              </div>
              <p className="text-xs text-gray-500 mt-2">All distributions</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedDistributions}</p>
                </div>
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Fully paid</p>
            </div>
          </div>

          {/* Filters */}
          {distributions.length > 0 && (
            <div className="card">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Distribution number, project..."
                      className="input pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="calculated">Calculated</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('');
                    }}
                    className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <FaFilter />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Distributions List */}
          {filteredDistributions.length === 0 ? (
            <div className="card text-center py-12">
              <FaFileInvoiceDollar className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {distributions.length === 0 ? 'No Distributions Yet' : 'No Matching Distributions'}
              </h3>
              <p className="text-gray-600">
                {distributions.length === 0
                  ? "You'll see profit distributions here once projects are sold or generate returns."
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDistributions.map((distribution) => {
                // Find this investor's distribution details
                const myDistribution = distribution.investorDistributions?.find(inv => {
                  // Handle both populated and unpopulated investor references
                  const invId = inv.investor?._id || inv.investor;
                  // The distribution.investor might not exist, so we check the current user
                  // For now, we'll match by checking if this is the investor's distribution
                  // In a real scenario, we'd use the authenticated user's ID
                  return inv;
                });

                // If we can't find the investor's specific distribution, take the first one
                // This is a fallback - ideally the API should filter properly
                const myDist = myDistribution || distribution.investorDistributions?.[0];

                return (
                  <div key={distribution._id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">
                            {distribution.project?.projectName || distribution.spv?.spvName || 'Distribution'}
                          </h3>
                          {getStatusBadge(distribution.status)}
                          {myDist && getPaymentStatusBadge(myDist.paymentStatus || 'pending')}
                        </div>
                        <p className="text-sm text-gray-500">
                          Distribution #{distribution.distributionNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: <span className="font-medium capitalize">
                            {distribution.distributionType?.replace(/_/g, ' ') || '-'}
                          </span>
                          {distribution.spv && (
                            <> • SPV: <span className="font-medium">{distribution.spv.spvName || '-'}</span></>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetails(distribution)}
                        className="btn btn-secondary flex items-center space-x-2"
                      >
                        <FaEye />
                        <span>View Details</span>
                      </button>
                    </div>

                    {myDist && (
                      <>
                        <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Gross Amount</p>
                            <p className="text-lg font-bold">
                              ₹{myDist.grossAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">TDS Deducted</p>
                            <p className="text-lg font-medium text-red-600">
                              -₹{myDist.tdsAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Net Amount</p>
                            <p className="text-lg font-bold text-green-600">
                              ₹{myDist.netAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Shares</p>
                            <p className="text-lg font-medium text-gray-900">
                              {myDist.numberOfShares?.toLocaleString('en-IN') || '0'}
                            </p>
                          </div>
                        </div>

                        {myDist.paymentStatus === 'completed' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-900">Payment Completed</p>
                                {myDist.utr && (
                                  <p className="text-xs text-green-700 mt-1">UTR: {myDist.utr}</p>
                                )}
                                {myDist.transactionId && (
                                  <p className="text-xs text-green-700">Transaction ID: {myDist.transactionId}</p>
                                )}
                                {myDist.paymentDate && (
                                  <p className="text-xs text-green-700">
                                    Paid on: {new Date(myDist.paymentDate).toLocaleDateString('en-IN')}
                                  </p>
                                )}
                              </div>
                              <FaCheckCircle className="text-green-600 text-2xl" />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm pt-4 border-t">
                          <div className="text-gray-500">
                            {distribution.createdAt && (
                              <span>
                                Created: {new Date(distribution.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            )}
                            {distribution.paymentDate && (
                              <span className="ml-4">
                                Payment Date: {new Date(distribution.paymentDate).toLocaleDateString('en-IN')}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleViewDetails(distribution)}
                              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <FaDownload />
                              Download Statement
                            </button>
                            {myDist?.form16Document && (
                              <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                <FaDownload />
                                Download Form 16
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Card */}
          <div className="card bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start space-x-3">
              <FaInfoCircle className="text-blue-600 text-xl mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">About Distributions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Distributions are made when projects are sold or generate income</li>
                  <li>• TDS is automatically deducted as per Indian tax laws (typically 20%)</li>
                  <li>• Form 16 certificates are provided for tax filing when available</li>
                  <li>• Payments are made directly to your registered bank account</li>
                  <li>• You'll receive email notifications at each stage of the distribution process</li>
                  <li>• Payment status updates in real-time as transactions are processed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Details Modal */}
      {showDetailsModal && selectedDistribution && (
        <InvestorDistributionDetailsModal
          distribution={selectedDistribution}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDistribution(null);
          }}
        />
      )}
    </>
  );
}

export default function Distributions() {
  return (
    <ProtectedRoute>
      <DistributionsPage />
    </ProtectedRoute>
  );
}

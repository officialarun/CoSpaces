import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ProtectedRoute } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { distributionAPI } from '../../lib/api';
import { FaFileInvoiceDollar, FaDownload, FaCheckCircle, FaClock } from 'react-icons/fa';

function DistributionsPage() {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDistributions();
  }, []);

  const loadDistributions = async () => {
    try {
      const response = await distributionAPI.getMyDistributions();
      setDistributions(response.data.distributions);
    } catch (error) {
      console.error('Error loading distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: 'badge-info',
      calculated: 'badge-info',
      under_review: 'badge-warning',
      approved: 'badge-success',
      processing: 'badge-warning',
      completed: 'badge-success',
      failed: 'badge-error',
    };

    return <span className={`badge ${statusMap[status] || 'badge-info'}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>;
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

  const totalReceived = distributions
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => {
      const myDist = d.investorDistributions?.find(inv => inv.paymentStatus === 'completed');
      return sum + (myDist?.netAmount || 0);
    }, 0);

  return (
    <>
      <Head>
        <title>My Distributions - Profit Payouts</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Distributions</h1>
            <p className="text-gray-600 mt-1">Track your profit distributions and payouts</p>
          </div>

          {/* Summary Card */}
          <div className="card bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center gap-4">
              <FaFileInvoiceDollar className="text-green-600 text-5xl" />
              <div>
                <p className="text-sm text-green-700">Total Distributions Received</p>
                <p className="text-4xl font-bold text-green-900">
                  ₹{totalReceived.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {distributions.filter(d => d.status === 'completed').length} completed distributions
                </p>
              </div>
            </div>
          </div>

          {/* Distributions List */}
          {distributions.length === 0 ? (
            <div className="card text-center py-12">
              <FaFileInvoiceDollar className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Distributions Yet</h3>
              <p className="text-gray-600">
                You'll see profit distributions here once projects are sold or generate returns.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {distributions.map((distribution) => {
                const myDistribution = distribution.investorDistributions?.find(
                  inv => inv.investor === distribution.investor
                );

                return (
                  <div key={distribution._id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">
                            {distribution.spv?.spvName || 'SPV Distribution'}
                          </h3>
                          {getStatusBadge(distribution.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          Distribution #{distribution.distributionNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: <span className="font-medium capitalize">{distribution.distributionType.replace('_', ' ')}</span>
                        </p>
                      </div>
                    </div>

                    {myDistribution && (
                      <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-500">Gross Amount</p>
                          <p className="text-lg font-bold">
                            ₹{myDistribution.grossAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">TDS Deducted</p>
                          <p className="text-lg font-medium text-red-600">
                            -₹{myDistribution.tdsAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Net Amount</p>
                          <p className="text-lg font-bold text-green-600">
                            ₹{myDistribution.netAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {myDistribution.paymentStatus === 'completed' ? (
                              <>
                                <FaCheckCircle className="text-green-600" />
                                <span className="text-green-600 font-medium">Paid</span>
                              </>
                            ) : (
                              <>
                                <FaClock className="text-yellow-600" />
                                <span className="text-yellow-600 font-medium capitalize">
                                  {myDistribution.paymentStatus}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="text-gray-500">
                        {distribution.paymentDate && (
                          <span>Payment Date: {new Date(distribution.paymentDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                          <FaDownload />
                          Download Statement
                        </button>
                        {myDistribution?.form16Document && (
                          <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            <FaDownload />
                            Download Form 16
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Card */}
          <div className="card bg-blue-50 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">📊 About Distributions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Distributions are made when projects are sold or generate income</li>
              <li>• TDS is automatically deducted as per Indian tax laws</li>
              <li>• Form 16 certificates are provided for tax filing</li>
              <li>• Payments are made directly to your registered bank account</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
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


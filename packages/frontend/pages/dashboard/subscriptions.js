import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { subscriptionAPI } from '../../lib/api';
import { FaFileInvoice, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getMySubscriptions();
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { color: 'badge-info', label: 'Draft' },
      submitted: { color: 'badge-info', label: 'Submitted' },
      under_review: { color: 'badge-warning', label: 'Under Review' },
      approved: { color: 'badge-success', label: 'Approved' },
      payment_pending: { color: 'badge-warning', label: 'Payment Pending' },
      payment_confirmed: { color: 'badge-success', label: 'Payment Confirmed' },
      shares_allocated: { color: 'badge-success', label: 'Shares Allocated' },
      completed: { color: 'badge-success', label: 'Completed' },
      rejected: { color: 'badge-error', label: 'Rejected' },
      cancelled: { color: 'badge-error', label: 'Cancelled' },
    };

    const config = statusMap[status] || { color: 'badge-info', label: status };
    return <span className={`badge ${config.color}`}>{config.label}</span>;
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
        <title>My Subscriptions - Investment Applications</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
              <p className="text-gray-600 mt-1">Track your investment applications</p>
            </div>
            <Link href="/projects" className="btn-primary">
              Browse Projects
            </Link>
          </div>

          {subscriptions.length === 0 ? (
            <div className="card text-center py-12">
              <FaFileInvoice className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Subscriptions Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't created any investment subscriptions yet.
              </p>
              <Link href="/projects" className="btn-primary inline-block">
                Explore Projects
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {subscription.spv?.spvName || subscription.project?.projectName}
                        </h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Subscription Number</p>
                          <p className="font-medium">{subscription.subscriptionNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Committed Amount</p>
                          <p className="font-medium text-lg">
                            ₹{subscription.committedAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Number of Shares</p>
                          <p className="font-medium">{subscription.numberOfShares || 'TBD'}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3 text-sm">
                        {subscription.documents?.ppmAccepted && (
                          <div className="flex items-center text-green-600">
                            <FaCheckCircle className="mr-1" />
                            PPM Accepted
                          </div>
                        )}
                        {subscription.documents?.subscriptionAgreementSigned && (
                          <div className="flex items-center text-green-600">
                            <FaCheckCircle className="mr-1" />
                            Documents Signed
                          </div>
                        )}
                        {subscription.payment?.paymentConfirmedDate && (
                          <div className="flex items-center text-green-600">
                            <FaCheckCircle className="mr-1" />
                            Payment Confirmed
                          </div>
                        )}
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        Submitted: {new Date(subscription.submittedAt || subscription.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="ml-4">
                      <Link
                        href={`/dashboard/subscriptions/${subscription._id}`}
                        className="btn-outline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className={`flex items-center ${subscription.status !== 'draft' ? 'text-green-600' : 'text-gray-400'}`}>
                        <FaCheckCircle className="mr-1" />
                        Submitted
                      </div>
                      <div className={`flex items-center ${['approved', 'payment_confirmed', 'shares_allocated', 'completed'].includes(subscription.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <FaCheckCircle className="mr-1" />
                        Approved
                      </div>
                      <div className={`flex items-center ${['payment_confirmed', 'shares_allocated', 'completed'].includes(subscription.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <FaCheckCircle className="mr-1" />
                        Payment
                      </div>
                      <div className={`flex items-center ${['shares_allocated', 'completed'].includes(subscription.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <FaCheckCircle className="mr-1" />
                        Shares
                      </div>
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

export default function Subscriptions() {
  return (
    <ProtectedRoute>
      <SubscriptionsPage />
    </ProtectedRoute>
  );
}


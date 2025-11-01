import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import { subscriptionAPI, distributionAPI, reportAPI } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import { FaChartLine, FaWallet, FaFileInvoiceDollar, FaLandmark, FaShieldAlt } from 'react-icons/fa';

function DashboardHome() {
  const { user, loadUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh user data on mount to ensure KYC status is up to date
    loadUser();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [portfolioRes, subscriptionsRes, distributionsRes] = await Promise.all([
        reportAPI.getPortfolio(),
        subscriptionAPI.getMySubscriptions(),
        distributionAPI.getMyDistributions()
      ]);
      
      setPortfolio(portfolioRes.data.portfolio);
      setSubscriptions(subscriptionsRes.data.subscriptions);
      setDistributions(distributionsRes.data.distributions);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
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
        <title>Dashboard - Fractional Land SPV Platform</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.displayName}!
            </h1>
            <p className="text-gray-600 mt-1">Here's an overview of your investments</p>
          </div>

          {/* DIDIT Verification Banner */}
          {!user.diditVerification?.isVerified && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-400 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <FaShieldAlt className="text-indigo-600 text-2xl" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      Identity Verification Required
                    </p>
                    <p className="text-xs text-indigo-700">
                      Verify your identity with Aadhaar to unlock all investment opportunities
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/verify-didit" className="btn-primary text-sm whitespace-nowrap">
                  Verify Now
                </Link>
              </div>
            </div>
          )}

          {/* Phone Number Required Banner (for OAuth users) */}
          {!user.phone && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-blue-700">
                    Phone number required for KYC verification. Please add your phone number to continue.
                  </p>
                </div>
                <Link href="/kyc/onboarding" className="btn-primary text-sm">
                  Add Phone
                </Link>
              </div>
            </div>
          )}

          {/* KYC Status Banner */}
          {user.kycStatus !== 'approved' && (() => {
            const getBannerConfig = () => {
              const status = user.kycStatus || 'pending';
              
              if (status === 'pending' || !status) {
                return {
                  message: 'Complete your KYC verification to start investing in projects.',
                  buttonText: 'Complete KYC',
                  href: '/kyc/onboarding',
                  bgColor: 'bg-yellow-50',
                  borderColor: 'border-yellow-400',
                  textColor: 'text-yellow-700'
                };
              } else if (status === 'submitted' || status === 'under_review') {
                return {
                  message: `Your KYC is ${status.replace('_', ' ')}. Our team is reviewing your documents.`,
                  buttonText: 'View KYC Status',
                  href: '/kyc/status',
                  bgColor: 'bg-blue-50',
                  borderColor: 'border-blue-400',
                  textColor: 'text-blue-700'
                };
              } else if (status === 'rejected') {
                return {
                  message: 'Your KYC was rejected. Please resubmit with correct information.',
                  buttonText: 'Resubmit KYC',
                  href: '/kyc/onboarding',
                  bgColor: 'bg-red-50',
                  borderColor: 'border-red-400',
                  textColor: 'text-red-700'
                };
              }
              
              return {
                message: `Your KYC status is ${status}. Complete your KYC to start investing.`,
                buttonText: 'Complete KYC',
                href: '/kyc/onboarding',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-400',
                textColor: 'text-yellow-700'
              };
            };
            
            const config = getBannerConfig();
            
            return (
              <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4`}>
                <div className="flex">
                  <div className="flex-1">
                    <p className={`text-sm ${config.textColor}`}>
                      {config.message}
                    </p>
                  </div>
                  <Link href={config.href} className="btn-primary text-sm">
                    {config.buttonText}
                  </Link>
                </div>
              </div>
            );
          })()}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{portfolio?.totalInvested?.toLocaleString() || 0}
                  </p>
                </div>
                <FaWallet className="text-primary-600 text-3xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Investments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolio?.activeInvestments || 0}
                  </p>
                </div>
                <FaLandmark className="text-green-600 text-3xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Distributions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{portfolio?.totalDistributions?.toLocaleString() || 0}
                  </p>
                </div>
                <FaFileInvoiceDollar className="text-blue-600 text-3xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{((portfolio?.totalInvested || 0) + (portfolio?.totalDistributions || 0)).toLocaleString()}
                  </p>
                </div>
                <FaChartLine className="text-purple-600 text-3xl" />
              </div>
            </div>
          </div>

          {/* My Investments */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">My Investments</h2>
            {portfolio?.investments?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPV</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invested</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shares</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distributions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {portfolio.investments.map((investment) => (
                      <tr key={investment.spv}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{investment.spv}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          ₹{investment.invested.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {investment.shares}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          ₹{investment.distributionsReceived.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link href={`/investments/${investment.spv}`} className="text-primary-600 hover:text-primary-700">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You don't have any investments yet</p>
                <Link href="/projects" className="btn-primary">
                  Browse Projects
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Subscriptions</h2>
              {subscriptions.slice(0, 5).map((sub) => (
                <div key={sub._id} className="border-b border-gray-200 py-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{sub.spv?.spvName}</p>
                      <p className="text-sm text-gray-500">₹{sub.committedAmount.toLocaleString()}</p>
                    </div>
                    <span className={`badge badge-${sub.status === 'completed' ? 'success' : sub.status === 'rejected' ? 'error' : 'warning'}`}>
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Distributions</h2>
              {distributions.slice(0, 5).map((dist) => (
                <div key={dist._id} className="border-b border-gray-200 py-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{dist.spv?.spvName}</p>
                      <p className="text-sm text-gray-500">
                        {dist.investorDistributions.find(inv => inv.investor === user._id)?.netAmount.toLocaleString()}
                      </p>
                    </div>
                    <span className={`badge badge-${dist.status === 'completed' ? 'success' : 'info'}`}>
                      {dist.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardHome />
    </ProtectedRoute>
  );
}


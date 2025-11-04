import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import { distributionAPI, reportAPI } from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import { FaChartLine, FaWallet, FaFileInvoiceDollar, FaLandmark, FaShieldAlt, FaArrowUp, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

function DashboardHome() {
  const { user, loadUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh user data on mount to ensure KYC status is up to date
    loadUser();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [portfolioRes, distributionsRes] = await Promise.all([
        reportAPI.getPortfolio(),
        distributionAPI.getMyDistributions()
      ]);
      
      setPortfolio(portfolioRes.data.portfolio);
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
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - CoSpaces</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {user.displayName}! 👋
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Here's an overview of your investment portfolio</p>
            </div>
          </div>

          {/* DIDIT Verification Banner */}
          {!user.diditVerification?.isVerified && (
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                    <FaShieldAlt className="text-3xl" />
                  </div>
                  <div>
                    <p className="text-lg font-bold mb-1">
                      Identity Verification Required
                    </p>
                    <p className="text-blue-100">
                      Verify your identity with Aadhaar to unlock all investment opportunities
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/verify-didit" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg whitespace-nowrap">
                  Verify Now
                </Link>
              </div>
            </div>
          )}

          {/* Phone Number Required Banner (for OAuth users) */}
          {!user.phone && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-lg font-semibold">
                    Phone number required for KYC verification. Please add your phone number to continue.
                  </p>
                </div>
                <Link href="/kyc/onboarding" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg whitespace-nowrap ml-4">
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
                  gradient: 'from-yellow-500 to-orange-600',
                  icon: FaShieldAlt
                };
              } else if (status === 'submitted' || status === 'under_review') {
                return {
                  message: `Your KYC is ${status.replace('_', ' ')}. Our team is reviewing your documents.`,
                  buttonText: 'View KYC Status',
                  href: '/kyc/status',
                  gradient: 'from-blue-500 to-indigo-600',
                  icon: FaCheckCircle
                };
              } else if (status === 'rejected') {
                return {
                  message: 'Your KYC was rejected. Please resubmit with correct information.',
                  buttonText: 'Resubmit KYC',
                  href: '/kyc/onboarding',
                  gradient: 'from-red-500 to-pink-600',
                  icon: FaShieldAlt
                };
              }
              
              return {
                message: `Your KYC status is ${status}. Complete your KYC to start investing.`,
                buttonText: 'Complete KYC',
                href: '/kyc/onboarding',
                gradient: 'from-yellow-500 to-orange-600',
                icon: FaShieldAlt
              };
            };
            
            const config = getBannerConfig();
            
            return (
              <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 shadow-xl text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="bg-white bg-opacity-20 p-4 rounded-xl">
                      <config.icon className="text-3xl" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {config.message}
                      </p>
                    </div>
                  </div>
                  <Link href={config.href} className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg whitespace-nowrap">
                    {config.buttonText}
                  </Link>
                </div>
              </div>
            );
          })()}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Invested</p>
                  <p className="text-3xl font-bold">
                    ₹{portfolio?.totalInvested?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <FaWallet className="text-2xl" />
                </div>
              </div>
              <div className="flex items-center text-blue-100 text-sm">
                <FaArrowUp className="mr-1" />
                <span>Portfolio value</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Active Investments</p>
                  <p className="text-3xl font-bold">
                    {portfolio?.activeInvestments || 0}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <FaLandmark className="text-2xl" />
                </div>
              </div>
              <div className="flex items-center text-green-100 text-sm">
                <span>Projects invested</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Total Distributions</p>
                  <p className="text-3xl font-bold">
                    ₹{portfolio?.totalDistributions?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <FaFileInvoiceDollar className="text-2xl" />
                </div>
              </div>
              <div className="flex items-center text-purple-100 text-sm">
                <span>Returns received</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Current Value</p>
                  <p className="text-3xl font-bold">
                    ₹{((portfolio?.totalInvested || 0) + (portfolio?.totalDistributions || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <FaChartLine className="text-2xl" />
                </div>
              </div>
              <div className="flex items-center text-orange-100 text-sm">
                <FaArrowUp className="mr-1" />
                <span>Total portfolio value</span>
              </div>
            </div>
          </div>

          {/* My Investments */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Investments</h2>
              <Link href="/dashboard/investments" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
                View All <FaArrowRight className="ml-2" />
              </Link>
            </div>
            {portfolio?.investments?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SPV</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invested</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shares</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Distributions</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {portfolio.investments.map((investment) => (
                      <tr key={investment.spv} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{investment.spv}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          ₹{investment.invested.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {investment.shares}
                        </td>
                        <td className="px-6 py-4 text-green-600 font-semibold">
                          ₹{investment.distributionsReceived.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/investments/${investment.spv}`} className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
                            View Details <FaArrowRight className="ml-2 text-sm" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaLandmark className="text-gray-400 text-4xl" />
                </div>
                <p className="text-gray-600 text-lg mb-6">You don't have any investments yet</p>
                <Link href="/projects" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-block">
                  Browse Projects
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Distributions</h2>
              {distributions.slice(0, 5).length > 0 ? (
                <div className="space-y-4">
                  {distributions.slice(0, 5).map((dist) => (
                    <div key={dist._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{dist.spv?.spvName}</p>
                        <p className="text-sm text-green-600 font-medium">
                          ₹{dist.investorDistributions.find(inv => inv.investor === user._id)?.netAmount.toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        dist.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {dist.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No distributions yet</p>
              )}
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

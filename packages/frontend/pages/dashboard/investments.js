import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { reportAPI } from '../../lib/api';
import { FaLandmark, FaChartLine, FaCalendar, FaDownload, FaArrowRight, FaPercentage } from 'react-icons/fa';

function MyInvestments() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await reportAPI.getPortfolio();
      setPortfolio(response.data.portfolio);
    } catch (error) {
      console.error('Error loading portfolio:', error);
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
        <title>My Investments - Portfolio</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Investments</h1>
            <p className="text-gray-600 mt-2 text-lg">Track and manage your investment portfolio</p>
          </div>

          {/* Portfolio Summary */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Invested</p>
                  <p className="text-4xl font-bold">
                    ₹{portfolio?.totalInvested?.toLocaleString() || 0}
                  </p>
                  <p className="text-blue-100 text-sm mt-2">
                    Across {portfolio?.activeInvestments || 0} projects
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <FaLandmark className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-green-100 text-sm font-medium mb-1">Total Distributions</p>
                  <p className="text-4xl font-bold">
                    ₹{portfolio?.totalDistributions?.toLocaleString() || 0}
                  </p>
                  <p className="text-green-100 text-sm mt-2">
                    Returns received to date
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <FaChartLine className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-purple-100 text-sm font-medium mb-1">Current Value</p>
                  <p className="text-4xl font-bold">
                    ₹{((portfolio?.totalInvested || 0) + (portfolio?.totalDistributions || 0)).toLocaleString()}
                  </p>
                  <p className="text-purple-100 text-sm mt-2 flex items-center">
                    <FaChartLine className="mr-1" />
                    Portfolio tracking
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <FaCalendar className="text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Investments List */}
          {portfolio?.investments && portfolio.investments.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Investments</h2>
              {portfolio.investments.map((investment, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-md">
                        <FaLandmark className="text-white text-3xl" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{investment.spv}</h3>
                        <p className="text-sm text-gray-500 mt-1">Project ID: {investment.projectId}</p>
                      </div>
                    </div>
                    <Link href={`/projects/${investment.projectId}`} className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
                      View Project <FaArrowRight className="ml-2" />
                    </Link>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1 flex items-center">
                        <FaLandmark className="mr-2 text-blue-600" />
                        Invested Amount
                      </p>
                      <p className="text-2xl font-bold text-gray-900">₹{investment.invested.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Shares Owned</p>
                      <p className="text-2xl font-bold text-gray-900">{investment.shares?.toLocaleString() || 'N/A'}</p>
                    </div>
                    {investment.equityPercentage !== null && investment.equityPercentage !== undefined && investment.hasSPV ? (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                        <p className="text-sm text-blue-600 mb-1 flex items-center font-semibold">
                          <FaPercentage className="mr-2" />
                          Equity Share
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {investment.equityPercentage.toFixed(2)}%
                        </p>
                      </div>
                    ) : null}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-sm text-green-600 mb-1 font-semibold">Distributions Received</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{investment.distributionsReceived.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                      <p className="text-sm text-purple-600 mb-1 font-semibold">Total Value</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{(investment.invested + investment.distributionsReceived).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link href={`/projects/${investment.projectId}`} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center">
                      View Project Details <FaArrowRight className="ml-2" />
                    </Link>
                    <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center">
                      <FaDownload className="mr-2" />
                      Download Statement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 shadow-lg border border-gray-100 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaLandmark className="text-blue-600 text-5xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Active Investments</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Start your investment journey by exploring available projects and opportunities.
              </p>
              <Link href="/projects" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center">
                Browse Projects <FaArrowRight className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

export default function Investments() {
  return (
    <ProtectedRoute>
      <MyInvestments />
    </ProtectedRoute>
  );
}

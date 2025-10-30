import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { reportAPI } from '../../lib/api';
import { FaLandmark, FaChartLine, FaCalendar } from 'react-icons/fa';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>

          {/* Portfolio Summary */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-sm text-gray-500 mb-1">Total Invested</h3>
              <p className="text-3xl font-bold text-gray-900">
                ₹{portfolio?.totalInvested?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Across {portfolio?.activeInvestments || 0} projects
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm text-gray-500 mb-1">Total Distributions</h3>
              <p className="text-3xl font-bold text-green-600">
                ₹{portfolio?.totalDistributions?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Received to date
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm text-gray-500 mb-1">Current Value</h3>
              <p className="text-3xl font-bold text-primary-600">
                ₹{((portfolio?.totalInvested || 0) + (portfolio?.totalDistributions || 0)).toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">
                <FaChartLine className="inline mr-1" />
                Growth tracking
              </p>
            </div>
          </div>

          {/* Investments List */}
          {portfolio?.investments && portfolio.investments.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Active Investments</h2>
              {portfolio.investments.map((investment, index) => (
                <div key={index} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FaLandmark className="text-primary-600 text-2xl" />
                        <div>
                          <h3 className="text-xl font-bold">{investment.spv}</h3>
                          <p className="text-sm text-gray-500">Project ID: {investment.projectId}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Invested Amount</p>
                          <p className="text-lg font-bold">₹{investment.invested.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Shares Owned</p>
                          <p className="text-lg font-bold">{investment.shares}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Distributions Received</p>
                          <p className="text-lg font-bold text-green-600">
                            ₹{investment.distributionsReceived.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Value</p>
                          <p className="text-lg font-bold text-primary-600">
                            ₹{(investment.invested + investment.distributionsReceived).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <Link href={`/projects/${investment.projectId}`} className="text-primary-600 hover:text-primary-700 text-sm">
                          View Project →
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button className="text-primary-600 hover:text-primary-700 text-sm">
                          Download Statement
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <FaLandmark className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Investments</h3>
              <p className="text-gray-600 mb-6">
                Start your investment journey by exploring available projects.
              </p>
              <Link href="/projects" className="btn-primary inline-block">
                Browse Projects
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


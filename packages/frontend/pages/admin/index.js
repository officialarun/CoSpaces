import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { reportAPI } from '../../lib/api';
import { FaUsers, FaLandmark, FaFileInvoice, FaRupeeSign, FaChartLine, FaShieldAlt } from 'react-icons/fa';

function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await reportAPI.getPlatformSummary();
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading summary:', error);
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
        <title>Admin Dashboard - Platform Management</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Platform overview and management</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold">{summary?.users || 0}</p>
                </div>
                <FaUsers className="text-primary-600 text-4xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-3xl font-bold">{summary?.projects || 0}</p>
                </div>
                <FaLandmark className="text-green-600 text-4xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active SPVs</p>
                  <p className="text-3xl font-bold">{summary?.spvs || 0}</p>
                </div>
                <FaFileInvoice className="text-blue-600 text-4xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Raised</p>
                  <p className="text-2xl font-bold">
                    ₹{((summary?.totalRaised || 0) / 10000000).toFixed(2)}Cr
                  </p>
                </div>
                <FaRupeeSign className="text-purple-600 text-4xl" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/admin/compliance" className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <FaShieldAlt className="text-yellow-600 text-4xl" />
                <div>
                  <h3 className="text-lg font-bold">Compliance Dashboard</h3>
                  <p className="text-sm text-gray-600">Review KYC and AML status</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/projects" className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <FaLandmark className="text-green-600 text-4xl" />
                <div>
                  <h3 className="text-lg font-bold">Manage Projects</h3>
                  <p className="text-sm text-gray-600">Create and approve projects</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/users" className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <FaUsers className="text-blue-600 text-4xl" />
                <div>
                  <h3 className="text-lg font-bold">User Management</h3>
                  <p className="text-sm text-gray-600">Manage users and roles</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-500 text-center py-8">Activity feed coming soon...</p>
          </div>

          {/* Platform Health */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Platform Health</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">System Status</span>
                </div>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Database</span>
                </div>
                <p className="text-sm text-gray-600">Connected</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">API</span>
                </div>
                <p className="text-sm text-gray-600">Healthy</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'asset_manager', 'compliance_officer']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}


import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ProtectedRoute } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { complianceAPI, kycAPI } from '../../lib/api';
import { FaCheckCircle, FaExclamationTriangle, FaUsers, FaFileAlt } from 'react-icons/fa';

function ComplianceDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      const [dashboardRes, kycRes] = await Promise.all([
        complianceAPI.getComplianceDashboard(),
        kycAPI.getAllKYC({ status: 'submitted', limit: 10 })
      ]);

      setDashboard(dashboardRes.data.dashboard);
      setPendingKYC(kycRes.data.kycs);
    } catch (error) {
      console.error('Error loading compliance data:', error);
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
        <title>Compliance Dashboard - Admin</title>
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending KYC</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboard?.kyc?.pending || 0}
                  </p>
                </div>
                <FaFileAlt className="text-yellow-600 text-3xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved KYC</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboard?.kyc?.approved || 0}
                  </p>
                </div>
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AML Flagged</p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboard?.aml?.flagged || 0}
                  </p>
                </div>
                <FaExclamationTriangle className="text-red-600 text-3xl" />
              </div>
            </div>

          </div>

          {/* Pending KYC Reviews */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Pending KYC Reviews</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingKYC.map((kyc) => (
                    <tr key={kyc._id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {kyc.user?.firstName} {kyc.user?.lastName || kyc.user?.entityName}
                        </div>
                        <div className="text-sm text-gray-500">{kyc.user?.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {kyc.user?.userType}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(kyc.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="badge badge-warning">{kyc.verificationStatus}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <a href={`/admin/kyc/${kyc.user._id}`} className="text-primary-600 hover:text-primary-700">
                          Review
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}

export default function CompliancePage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'compliance_officer']}>
      <ComplianceDashboard />
    </ProtectedRoute>
  );
}


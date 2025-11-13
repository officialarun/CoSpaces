import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withAuth } from '../lib/auth';
import AdminLayout from '../components/AdminLayout';
import UsersTab from '../components/UsersTab';
import StaffManagementTab from '../components/StaffManagementTab';
import ProjectsTab from '../components/ProjectsTab';
import KYCTab from '../components/KYCTab';
import StatsTab from '../components/StatsTab';
import PublishSitesTab from '../components/PublishSitesTab';
import TrustTab from '../components/TrustTab';
import SPVsTab from '../components/SPVsTab';
import AssignSPVTab from '../components/AssignSPVTab';
import DistributionsTab from '../components/DistributionsTab';
import { adminStatsAPI } from '../lib/api';
import { FaClock, FaSync } from 'react-icons/fa';

function Dashboard() {
  const router = useRouter();
  const activeTab = router.query.tab || 'users';
  const [pendingKYCCount, setPendingKYCCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch stats for badges
    fetchStats();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await adminStatsAPI.getStats();
      const stats = response.data.data.stats;
      setPendingKYCCount(stats.kyc.pending);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchStats();
    setLastUpdated(new Date());
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab />;
      case 'staff':
        return <StaffManagementTab />;
      case 'projects':
        return <ProjectsTab />;
      case 'publish':
        return <PublishSitesTab />;
      case 'trust':
        return <TrustTab />;
      case 'spvs':
        return <SPVsTab />;
      case 'assign':
        return <AssignSPVTab />;
      case 'distributions':
        return <DistributionsTab />;
      case 'kyc':
        return <KYCTab />;
      case 'stats':
        return <StatsTab />;
      default:
        return <UsersTab />;
    }
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - CoSpaces</title>
      </Head>

      <AdminLayout activeTab={activeTab}>
        <div className="space-y-6">
          {/* Info Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FaClock className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Auto-refresh enabled</p>
                  <p className="text-xs text-gray-500">Data updates every 30 seconds automatically</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Last updated</p>
                  <p className="text-sm font-medium text-gray-900">{lastUpdated.toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {renderTabContent()}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default withAuth(Dashboard);

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withAuth } from '../lib/auth';
import AdminLayout from '../components/AdminLayout';
import UsersTab from '../components/UsersTab';
import ProjectsTab from '../components/ProjectsTab';
import KYCTab from '../components/KYCTab';
import StatsTab from '../components/StatsTab';
import PublishSitesTab from '../components/PublishSitesTab';
import TrustTab from '../components/TrustTab';
import SPVsTab from '../components/SPVsTab';
import AssignSPVTab from '../components/AssignSPVTab';
import { adminStatsAPI } from '../lib/api';

function Dashboard() {
  const router = useRouter();
  const activeTab = router.query.tab || 'users';
  const [pendingKYCCount, setPendingKYCCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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
      const response = await adminStatsAPI.getStats();
      const stats = response.data.data.stats;
      setPendingKYCCount(stats.kyc.pending);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab />;
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
        <title>Admin Dashboard - Fractional Land SPV Platform</title>
      </Head>

      <AdminLayout activeTab={activeTab}>
        <div className="space-y-6">
          {/* Info Bar */}
          <div className="flex justify-between items-center bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">
              Auto-refresh enabled • Updates every 30 seconds
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default withAuth(Dashboard);


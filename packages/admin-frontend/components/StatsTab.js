import { useState, useEffect } from 'react';
import { adminStatsAPI } from '../lib/api';
import { FaUsers, FaFolderOpen, FaCheckCircle, FaChartLine, FaSpinner } from 'react-icons/fa';

export default function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminStatsAPI.getStats();
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      icon: FaUsers,
      color: 'bg-blue-500',
      details: [
        { label: 'Active', value: stats.users.active },
        { label: 'Investors', value: stats.users.investors },
        { label: 'Asset Managers', value: stats.users.assetManagers },
      ],
    },
    {
      title: 'Projects',
      value: stats.projects.total,
      icon: FaFolderOpen,
      color: 'bg-green-500',
      details: [
        { label: 'Listed', value: stats.projects.listed },
        { label: 'Fundraising', value: stats.projects.fundraising },
        { label: 'Draft', value: stats.projects.draft },
      ],
    },
    {
      title: 'KYC Status',
      value: stats.kyc.submitted,
      icon: FaCheckCircle,
      color: 'bg-yellow-500',
      details: [
        { label: 'Pending', value: stats.kyc.pending },
        { label: 'Under Review', value: stats.kyc.underReview },
        { label: 'Approved', value: stats.kyc.approved },
        { label: 'Rejected', value: stats.kyc.rejected },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Statistics</h2>
        <p className="text-gray-600">Overview of your platform's key metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                <div className={`${card.color} p-3 rounded-xl`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Main Value */}
              <div className="px-6 py-6">
                <div className="text-4xl font-bold text-gray-900 mb-4">{card.value}</div>

                {/* Details */}
                <div className="space-y-2">
                  {card.details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{detail.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FaChartLine className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Platform Insights</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Total platform users: <span className="font-semibold">{stats.users.total}</span></li>
              <li>• Active KYC submissions: <span className="font-semibold">{stats.kyc.submitted}</span></li>
              <li>• Projects awaiting approval: <span className="font-semibold">{stats.projects.draft}</span></li>
              <li>• Current fundraising campaigns: <span className="font-semibold">{stats.projects.fundraising}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


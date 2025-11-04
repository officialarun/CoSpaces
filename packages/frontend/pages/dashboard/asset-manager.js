import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { ProtectedRoute } from '../../lib/auth';
import { useAuth } from '../../lib/auth';
import { distributionAPI, projectAPI } from '../../lib/api';
import { FaClock, FaProjectDiagram, FaFileInvoice, FaEye, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';
import DistributionApprovalModal from '../../components/asset-manager/DistributionApprovalModal';

function AssetManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalProjects: 0,
    activeDistributions: 0,
    totalDistributions: 0
  });
  const [pendingDistributions, setPendingDistributions] = useState([]);
  const [allDistributions, setAllDistributions] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch distributions for this asset manager
      const distributionsRes = await distributionAPI.getDistributionsByAssetManager(user._id);
      const distributions = distributionsRes.data?.distributions || [];
      
      // Filter pending distributions (calculated status, not yet approved by asset manager)
      const pending = distributions.filter(d => 
        d.status === 'calculated' && 
        !d.approvals?.assetManagerApproval?.approved
      );
      
      // Count active distributions (not completed or cancelled)
      const active = distributions.filter(d => 
        !['completed', 'cancelled'].includes(d.status)
      );

      // Fetch projects assigned to this asset manager
      const projectsRes = await projectAPI.getProjects({ assetManager: user._id, limit: 100 });
      const projects = projectsRes.data?.projects || projectsRes.data?.data?.projects || [];

      setPendingDistributions(pending);
      setAllDistributions(distributions);
      setMyProjects(projects);
      
      setStats({
        pendingApprovals: pending.length,
        totalProjects: projects.length,
        activeDistributions: active.length,
        totalDistributions: distributions.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDistribution = (distribution) => {
    setSelectedDistribution(distribution);
    setShowApprovalModal(true);
  };

  const handleApprovalSuccess = () => {
    setShowApprovalModal(false);
    setSelectedDistribution(null);
    fetchDashboardData();
  };

  const getStatusBadge = (status) => {
    const badges = {
      calculated: <span className="badge badge-info">Calculated</span>,
      under_review: <span className="badge badge-warning">Under Review</span>,
      approved: <span className="badge badge-success">Approved</span>,
      processing: <span className="badge badge-info">Processing</span>,
      completed: <span className="badge badge-success">Completed</span>,
      cancelled: <span className="badge badge-gray">Cancelled</span>,
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  return (
    <ProtectedRoute allowedRoles={['asset_manager']}>
      <>
        <Head>
          <title>Asset Manager Dashboard - CoSpaces</title>
        </Head>

        <DashboardLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asset Manager Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage distributions and projects assigned to you</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-xl">
                    <FaClock className="text-yellow-600 text-2xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Distributions awaiting your approval</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-xl">
                    <FaProjectDiagram className="text-blue-600 text-2xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Projects assigned to you</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Distributions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeDistributions}</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-xl">
                    <FaFileInvoice className="text-green-600 text-2xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Distributions in progress</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Distributions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalDistributions}</p>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-xl">
                    <FaFileInvoice className="text-purple-600 text-2xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">All distributions</p>
              </div>
            </div>

            {/* Pending Distributions - Priority Section */}
            {pendingDistributions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-yellow-200 border-l-4">
                <div className="p-6 border-b border-gray-200 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <FaExclamationTriangle className="text-yellow-600" />
                        <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
                      </div>
                      <p className="text-sm text-gray-600">Review and approve pending distributions</p>
                    </div>
                    <Link href="/dashboard/asset-manager/distributions">
                      <button className="btn btn-primary">View All</button>
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {pendingDistributions.slice(0, 5).map((distribution) => (
                      <div 
                        key={distribution._id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {distribution.project?.projectName || 'Unknown Project'}
                              </h3>
                              <span className="text-sm text-gray-500">
                                {distribution.distributionNumber}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Gross Amount</p>
                                <p className="font-semibold text-gray-900">
                                  ₹{distribution.grossProceeds?.toLocaleString('en-IN') || '0'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Net Amount</p>
                                <p className="font-semibold text-green-600">
                                  ₹{distribution.netDistributableAmount?.toLocaleString('en-IN') || '0'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Created</p>
                                <p className="text-gray-900">
                                  {distribution.createdAt 
                                    ? new Date(distribution.createdAt).toLocaleDateString()
                                    : '-'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-6">
                            <button
                              onClick={() => handleViewDistribution(distribution)}
                              className="btn btn-primary flex items-center space-x-2"
                            >
                              <FaEye />
                              <span>Review</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pendingDistributions.length > 5 && (
                    <div className="mt-4 text-center">
                      <Link href="/dashboard/asset-manager/distributions">
                        <button className="btn btn-secondary">
                          View All {pendingDistributions.length} Pending
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* All Distributions - Recent */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Distributions</h2>
                    <p className="text-sm text-gray-600 mt-1">Latest distribution activities</p>
                  </div>
                  <Link href="/dashboard/asset-manager/distributions">
                    <button className="btn btn-secondary">View All</button>
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : allDistributions.length === 0 ? (
                <div className="p-12 text-center">
                  <FaFileInvoice className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No distributions found</p>
                  <p className="text-gray-400 text-sm mt-2">Distributions for your projects will appear here</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Distribution #</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden md:table-cell">Type</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gross</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Net</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Created</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {allDistributions.slice(0, 10).map((distribution) => (
                          <tr key={distribution._id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-medium text-primary-600 text-sm">
                                {distribution.distributionNumber}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900 line-clamp-1">
                                {distribution.project?.projectName || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <span className="text-sm text-gray-600 capitalize">
                                {distribution.distributionType?.replace(/_/g, ' ') || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                                ₹{distribution.grossProceeds?.toLocaleString('en-IN') || '0'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-green-600 text-sm whitespace-nowrap">
                                ₹{distribution.netDistributableAmount?.toLocaleString('en-IN') || '0'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(distribution.status)}
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              <span className="text-xs text-gray-600">
                                {distribution.createdAt
                                  ? new Date(distribution.createdAt).toLocaleDateString()
                                  : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleViewDistribution(distribution)}
                                className="btn btn-sm btn-secondary flex items-center space-x-1 whitespace-nowrap"
                              >
                                <FaEye className="text-xs" />
                                <span className="text-xs">View</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* My Projects */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">My Projects</h2>
                <p className="text-sm text-gray-600 mt-1">Projects assigned to you for management</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : myProjects.length === 0 ? (
                <div className="p-12 text-center">
                  <FaProjectDiagram className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No projects assigned</p>
                  <p className="text-gray-400 text-sm mt-2">Projects assigned to you will appear here</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myProjects.map((project) => (
                      <div 
                        key={project._id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">{project.projectName}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {project.shortDescription || project.description?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <span className={`badge ${
                            project.status === 'approved' ? 'badge-success' :
                            project.status === 'under_acquisition' ? 'badge-info' :
                            'badge-gray'
                          }`}>
                            {project.status?.replace(/_/g, ' ')}
                          </span>
                          <Link href={`/projects/${project._id}`}>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DashboardLayout>

        {/* Approval Modal */}
        {showApprovalModal && selectedDistribution && (
          <DistributionApprovalModal
            distribution={selectedDistribution}
            onClose={() => {
              setShowApprovalModal(false);
              setSelectedDistribution(null);
            }}
            onSuccess={handleApprovalSuccess}
          />
        )}
      </>
    </ProtectedRoute>
  );
}

export default AssetManagerDashboard;

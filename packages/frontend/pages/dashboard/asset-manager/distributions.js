import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../../components/DashboardLayout';
import { ProtectedRoute } from '../../../lib/auth';
import { useAuth } from '../../../lib/auth';
import { distributionAPI } from '../../../lib/api';
import { FaSearch, FaEye, FaFilter, FaFileInvoice } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DistributionApprovalModal from '../../../components/asset-manager/DistributionApprovalModal';

export default function AssetManagerDistributions() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchDistributions();
    }
  }, [user, statusFilter]);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const response = await distributionAPI.getDistributionsByAssetManager(user._id);
      let distributions = response.data?.distributions || [];
      
      // Apply status filter
      if (statusFilter) {
        distributions = distributions.filter(d => d.status === statusFilter);
      }
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        distributions = distributions.filter(d => 
          d.distributionNumber?.toLowerCase().includes(searchLower) ||
          d.project?.projectName?.toLowerCase().includes(searchLower)
        );
      }
      
      setDistributions(distributions);
    } catch (error) {
      console.error('Error fetching distributions:', error);
      toast.error('Failed to load distributions');
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
    fetchDistributions();
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

  const needsApproval = (distribution) => {
    return distribution.status === 'calculated' && 
           !distribution.approvals?.assetManagerApproval?.approved;
  };

  return (
    <ProtectedRoute allowedRoles={['asset_manager']}>
      <>
        <Head>
          <title>My Distributions - Asset Manager - CoSpaces</title>
        </Head>

        <DashboardLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Distributions</h1>
              <p className="text-gray-600 mt-2">Review and approve distributions for your projects</p>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Distribution number or project"
                      className="input pl-10"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setTimeout(fetchDistributions, 300);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="input"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="calculated">Calculated</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={fetchDistributions}
                    className="btn btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <FaFilter />
                    <span>Apply Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Distributions Table */}
            <div className="card overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : distributions.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileInvoice className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No distributions found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {search || statusFilter
                      ? 'Try adjusting your filters'
                      : 'Distributions for your projects will appear here'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Distribution #</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden md:table-cell">SPV</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Type</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gross</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Net</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Created</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {distributions.map((distribution) => (
                          <tr 
                            key={distribution._id}
                            className={`hover:bg-gray-50 transition-colors ${
                              needsApproval(distribution) ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                            }`}
                          >
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
                              <span className="text-sm text-gray-600 line-clamp-1">
                                {distribution.spv?.spvName || distribution.spv?.name || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
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
                              <div className="flex flex-col space-y-1">
                                {getStatusBadge(distribution.status)}
                                {needsApproval(distribution) && (
                                  <span className="text-xs text-yellow-600 font-semibold">
                                    (Action Required)
                                  </span>
                                )}
                              </div>
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
                                className={`btn btn-sm ${
                                  needsApproval(distribution) ? 'btn-primary' : 'btn-secondary'
                                } flex items-center space-x-1 whitespace-nowrap`}
                              >
                                <FaEye className="text-xs" />
                                <span className="text-xs">{needsApproval(distribution) ? 'Review' : 'View'}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
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


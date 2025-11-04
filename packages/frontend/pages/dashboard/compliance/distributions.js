import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../../components/DashboardLayout';
import { ProtectedRoute } from '../../../lib/auth';
import { useAuth } from '../../../lib/auth';
import { distributionAPI } from '../../../lib/api';
import { FaSearch, FaEye, FaFilter, FaFileInvoice, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ComplianceDistributionReviewModal from '../../../components/compliance/ComplianceDistributionReviewModal';

export default function ComplianceDistributions() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchDistributions();
    }
  }, [user, statusFilter]);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const response = await distributionAPI.getAllDistributions({ limit: 200 });
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
      
      // Sort: pending compliance reviews first
      distributions.sort((a, b) => {
        const aNeedsReview = needsComplianceReview(a);
        const bNeedsReview = needsComplianceReview(b);
        if (aNeedsReview && !bNeedsReview) return -1;
        if (!aNeedsReview && bNeedsReview) return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      
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
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedDistribution(null);
    // Add small delay to ensure backend has updated the approval status
    setTimeout(() => {
      fetchDistributions();
    }, 500);
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

  const needsComplianceReview = (distribution) => {
    const assetApproved = distribution.approvals?.assetManagerApproval?.approved === true;
    const complianceApproved = distribution.approvals?.complianceApproval?.approved === true;
    const isActive = !['completed', 'cancelled'].includes(distribution.status);
    
    // Only needs review if asset manager approved, compliance NOT approved, and active
    return assetApproved && !complianceApproved && isActive;
  };

  return (
    <ProtectedRoute allowedRoles={['compliance_officer']}>
      <>
        <Head>
          <title>Distribution Reviews - Compliance - CoSpaces</title>
        </Head>

        <DashboardLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <FaShieldAlt className="text-orange-600" />
                <span>Distribution Reviews</span>
              </h1>
              <p className="text-gray-600 mt-2">Review and approve distributions for regulatory compliance</p>
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
                      : 'Distributions will appear here once created'}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Distribution #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Project
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          SPV
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Asset Manager
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Type
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Gross Amount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Net Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Created
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {distributions.map((distribution) => (
                        <tr 
                          key={distribution._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            needsComplianceReview(distribution) ? 'bg-orange-50 border-l-4 border-orange-400' : ''
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600">
                            {distribution.distributionNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {distribution.project?.projectName || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {distribution.spv?.spvName || distribution.spv?.name || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {distribution.approvals?.assetManagerApproval?.approvedBy?.firstName || '-'}
                            {distribution.approvals?.assetManagerApproval?.approvedBy?.lastName && (
                              <span> {distribution.approvals.assetManagerApproval.approvedBy.lastName}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {distribution.distributionType?.replace(/_/g, ' ') || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                            ₹{distribution.grossProceeds?.toLocaleString('en-IN') || '0'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right font-semibold">
                            ₹{distribution.netDistributableAmount?.toLocaleString('en-IN') || '0'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex flex-col space-y-1">
                              {getStatusBadge(distribution.status)}
                              {needsComplianceReview(distribution) && (
                                <span className="text-xs text-orange-600 font-semibold">
                                  (Action Required)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {distribution.createdAt
                              ? new Date(distribution.createdAt).toLocaleDateString('en-IN')
                              : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleViewDistribution(distribution)}
                              className={`btn btn-sm ${
                                needsComplianceReview(distribution) ? 'btn-primary' : 'btn-secondary'
                              } flex items-center space-x-1`}
                            >
                              <FaEye />
                              <span>{needsComplianceReview(distribution) ? 'Review' : 'View'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </DashboardLayout>

        {/* Review Modal */}
        {showReviewModal && selectedDistribution && (
          <ComplianceDistributionReviewModal
            distribution={selectedDistribution}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedDistribution(null);
            }}
            onSuccess={handleReviewSuccess}
          />
        )}
      </>
    </ProtectedRoute>
  );
}


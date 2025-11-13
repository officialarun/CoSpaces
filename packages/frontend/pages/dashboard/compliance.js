import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import { ProtectedRoute } from '../../lib/auth';
import { useAuth } from '../../lib/auth';
import { distributionAPI } from '../../lib/api';
import { FaShieldAlt, FaFileInvoice, FaClock, FaCheckCircle, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ComplianceDistributionReviewModal from '../../components/compliance/ComplianceDistributionReviewModal';

function ComplianceDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingReviews: 0,
    totalReviews: 0,
    approved: 0,
    totalDistributions: 0
  });
  const [pendingDistributions, setPendingDistributions] = useState([]);
  const [allDistributions, setAllDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all distributions (compliance officers can see all distributions)
      const distributionsRes = await distributionAPI.getAllDistributions({ limit: 100 });
      let distributions = distributionsRes.data?.distributions || [];
      
      // Debug: Log approval status for troubleshooting
      console.log('Distribution approval status:', distributions.map(d => ({
        id: d._id,
        number: d.distributionNumber,
        assetManagerApproved: d.approvals?.assetManagerApproval?.approved,
        complianceApproved: d.approvals?.complianceApproval?.approved,
        status: d.status,
        approvals: d.approvals
      })));
      
      // Filter distributions that need compliance review
      // These are distributions approved by asset manager but not yet approved by compliance
      const pending = distributions.filter(d => {
        const assetApproved = d.approvals?.assetManagerApproval?.approved === true;
        const complianceApproved = d.approvals?.complianceApproval?.approved === true;
        const isActive = !['completed', 'cancelled'].includes(d.status);
        
        // Only show as pending if asset manager approved, compliance NOT approved, and active
        return assetApproved && !complianceApproved && isActive;
      });
      
      // Count approved by compliance
      const approved = distributions.filter(d => 
        d.approvals?.complianceApproval?.approved === true
      );

      setPendingDistributions(pending);
      setAllDistributions(distributions);
      
      setStats({
        pendingReviews: pending.length,
        totalReviews: distributions.filter(d => 
          d.approvals?.assetManagerApproval?.approved === true
        ).length,
        approved: approved.length,
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
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedDistribution(null);
    // Add small delay to ensure backend has updated the approval status
    setTimeout(() => {
      fetchDashboardData();
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
          <title>Compliance Dashboard - CoSpaces</title>
        </Head>

        <DashboardLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <FaShieldAlt className="text-orange-600" />
                <span>Compliance Dashboard</span>
              </h1>
              <p className="text-gray-600 mt-2">Review and approve distributions for regulatory compliance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200 border-l-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
                  </div>
                  <div className="bg-orange-100 p-4 rounded-xl">
                    <FaClock className="text-orange-600 text-2xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Distributions awaiting compliance review</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-xl">
                    <FaFileInvoice className="text-blue-600 text-2xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">All distributions reviewed by you</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-xl">
                    <FaCheckCircle className="text-green-600 text-2xl" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Distributions you've approved</p>
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
                <p className="text-xs text-gray-500 mt-2">All distributions in system</p>
              </div>
            </div>

            {/* Pending Distributions - Priority Section */}
            {pendingDistributions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-orange-200 border-l-4">
                <div className="p-6 border-b border-gray-200 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <FaExclamationTriangle className="text-orange-600" />
                        <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
                      </div>
                      <p className="text-sm text-gray-600">Review distributions approved by asset managers</p>
                    </div>
                    <Link href="/dashboard/compliance/distributions">
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
                              {distribution.approvals?.assetManagerApproval?.approvedBy && (
                                <span className="text-xs text-gray-500">
                                  Approved by: {distribution.approvals.assetManagerApproval.approvedBy?.firstName || 'Asset Manager'}
                                </span>
                              )}
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
                                <p className="text-gray-600">Type</p>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {distribution.distributionType?.replace(/_/g, ' ') || '-'}
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
                      <Link href="/dashboard/compliance/distributions">
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
                    <h2 className="text-xl font-bold text-gray-900">All Distributions</h2>
                    <p className="text-sm text-gray-600 mt-1">All distribution activities</p>
                  </div>
                  <Link href="/dashboard/compliance/distributions">
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
                  <p className="text-gray-400 text-sm mt-2">Distributions will appear here once created</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
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
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allDistributions.slice(0, 10).map((distribution) => (
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

export default ComplianceDashboard;


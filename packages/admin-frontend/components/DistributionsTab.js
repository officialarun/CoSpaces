import { useState, useEffect } from 'react';
import { adminDistributionAPI, adminProjectAPI, adminStaffAPI } from '../lib/api';
import { FaSearch, FaEye, FaCalculator, FaFileInvoice } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CreateDistributionModal from './CreateDistributionModal';
import DistributionDetailsModal from './DistributionDetailsModal';

export default function DistributionsTab() {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assetManagerFilter, setAssetManagerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDistributions, setTotalDistributions] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [assetManagers, setAssetManagers] = useState([]);

  useEffect(() => {
    fetchDistributions();
    fetchFilters();
  }, [page, statusFilter, projectFilter, assetManagerFilter, dateFrom, dateTo]);

  const fetchFilters = async () => {
    try {
      const [projectRes, staffRes] = await Promise.all([
        adminProjectAPI.getProjects({ limit: 100 }),
        adminStaffAPI.getStaff({ role: 'asset_manager', limit: 100 })
      ]);
      setProjects(projectRes.data.data.projects || []);
      setAssetManagers(staffRes.data.data.staff || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        status: statusFilter,
        projectId: projectFilter,
        assetManagerId: assetManagerFilter,
        dateFrom,
        dateTo
      };
      
      const response = await adminDistributionAPI.getAllDistributions(params);
      setDistributions(response.data.data.distributions || []);
      setTotalPages(response.data.data.totalPages || 1);
      setTotalDistributions(response.data.data.totalDistributions || 0);
    } catch (error) {
      console.error('Error fetching distributions:', error);
      toast.error('Failed to load distributions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: <span className="badge badge-gray">Draft</span>,
      calculated: <span className="badge badge-info">Calculated</span>,
      under_review: <span className="badge badge-warning">Under Review</span>,
      approved: <span className="badge badge-success">Approved</span>,
      processing: <span className="badge badge-info">Processing</span>,
      completed: <span className="badge badge-success">Completed</span>,
      cancelled: <span className="badge badge-gray">Cancelled</span>,
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  const handleViewDetails = (distribution) => {
    setSelectedDistribution(distribution);
    setShowDetailsModal(true);
  };

  const getApprovalStatus = (distribution) => {
    const approvals = distribution.approvals || {};
    const assetManager = approvals.assetManagerApproval?.approved;
    const compliance = approvals.complianceApproval?.approved;
    const admin = approvals.adminApproval?.approved;

    if (admin) return 'Fully Approved';
    if (compliance) return 'Awaiting Admin';
    if (assetManager) return 'Awaiting Compliance';
    return 'Awaiting Asset Manager';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Distributions</h2>
          <p className="text-gray-600 mt-1">Manage and track all distributions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FaCalculator />
          <span>Calculate Distribution</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Distributions</p>
              <p className="text-2xl font-bold text-gray-900">{totalDistributions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaFileInvoice className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributions.filter(d => ['calculated', 'under_review'].includes(d.status)).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaFileInvoice className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributions.filter(d => d.status === 'approved').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaFileInvoice className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {distributions.filter(d => d.status === 'completed').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaFileInvoice className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Distribution number"
                className="input pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
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
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="calculated">Calculated</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <select
              className="input"
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Manager
            </label>
            <select
              className="input"
              value={assetManagerFilter}
              onChange={(e) => {
                setAssetManagerFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Managers</option>
              {assetManagers.map(am => (
                <option key={am._id} value={am._id}>
                  {am.firstName} {am.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-6 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="md:col-span-5 flex items-end">
            <button
              onClick={fetchDistributions}
              className="btn btn-primary w-full"
            >
              Apply Filters
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
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Distribution #</th>
                  <th>Project</th>
                  <th>SPV</th>
                  <th>Type</th>
                  <th>Gross Amount</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map((distribution) => (
                  <tr key={distribution._id}>
                    <td className="font-medium text-primary-600">
                      {distribution.distributionNumber}
                    </td>
                    <td>{distribution.project?.projectName || '-'}</td>
                    <td>{distribution.spv?.spvName || distribution.spv?.name || '-'}</td>
                    <td className="capitalize">
                      {distribution.distributionType?.replace(/_/g, ' ') || '-'}
                    </td>
                    <td className="font-semibold">
                      ₹{distribution.grossProceeds?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="font-semibold text-green-600">
                      ₹{distribution.netDistributableAmount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td>{getStatusBadge(distribution.status)}</td>
                    <td>
                      <span className="text-xs text-gray-600">
                        {getApprovalStatus(distribution)}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {distribution.createdAt
                        ? new Date(distribution.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(distribution)}
                        className="btn btn-sm btn-secondary flex items-center space-x-1"
                        title="View Details"
                      >
                        <FaEye />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {distributions.length === 0 && (
              <div className="text-center py-12">
                <FaFileInvoice className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No distributions found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {search || statusFilter || projectFilter
                    ? 'Try adjusting your filters'
                    : 'Calculate your first distribution to get started'}
                </p>
                {!search && !statusFilter && !projectFilter && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary mt-4"
                  >
                    Calculate Distribution
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDistributionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchDistributions();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDistribution && (
        <DistributionDetailsModal
          distribution={selectedDistribution}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDistribution(null);
          }}
          onSuccess={() => {
            fetchDistributions();
            setShowDetailsModal(false);
            setSelectedDistribution(null);
          }}
        />
      )}
    </div>
  );
}


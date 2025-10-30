import { useState, useEffect } from 'react';
import { adminKYCAPI } from '../lib/api';
import { FaCheckCircle, FaTimesCircle, FaClock, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import KYCReviewModal from './KYCReviewModal';

export default function KYCTab() {
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchKYCSubmissions();
  }, [statusFilter, page]);

  const fetchKYCSubmissions = async () => {
    try {
      setLoading(true);
      if (statusFilter === 'pending') {
        const response = await adminKYCAPI.getPendingKYC();
        setKycSubmissions(response.data.data.users);
        setTotalPages(1);
      } else {
        const response = await adminKYCAPI.getAllKYC({
          kycStatus: statusFilter,
          page,
          limit: 20
        });
        setKycSubmissions(response.data.data.users);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
      toast.error('Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (user) => {
    setSelectedUser(user);
    setShowReviewModal(true);
  };

  const getKYCBadge = (kycStatus) => {
    const badges = {
      approved: <span className="badge badge-success"><FaCheckCircle className="inline mr-1" />Approved</span>,
      pending: <span className="badge badge-warning"><FaClock className="inline mr-1" />Pending</span>,
      submitted: <span className="badge badge-info"><FaClock className="inline mr-1" />Submitted</span>,
      rejected: <span className="badge badge-danger"><FaTimesCircle className="inline mr-1" />Rejected</span>,
    };
    return badges[kycStatus] || <span className="badge badge-gray">{kycStatus}</span>;
  };

  const getDIDITBadge = (user) => {
    if (user.diditVerification?.isVerified) {
      return <span className="badge badge-success"><FaCheckCircle className="inline mr-1" />Verified</span>;
    }
    return <span className="badge badge-gray">Not Verified</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              KYC Status
            </label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="">All</option>
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={fetchKYCSubmissions} className="btn btn-primary w-full">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KYC Table */}
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Submission Date</th>
                  <th>KYC Status</th>
                  <th>DIDIT Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kycSubmissions.map((user) => (
                  <tr key={user._id}>
                    <td className="font-medium">
                      {user.firstName || user.profile?.firstName} {user.lastName || user.profile?.lastName}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td className="text-sm text-gray-600">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '-'}
                    </td>
                    <td>{getKYCBadge(user.kycStatus)}</td>
                    <td>{getDIDITBadge(user)}</td>
                    <td>
                      <button
                        onClick={() => handleReview(user)}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-900"
                        title="Review KYC"
                      >
                        <FaEye className="h-4 w-4" />
                        <span className="text-sm">Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {kycSubmissions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No KYC submissions found</p>
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

      {/* Review Modal */}
      {showReviewModal && (
        <KYCReviewModal
          user={selectedUser}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchKYCSubmissions();
            setShowReviewModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import { adminUserAPI } from '../lib/api';
import { FaEdit, FaBan, FaSearch, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import UserEditModal from './UserEditModal';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search, kycFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUserAPI.getUsers({
        page,
        limit: 20,
        search,
        kycStatus: kycFilter
      });
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to deactivate ${userEmail}?`)) {
      return;
    }

    try {
      await adminUserAPI.deactivateUser(userId);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const getKYCBadge = (kycStatus) => {
    const badges = {
      approved: <span className="badge badge-success"><FaCheckCircle className="inline mr-1" />Approved</span>,
      pending: <span className="badge badge-warning"><FaClock className="inline mr-1" />Pending</span>,
      rejected: <span className="badge badge-danger"><FaTimesCircle className="inline mr-1" />Rejected</span>,
      submitted: <span className="badge badge-info"><FaClock className="inline mr-1" />Submitted</span>,
    };
    return badges[kycStatus] || <span className="badge badge-gray">{kycStatus}</span>;
  };

  const getOnboardingBadge = (user) => {
    if (user.onboardingCompleted) {
      return <span className="badge badge-success">Complete</span>;
    } else if (user.onboardingStep > 0) {
      return <span className="badge badge-warning">Step {user.onboardingStep}</span>;
    }
    return <span className="badge badge-gray">Not Started</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
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
                placeholder="Search by name or email"
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* KYC Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              KYC Status
            </label>
            <select
              className="input"
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchUsers}
              className="btn btn-primary w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
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
                  <th>Role</th>
                  <th>KYC Status</th>
                  <th>Onboarding</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="font-medium">
                      {user.firstName || user.profile?.firstName} {user.lastName || user.profile?.lastName}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className="badge badge-info capitalize">{user.role}</span>
                    </td>
                    <td>{getKYCBadge(user.kycStatus)}</td>
                    <td>{getOnboardingBadge(user)}</td>
                    <td>
                      {user.isActive !== false ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-gray">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit User"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        {user.isActive !== false && (
                          <button
                            onClick={() => handleDeactivate(user._id, user.email)}
                            className="text-red-600 hover:text-red-900"
                            title="Deactivate User"
                          >
                            <FaBan className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
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

      {/* Edit Modal */}
      {showEditModal && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            setShowEditModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}


import { useState, useEffect } from 'react';
import { adminStaffAPI } from '../lib/api';
import { FaEdit, FaBan, FaSearch, FaUserPlus, FaUserShield, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CreateStaffModal from './CreateStaffModal';
import UserEditModal from './UserEditModal';

export default function StaffManagementTab() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStaff, setTotalStaff] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [page, search, roleFilter, statusFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await adminStaffAPI.getStaff({
        page,
        limit: 20,
        search,
        role: roleFilter,
        isActive: statusFilter
      });
      setStaff(response.data.data.staff);
      setTotalPages(response.data.data.totalPages);
      setTotalStaff(response.data.data.totalStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (staffId, staffEmail) => {
    if (!confirm(`Are you sure you want to deactivate ${staffEmail}?`)) {
      return;
    }

    try {
      // Use existing deactivate user endpoint
      const { adminUserAPI } = await import('../lib/api');
      await adminUserAPI.deactivateUser(staffId);
      toast.success('Staff member deactivated successfully');
      fetchStaff();
    } catch (error) {
      console.error('Error deactivating staff:', error);
      toast.error('Failed to deactivate staff member');
    }
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowEditModal(true);
  };

  const getRoleBadge = (role) => {
    const badges = {
      asset_manager: (
        <span className="badge badge-info flex items-center space-x-1">
          <FaUserShield className="text-xs" />
          <span>Asset Manager</span>
        </span>
      ),
      compliance_officer: (
        <span className="badge badge-warning flex items-center space-x-1">
          <FaShieldAlt className="text-xs" />
          <span>Compliance Officer</span>
        </span>
      )
    };
    return badges[role] || <span className="badge badge-gray">{role}</span>;
  };

  const getStatusBadge = (isActive) => {
    if (isActive !== false) {
      return <span className="badge badge-success">Active</span>;
    }
    return <span className="badge badge-gray">Inactive</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Staff Management</h3>
          <p className="text-gray-600 mt-1">Manage asset managers and compliance officers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FaUserPlus />
          <span>Create Staff Member</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
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
                placeholder="Search by name or email"
                className="input pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page
                }}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              className="input"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="asset_manager">Asset Manager</option>
              <option value="compliance_officer">Compliance Officer</option>
            </select>
          </div>

          {/* Status Filter */}
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
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUserShield className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Asset Managers</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter(s => s.role === 'asset_manager').length}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FaUserShield className="text-indigo-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Officers</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter(s => s.role === 'compliance_officer').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaShieldAlt className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
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
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember._id}>
                    <td className="font-medium">
                      {staffMember.firstName} {staffMember.lastName}
                    </td>
                    <td>{staffMember.email}</td>
                    <td>{staffMember.phone || '-'}</td>
                    <td>{getRoleBadge(staffMember.role)}</td>
                    <td>{getStatusBadge(staffMember.isActive)}</td>
                    <td>
                      {staffMember.createdAt
                        ? new Date(staffMember.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(staffMember)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit Staff Member"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        {staffMember.isActive !== false && (
                          <button
                            onClick={() => handleDeactivate(staffMember._id, staffMember.email)}
                            className="text-red-600 hover:text-red-900"
                            title="Deactivate Staff Member"
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

            {staff.length === 0 && (
              <div className="text-center py-12">
                <FaUserShield className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No staff members found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {search || roleFilter || statusFilter
                    ? 'Try adjusting your filters'
                    : 'Create your first staff member to get started'}
                </p>
                {!search && !roleFilter && !statusFilter && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary mt-4"
                  >
                    Create Staff Member
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
        <CreateStaffModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchStaff();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStaff && (
        <UserEditModal
          user={selectedStaff}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStaff(null);
          }}
          onSuccess={() => {
            fetchStaff();
            setShowEditModal(false);
            setSelectedStaff(null);
          }}
        />
      )}
    </div>
  );
}


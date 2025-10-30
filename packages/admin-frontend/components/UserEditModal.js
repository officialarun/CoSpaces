import { useState } from 'react';
import { adminUserAPI } from '../lib/api';
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function UserEditModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || user.profile?.firstName || '',
    lastName: user.lastName || user.profile?.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'investor',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminUserAPI.updateUser(user._id, formData);
      toast.success('User updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Editable Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                className="input"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                className="input"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                className="input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                className="input"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="investor">Investor</option>
                <option value="asset_manager">Asset Manager</option>
                <option value="compliance_officer">Compliance Officer</option>
                <option value="legal_officer">Legal Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Read-only Onboarding Details */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Onboarding Status</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Onboarding Progress</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {user.onboardingCompleted ? (
                    <span className="text-green-600">
                      <FaCheckCircle className="inline mr-1" />
                      Complete
                    </span>
                  ) : (
                    <span className="text-yellow-600">
                      Step {user.onboardingStep || 0}/2
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Phone Verified</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {user.phone ? (
                    <span className="text-green-600">
                      <FaCheckCircle className="inline mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      <FaTimesCircle className="inline mr-1" />
                      No
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">DIDIT KYC</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {user.diditVerification?.isVerified ? (
                    <span className="text-green-600">
                      <FaCheckCircle className="inline mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      <FaTimesCircle className="inline mr-1" />
                      Not Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


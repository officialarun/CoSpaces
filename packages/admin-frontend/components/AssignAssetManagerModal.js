import { useState, useEffect } from 'react';
import { adminProjectAPI, adminStaffAPI } from '../lib/api';
import { FaTimes, FaUserShield } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AssignAssetManagerModal({ project, onClose, onSuccess }) {
  const [assetManagers, setAssetManagers] = useState([]);
  const [selectedAssetManagerId, setSelectedAssetManagerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(true);

  useEffect(() => {
    fetchAssetManagers();
    // Pre-select current asset manager if exists
    if (project?.assetManager?._id) {
      setSelectedAssetManagerId(project.assetManager._id);
    }
  }, [project]);

  const fetchAssetManagers = async () => {
    try {
      setLoadingManagers(true);
      const response = await adminStaffAPI.getStaff({
        role: 'asset_manager',
        isActive: 'true',
        limit: 100
      });
      setAssetManagers(response.data.data.staff || []);
    } catch (error) {
      console.error('Error fetching asset managers:', error);
      toast.error('Failed to load asset managers');
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAssetManagerId) {
      toast.error('Please select an asset manager');
      return;
    }

    setLoading(true);

    try {
      await adminProjectAPI.assignAssetManager(project._id, selectedAssetManagerId);
      toast.success('Asset manager assigned successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning asset manager:', error);
      const errorMessage = error.response?.data?.error || 'Failed to assign asset manager';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentAssetManager = assetManagers.find(am => am._id === selectedAssetManagerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
              <FaUserShield className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Assign Asset Manager</h3>
              <p className="text-sm text-gray-500">{project?.projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Asset Manager */}
          {project?.assetManager && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-1">Current Asset Manager:</p>
              <p className="text-blue-900">
                {project.assetManager.firstName} {project.assetManager.lastName} ({project.assetManager.email})
              </p>
            </div>
          )}

          {/* Asset Manager Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Asset Manager <span className="text-red-500">*</span>
            </label>
            {loadingManagers ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : assetManagers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No asset managers available. Please create asset managers in the Staff Management section first.
                </p>
              </div>
            ) : (
              <select
                className="input"
                value={selectedAssetManagerId}
                onChange={(e) => setSelectedAssetManagerId(e.target.value)}
                required
              >
                <option value="">-- Select Asset Manager --</option>
                {assetManagers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.firstName} {manager.lastName} ({manager.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedAssetManagerId && currentAssetManager && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Selected:</p>
              <p className="font-medium text-gray-900">
                {currentAssetManager.firstName} {currentAssetManager.lastName}
              </p>
              <p className="text-sm text-gray-600">{currentAssetManager.email}</p>
            </div>
          )}

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
              disabled={loading || !selectedAssetManagerId || loadingManagers}
            >
              {loading ? 'Assigning...' : 'Assign Asset Manager'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


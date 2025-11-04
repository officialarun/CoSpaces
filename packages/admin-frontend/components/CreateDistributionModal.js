import { useState, useEffect } from 'react';
import { adminDistributionAPI, adminSPVAPI, adminProjectAPI } from '../lib/api';
import { FaTimes, FaCalculator, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function CreateDistributionModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    spvId: '',
    grossProceeds: '',
    distributionType: 'final_sale_proceeds',
    deductions: {
      legalFees: '',
      brokerageFees: '',
      otherFees: ''
    },
    platformFees: {
      managementFee: '',
      processingFee: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [spvs, setSpvs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [spvRes, projectRes] = await Promise.all([
        adminSPVAPI.getSPVs({}),
        adminProjectAPI.getProjects({ status: 'approved', limit: 100 })
      ]);
      
      const allSpvs = spvRes.data.data.spvs || [];
      const allProjects = projectRes.data.data.projects || [];
      
      // Filter SPVs that have projects assigned
      const spvsWithProjects = allSpvs.filter(spv => spv.project);
      
      setSpvs(spvsWithProjects);
      setProjects(allProjects);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load SPVs and projects');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('deductions.') || name.startsWith('platformFees.')) {
      const [category, field] = name.split('.');
      setFormData({
        ...formData,
        [category]: {
          ...formData[category],
          [field]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.spvId) {
      newErrors.spvId = 'SPV is required';
    }

    if (!formData.grossProceeds || parseFloat(formData.grossProceeds) <= 0) {
      newErrors.grossProceeds = 'Gross proceeds must be greater than 0';
    }

    if (!formData.distributionType) {
      newErrors.distributionType = 'Distribution type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Convert deductions and platformFees to numbers, filter out empty values
      const deductions = {};
      Object.entries(formData.deductions).forEach(([key, value]) => {
        if (value && !isNaN(value) && parseFloat(value) > 0) {
          deductions[key] = parseFloat(value);
        }
      });

      const platformFees = {};
      Object.entries(formData.platformFees).forEach(([key, value]) => {
        if (value && !isNaN(value) && parseFloat(value) > 0) {
          platformFees[key] = parseFloat(value);
        }
      });

      const payload = {
        spvId: formData.spvId,
        grossProceeds: parseFloat(formData.grossProceeds),
        distributionType: formData.distributionType,
        deductions: Object.keys(deductions).length > 0 ? deductions : undefined,
        platformFees: Object.keys(platformFees).length > 0 ? platformFees : undefined
      };

      await adminDistributionAPI.createDistribution(payload);
      toast.success('Distribution calculated successfully! Asset manager will be notified.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating distribution:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create distribution';
      toast.error(errorMessage);
      
      if (error.response?.data?.error) {
        setErrors({ form: error.response.data.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedSPV = spvs.find(s => s._id === formData.spvId);
  const selectedProject = selectedSPV?.project ? projects.find(p => String(p._id) === String(selectedSPV.project)) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
              <FaCalculator className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Calculate Distribution</h3>
              <p className="text-sm text-gray-500">Create a new distribution for an SPV</p>
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
          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.form}
            </div>
          )}

          {/* SPV Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SPV <span className="text-red-500">*</span>
            </label>
            {loadingData ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : spvs.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No SPVs with assigned projects found. Please assign SPVs to projects first.
                </p>
              </div>
            ) : (
              <>
                <select
                  name="spvId"
                  className={`input ${errors.spvId ? 'border-red-500' : ''}`}
                  value={formData.spvId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select SPV --</option>
                  {spvs.map((spv) => (
                    <option key={spv._id} value={spv._id}>
                      {spv.spvName || spv.name} - {spv.registrationDetails?.cin || spv.registrationNumber || 'No Reg'}
                    </option>
                  ))}
                </select>
                {errors.spvId && (
                  <p className="text-red-500 text-xs mt-1">{errors.spvId}</p>
                )}
                
                {selectedSPV && selectedProject && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <FaInfoCircle className="text-blue-600 text-sm mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Associated Project:</p>
                        <p className="text-sm text-blue-700">{selectedProject.projectName}</p>
                        {selectedProject.assetManager && (
                          <p className="text-xs text-blue-600 mt-1">
                            Asset Manager: {selectedProject.assetManager.firstName} {selectedProject.assetManager.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Distribution Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distribution Type <span className="text-red-500">*</span>
            </label>
            <select
              name="distributionType"
              className={`input ${errors.distributionType ? 'border-red-500' : ''}`}
              value={formData.distributionType}
              onChange={handleChange}
              required
            >
              <option value="final_sale_proceeds">Final Sale Proceeds</option>
              <option value="interim_dividend">Interim Dividend</option>
              <option value="rental_income">Rental Income</option>
              <option value="lease_payment">Lease Payment</option>
            </select>
            {errors.distributionType && (
              <p className="text-red-500 text-xs mt-1">{errors.distributionType}</p>
            )}
          </div>

          {/* Gross Proceeds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gross Proceeds (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="grossProceeds"
              step="0.01"
              min="0"
              className={`input ${errors.grossProceeds ? 'border-red-500' : ''}`}
              value={formData.grossProceeds}
              onChange={handleChange}
              placeholder="Enter gross proceeds amount"
              required
            />
            {errors.grossProceeds && (
              <p className="text-red-500 text-xs mt-1">{errors.grossProceeds}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Total amount before deductions and fees</p>
          </div>

          {/* Deductions */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Deductions (Optional)</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Fees (₹)
                </label>
                <input
                  type="number"
                  name="deductions.legalFees"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.deductions.legalFees}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brokerage Fees (₹)
                </label>
                <input
                  type="number"
                  name="deductions.brokerageFees"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.deductions.brokerageFees}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Fees (₹)
                </label>
                <input
                  type="number"
                  name="deductions.otherFees"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.deductions.otherFees}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Platform Fees */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Platform Fees (Optional)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Management Fee (₹)
                </label>
                <input
                  type="number"
                  name="platformFees.managementFee"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.platformFees.managementFee}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Fee (₹)
                </label>
                <input
                  type="number"
                  name="platformFees.processingFee"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.platformFees.processingFee}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FaInfoCircle className="text-blue-600 text-sm mt-0.5" />
              <div className="flex-1 text-sm text-blue-800">
                <p className="font-medium mb-1">Note:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>TDS will be calculated automatically at 20% on net amount</li>
                  <li>Distribution will be calculated per shareholder based on their ownership</li>
                  <li>Asset manager will be notified for approval after calculation</li>
                  <li>All fields marked with * are required</li>
                </ul>
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
              disabled={loading || loadingData || !formData.spvId}
            >
              {loading ? 'Calculating...' : 'Calculate Distribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


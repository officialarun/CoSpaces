import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { userAPI } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function OnboardingStep2() {
  const router = useRouter();
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    landTypes: [],
    preferredLocations: [{ city: '', state: '', pincode: '' }],
    investmentGoal: '',
    riskAppetite: '',
    investmentHorizon: '',
    minimumInvestmentAmount: '',
    maximumInvestmentAmount: ''
  });

  // Load existing user data when component mounts
  useEffect(() => {
    if (user && user.investmentPreferences) {
      
      setFormData({
        landTypes: user.investmentPreferences.landTypes || [],
        preferredLocations: user.investmentPreferences.preferredLocations?.length > 0 
          ? user.investmentPreferences.preferredLocations 
          : [{ city: '', state: '', pincode: '' }],
        investmentGoal: user.investmentPreferences.investmentGoal || '',
        riskAppetite: user.investmentPreferences.riskAppetite || '',
        investmentHorizon: user.investmentPreferences.investmentHorizon || '',
        minimumInvestmentAmount: user.investmentPreferences.minimumInvestmentAmount || '',
        maximumInvestmentAmount: user.investmentPreferences.maximumInvestmentAmount || ''
      });
      
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLandTypeChange = (type) => {
    setFormData(prev => {
      const landTypes = prev.landTypes.includes(type)
        ? prev.landTypes.filter(t => t !== type)
        : [...prev.landTypes, type];
      return { ...prev, landTypes };
    });
  };

  const handleLocationChange = (index, field, value) => {
    const newLocations = [...formData.preferredLocations];
    newLocations[index][field] = value;
    setFormData(prev => ({ ...prev, preferredLocations: newLocations }));
  };

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: [...prev.preferredLocations, { city: '', state: '', pincode: '' }]
    }));
  };

  const removeLocation = (index) => {
    if (formData.preferredLocations.length > 1) {
      const newLocations = formData.preferredLocations.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, preferredLocations: newLocations }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Filter out empty locations
    const cleanedData = {
      ...formData,
      preferredLocations: formData.preferredLocations.filter(
        loc => loc.city || loc.state || loc.pincode
      )
    };

    try {
      await userAPI.updateOnboardingStep2(cleanedData);
      // Reload user data to mark onboarding as completed
      await loadUser();
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const landTypeOptions = [
    { value: 'agricultural', label: 'Agricultural', icon: '🌾' },
    { value: 'residential', label: 'Residential', icon: '🏘️' },
    { value: 'commercial', label: 'Commercial', icon: '🏢' },
    { value: 'industrial', label: 'Industrial', icon: '🏭' },
    { value: 'mixed_use', label: 'Mixed Use', icon: '🏗️' }
  ];

  return (
    <>
      <Head>
        <title>Investment Preferences - Onboarding</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-600">Step 2 of 2</span>
              <span className="text-sm text-gray-500">100% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Investment Preferences
            </h1>
            <p className="text-gray-600">
              Help us understand your investment goals and preferences
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Land Type Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What type of land are you interested in? * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {landTypeOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLandTypeChange(option.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.landTypes.includes(option.value)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Preferred Locations
              </label>
              {formData.preferredLocations.map((location, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Location {index + 1}</span>
                    {formData.preferredLocations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={location.city}
                      onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={location.state}
                      onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={location.pincode}
                      onChange={(e) => handleLocationChange(index, 'pincode', e.target.value)}
                      pattern="[0-9]{6}"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addLocation}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                + Add Another Location
              </button>
            </div>

            {/* Investment Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Investment Goal *
              </label>
              <select
                name="investmentGoal"
                value={formData.investmentGoal}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select your primary goal</option>
                <option value="capital_appreciation">Capital Appreciation (Long-term growth)</option>
                <option value="regular_income">Regular Income (Rental/Lease)</option>
                <option value="diversification">Portfolio Diversification</option>
                <option value="tax_benefits">Tax Benefits</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Risk Appetite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Risk Appetite *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'conservative', label: 'Conservative', desc: 'Low risk, stable returns' },
                  { value: 'moderate', label: 'Moderate', desc: 'Balanced risk & returns' },
                  { value: 'aggressive', label: 'Aggressive', desc: 'Higher risk, higher returns' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, riskAppetite: option.value }))}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.riskAppetite === option.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Investment Horizon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Horizon *
              </label>
              <select
                name="investmentHorizon"
                value={formData.investmentHorizon}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select investment horizon</option>
                <option value="short_term">Short Term (&lt; 3 years)</option>
                <option value="medium_term">Medium Term (3-5 years)</option>
                <option value="long_term">Long Term (&gt; 5 years)</option>
              </select>
            </div>

            {/* Investment Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Investment Amount Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Minimum (₹)</label>
                  <input
                    type="number"
                    name="minimumInvestmentAmount"
                    value={formData.minimumInvestmentAmount}
                    onChange={handleChange}
                    min="0"
                    step="10000"
                    placeholder="e.g., 100000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Maximum (₹)</label>
                  <input
                    type="number"
                    name="maximumInvestmentAmount"
                    value={formData.maximumInvestmentAmount}
                    onChange={handleChange}
                    min="0"
                    step="10000"
                    placeholder="e.g., 5000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => router.push('/onboarding/step1')}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || formData.landTypes.length === 0}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Completing...' : 'Complete & Go to Dashboard →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


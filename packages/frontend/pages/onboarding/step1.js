import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { userAPI, diditAPI } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import DiditVerification from '../../components/DiditVerification';
import toast from 'react-hot-toast';
import { FaLock } from 'react-icons/fa';

export default function OnboardingStep1() {
  const router = useRouter();
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDIDIT, setShowDIDIT] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    occupation: '',
    company: '',
    designation: '',
    yearsOfExperience: '',
    education: '',
    annualIncome: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  
  const [verifiedFields, setVerifiedFields] = useState({
    dob: false,
    gender: false,
    age: false,
    address: {
      street: false,
      city: false,
      state: false,
      pincode: false,
      country: false
    }
  });

  // Load existing user data when component mounts
  useEffect(() => {
    if (user) {
      loadExistingUserData();
      checkVerificationStatus();
    }
  }, [user]);

  const loadExistingUserData = () => {
    console.log('📥 Loading existing user data...');
    
    // Pre-fill form with existing user data
    setFormData(prev => ({
      occupation: user.professionalDetails?.occupation || prev.occupation,
      company: user.professionalDetails?.company || prev.company,
      designation: user.professionalDetails?.designation || prev.designation,
      yearsOfExperience: user.professionalDetails?.yearsOfExperience || prev.yearsOfExperience,
      education: user.professionalDetails?.education || prev.education,
      annualIncome: user.professionalDetails?.annualIncome || prev.annualIncome,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : prev.dateOfBirth,
      gender: user.gender || prev.gender,
      address: {
        street: user.address?.street || prev.address.street,
        city: user.address?.city || prev.address.city,
        state: user.address?.state || prev.address.state,
        pincode: user.address?.pincode || prev.address.pincode,
        country: user.address?.country || 'India'
      }
    }));
    
    console.log('✅ User data loaded into form');
  };

  const checkVerificationStatus = async () => {
    if (!user) return;

    try {
      const response = await diditAPI.getVerificationStatus();
      console.log('🔍 DIDIT Status Response:', response);
      console.log('🔍 Raw response.data:', response.data);
      
      // Since axios interceptor returns response.data, we access .data directly
      const statusData = response.data || response;
      const { isVerified: verified, verifiedData, verifiedFields: apiVerifiedFields } = statusData;
      
      console.log('✅ Verified:', verified);
      console.log('📋 Verified Data:', verifiedData);
      console.log('🔐 Verified Fields from API:', apiVerifiedFields);
      console.log('🔐 Full statusData:', statusData);
      
      setIsVerified(verified);
      
      // Update which fields are verified
      // If verifiedFields is missing, build it from verifiedData
      if (apiVerifiedFields) {
        console.log('✅ Using API verifiedFields');
        setVerifiedFields(apiVerifiedFields);
      } else if (verifiedData) {
        console.log('⚠️ verifiedFields missing, building from verifiedData');
        // Fallback: construct verifiedFields from available data
        const constructedFields = {
          dob: !!verifiedData.dob,
          age: !!verifiedData.age,
          gender: !!verifiedData.gender,
          name: !!verifiedData.name,
          address: {
            full: !!verifiedData.address,
            street: !!verifiedData.address?.street,
            city: !!verifiedData.address?.city,
            state: !!verifiedData.address?.state,
            pincode: !!verifiedData.address?.pincode,
            country: !!verifiedData.address?.country
          }
        };
        console.log('🔧 Constructed verifiedFields:', constructedFields);
        setVerifiedFields(constructedFields);
      }

      if (verified && verifiedData) {
        console.log('🎯 Merging verified data with form...');
        
        // Use constructed or API-provided verifiedFields
        const fieldsToUse = apiVerifiedFields || {
          dob: !!verifiedData.dob,
          gender: !!verifiedData.gender,
          address: {
            street: !!verifiedData.address?.street,
            city: !!verifiedData.address?.city,
            state: !!verifiedData.address?.state,
            pincode: !!verifiedData.address?.pincode,
            country: !!verifiedData.address?.country
          }
        };
        
        console.log('🔧 Using verifiedFields:', fieldsToUse);
        
        // Merge verified data with existing form data
        setFormData(prev => {
          const newFormData = { ...prev };
          
          // DOB - only if verified and present
          if (fieldsToUse.dob && verifiedData.dob) {
            newFormData.dateOfBirth = new Date(verifiedData.dob).toISOString().split('T')[0];
            console.log('✅ Set DOB from verification:', newFormData.dateOfBirth);
          }
          
          // Gender - only if verified and present
          if (fieldsToUse.gender && verifiedData.gender) {
            // Normalize gender for our dropdown
            const genderMap = {
              'M': 'male',
              'Male': 'male',
              'F': 'female',
              'Female': 'female',
              'O': 'other',
              'Other': 'other'
            };
            newFormData.gender = genderMap[verifiedData.gender] || verifiedData.gender.toLowerCase();
            console.log('✅ Set Gender from verification:', newFormData.gender);
          }
          
          // Address fields - only override verified ones
          if (verifiedData.address) {
            if (fieldsToUse.address?.street && verifiedData.address.street) {
              newFormData.address.street = verifiedData.address.street;
              console.log('✅ Set Street from verification');
            }
            if (fieldsToUse.address?.city && verifiedData.address.city) {
              newFormData.address.city = verifiedData.address.city;
              console.log('✅ Set City from verification');
            }
            if (fieldsToUse.address?.state && verifiedData.address.state) {
              newFormData.address.state = verifiedData.address.state;
              console.log('✅ Set State from verification');
            }
            if (fieldsToUse.address?.pincode && verifiedData.address.pincode) {
              newFormData.address.pincode = verifiedData.address.pincode;
              console.log('✅ Set Pincode from verification');
            }
            if (fieldsToUse.address?.country && verifiedData.address.country) {
              newFormData.address.country = verifiedData.address.country;
              console.log('✅ Set Country from verification');
            }
          }
          
          console.log('📝 Final merged form data:', newFormData);
          return newFormData;
        });
        
        setShowDIDIT(false); // Hide DIDIT card if already verified
        
        // Count verified fields for user feedback
        let verifiedCount = 0;
        if (fieldsToUse.dob) verifiedCount++;
        if (fieldsToUse.gender) verifiedCount++;
        if (fieldsToUse.address?.street) verifiedCount++;
        if (fieldsToUse.address?.city) verifiedCount++;
        if (fieldsToUse.address?.state) verifiedCount++;
        if (fieldsToUse.address?.pincode) verifiedCount++;
        
        console.log(`✅ ${verifiedCount} field(s) verified and locked`);
      }
    } catch (err) {
      console.error('❌ Error checking verification status:', err);
    }
  };

  const handleVerificationComplete = async (verificationData) => {
    setIsVerified(true);
    await loadUser(); // Reload user data
    await checkVerificationStatus(); // Re-check and auto-fill
    setShowDIDIT(false);
  };

  const handleSkipDIDIT = () => {
    setShowDIDIT(false);
    toast.info('You can verify later from your dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await userAPI.updateOnboardingStep1(formData);
      // Reload user data to update onboarding step in context
      await loadUser();
      router.push('/onboarding/step2');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Personal & Professional Details - Onboarding</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-600">Step 1 of 2</span>
              <span className="text-sm text-gray-500">50% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tell us about yourself
            </h1>
            <p className="text-gray-600">
              We need some basic information to personalize your experience
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* DIDIT Verification Component */}
          {showDIDIT && !isVerified && (
            <DiditVerification
              isVerified={isVerified}
              verifiedAt={user?.diditVerification?.verifiedAt}
              onVerificationComplete={handleVerificationComplete}
              onSkip={handleSkipDIDIT}
              showSkip={true}
            />
          )}

          {isVerified && (
            <DiditVerification
              isVerified={true}
              verifiedAt={user?.diditVerification?.verifiedAt}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <span>Date of Birth *</span>
                    {verifiedFields.dob && (
                      <span className="flex items-center space-x-1 text-xs text-green-600">
                        <FaLock className="text-xs" />
                        <span>Verified</span>
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    readOnly={verifiedFields.dob}
                    disabled={verifiedFields.dob}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      verifiedFields.dob
                        ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
                  />
                  {verifiedFields.dob && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Verified via DIDIT
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <span>Gender *</span>
                    {verifiedFields.gender && (
                      <span className="flex items-center space-x-1 text-xs text-green-600">
                        <FaLock className="text-xs" />
                        <span>Verified</span>
                      </span>
                    )}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    disabled={verifiedFields.gender}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      verifiedFields.gender
                        ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  {verifiedFields.gender && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Verified via DIDIT
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <span>Street Address *</span>
                    {verifiedFields.address?.street && (
                      <span className="flex items-center space-x-1 text-xs text-green-600">
                        <FaLock className="text-xs" />
                        <span>Verified</span>
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                    readOnly={verifiedFields.address?.street}
                    disabled={verifiedFields.address?.street}
                    placeholder="Enter your street address"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      verifiedFields.address?.street
                        ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
                  />
                  {verifiedFields.address?.street && (
                    <p className="text-xs text-green-600 mt-1">✓ Verified via DIDIT</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <span>City *</span>
                      {verifiedFields.address?.city && (
                        <span className="flex items-center space-x-1 text-xs text-green-600">
                          <FaLock className="text-xs" />
                          <span>Verified</span>
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      required
                      readOnly={verifiedFields.address?.city}
                      disabled={verifiedFields.address?.city}
                      placeholder="City"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        verifiedFields.address?.city
                          ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                          : 'border-gray-300'
                      }`}
                    />
                    {verifiedFields.address?.city && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <span>State *</span>
                      {verifiedFields.address?.state && (
                        <span className="flex items-center space-x-1 text-xs text-green-600">
                          <FaLock className="text-xs" />
                          <span>Verified</span>
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      required
                      readOnly={verifiedFields.address?.state}
                      disabled={verifiedFields.address?.state}
                      placeholder="State"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        verifiedFields.address?.state
                          ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                          : 'border-gray-300'
                      }`}
                    />
                    {verifiedFields.address?.state && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <span>Pincode *</span>
                      {verifiedFields.address?.pincode && (
                        <span className="flex items-center space-x-1 text-xs text-green-600">
                          <FaLock className="text-xs" />
                          <span>Verified</span>
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      required
                      readOnly={verifiedFields.address?.pincode}
                      disabled={verifiedFields.address?.pincode}
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        verifiedFields.address?.pincode
                          ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                          : 'border-gray-300'
                      }`}
                    />
                    {verifiedFields.address?.pincode && (
                      <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation *
                  </label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select occupation</option>
                    <option value="salaried">Salaried Employee</option>
                    <option value="self_employed">Self Employed</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="professional">Professional (Doctor, Lawyer, etc.)</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {formData.occupation && formData.occupation !== 'retired' && formData.occupation !== 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Enter your company name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Your job title/designation"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        min="0"
                        max="60"
                        placeholder="Total years of experience"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education *
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select education level</option>
                    <option value="high_school">High School</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="doctorate">Doctorate</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income *
                  </label>
                  <select
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select income range</option>
                    <option value="below_5L">Below ₹5 Lakhs</option>
                    <option value="5L_10L">₹5 - 10 Lakhs</option>
                    <option value="10L_25L">₹10 - 25 Lakhs</option>
                    <option value="25L_50L">₹25 - 50 Lakhs</option>
                    <option value="50L_1Cr">₹50 Lakhs - 1 Crore</option>
                    <option value="above_1Cr">Above ₹1 Crore</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Continue to Step 2 →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


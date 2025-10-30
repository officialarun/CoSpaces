import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userAPI } from '../../lib/api';
import { FaUser, FaPhone, FaEnvelope, FaShieldAlt, FaGoogle, FaBriefcase, FaMapMarkerAlt, FaChartPie, FaEdit } from 'react-icons/fa';
import VerificationBadge from '../../components/VerificationBadge';

function ProfilePage() {
  const { user, loadUser } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: user?.phone,
    }
  });
  const [loading, setLoading] = useState(false);
  const [phoneEdit, setPhoneEdit] = useState(false);

  // Helper function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Helper functions to format data
  const formatOccupation = (occupation) => {
    const occupationMap = {
      'salaried': 'Salaried Employee',
      'self_employed': 'Self Employed',
      'business_owner': 'Business Owner',
      'professional': 'Professional',
      'retired': 'Retired',
      'student': 'Student',
      'other': 'Other'
    };
    return occupationMap[occupation] || occupation;
  };

  const formatEducation = (education) => {
    const educationMap = {
      'high_school': 'High School',
      'undergraduate': 'Undergraduate',
      'postgraduate': 'Postgraduate',
      'doctorate': 'Doctorate',
      'other': 'Other'
    };
    return educationMap[education] || education;
  };

  const formatIncome = (income) => {
    const incomeMap = {
      'below_5L': 'Below ₹5 Lakhs',
      '5L_10L': '₹5 - 10 Lakhs',
      '10L_25L': '₹10 - 25 Lakhs',
      '25L_50L': '₹25 - 50 Lakhs',
      '50L_1Cr': '₹50 Lakhs - 1 Crore',
      'above_1Cr': 'Above ₹1 Crore'
    };
    return incomeMap[income] || income;
  };

  const formatLandType = (type) => {
    const typeMap = {
      'agricultural': '🌾 Agricultural',
      'residential': '🏘️ Residential',
      'commercial': '🏢 Commercial',
      'industrial': '🏭 Industrial',
      'mixed_use': '🏗️ Mixed Use'
    };
    return typeMap[type] || type;
  };

  const formatInvestmentGoal = (goal) => {
    const goalMap = {
      'capital_appreciation': 'Capital Appreciation',
      'regular_income': 'Regular Income',
      'diversification': 'Portfolio Diversification',
      'tax_benefits': 'Tax Benefits',
      'other': 'Other'
    };
    return goalMap[goal] || goal;
  };

  const formatRiskAppetite = (risk) => {
    const riskMap = {
      'conservative': 'Conservative',
      'moderate': 'Moderate',
      'aggressive': 'Aggressive'
    };
    return riskMap[risk] || risk;
  };

  const formatInvestmentHorizon = (horizon) => {
    const horizonMap = {
      'short_term': 'Short Term (< 3 years)',
      'medium_term': 'Medium Term (3-5 years)',
      'long_term': 'Long Term (> 5 years)'
    };
    return horizonMap[horizon] || horizon;
  };

  const onSubmitProfile = async (data) => {
    setLoading(true);
    try {
      await userAPI.updateProfile(data);
      await loadUser();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPhone = async (data) => {
    setLoading(true);
    try {
      await userAPI.updatePhone(data.phone);
      await loadUser();
      toast.success('Phone number updated!');
      setPhoneEdit(false);
    } catch (error) {
      toast.error(error.error || 'Failed to update phone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>My Profile - Account Settings</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <Link 
              href="/onboarding/step1" 
              className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors border-2 border-indigo-200"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* Account Type Badge */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.displayName} className="w-20 h-20 rounded-full" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{user?.displayName}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  {user?.authProvider === 'google' && (
                    <div className="flex items-center gap-2 mt-1">
                      <FaGoogle className="text-red-500" />
                      <span className="text-sm text-gray-500">Signed in with Google</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`badge ${
                  user?.role === 'admin' ? 'badge-error' :
                  user?.role === 'compliance_officer' ? 'badge-warning' :
                  user?.role === 'asset_manager' ? 'badge-info' :
                  'badge-success'
                }`}>
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </span>
                <p className="text-sm text-gray-500 mt-1 capitalize">{user?.userType}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Personal Information</h3>
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    type="text"
                    className="input"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    type="text"
                    className="input"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                {user?.isEmailVerified ? (
                  <span className="badge badge-success">Verified</span>
                ) : (
                  <button className="text-primary-600 hover:text-primary-700 text-sm">
                    Verify Email
                  </button>
                )}
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <FaPhone className="text-gray-400 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    {phoneEdit ? (
                      <form onSubmit={handleSubmit(onSubmitPhone)} className="flex gap-2 mt-1">
                        <input
                          {...register('phone', { required: 'Phone is required' })}
                          type="tel"
                          className="input"
                          placeholder="+91 9876543210"
                        />
                        <button type="submit" className="btn-primary text-sm">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhoneEdit(false)}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <p className="font-medium">{user?.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                {!phoneEdit && (
                  <div className="flex items-center gap-2">
                    {user?.isPhoneVerified ? (
                      <span className="badge badge-success">Verified</span>
                    ) : user?.phone ? (
                      <button className="text-primary-600 hover:text-primary-700 text-sm">
                        Verify
                      </button>
                    ) : null}
                    {!user?.phone && (
                      <button
                        onClick={() => setPhoneEdit(true)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Add Phone
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KYC Status */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-primary-600 text-2xl" />
                <div>
                  <h3 className="text-xl font-bold">KYC Verification</h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${
                      user?.kycStatus === 'approved' ? 'text-green-600' :
                      user?.kycStatus === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {user?.kycStatus?.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
              <a href="/kyc/status" className="btn-outline">
                View KYC Status
              </a>
            </div>
          </div>

          {/* Security */}
          {user?.authProvider === 'local' && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Security</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-gray-600">Update your password</p>
                    </div>
                    <span className="text-primary-600">→</span>
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">
                        {user?.mfaEnabled ? 'Enabled' : 'Add an extra layer of security'}
                      </p>
                    </div>
                    <span className={`badge ${user?.mfaEnabled ? 'badge-success' : 'badge-warning'}`}>
                      {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Detailed Onboarding Information */}
          <div className="card border-2 border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Onboarding Details</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-blue-600 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <VerificationBadge 
                    status={user?.diditVerification?.isVerified ? 'verified' : 'not_verified'}
                    verifiedAt={user?.diditVerification?.verifiedAt}
                    size="sm"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">{user?.displayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                  {user?.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{user?.phone}</p>
                    </div>
                  )}
                  {!user?.diditVerification?.isVerified && (
                    <div className="pt-3 border-t border-blue-200">
                      <Link 
                        href="/dashboard/verify-didit"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2"
                      >
                        <FaShieldAlt />
                        <span>Verify Identity with DIDIT</span>
                      </Link>
                    </div>
                  )}
                  {user?.dateOfBirth && (
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">
                        {new Date(user.dateOfBirth).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                  {(user?.diditVerification?.verificationData?.verifiedAge || user?.dateOfBirth) && (
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">
                        {user?.diditVerification?.verificationData?.verifiedAge || 
                         calculateAge(user?.dateOfBirth)} years
                      </p>
                    </div>
                  )}
                  {user?.gender && (
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">{user.gender.replace('_', ' ')}</p>
                    </div>
                  )}
                  {user?.address && (user.address.street || user.address.city || user.address.state || user.address.pincode || user.address.country) && (
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">
                        {user.address.street && <>{user.address.street}<br /></>}
                        {(user.address.city || user.address.state || user.address.pincode) && (
                          <>
                            {[user.address.city, user.address.state, user.address.pincode]
                              .filter(Boolean)
                              .join(', ')}
                            <br />
                          </>
                        )}
                        {user.address.country && user.address.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FaBriefcase className="text-green-600 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
                </div>
                <div className="space-y-3">
                  {user?.professionalDetails?.occupation && (
                    <div>
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-medium text-gray-900">
                        {formatOccupation(user.professionalDetails.occupation)}
                      </p>
                    </div>
                  )}
                  {user?.professionalDetails?.company && (
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium text-gray-900">{user.professionalDetails.company}</p>
                    </div>
                  )}
                  {user?.professionalDetails?.designation && (
                    <div>
                      <p className="text-sm text-gray-600">Designation</p>
                      <p className="font-medium text-gray-900">{user.professionalDetails.designation}</p>
                    </div>
                  )}
                  {user?.professionalDetails?.yearsOfExperience && (
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium text-gray-900">
                        {user.professionalDetails.yearsOfExperience} years
                      </p>
                    </div>
                  )}
                  {user?.professionalDetails?.education && (
                    <div>
                      <p className="text-sm text-gray-600">Education</p>
                      <p className="font-medium text-gray-900">
                        {formatEducation(user.professionalDetails.education)}
                      </p>
                    </div>
                  )}
                  {user?.professionalDetails?.annualIncome && (
                    <div>
                      <p className="text-sm text-gray-600">Annual Income</p>
                      <p className="font-medium text-gray-900">
                        {formatIncome(user.professionalDetails.annualIncome)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Investment Preferences - Land Types & Locations */}
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FaMapMarkerAlt className="text-purple-600 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-900">Land Preferences</h3>
                </div>
                <div className="space-y-3">
                  {user?.investmentPreferences?.landTypes?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Preferred Land Types</p>
                      <div className="flex flex-wrap gap-2">
                        {user.investmentPreferences.landTypes.map((type, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-purple-200"
                          >
                            {formatLandType(type)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {user?.investmentPreferences?.preferredLocations?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Preferred Locations</p>
                      <div className="space-y-2">
                        {user.investmentPreferences.preferredLocations.map((loc, idx) => (
                          <div 
                            key={idx}
                            className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 border border-purple-200"
                          >
                            📍 {loc.city}, {loc.state} {loc.pincode && `- ${loc.pincode}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Investment Goals & Strategy */}
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FaChartPie className="text-orange-600 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-900">Investment Strategy</h3>
                </div>
                <div className="space-y-3">
                  {user?.investmentPreferences?.investmentGoal && (
                    <div>
                      <p className="text-sm text-gray-600">Investment Goal</p>
                      <p className="font-medium text-gray-900">
                        {formatInvestmentGoal(user.investmentPreferences.investmentGoal)}
                      </p>
                    </div>
                  )}
                  {user?.investmentPreferences?.riskAppetite && (
                    <div>
                      <p className="text-sm text-gray-600">Risk Appetite</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        user.investmentPreferences.riskAppetite === 'conservative' 
                          ? 'bg-green-100 text-green-800' 
                          : user.investmentPreferences.riskAppetite === 'moderate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formatRiskAppetite(user.investmentPreferences.riskAppetite)}
                      </span>
                    </div>
                  )}
                  {user?.investmentPreferences?.investmentHorizon && (
                    <div>
                      <p className="text-sm text-gray-600">Investment Horizon</p>
                      <p className="font-medium text-gray-900">
                        {formatInvestmentHorizon(user.investmentPreferences.investmentHorizon)}
                      </p>
                    </div>
                  )}
                  {(user?.investmentPreferences?.minimumInvestmentAmount || user?.investmentPreferences?.maximumInvestmentAmount) && (
                    <div>
                      <p className="text-sm text-gray-600">Investment Range</p>
                      <p className="font-medium text-gray-900">
                        {user.investmentPreferences.minimumInvestmentAmount && 
                          `₹${user.investmentPreferences.minimumInvestmentAmount.toLocaleString()}`}
                        {user.investmentPreferences.minimumInvestmentAmount && user.investmentPreferences.maximumInvestmentAmount && ' - '}
                        {user.investmentPreferences.maximumInvestmentAmount && 
                          `₹${user.investmentPreferences.maximumInvestmentAmount.toLocaleString()}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}


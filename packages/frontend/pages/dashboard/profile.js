import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userAPI } from '../../lib/api';
import { FaUser, FaPhone, FaEnvelope, FaShieldAlt, FaGoogle, FaBriefcase, FaMapMarkerAlt, FaChartPie, FaEdit, FaUniversity, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import VerificationBadge from '../../components/VerificationBadge';

function ProfilePage() {
  const { user, loadUser } = useAuth();
  // Main profile form (for firstName and lastName)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    }
  });
  // Separate form for phone number to avoid validation conflicts
  const { 
    register: registerPhone, 
    handleSubmit: handleSubmitPhone, 
    formState: { errors: phoneErrors }, 
    reset: resetPhone,
    setValue: setPhoneValue,
    getValues: getPhoneValues
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      phone: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [phoneEdit, setPhoneEdit] = useState(false);
  const [bankDetails, setBankDetails] = useState([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);
  const { register: registerBank, handleSubmit: handleSubmitBank, formState: { errors: bankErrors }, reset: resetBank, getValues: getBankValues, setValue: setBankValue } = useForm();

  // Reset profile form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user, reset]);

  // Initialize phone form when user data loads or when entering edit mode
  useEffect(() => {
    if (user && phoneEdit) {
      // When entering edit mode, set the phone value (empty if user has no phone)
      setPhoneValue('phone', user.phone || '', { shouldValidate: false });
    }
  }, [user, phoneEdit, setPhoneValue]);

  // Load bank details on mount
  useEffect(() => {
    loadBankDetails();
  }, []);

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
      console.log('onSubmitPhone called with data:', data);
      console.log('Form values via getPhoneValues:', getPhoneValues());
      
      // Get phone value from form data or directly from form values
      const phoneValue = data?.phone || getPhoneValues('phone') || '';
      const phone = phoneValue.toString().trim();
      console.log('Trimmed phone value:', phone);
      
      if (!phone || phone.length === 0) {
        toast.error('Phone number cannot be empty');
        setLoading(false);
        return;
      }
      
      console.log('Calling API with phone:', phone);
      const response = await userAPI.updatePhone(phone);
      console.log('API response:', response);
      console.log('Phone from API response user:', response?.data?.user?.phone);
      console.log('Phone from API response user type:', typeof response?.data?.user?.phone);
      
      // If API response includes updated user, use it immediately
      if (response?.data?.user) {
        console.log('Using user from API response');
        // Note: We can't directly set user state here, but we'll reload
      }
      
      // Refresh user data to get updated phone - add delay to ensure DB is updated
      await new Promise(resolve => setTimeout(resolve, 200));
      await loadUser();
      
      // Small delay to ensure state update propagates
      await new Promise(resolve => setTimeout(resolve, 200));
      
      toast.success('Phone number updated successfully!');
      setPhoneEdit(false);
    } catch (error) {
      console.error('Error updating phone:', error);
      const errorMessage = error?.error || error?.details || error?.message || 'Failed to update phone number';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadBankDetails = async () => {
    try {
      const response = await userAPI.getBankDetails();
      setBankDetails(response.data.bankDetails || []);
    } catch (error) {
      console.error('Error loading bank details:', error);
    }
  };

  const onSubmitBank = async (data, e) => {
    setLoading(true);
    try {
      // Hybrid approach: Read values directly from DOM as fallback
      let formData = { ...data };
      
      if (e?.target) {
        const accountHolderNameInput = e.target.querySelector('input[name="accountHolderName"]');
        const accountNumberInput = e.target.querySelector('input[name="accountNumber"]');
        const ifscCodeInput = e.target.querySelector('input[name="ifscCode"]');
        const bankNameInput = e.target.querySelector('input[name="bankName"]');
        const branchNameInput = e.target.querySelector('input[name="branchName"]');
        const accountTypeSelect = e.target.querySelector('select[name="accountType"]');
        const isPrimaryCheckbox = e.target.querySelector('input[name="isPrimary"]');
        
        // Use DOM values if react-hook-form values are missing
        if (!formData.accountHolderName && accountHolderNameInput?.value) {
          formData.accountHolderName = accountHolderNameInput.value.trim();
        }
        if (!formData.accountNumber && accountNumberInput?.value) {
          formData.accountNumber = accountNumberInput.value.trim();
        }
        if (!formData.ifscCode && ifscCodeInput?.value) {
          formData.ifscCode = ifscCodeInput.value.trim().toUpperCase();
        }
        if (!formData.bankName && bankNameInput?.value) {
          formData.bankName = bankNameInput.value.trim();
        }
        if (branchNameInput?.value) {
          formData.branchName = branchNameInput.value.trim();
        }
        if (!formData.accountType && accountTypeSelect?.value) {
          formData.accountType = accountTypeSelect.value;
        }
        if (isPrimaryCheckbox) {
          formData.isPrimary = isPrimaryCheckbox.checked;
        }
      }
      
      // Validate required fields
      if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.accountType) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Clean and format data
      const cleanData = {
        accountHolderName: formData.accountHolderName.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.trim().toUpperCase(),
        bankName: formData.bankName.trim(),
        branchName: formData.branchName?.trim() || '',
        accountType: formData.accountType,
        isPrimary: formData.isPrimary || false
      };
      
      if (editingBankId) {
        await userAPI.updateBankDetails(editingBankId, cleanData);
        toast.success('Bank details updated successfully!');
      } else {
        await userAPI.addBankDetails(cleanData);
        toast.success('Bank details added successfully!');
      }
      setShowBankForm(false);
      setEditingBankId(null);
      resetBank();
      await loadBankDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBank = async (bankDetailsId) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }
    setLoading(true);
    try {
      await userAPI.deleteBankDetails(bankDetailsId);
      toast.success('Bank details deleted successfully!');
      await loadBankDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (bankDetailsId) => {
    setLoading(true);
    try {
      await userAPI.setPrimaryBank(bankDetailsId);
      toast.success('Primary bank account updated!');
      await loadBankDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update primary bank');
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

              {/* Phone - Simplified Card */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2 text-gray-400" />
                    Phone Number
                  </label>
                </div>
                
                {phoneEdit ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      console.log('Form onSubmit triggered');
                      
                      // Get the input element directly
                      const inputElement = e.target.querySelector('input[type="tel"]');
                      const inputValue = inputElement?.value || '';
                      console.log('Phone input value (direct):', inputValue);
                      
                      // Use handleSubmitPhone but ensure we have the value
                      handleSubmitPhone((data) => {
                        console.log('handleSubmitPhone callback called with data:', data);
                        // Fallback: if data.phone is empty but input has value, use input value
                        const finalPhone = data?.phone || inputValue || getPhoneValues('phone') || '';
                        if (finalPhone) {
                          onSubmitPhone({ phone: finalPhone });
                        } else {
                          onSubmitPhone(data);
                        }
                      })(e);
                    }} 
                    className="space-y-3"
                  >
                    <div>
                      <input
                        {...registerPhone('phone', { 
                          required: {
                            value: true,
                            message: 'Phone is required'
                          },
                          validate: (value) => {
                            console.log('Validation - value:', value, 'type:', typeof value);
                            if (!value) return 'Phone is required';
                            const trimmed = String(value).trim();
                            if (trimmed.length === 0) {
                              return 'Phone number cannot be empty';
                            }
                            return true;
                          }
                        })}
                        type="tel"
                        className="input w-full"
                        placeholder="+91 9876543210"
                        disabled={loading}
                        autoComplete="tel"
                        onBlur={(e) => {
                          // Ensure value is set when blurring
                          const value = e.target.value;
                          if (value) {
                            setPhoneValue('phone', value, { shouldValidate: false });
                          }
                        }}
                      />
                      {phoneErrors.phone && (
                        <p className="text-sm text-red-600 mt-1">{phoneErrors.phone.message}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        className="btn-primary text-sm"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneEdit(false);
                          setPhoneValue('phone', user?.phone || '', { shouldValidate: false });
                        }}
                        className="btn-secondary text-sm"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const phoneValue = user?.phone;
                        if (phoneValue && phoneValue !== null && phoneValue !== undefined && phoneValue !== 'null' && phoneValue !== '') {
                          return String(phoneValue);
                        }
                        return <span className="text-gray-400">Not provided</span>;
                      })()}
                    </p>
                    <div className="flex items-center gap-2">
                      {user?.isPhoneVerified && (
                        <span className="badge badge-success">Verified</span>
                      )}
                      {user?.phone && user.phone !== null && user.phone !== 'null' && !user?.isPhoneVerified && (
                        <button className="text-primary-600 hover:text-primary-700 text-sm">
                          Verify
                        </button>
                      )}
                      {(!user?.phone || user.phone === null || user.phone === 'null') && (
                        <button
                          onClick={() => {
                            setPhoneEdit(true);
                            setPhoneValue('phone', '', { shouldValidate: false });
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Add Phone
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaUniversity className="text-primary-600" />
                Bank Details
              </h3>
              {!showBankForm && (
                <button
                  onClick={() => {
                    setShowBankForm(true);
                    setEditingBankId(null);
                    resetBank();
                  }}
                  className="btn btn-sm btn-primary flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Add Bank Account</span>
                </button>
              )}
            </div>

            {showBankForm ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmitBank(onSubmitBank)(e);
                }} 
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerBank('accountHolderName', { required: 'Account holder name is required' })}
                      name="accountHolderName"
                      type="text"
                      className="input w-full"
                      placeholder="John Doe"
                      style={{ width: '100%', minWidth: '0', flexShrink: 0 }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value) {
                          setBankValue('accountHolderName', value, { shouldValidate: false });
                        }
                      }}
                    />
                    {bankErrors.accountHolderName && (
                      <p className="mt-1 text-sm text-red-600">{bankErrors.accountHolderName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerBank('accountNumber', { 
                        required: 'Account number is required',
                        pattern: {
                          value: /^\d+$/,
                          message: 'Account number must contain only digits'
                        }
                      })}
                      name="accountNumber"
                      type="text"
                      className="input w-full"
                      placeholder="1234567890"
                      maxLength={20}
                      style={{ width: '100%', minWidth: '0', flexShrink: 0 }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value) {
                          setBankValue('accountNumber', value, { shouldValidate: false });
                        }
                      }}
                    />
                    {bankErrors.accountNumber && (
                      <p className="mt-1 text-sm text-red-600">{bankErrors.accountNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerBank('ifscCode', { 
                        required: 'IFSC code is required',
                        pattern: {
                          value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                          message: 'Invalid IFSC format (e.g., HDFC0001234)'
                        }
                      })}
                      name="ifscCode"
                      type="text"
                      className="input w-full uppercase"
                      placeholder="HDFC0001234"
                      maxLength={11}
                      style={{ width: '100%', minWidth: '0', flexShrink: 0 }}
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                        const value = e.target.value.toUpperCase();
                        setBankValue('ifscCode', value, { shouldValidate: false });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim().toUpperCase();
                        if (value) {
                          setBankValue('ifscCode', value, { shouldValidate: false });
                        }
                      }}
                    />
                    {bankErrors.ifscCode && (
                      <p className="mt-1 text-sm text-red-600">{bankErrors.ifscCode.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerBank('bankName', { required: 'Bank name is required' })}
                      name="bankName"
                      type="text"
                      className="input w-full"
                      placeholder="HDFC Bank"
                      style={{ width: '100%', minWidth: '0', flexShrink: 0 }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value) {
                          setBankValue('bankName', value, { shouldValidate: false });
                        }
                      }}
                    />
                    {bankErrors.bankName && (
                      <p className="mt-1 text-sm text-red-600">{bankErrors.bankName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Name
                    </label>
                    <input
                      {...registerBank('branchName')}
                      name="branchName"
                      type="text"
                      className="input w-full"
                      placeholder="Mumbai Branch"
                      style={{ width: '100%', minWidth: '0', flexShrink: 0 }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        setBankValue('branchName', value, { shouldValidate: false });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...registerBank('accountType', { required: 'Account type is required' })}
                      name="accountType"
                      className="input w-full"
                      style={{ width: '100%', minWidth: '0', flexShrink: 0 }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value) {
                          setBankValue('accountType', value, { shouldValidate: false });
                        }
                      }}
                    >
                      <option value="">Select account type</option>
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                    </select>
                    {bankErrors.accountType && (
                      <p className="mt-1 text-sm text-red-600">{bankErrors.accountType.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    {...registerBank('isPrimary')}
                    name="isPrimary"
                    type="checkbox"
                    id="isPrimary"
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    onChange={(e) => {
                      setBankValue('isPrimary', e.target.checked, { shouldValidate: false });
                    }}
                  />
                  <label htmlFor="isPrimary" className="text-sm text-gray-700">
                    Set as primary bank account
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Saving...' : editingBankId ? 'Update' : 'Add Bank Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBankForm(false);
                      setEditingBankId(null);
                      resetBank();
                    }}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {bankDetails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaUniversity className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p>No bank accounts added yet</p>
                    <p className="text-sm mt-1">Add a bank account to receive distribution payments</p>
                  </div>
                ) : (
                  bankDetails.map((bank) => (
                    <div key={bank._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{bank.accountHolderName}</h4>
                            {bank.isPrimary && (
                              <span className="badge badge-success text-xs">Primary</span>
                            )}
                            {bank.verificationStatus === 'verified' && (
                              <span className="badge badge-success text-xs flex items-center gap-1">
                                <FaCheckCircle className="text-xs" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Account:</span> {bank.maskedAccountNumber || '****'}
                            </div>
                            <div>
                              <span className="font-medium">IFSC:</span> {bank.ifscCode}
                            </div>
                            <div>
                              <span className="font-medium">Bank:</span> {bank.bankName}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {bank.accountType?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {!bank.isPrimary && (
                            <button
                              onClick={() => handleSetPrimary(bank._id)}
                              disabled={loading}
                              className="btn btn-sm btn-secondary"
                              title="Set as primary"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingBankId(bank._id);
                              setShowBankForm(true);
                              resetBank({
                                accountHolderName: bank.accountHolderName,
                                ifscCode: bank.ifscCode,
                                bankName: bank.bankName,
                                branchName: bank.branchName,
                                accountType: bank.accountType,
                                isPrimary: bank.isPrimary
                              });
                            }}
                            disabled={loading}
                            className="btn btn-sm btn-secondary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBank(bank._id)}
                            disabled={loading}
                            className="btn btn-sm btn-danger"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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


import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { kycAPI } from '../../lib/api';
import { FaExclamationTriangle, FaPhone } from 'react-icons/fa';

function KYCOnboarding() {
  const { user, loadUser } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Register PAN field and store the result to merge onChange handlers
  const panRegister = register('panNumber', { 
    required: 'PAN is required',
    pattern: {
      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      message: 'Invalid PAN format (e.g., ABCDE1234F)'
    }
  });
  
  // Helper function to sync DOM values to react-hook-form before submission
  const syncFormValuesFromDOM = (formElement) => {
    const panInput = formElement?.querySelector('input[name="panNumber"]');
    const aadhaarInput = formElement?.querySelector('input[name="aadhaarNumber"]');
    const addressProofSelect = formElement?.querySelector('select[name="addressProofType"]');
    const sourceOfFundsSelect = formElement?.querySelector('select[name="sourceOfFunds"]');
    const sourceDescriptionTextarea = formElement?.querySelector('textarea[name="sourceDescription"]');
    const consentCheckbox = formElement?.querySelector('input[type="checkbox"][name="consent"]');
    
    // Sync all values to react-hook-form
    if (panInput?.value) {
      setValue('panNumber', panInput.value.trim(), { shouldValidate: false, shouldDirty: true });
    }
    if (aadhaarInput?.value) {
      setValue('aadhaarNumber', aadhaarInput.value.replace(/\D/g, ''), { shouldValidate: false, shouldDirty: true });
    }
    if (addressProofSelect?.value) {
      setValue('addressProofType', addressProofSelect.value, { shouldValidate: false, shouldDirty: true });
    }
    if (sourceOfFundsSelect?.value) {
      setValue('sourceOfFunds', sourceOfFundsSelect.value, { shouldValidate: false, shouldDirty: true });
    }
    if (sourceDescriptionTextarea?.value) {
      setValue('sourceDescription', sourceDescriptionTextarea.value.trim(), { shouldValidate: false, shouldDirty: true });
    }
    if (consentCheckbox) {
      setValue('consent', consentCheckbox.checked, { shouldValidate: false, shouldDirty: true });
    }
  };

  // Refresh user data when component mounts to ensure we have latest phone status
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data, e) => {
    // Check if user has phone number before allowing submission
    if (!user.phone) {
      toast.error('Please add your phone number in your profile before submitting KYC');
      router.push('/dashboard/profile');
      return;
    }

    // Sync DOM values to react-hook-form before processing (handles flex layout issues)
    if (e?.target) {
      syncFormValuesFromDOM(e.target);
    }
    
    // Get values from react-hook-form, with fallback to getValues() if data is incomplete
    const formValues = getValues();
    const panValue = data.panNumber || formValues.panNumber || '';
    const aadhaarRaw = data.aadhaarNumber || formValues.aadhaarNumber || '';
    const aadhaarValue = String(aadhaarRaw).replace(/\D/g, '').trim();
    const addressProofValue = data.addressProofType || formValues.addressProofType || '';
    const sourceOfFundsValue = data.sourceOfFunds || formValues.sourceOfFunds || '';
    const sourceDescriptionValue = data.sourceDescription || formValues.sourceDescription || '';
    const consentValue = data.consent !== undefined ? data.consent : (formValues.consent || false);

    setLoading(true);
    try {
      // Submit KYC - Convert PAN to uppercase before sending
      const kycData = {
        individualKYC: {
          panNumber: panValue ? String(panValue).toUpperCase().trim() : panValue,
          aadhaarNumber: aadhaarValue,
          addressProofType: addressProofValue,
        },
        sourceOfFunds: {
          primarySource: sourceOfFundsValue,
          description: sourceDescriptionValue,
        }
      };

      await kycAPI.submitKYC(kycData);
      // Refresh user data to update KYC status
      await loadUser();
      toast.success('KYC submitted successfully! Our team will review it.');
      router.push('/kyc/status');
    } catch (error) {
      toast.error(error.error || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>KYC Onboarding - Complete Your Profile</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your KYC</h1>
            <p className="text-gray-600 mt-2">
              We need to verify your identity before you can start investing. This process is required by Indian regulations.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Personal Info</span>
              </div>
              <div className="flex-1 border-t-2 border-gray-300 mx-4"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Documents</span>
              </div>
              <div className="flex-1 border-t-2 border-gray-300 mx-4"></div>
              <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 3 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Review</span>
              </div>
            </div>
          </div>

          {/* Phone Number Required Banner */}
          {!user.phone && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <FaExclamationTriangle className="text-red-600 text-2xl mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Phone Number Required</h3>
                  <p className="text-red-800 mb-4">
                    You need to add your phone number to your profile before you can submit KYC. 
                    This is required for identity verification.
                  </p>
                  <Link 
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <FaPhone className="text-sm" />
                    Add Phone Number in Profile
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className={`card ${!user.phone ? 'opacity-60 pointer-events-none' : ''}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* PAN Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Card Number *
                </label>
                <div>
                  <input
                    {...panRegister}
                    type="text"
                    name="panNumber"
                    className="input uppercase w-full"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    onChange={(e) => {
                      // Convert to uppercase in real-time as user types
                      const upperValue = e.target.value.toUpperCase();
                      e.target.value = upperValue;
                      // Update react-hook-form value
                      setValue('panNumber', upperValue, { shouldValidate: true, shouldDirty: true });
                      // Call the original onChange from register to maintain form state
                      if (panRegister.onChange) {
                        panRegister.onChange(e);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure value is synced to react-hook-form on blur
                      const value = e.target.value.trim();
                      if (value) {
                        setValue('panNumber', value.toUpperCase(), { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                  />
                  {errors.panNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>
                  )}
                </div>
              </div>

              {/* Aadhaar Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Card Number *
                </label>
                <div>
                  <input
                    {...register('aadhaarNumber', { 
                      required: 'Aadhaar is required',
                      pattern: {
                        value: /^[0-9]{12}$/,
                        message: 'Aadhaar must be 12 digits'
                      },
                      validate: (value) => {
                        if (!value) return 'Aadhaar is required';
                        const trimmed = String(value).trim().replace(/\s/g, '');
                        if (trimmed.length !== 12) {
                          return 'Aadhaar must be exactly 12 digits';
                        }
                        if (!/^[0-9]{12}$/.test(trimmed)) {
                          return 'Aadhaar must contain only digits';
                        }
                        return true;
                      }
                    })}
                    type="text"
                    name="aadhaarNumber"
                    className="input w-full"
                    placeholder="123456789012"
                    maxLength={12}
                    onInput={(e) => {
                      // Remove any spaces or non-digit characters
                      const value = e.target.value.replace(/\D/g, '');
                      if (value !== e.target.value) {
                        e.target.value = value;
                        setValue('aadhaarNumber', value, { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure value is synced to react-hook-form on blur
                      const value = e.target.value.replace(/\D/g, '').trim();
                      if (value) {
                        setValue('aadhaarNumber', value, { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                  />
                  {errors.aadhaarNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.aadhaarNumber.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Will be encrypted and stored securely</p>
                </div>
              </div>

              {/* Address Proof Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Proof Type *
                </label>
                <div>
                  <select 
                    {...register('addressProofType', { required: true })} 
                    name="addressProofType"
                    className="input w-full"
                    onBlur={(e) => {
                      // Ensure value is synced to react-hook-form on blur
                      const value = e.target.value;
                      if (value) {
                        setValue('addressProofType', value, { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                  >
                    <option value="">Select proof type</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="utility_bill">Utility Bill</option>
                    <option value="bank_statement">Bank Statement</option>
                  </select>
                </div>
              </div>

              {/* Source of Funds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source of Funds *
                </label>
                <div>
                  <select 
                    {...register('sourceOfFunds', { required: true })} 
                    name="sourceOfFunds"
                    className="input w-full"
                    onBlur={(e) => {
                      // Ensure value is synced to react-hook-form on blur
                      const value = e.target.value;
                      if (value) {
                        setValue('sourceOfFunds', value, { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                  >
                    <option value="">Select source</option>
                    <option value="salary">Salary/Employment Income</option>
                    <option value="business_income">Business Income</option>
                    <option value="investment_returns">Investment Returns</option>
                    <option value="inheritance">Inheritance</option>
                    <option value="loan">Loan</option>
                    <option value="gift">Gift</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Source Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Description
                </label>
                <div>
                  <textarea
                    {...register('sourceDescription')}
                    name="sourceDescription"
                    className="input w-full"
                    rows={3}
                    placeholder="Brief description of your income source..."
                    onBlur={(e) => {
                      // Ensure value is synced to react-hook-form on blur
                      const value = e.target.value.trim();
                      setValue('sourceDescription', value, { shouldValidate: false, shouldDirty: true });
                    }}
                  />
                </div>
              </div>

              {/* Consent */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <input
                    {...register('consent', { required: 'You must provide consent' })}
                    type="checkbox"
                    name="consent"
                    className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded"
                    onChange={(e) => {
                      // Ensure value is synced to react-hook-form
                      setValue('consent', e.target.checked, { shouldValidate: true, shouldDirty: true });
                      // Call original onChange if it exists
                      const originalOnChange = register('consent').onChange;
                      if (originalOnChange) {
                        originalOnChange(e);
                      }
                    }}
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    I hereby declare that the information provided is accurate and I consent to:
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Verification of my identity documents</li>
                      <li>AML/KYC checks and sanctions screening</li>
                      <li>Storage of my encrypted personal information</li>
                      <li>Compliance with PMLA and FIU regulations</li>
                    </ul>
                  </label>
                </div>
                {errors.consent && (
                  <p className="mt-2 text-sm text-red-600">{errors.consent.message}</p>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !user.phone}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!user.phone ? 'Please add your phone number in your profile first' : ''}
                >
                  {loading ? 'Submitting...' : !user.phone ? 'Add Phone Number First' : 'Submit KYC'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">📋 What happens next?</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Our compliance team will review your documents (1-2 business days)</li>
              <li>• You'll receive email notification once approved</li>
              <li>• After approval, you can start investing in projects</li>
              <li>• All data is encrypted and stored securely</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

export default function KYCOnboardingPage() {
  return (
    <ProtectedRoute>
      <KYCOnboarding />
    </ProtectedRoute>
  );
}


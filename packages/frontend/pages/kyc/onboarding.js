import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProtectedRoute, useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { kycAPI, userAPI } from '../../lib/api';

function KYCOnboarding() {
  const { user, loadUser } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Update phone if not present
      if (!user.phone && data.phone) {
        await userAPI.updatePhone(data.phone);
      }

      // Submit KYC
      const kycData = {
        individualKYC: {
          panNumber: data.panNumber,
          aadhaarNumber: data.aadhaarNumber,
          addressProofType: data.addressProofType,
        },
        sourceOfFunds: {
          primarySource: data.sourceOfFunds,
          description: data.sourceDescription,
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

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Phone Number (for OAuth users) */}
              {!user.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    type="tel"
                    className="input"
                    placeholder="+91 9876543210"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Required for identity verification</p>
                </div>
              )}

              {/* PAN Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Card Number *
                </label>
                <input
                  {...register('panNumber', { 
                    required: 'PAN is required',
                    pattern: {
                      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: 'Invalid PAN format (e.g., ABCDE1234F)'
                    }
                  })}
                  type="text"
                  className="input uppercase"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {errors.panNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>
                )}
              </div>

              {/* Aadhaar Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Card Number *
                </label>
                <input
                  {...register('aadhaarNumber', { 
                    required: 'Aadhaar is required',
                    pattern: {
                      value: /^[0-9]{12}$/,
                      message: 'Aadhaar must be 12 digits'
                    }
                  })}
                  type="text"
                  className="input"
                  placeholder="1234 5678 9012"
                  maxLength={12}
                />
                {errors.aadhaarNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.aadhaarNumber.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Will be encrypted and stored securely</p>
              </div>

              {/* Address Proof Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Proof Type *
                </label>
                <select {...register('addressProofType', { required: true })} className="input">
                  <option value="">Select proof type</option>
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="utility_bill">Utility Bill</option>
                  <option value="bank_statement">Bank Statement</option>
                </select>
              </div>

              {/* Source of Funds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source of Funds *
                </label>
                <select {...register('sourceOfFunds', { required: true })} className="input">
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

              {/* Source Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Description
                </label>
                <textarea
                  {...register('sourceDescription')}
                  className="input"
                  rows={3}
                  placeholder="Brief description of your income source..."
                />
              </div>

              {/* Consent */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <input
                    {...register('consent', { required: 'You must provide consent' })}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded"
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
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Submitting...' : 'Submit KYC'}
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


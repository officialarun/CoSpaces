import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaLandmark, FaChartLine, FaUsers, FaRocket } from 'react-icons/fa';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Signup() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { signup } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const userType = watch('userType', 'individual');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await signup(data);
      toast.success('Account created successfully!');
      
      // All new users start onboarding from step 1
      router.push('/onboarding/step1');
    } catch (error) {
      toast.error(error.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - CoSpaces</title>
      </Head>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center space-x-3 mb-12">
              <FaLandmark className="text-5xl" />
              <span className="text-3xl font-bold">CoSpaces</span>
            </Link>

            <div className="max-w-lg">
              <h1 className="text-5xl font-bold mb-6">
                Start investing in alternative assets today
              </h1>
              <p className="text-xl text-blue-100 mb-12">
                Join thousands of investors accessing exclusive real estate, PE, and VC opportunities
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-4xl font-bold mb-2">$125M+</div>
                  <div className="text-blue-100">Assets Under Management</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-4xl font-bold mb-2">5,000+</div>
                  <div className="text-blue-100">Active Investors</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaChartLine className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">High Returns</h3>
                    <p className="text-blue-100">Access deals with target returns of 18%+ IRR</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaUsers className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Low Minimums</h3>
                    <p className="text-blue-100">Start investing with as little as $1,000</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaRocket className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Fast Onboarding</h3>
                    <p className="text-blue-100">Get verified and start investing in minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-sm text-blue-200">
              © 2024 CoSpaces. Regulated under IFSCA's Regulatory Sandbox Framework
            </p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-8">
            {/* Mobile Logo */}
            <Link href="/" className="flex lg:hidden items-center justify-center space-x-2 mb-8">
              <FaLandmark className="text-blue-600 text-3xl" />
              <span className="text-2xl font-bold text-gray-900">CoSpaces</span>
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">Start your investment journey in minutes</p>
            </div>

            {/* Google Sign Up */}
            <div className="mb-6">
              <GoogleLoginButton />
              
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with email</span>
                </div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Account Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${userType === 'individual' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      {...register('userType')}
                      type="radio"
                      value="individual"
                      className="sr-only"
                    />
                    <span className={`font-semibold ${userType === 'individual' ? 'text-blue-600' : 'text-gray-700'}`}>Individual</span>
                  </label>
                  <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${userType === 'entity' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input
                      {...register('userType')}
                      type="radio"
                      value="entity"
                      className="sr-only"
                    />
                    <span className={`font-semibold ${userType === 'entity' ? 'text-blue-600' : 'text-gray-700'}`}>Entity</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Fields Based on User Type */}
              {userType === 'individual' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Entity Name
                    </label>
                    <input
                      {...register('entityName', { required: 'Entity name is required' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="Company Name Pvt Ltd"
                    />
                    {errors.entityName && (
                      <p className="mt-1 text-sm text-red-600">{errors.entityName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Entity Type
                    </label>
                    <select 
                      {...register('entityType')} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    >
                      <option value="private_limited">Private Limited</option>
                      <option value="llp">LLP</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                      <option value="huf">HUF</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="+91 1234567890"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div className="flex items-start">
                <input
                  {...register('termsAccepted', { required: 'You must accept the terms' })}
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold text-blue-600 hover:text-blue-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-red-600">{errors.termsAccepted.message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

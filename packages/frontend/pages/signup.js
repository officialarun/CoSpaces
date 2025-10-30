import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaLandmark } from 'react-icons/fa';
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
        <title>Sign Up - Fractional Land SPV Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <FaLandmark className="text-primary-600 text-4xl" />
            <span className="text-2xl font-bold text-gray-900">FractionalLand</span>
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-6">
              <GoogleLoginButton />
              
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer ${userType === 'individual' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}>
                    <input
                      {...register('userType')}
                      type="radio"
                      value="individual"
                      className="mr-2"
                    />
                    <span>Individual</span>
                  </label>
                  <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer ${userType === 'entity' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}>
                    <input
                      {...register('userType')}
                      type="radio"
                      value="entity"
                      className="mr-2"
                    />
                    <span>Entity</span>
                  </label>
                </div>
              </div>

              {userType === 'individual' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        type="text"
                        className="input mt-1"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        type="text"
                        className="input mt-1"
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
                    <label className="block text-sm font-medium text-gray-700">
                      Entity Name
                    </label>
                    <input
                      {...register('entityName', { required: 'Entity name is required' })}
                      type="text"
                      className="input mt-1"
                    />
                    {errors.entityName && (
                      <p className="mt-1 text-sm text-red-600">{errors.entityName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Entity Type
                    </label>
                    <select {...register('entityType')} className="input mt-1">
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
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="input mt-1"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  type="tel"
                  className="input mt-1"
                  placeholder="+91 1234567890"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  type="password"
                  className="input mt-1"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  {...register('termsAccepted', { required: 'You must accept the terms' })}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="mt-1 text-sm text-red-600">{errors.termsAccepted.message}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-6">
              <div className="text-sm text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


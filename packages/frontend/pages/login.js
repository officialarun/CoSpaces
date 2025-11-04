import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaLandmark, FaShieldAlt, FaLock, FaUserCheck } from 'react-icons/fa';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { getRedirectPath } from '../lib/redirectHelper';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.mfaRequired) {
        setMfaRequired(true);
        setTempToken(result.tempToken);
        toast.success('Enter MFA code');
      } else {
        toast.success('Login successful!');
        
        // Redirect based on role and onboarding status
        const user = result.user;
        const redirectPath = getRedirectPath(user);
        
        // For admin role, redirect to admin frontend
        if (user.role === 'admin') {
          // Admin frontend runs on port 3001
          if (typeof window !== 'undefined') {
            const adminUrl = window.location.origin.replace(':3000', ':3001') + '/dashboard?tab=users';
            window.location.href = adminUrl;
            return;
          }
        }
        
        router.push(redirectPath);
      }
    } catch (error) {
      toast.error(error.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - CoSpaces</title>
      </Head>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center space-x-3 mb-12">
              <FaLandmark className="text-5xl" />
              <span className="text-3xl font-bold">CoSpaces</span>
            </Link>

            <div className="max-w-lg">
              <h1 className="text-5xl font-bold mb-6">
                Welcome back to the future of investing
              </h1>
              <p className="text-xl text-blue-100 mb-12">
                Access exclusive alternative asset opportunities with institutional-grade security
              </p>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaShieldAlt className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Secure & Compliant</h3>
                    <p className="text-blue-100">Bank-grade security with full regulatory compliance</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaUserCheck className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Verified Investors</h3>
                    <p className="text-blue-100">Join a community of verified, accredited investors</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaLock className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Private & Encrypted</h3>
                    <p className="text-blue-100">Your data is encrypted end-to-end</p>
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

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link href="/" className="flex lg:hidden items-center justify-center space-x-2 mb-8">
              <FaLandmark className="text-blue-600 text-3xl" />
              <span className="text-2xl font-bold text-gray-900">CoSpaces</span>
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
              <p className="text-gray-600">Welcome back! Please enter your details.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleLoginButton />
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

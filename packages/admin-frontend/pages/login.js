import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { FaLock, FaEnvelope, FaShieldAlt, FaChartLine, FaUsers, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check for OAuth errors in URL
    if (router.isReady && router.query.error) {
      const errorType = router.query.error;
      if (errorType === 'auth_failed') {
        toast.error('Google authentication failed. Please try again or use email/password.');
      } else if (errorType === 'no_user') {
        toast.error('Unable to authenticate. Please contact support.');
      }
      // Clear the error from URL
      router.replace('/login', undefined, { shallow: true });
    }
  }, [router.isReady, router.query.error]);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Admin Login - CoSpaces</title>
      </Head>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-gray-800 via-gray-900 to-black p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center space-x-3 mb-12">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg">
                <FaShieldAlt className="text-4xl" />
              </div>
              <div>
                <span className="text-3xl font-bold">Admin Console</span>
                <p className="text-sm text-gray-400">CoSpaces Platform</p>
              </div>
            </Link>

            <div className="max-w-lg">
              <h1 className="text-5xl font-bold mb-6">
                Powerful admin controls at your fingertips
              </h1>
              <p className="text-xl text-gray-300 mb-12">
                Manage users, projects, and platform operations with enterprise-grade tools
              </p>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaUsers className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">User Management</h3>
                    <p className="text-gray-300">Complete control over user accounts and permissions</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaChartLine className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Real-time Analytics</h3>
                    <p className="text-gray-300">Monitor platform metrics and user activity</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <FaFileAlt className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">KYC Review</h3>
                    <p className="text-gray-300">Streamlined document verification and compliance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-sm text-gray-400">
              © 2024 CoSpaces. Secure admin portal with role-based access control
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link href="/" className="flex lg:hidden items-center justify-center space-x-2 mb-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2.5 rounded-xl">
                <FaShieldAlt className="text-blue-500 text-3xl" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Admin Console</span>
                <p className="text-xs text-gray-500">CoSpaces</p>
              </div>
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Sign In</h2>
              <p className="text-gray-600">Access the admin dashboard</p>
            </div>

            {/* Warning Banner */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl">
              <div className="flex items-start">
                <FaShieldAlt className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800">Admin Access Only</h3>
                  <p className="text-xs text-yellow-700 mt-1">
                    You must have admin privileges to access this console
                  </p>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="admin@cospaces.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
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
                <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 rounded-xl font-semibold hover:from-gray-900 hover:to-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In to Admin Console'
                )}
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
          </div>
        </div>
      </div>
    </>
  );
}

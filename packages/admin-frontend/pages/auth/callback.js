import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { authAPI } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const router = useRouter();
  const { loadUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if this was an admin login attempt
        const isAdminLogin = localStorage.getItem('adminLoginAttempt');
        
        if (!isAdminLogin) {
          setError('Invalid login attempt');
          return;
        }

        // Extract token from URL
        const { token, refreshToken } = router.query;

        if (!token) {
          setError('No authentication token received');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        // Store tokens
        localStorage.setItem('adminToken', token);
        if (refreshToken) {
          localStorage.setItem('adminRefreshToken', refreshToken);
        }

        // Get user data
        const response = await authAPI.getMe();
        const userData = response.data.data.user;

        // Check if user is admin
        if (userData.role !== 'admin') {
          localStorage.removeItem('adminLoginAttempt');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminRefreshToken');
          toast.error('Access denied. Admin privileges required.');
          setTimeout(() => {
            router.push('/unauthorized');
          }, 2000);
          return;
        }

        // Admin verified - complete login
        localStorage.removeItem('adminLoginAttempt');
        localStorage.setItem('adminUser', JSON.stringify(userData));
        await loadUser();
        toast.success('Login successful!');
        router.push('/dashboard');
      } catch (error) {
        console.error('Callback error:', error);
        setError('Authentication failed. Please try again.');
        localStorage.removeItem('adminLoginAttempt');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    // Only run if we have the router query
    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Authenticating... - Admin Console</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div>
              <div className="text-red-600 text-xl font-semibold mb-4">
                {error}
              </div>
              <p className="text-gray-600">Redirecting...</p>
            </div>
          ) : (
            <div>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg">Verifying admin access...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


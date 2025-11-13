import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth';
import { authAPI } from '../../lib/api';
import { getRedirectPath } from '../../lib/redirectHelper';

export default function AuthCallback() {
  const router = useRouter();
  const { setTokens } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (isProcessing) return;
      
      const { token, refreshToken, error } = router.query;

      if (error) {
        toast.error('Authentication failed. Please try again.');
        router.push('/login');
        return;
      }

      if (token && refreshToken) {
        setIsProcessing(true);
        
        try {
          // Store tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);

          // Fetch user data
          const response = await authAPI.getCurrentUser();
          const user = response.data.user;

          toast.success('Successfully logged in with Google!');
          
          // Redirect based on role and onboarding status
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
        } catch (err) {
          console.error('Failed to fetch user:', err);
          toast.error('Failed to complete authentication. Please try again.');
          router.push('/login');
        }
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, isProcessing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}


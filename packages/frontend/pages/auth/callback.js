import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth';
import { authAPI } from '../../lib/api';

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
          
          // Redirect based on onboarding status
          if (!user.onboardingCompleted) {
            const onboardingStep = user.onboardingStep || 0;
            if (onboardingStep === 0) {
              router.push('/onboarding/step1');
            } else if (onboardingStep === 1) {
              router.push('/onboarding/step2');
            }
          } else {
            router.push('/dashboard');
          }
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


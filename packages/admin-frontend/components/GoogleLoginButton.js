import { FaGoogle } from 'react-icons/fa';

export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
  // Use the shared public API base env var. Keep backward-compatible fallback.
  const API_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
    const ADMIN_URL = window.location.origin; // Get current admin console URL
    
    // Store that this is an admin login attempt
    localStorage.setItem('adminLoginAttempt', 'true');
    
    // Pass state parameter to indicate admin login
    const state = encodeURIComponent(JSON.stringify({ 
      isAdmin: true, 
      redirectUrl: ADMIN_URL 
    }));
    
  window.location.href = `${API_URL}/api/v1/auth/google?state=${state}`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-500 transition-all duration-200"
      type="button"
    >
      <FaGoogle className="text-red-500 text-xl" />
      <span className="text-gray-700 font-medium">Continue with Google</span>
    </button>
  );
}


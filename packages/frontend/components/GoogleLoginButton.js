import { FaGoogle } from 'react-icons/fa';

export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      type="button"
    >
      <FaGoogle className="text-red-500 text-xl" />
      <span className="text-gray-700 font-medium">Continue with Google</span>
    </button>
  );
}


import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from './api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        const userData = response.data.user;
        
        // Update localStorage as well for consistency
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.mfaRequired) {
        return { mfaRequired: true, tempToken: response.tempToken };
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      const response = await authAPI.signup(data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      throw error;
    }
  };

  const setTokens = (token, refreshToken) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    loadUser(); // Load user data after setting tokens
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Silently handle logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated,
        hasRole,
        loadUser,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children, allowedRoles = [], requireOnboarding = true }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (!loading && user) {
      // Check onboarding status
      if (requireOnboarding && !user.onboardingCompleted) {
        const onboardingStep = user.onboardingStep || 0;
        const currentPath = router.pathname;
        
        // Don't redirect if already on onboarding pages
        if (!currentPath.startsWith('/onboarding')) {
          if (onboardingStep === 0) {
            router.push('/onboarding/step1');
          } else if (onboardingStep === 1) {
            router.push('/onboarding/step2');
          }
        }
      }
      
      // Check role permissions
      if (allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          router.push('/unauthorized');
        }
      }
    }
  }, [user, loading, router, allowedRoles, requireOnboarding]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};


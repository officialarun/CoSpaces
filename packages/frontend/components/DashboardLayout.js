import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import {
  FaHome,
  FaLandmark,
  FaFileInvoice,
  FaWallet,
  FaChartLine,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaFileSignature
} from 'react-icons/fa';

export default function DashboardLayout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingSHACount, setPendingSHACount] = useState(0);

  // Check for pending SHAs on mount
  useEffect(() => {
    if (user?.role === 'investor') {
      import('../lib/api').then(({ shaAPI }) => {
        shaAPI.getPendingAgreements()
          .then(response => {
            setPendingSHACount(response.data.count || 0);
          })
          .catch(() => {
            // Silently fail - don't show error for navigation
          });
      });
    }
  }, [user]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FaHome, roles: [] },
    { name: 'Projects', href: '/projects', icon: FaLandmark, roles: [] },
    { name: 'My Investments', href: '/dashboard/investments', icon: FaWallet, roles: ['investor'] },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: FaFileInvoice, roles: ['investor'] },
    { name: 'Distributions', href: '/dashboard/distributions', icon: FaChartLine, roles: ['investor'] },
    { name: 'KYC Status', href: '/kyc/status', icon: FaShieldAlt, roles: ['investor'] },
    { 
      name: 'Sign Agreements', 
      href: '/dashboard/sha-signing', 
      icon: FaFileSignature, 
      roles: ['investor'],
      badge: pendingSHACount > 0 ? pendingSHACount : null
    },
    { name: 'Profile', href: '/dashboard/profile', icon: FaUser, roles: [] },
    { name: 'Admin Panel', href: '/admin', icon: FaCog, roles: ['admin', 'compliance_officer', 'asset_manager'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.roles.length === 0) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-800">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-2 text-white">
              <div className="bg-primary-600 p-2 rounded-lg">
                <FaLandmark className="text-xl" />
              </div>
              <span className="font-bold text-lg">FractionalLand</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-300">
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 text-lg" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop layout with floating effect */}
      <div className="hidden lg:block lg:p-6">
        <div className="flex bg-gray-50 rounded-2xl shadow-2xl overflow-hidden" style={{ minHeight: 'calc(100vh - 3rem)' }}>
          {/* Desktop sidebar */}
          <aside className="w-64 bg-gray-800 text-white flex flex-col rounded-l-2xl">
            <div className="flex items-center space-x-3 h-16 px-6 border-b border-gray-700 rounded-tl-2xl">
              <div className="bg-primary-600 p-2 rounded-lg flex-shrink-0">
                <FaLandmark className="text-xl" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">FractionalLand</h1>
                <p className="text-xs text-gray-400">Investor Portal</p>
              </div>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {filteredNavigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3 text-lg" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-shrink-0 p-4 border-t border-gray-700 rounded-bl-2xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white flex-shrink-0">
                  <FaUser className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.firstName || user?.displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-colors"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none hover:text-gray-700"
          >
            <FaBars className="text-xl" />
          </button>
          
          <div className="flex items-center justify-between flex-1 px-4">
            <Link href="/" className="flex items-center space-x-2">
              <FaLandmark className="text-primary-600 text-xl" />
              <span className="font-bold text-gray-900">FractionalLand</span>
            </Link>
            
            <Link href="/dashboard/profile" className="text-gray-500 hover:text-gray-700">
              <FaUser />
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}


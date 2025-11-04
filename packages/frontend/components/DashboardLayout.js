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
  FaFileSignature,
  FaBell
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
    { name: 'Distributions', href: '/dashboard/distributions', icon: FaChartLine, roles: ['investor'] },
    { name: 'KYC Status', href: '/kyc/status', icon: FaShieldAlt, roles: ['investor'] },
    { 
      name: 'Sign Agreements', 
      href: '/dashboard/sha-signing', 
      icon: FaFileSignature, 
      roles: ['investor'],
      badge: pendingSHACount > 0 ? pendingSHACount : null
    },
    // Asset Manager specific navigation
    { name: 'Asset Manager Dashboard', href: '/dashboard/asset-manager', icon: FaChartLine, roles: ['asset_manager'] },
    { name: 'My Distributions', href: '/dashboard/asset-manager/distributions', icon: FaFileInvoice, roles: ['asset_manager'] },
    // Compliance Officer specific navigation
    { name: 'Compliance Dashboard', href: '/dashboard/compliance', icon: FaShieldAlt, roles: ['compliance_officer'] },
    { name: 'Distribution Reviews', href: '/dashboard/compliance/distributions', icon: FaFileInvoice, roles: ['compliance_officer'] },
    { name: 'Profile', href: '/dashboard/profile', icon: FaUser, roles: [] },
    { name: 'Admin Panel', href: '/admin', icon: FaCog, roles: ['admin', 'compliance_officer', 'asset_manager'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.roles.length === 0) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100 p-6">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl rounded-r-3xl">
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 rounded-xl shadow-lg">
                <FaLandmark className="text-xl text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">CoSpaces</span>
                <p className="text-xs text-gray-400">Investor Portal</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 text-lg" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3 px-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex-shrink-0">
                <FaUser className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.firstName || user?.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <FaSignOutAlt className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop layout - Floating Card */}
      <div className="hidden lg:flex h-[calc(100vh-3rem)] max-w-[1600px] mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="w-72 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col">
          <div className="flex items-center space-x-3 h-20 px-6 border-b border-gray-700">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 rounded-xl shadow-lg flex-shrink-0">
              <FaLandmark className="text-xl text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white leading-tight">CoSpaces</h1>
              <p className="text-xs text-gray-400">Investor Portal</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 text-lg" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3 px-2">
              <div className="flex items-center justify-center h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex-shrink-0 shadow-md">
                <FaUser className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.firstName || user?.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <FaSignOutAlt className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
          <main className="p-8">
            {children}
          </main>
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
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg">
                <FaLandmark className="text-white text-lg" />
              </div>
              <span className="font-bold text-gray-900">CoSpaces</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-gray-700 relative">
                <FaBell />
                {pendingSHACount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1 rounded-full" style={{fontSize: '8px'}}>
                    {pendingSHACount}
                  </span>
                )}
              </button>
              <Link href="/dashboard/profile" className="text-gray-500 hover:text-gray-700">
                <FaUser />
              </Link>
            </div>
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

import { useState } from 'react';
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
  FaShieldAlt
} from 'react-icons/fa';

export default function DashboardLayout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FaHome, roles: [] },
    { name: 'Projects', href: '/projects', icon: FaLandmark, roles: [] },
    { name: 'My Investments', href: '/dashboard/investments', icon: FaWallet, roles: ['investor'] },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: FaFileInvoice, roles: ['investor'] },
    { name: 'Distributions', href: '/dashboard/distributions', icon: FaChartLine, roles: ['investor'] },
    { name: 'KYC Status', href: '/kyc/status', icon: FaShieldAlt, roles: ['investor'] },
    { name: 'Admin Panel', href: '/admin', icon: FaCog, roles: ['admin', 'compliance_officer', 'asset_manager'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.roles.length === 0) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
            <Link href="/" className="flex items-center space-x-2 text-white">
              <FaLandmark className="text-2xl" />
              <span className="font-bold">FractionalLand</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 bg-primary-600">
            <Link href="/" className="flex items-center space-x-2 text-white">
              <FaLandmark className="text-2xl" />
              <span className="font-bold">FractionalLand</span>
            </Link>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none"
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
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


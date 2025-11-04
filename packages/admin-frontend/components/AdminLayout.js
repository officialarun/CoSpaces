import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaShieldAlt, FaSignOutAlt, FaUser, FaUsers, FaFolderOpen, FaCheckCircle, FaChartBar, FaGlobe, FaBars, FaTimes, FaUserShield, FaFileInvoice } from 'react-icons/fa';
import { useState } from 'react';

export default function AdminLayout({ children, activeTab = 'users' }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Users', id: 'users', icon: FaUsers },
    { name: 'Staff Management', id: 'staff', icon: FaUserShield },
    { name: 'Projects', id: 'projects', icon: FaFolderOpen },
    { name: 'Publish Sites', id: 'publish', icon: FaGlobe },
    { name: 'Trust', id: 'trust', icon: FaShieldAlt },
    { name: 'SPVs', id: 'spvs', icon: FaFolderOpen },
    { name: 'Assign SPV', id: 'assign', icon: FaGlobe },
    { name: 'Distributions', id: 'distributions', icon: FaFileInvoice },
    { name: 'KYC Review', id: 'kyc', icon: FaCheckCircle },
    { name: 'Statistics', id: 'stats', icon: FaChartBar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-100 to-blue-100 p-6">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl rounded-r-3xl">
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 rounded-xl shadow-lg">
                <FaShieldAlt className="text-xl text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">Admin Console</span>
                <p className="text-xs text-gray-400">CoSpaces</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(`/dashboard?tab=${item.id}`);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 text-lg" />
                  <span className="flex-1 text-left">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3 px-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex-shrink-0">
                <FaUser className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.firstName || 'Admin'}</p>
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
      <div className="hidden lg:flex h-[calc(100vh-3rem)] max-w-[1800px] mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="w-72 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col">
          <div className="flex items-center space-x-3 h-20 px-6 border-b border-gray-700">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 rounded-xl shadow-lg flex-shrink-0">
              <FaShieldAlt className="text-xl text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white leading-tight">Admin Console</h1>
              <p className="text-xs text-gray-400">CoSpaces</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(`/dashboard?tab=${item.id}`)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 text-lg" />
                  <span className="flex-1 text-left">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3 px-2">
              <div className="flex items-center justify-center h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex-shrink-0 shadow-md">
                <FaUser className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.firstName || 'Admin'}</p>
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
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900">
                {navigation.find(item => item.id === activeTab)?.name || 'Dashboard'}
              </h2>
              <p className="text-gray-600 mt-2">Manage and monitor your platform</p>
            </div>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 shadow-sm rounded-t-2xl mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none hover:text-gray-700"
          >
            <FaBars className="text-xl" />
          </button>
          
          <div className="flex items-center justify-between flex-1 px-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              <span className="font-bold text-gray-900">Admin Console</span>
            </Link>
            
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              <FaUser />
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="bg-white rounded-2xl shadow-lg p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {navigation.find(item => item.id === activeTab)?.name || 'Dashboard'}
            </h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

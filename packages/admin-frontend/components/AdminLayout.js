import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';
import { FaShieldAlt, FaSignOutAlt, FaUser, FaUsers, FaFolderOpen, FaCheckCircle, FaChartBar, FaGlobe } from 'react-icons/fa';

export default function AdminLayout({ children, activeTab = 'users' }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const navigation = [
    { name: 'Users', id: 'users', icon: FaUsers },
    { name: 'Projects', id: 'projects', icon: FaFolderOpen },
    { name: 'Publish Sites', id: 'publish', icon: FaGlobe },
    { name: 'Trust', id: 'trust', icon: FaShieldAlt },
    { name: 'SPVs', id: 'spvs', icon: FaFolderOpen },
    { name: 'Assign SPV', id: 'assign', icon: FaGlobe },
    { name: 'KYC Review', id: 'kyc', icon: FaCheckCircle },
    { name: 'Statistics', id: 'stats', icon: FaChartBar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 p-6">
      <div className="flex bg-gray-50 rounded-2xl shadow-2xl overflow-hidden" style={{ minHeight: 'calc(100vh - 3rem)' }}>
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white flex flex-col z-30 rounded-l-2xl">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 px-6 py-5 border-b border-gray-700 rounded-tl-2xl">
          <div className="flex-shrink-0 bg-primary-600 p-2 rounded-lg">
            <FaShieldAlt className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Console</h1>
            <p className="text-xs text-gray-400">Fractional Land SPV</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => router.push(`/dashboard?tab=${item.id}`)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin User Info at Bottom */}
        <div className="border-t border-gray-700 px-4 py-4 rounded-bl-2xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-600 text-white">
              <FaUser className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Top Header */}
            <header className="bg-white shadow-sm border border-gray-200 rounded-xl mb-6 overflow-hidden">
              <div className="px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigation.find(item => item.id === activeTab)?.name || 'Dashboard'}
                </h2>
              </div>
            </header>

            {/* Page Content */}
            <main>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}


import { FaUsers, FaBuilding, FaIdCard } from 'react-icons/fa';

export default function TabNavigation({ activeTab, setActiveTab, pendingKYCCount = 0 }) {
  const tabs = [
    { id: 'users', name: 'Users', icon: FaUsers },
    { id: 'projects', name: 'Projects', icon: FaBuilding },
    { id: 'kyc', name: 'KYC Management', icon: FaIdCard, badge: pendingKYCCount },
  ];

  return (
    <div className="border-b border-gray-200 bg-white rounded-t-lg">
      <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.name}</span>
              {tab.badge > 0 && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}


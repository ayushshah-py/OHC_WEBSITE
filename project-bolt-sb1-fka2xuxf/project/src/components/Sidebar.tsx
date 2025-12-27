import React from 'react';
import { 
  Home, 
  Pill, 
  Users, 
  UserCheck, 
  ShoppingCart, 
  TrendingUp,
  Package,
  Building2,
  BarChart3,
  Settings,
  FileText,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, userType } = useAuth();
  
  const isAdmin = userType === 'admin';
  const canManage = isAdmin || (user as any)?.role === 'manager';
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'medicines', label: 'Medicine Management', icon: Pill, requiresManage: false },
    { id: 'employees', label: 'Employee Management', icon: UserCheck, requiresManage: true },
    { id: 'customers', label: 'Patient Management', icon: Users, requiresManage: false },
    { id: 'purchases', label: 'Purchase Management', icon: ShoppingCart, requiresManage: false },
    { id: 'sales', label: 'Sales Management', icon: TrendingUp, requiresManage: false },
    { id: 'hospitals', label: 'Refer Hospital', icon: Building2, requiresManage: false },
    { id: 'transfers', label: 'Patient Transfer', icon: Users, requiresManage: false },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'reports', label: 'Daily Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin', label: 'User Management', icon: Settings, requiresAdmin: true },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings, requiresAdmin: true },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiresAdmin && !isAdmin) return false;
    if (item.requiresManage && !canManage) return false;
    return true;
  });

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-lg h-full w-64 border-r border-white/20">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-2">
            <Pill className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">MedStore</h2>
            <p className="text-sm text-gray-600 capitalize">{(user as any)?.role} Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
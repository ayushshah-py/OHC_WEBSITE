import React from 'react';
import { LogOut, Pill, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, userType, logout } = useAuth();

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-2">
              <Pill className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Medical Store Management</h1>
              <p className="text-sm text-gray-600">Database Management System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {(user as any)?.avatar || (user as any)?.profileImage ? (
                <img
                  src={(user as any)?.avatar || (user as any)?.profileImage}
                  alt={(user as any)?.name || `${(user as any)?.firstName} ${(user as any)?.lastName}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {(user as any)?.name || `${(user as any)?.firstName} ${(user as any)?.lastName}`}
                </p>
                <p className="text-xs text-gray-600">{(user as any)?.email}</p>
                <p className="text-xs text-blue-600 capitalize">{(user as any)?.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
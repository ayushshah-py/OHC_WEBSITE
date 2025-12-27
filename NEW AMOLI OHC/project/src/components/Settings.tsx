import React, { useState } from 'react';
import { Save, User, Bell, Shield, Database, Palette, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, userType, updateProfile, addAlert } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: (user as any)?.name || `${(user as any)?.firstName} ${(user as any)?.lastName}` || '',
    email: (user as any)?.email || '',
    phone: (user as any)?.phone || '',
    address: (user as any)?.address || '',
    bio: (user as any)?.bio || ''
  });

  const [systemSettings, setSystemSettings] = useState({
    storeName: 'Medical Store Management System',
    storeAddress: '123 Medical Street, Healthcare City',
    storePhone: '+91-9876543210',
    storeEmail: 'info@medicalstore.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en'
  });

  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    expiryAlerts: true,
    salesNotifications: true,
    emailNotifications: false,
    smsNotifications: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5'
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileData);
  };

  const handleSystemUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('medical_store_system_settings', JSON.stringify(systemSettings));
    addAlert('success', 'System settings updated successfully!');
  };

  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('medical_store_notifications', JSON.stringify(notifications));
    addAlert('success', 'Notification preferences updated!');
  };

  const handleSecurityUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('medical_store_security', JSON.stringify(security));
    addAlert('success', 'Security settings updated!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const isAdmin = userType === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            if (tab.id === 'system' && !isAdmin) return null;
            if (tab.id === 'security' && !isAdmin) return null;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save size={20} />
                <span>Save Profile</span>
              </button>
            </form>
          )}

          {/* System Settings */}
          {activeTab === 'system' && isAdmin && (
            <form onSubmit={handleSystemUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Store Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input
                      type="text"
                      value={systemSettings.storeName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, storeName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
                    <input
                      type="tel"
                      value={systemSettings.storePhone}
                      onChange={(e) => setSystemSettings({ ...systemSettings, storePhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                    <input
                      type="email"
                      value={systemSettings.storeEmail}
                      onChange={(e) => setSystemSettings({ ...systemSettings, storeEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={systemSettings.currency}
                      onChange={(e) => setSystemSettings({ ...systemSettings, currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                  <textarea
                    value={systemSettings.storeAddress}
                    onChange={(e) => setSystemSettings({ ...systemSettings, storeAddress: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save size={20} />
                <span>Save System Settings</span>
              </button>
            </form>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Low Stock Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified when items are running low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.lowStockAlerts}
                        onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Expiry Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified about expiring medicines</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.expiryAlerts}
                        onChange={(e) => setNotifications({ ...notifications, expiryAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Sales Notifications</h4>
                      <p className="text-sm text-gray-600">Get notified about daily sales</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.salesNotifications}
                        onChange={(e) => setNotifications({ ...notifications, salesNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save size={20} />
                <span>Save Notifications</span>
              </button>
            </form>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && isAdmin && (
            <form onSubmit={handleSecurityUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.twoFactorAuth}
                        onChange={(e) => setSecurity({ ...security, twoFactorAuth: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={security.sessionTimeout}
                        onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                      <input
                        type="number"
                        value={security.passwordExpiry}
                        onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        value={security.loginAttempts}
                        onChange={(e) => setSecurity({ ...security, loginAttempts: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save size={20} />
                <span>Save Security Settings</span>
              </button>
            </form>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appearance Settings</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Theme</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border-2 border-blue-500 rounded-lg p-4 bg-white">
                        <div className="w-full h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Medical (Current)</p>
                      </div>
                      <div className="border-2 border-gray-300 rounded-lg p-4 bg-white opacity-50">
                        <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Professional</p>
                      </div>
                      <div className="border-2 border-gray-300 rounded-lg p-4 bg-white opacity-50">
                        <div className="w-full h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded mb-2"></div>
                        <p className="text-sm font-medium text-center">Dark Mode</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Language</h4>
                    <select className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
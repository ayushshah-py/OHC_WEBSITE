import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, Shield, User, Key, CheckCircle, XCircle } from 'lucide-react';
import { User as UserType, Admin } from '../types';
import { storageUtils } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const AdminManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { addAlert, userType } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'pharmacist' as 'admin' | 'manager' | 'pharmacist' | 'cashier',
    phone: '',
    address: '',
    canApprove: false,
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(storageUtils.getUsers());
    setAdmins(storageUtils.getAdmins());
  };

  const allUsers = [...users, ...admins.map(admin => ({
    id: admin.id,
    username: admin.username,
    password: admin.password,
    email: admin.email,
    firstName: admin.name.split(' ')[0] || '',
    lastName: admin.name.split(' ').slice(1).join(' ') || '',
    role: admin.role as any,
    phone: '',
    address: '',
    canApprove: true,
    profileImage: admin.avatar,
    isActive: true,
    dateJoined: admin.createdAt,
    lastLogin: admin.lastLogin,
    bio: ''
  }))];

  const filteredUsers = allUsers.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      if (editingUser.role === 'super_admin' || editingUser.role === 'admin') {
        // Update admin
        const updatedAdmin: Admin = {
          id: editingUser.id,
          username: formData.username,
          password: formData.password,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          role: formData.role === 'admin' ? 'admin' : 'super_admin',
          createdAt: editingUser.dateJoined,
          lastLogin: editingUser.lastLogin
        };
        const updatedAdmins = admins.map(a => a.id === editingUser.id ? updatedAdmin : a);
        setAdmins(updatedAdmins);
        storageUtils.saveAdmins(updatedAdmins);
      } else {
        // Update regular user
        const updatedUser: UserType = {
          ...formData,
          id: editingUser.id,
          dateJoined: editingUser.dateJoined,
          lastLogin: editingUser.lastLogin,
          bio: editingUser.bio || ''
        };
        const updatedUsers = users.map(u => u.id === editingUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        storageUtils.saveUsers(updatedUsers);
      }
      addAlert('success', 'User updated successfully!');
    } else {
      // Create new user
      if (formData.role === 'admin') {
        // Create admin
        const newAdmin: Admin = {
          id: storageUtils.generateId(),
          username: formData.username,
          password: formData.password,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        const updatedAdmins = [...admins, newAdmin];
        setAdmins(updatedAdmins);
        storageUtils.saveAdmins(updatedAdmins);
      } else {
        // Create regular user
        const newUser: UserType = {
          ...formData,
          id: storageUtils.generateId(),
          dateJoined: new Date().toISOString(),
          bio: ''
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        storageUtils.saveUsers(updatedUsers);
      }
      addAlert('success', 'User created successfully!');
    }

    resetForm();
    loadData();
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      canApprove: user.canApprove || false,
      isActive: user.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Check if it's an admin or regular user
      const isAdmin = admins.some(a => a.id === userId);
      
      if (isAdmin) {
        const updatedAdmins = admins.filter(a => a.id !== userId);
        setAdmins(updatedAdmins);
        storageUtils.saveAdmins(updatedAdmins);
      } else {
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        storageUtils.saveUsers(updatedUsers);
      }
      
      addAlert('success', 'User deleted successfully!');
      loadData();
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if it's an admin or regular user
    const isAdmin = admins.some(a => a.id === resetUserId);
    
    if (isAdmin) {
      const updatedAdmins = admins.map(admin => 
        admin.id === resetUserId 
          ? { ...admin, password: newPassword }
          : admin
      );
      setAdmins(updatedAdmins);
      storageUtils.saveAdmins(updatedAdmins);
    } else {
      const updatedUsers = users.map(user => 
        user.id === resetUserId 
          ? { ...user, password: newPassword }
          : user
      );
      setUsers(updatedUsers);
      storageUtils.saveUsers(updatedUsers);
    }
    
    addAlert('success', 'Password reset successfully!');
    setShowPasswordReset(false);
    setResetUserId('');
    setNewPassword('');
    loadData();
  };

  const toggleUserStatus = (userId: string) => {
    const isAdmin = admins.some(a => a.id === userId);
    
    if (!isAdmin) {
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      );
      setUsers(updatedUsers);
      storageUtils.saveUsers(updatedUsers);
      addAlert('success', 'User status updated successfully!');
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'pharmacist',
      phone: '',
      address: '',
      canApprove: false,
      isActive: true
    });
    setEditingUser(undefined);
    setShowForm(false);
  };

  const isAdmin = userType === 'admin';

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500">Access denied. Administrator privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {(user.role === 'admin' || user.role === 'super_admin') && (
                          <Shield size={16} className="text-red-500" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' || user.role === 'super_admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'pharmacist'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'super_admin' ? 'Administrator' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        disabled={user.role === 'admin' || user.role === 'super_admin'}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } ${(user.role === 'admin' || user.role === 'super_admin') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setResetUserId(user.id);
                            setShowPasswordReset(true);
                          }}
                          className="text-green-500 hover:text-green-700 transition-colors"
                        >
                          <Key size={18} />
                        </button>
                        {user.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pharmacist">Pharmacist</option>
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formData.role !== 'admin' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="canApprove"
                    checked={formData.canApprove}
                    onChange={(e) => setFormData({ ...formData, canApprove: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="canApprove" className="text-sm font-medium text-gray-700">
                    Can approve transfer requests
                  </label>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
              <button
                onClick={() => {
                  setShowPasswordReset(false);
                  setResetUserId('');
                  setNewPassword('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setResetUserId('');
                    setNewPassword('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
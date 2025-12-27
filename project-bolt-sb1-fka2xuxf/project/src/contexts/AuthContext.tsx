import React, { createContext, useContext, useState, useEffect } from 'react';
import { Admin, User, AlertMessage } from '../types';
import { storageUtils } from '../utils/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Admin | User | null;
  userType: 'admin' | 'user' | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (profileData: any) => void;
  alerts: AlertMessage[];
  addAlert: (type: AlertMessage['type'], message: string) => void;
  removeAlert: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Admin | User | null>(null);
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  useEffect(() => {
    // Initialize sample data
    storageUtils.initializeSampleData();
    
    // Check if user is already logged in
    const savedAuth = localStorage.getItem('medical_store_auth');
    if (savedAuth) {
      const auth = JSON.parse(savedAuth);
      setIsAuthenticated(auth.isAuthenticated);
      setUser(auth.user);
      setUserType(auth.userType);
    }
  }, []);

  const addAlert = (type: AlertMessage['type'], message: string) => {
    const alert: AlertMessage = {
      id: storageUtils.generateId(),
      type,
      message,
      timestamp: Date.now()
    };
    setAlerts(prev => [...prev, alert]);
    
    setTimeout(() => {
      removeAlert(alert.id);
    }, 5000);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const login = (username: string, password: string): boolean => {
    // Try admin login first
    const admins = storageUtils.getAdmins();
    const foundAdmin = admins.find(a => a.username === username && a.password === password);
    
    if (foundAdmin) {
      foundAdmin.lastLogin = new Date().toISOString();
      const updatedAdmins = admins.map(a => a.id === foundAdmin.id ? foundAdmin : a);
      storageUtils.saveAdmins(updatedAdmins);
      
      setIsAuthenticated(true);
      setUser(foundAdmin);
      setUserType('admin');
      localStorage.setItem('medical_store_auth', JSON.stringify({
        isAuthenticated: true,
        user: foundAdmin,
        userType: 'admin'
      }));
      addAlert('success', `Welcome back, ${foundAdmin.name}!`);
      return true;
    }
    
    // Try user login
    const users = storageUtils.getUsers();
    const foundUser = users.find(u => u.username === username && u.password === password && u.isActive);
    
    if (foundUser) {
      foundUser.lastLogin = new Date().toISOString();
      const updatedUsers = users.map(u => u.id === foundUser.id ? foundUser : u);
      storageUtils.saveUsers(updatedUsers);
      
      setIsAuthenticated(true);
      setUser(foundUser);
      setUserType('user');
      localStorage.setItem('medical_store_auth', JSON.stringify({
        isAuthenticated: true,
        user: foundUser,
        userType: 'user'
      }));
      addAlert('success', `Welcome back, ${foundUser.firstName} ${foundUser.lastName}!`);
      return true;
    }
    
    addAlert('error', 'Invalid credentials. Please try again.');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserType(null);
    localStorage.removeItem('medical_store_auth');
    addAlert('info', 'You have been logged out successfully.');
  };

  const updateProfile = (profileData: any) => {
    if (!user) return;
    
    if (userType === 'admin') {
      const admins = storageUtils.getAdmins();
      const updatedAdmin = { ...user, ...profileData };
      const updatedAdmins = admins.map(a => a.id === user.id ? updatedAdmin : a);
      storageUtils.saveAdmins(updatedAdmins);
      setUser(updatedAdmin);
      localStorage.setItem('medical_store_auth', JSON.stringify({
        isAuthenticated: true,
        user: updatedAdmin,
        userType: 'admin'
      }));
    } else {
      const users = storageUtils.getUsers();
      const updatedUser = { ...user, ...profileData };
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      storageUtils.saveUsers(updatedUsers);
      setUser(updatedUser);
      localStorage.setItem('medical_store_auth', JSON.stringify({
        isAuthenticated: true,
        user: updatedUser,
        userType: 'user'
      }));
    }
    
    addAlert('success', 'Profile updated successfully!');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      userType,
      login,
      logout,
      updateProfile,
      alerts,
      addAlert,
      removeAlert
    }}>
      {children}
    </AuthContext.Provider>
  );
};
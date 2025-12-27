import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MedicineManagement from './components/MedicineManagement';
import CustomerManagement from './components/CustomerManagement';
import PurchaseManagement from './components/PurchaseManagement';
import DailyReports from './components/DailyReports';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import EmployeeManagement from './components/EmployeeManagement';
import SalesManagement from './components/SalesManagement';
import HospitalManagement from './components/HospitalManagement';
import PatientTransfer from './components/PatientTransfer';
import AdminManagement from './components/AdminManagement';
import AdminProfile from './components/AdminProfile';
import CustomerDashboard from './components/CustomerDashboard';
import AlertMessages from './components/AlertMessages';

const AppContent: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm />
        <AlertMessages />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'medicines':
        return <MedicineManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'purchases':
        return <PurchaseManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'hospitals':
        return <HospitalManagement />;
      case 'transfers':
        return <PatientTransfer />;
      case 'admin':
        return <AdminManagement />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <DailyReports />;
      case 'analytics':
        return <div className="p-6"><h2 className="text-2xl font-bold">Analytics</h2><p className="text-gray-600">Advanced analytics coming soon...</p></div>;
      case 'profile':
        return userType === 'admin' ? <AdminProfile /> : <CustomerDashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
      <AlertMessages />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
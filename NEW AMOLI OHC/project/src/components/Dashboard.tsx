import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Building2, 
  UserCheck, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Package,
  Calendar
} from 'lucide-react';
import { DashboardStats } from '../types';
import { storageUtils } from '../utils/storage';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMedicines: 0,
    lowStockMedicines: 0,
    expiringSoon: 0,
    totalDealers: 0,
    totalEmployees: 0,
    totalCustomers: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    totalPurchases: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const medicines = storageUtils.getMedicines();
    const dealers = storageUtils.getDealers();
    const employees = storageUtils.getEmployees();
    const customers = storageUtils.getCustomers();
    const purchases = storageUtils.getPurchases();
    const sales = storageUtils.getSales();

    // Calculate expiring medicines (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoon = medicines.filter(medicine => 
      new Date(medicine.expiryDate) <= thirtyDaysFromNow
    ).length;

    // Calculate low stock medicines
    const lowStockMedicines = medicines.filter(medicine => 
      medicine.stockQuantity <= medicine.minStockLevel
    ).length;

    // Calculate today's sales
    const today = new Date().toDateString();
    const todaySales = sales.filter(sale => 
      new Date(sale.saleDate).toDateString() === today
    ).length;

    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = sales
      .filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((total, sale) => total + sale.finalAmount, 0);

    // Calculate pending payments
    const pendingPayments = purchases
      .filter(purchase => purchase.paymentStatus !== 'paid')
      .reduce((total, purchase) => total + purchase.pendingAmount, 0);

    setStats({
      totalMedicines: medicines.length,
      lowStockMedicines,
      expiringSoon,
      totalDealers: dealers.length,
      totalEmployees: employees.length,
      totalCustomers: customers.length,
      todaySales,
      monthlyRevenue,
      totalPurchases: purchases.length,
      pendingPayments
    });
  };

  const statCards = [
    {
      title: 'Total Medicines',
      value: stats.totalMedicines,
      icon: Pill,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStockMedicines,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: Calendar,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Dealers',
      value: stats.totalDealers,
      icon: Building2,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Today\'s Sales',
      value: stats.todaySales,
      icon: TrendingUp,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Total Purchases',
      value: stats.totalPurchases,
      icon: ShoppingCart,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Pending Payments',
      value: `₹${stats.pendingPayments.toLocaleString()}`,
      icon: Package,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Medical Store Management Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-white/50 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3">
            <Pill size={20} />
            <span>Add Medicine</span>
          </button>
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-3">
            <ShoppingCart size={20} />
            <span>New Purchase</span>
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3">
            <TrendingUp size={20} />
            <span>New Sale</span>
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-3">
            <Users size={20} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">New medicine "Paracetamol" added to inventory</span>
            <span className="text-gray-500 text-sm ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Purchase order #PO001 completed</span>
            <span className="text-gray-500 text-sm ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Low stock alert for Amoxicillin</span>
            <span className="text-gray-500 text-sm ml-auto">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
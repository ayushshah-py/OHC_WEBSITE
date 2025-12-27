import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Package, Users, DollarSign, FileText, BarChart3 } from 'lucide-react';
import { DailyReport } from '../types';
import { storageUtils } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DailyReports: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<DailyReport | null>(null);
  const { addAlert } = useAuth();

  useEffect(() => {
    generateReport();
  }, [selectedDate]);

  const generateReport = () => {
    const medicines = storageUtils.getMedicines();
    const customers = storageUtils.getCustomers();
    const purchases = storageUtils.getPurchases();
    const sales = storageUtils.getSales();

    const reportDate = new Date(selectedDate);
    const dateString = reportDate.toDateString();

    // Filter data for selected date
    const dailySales = sales.filter(sale => 
      new Date(sale.saleDate).toDateString() === dateString
    );
    const dailyPurchases = purchases.filter(purchase => 
      new Date(purchase.purchaseDate).toDateString() === dateString
    );
    const newCustomers = customers.filter(customer => 
      new Date(customer.createdAt).toDateString() === dateString
    );

    // Calculate low stock and expiring items
    const lowStockItems = medicines.filter(medicine => 
      medicine.stockQuantity <= medicine.minStockLevel
    ).length;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringItems = medicines.filter(medicine => 
      new Date(medicine.expiryDate) <= thirtyDaysFromNow
    ).length;

    // Calculate totals
    const totalSales = dailySales.length;
    const totalRevenue = dailySales.reduce((sum, sale) => sum + sale.finalAmount, 0);
    const totalPurchases = dailyPurchases.length;

    // Top selling medicines (from all sales, not just daily)
    const medicinesSold: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!medicinesSold[item.medicineId]) {
          medicinesSold[item.medicineId] = {
            name: item.medicineName,
            quantity: 0,
            revenue: 0
          };
        }
        medicinesSold[item.medicineId].quantity += item.quantity;
        medicinesSold[item.medicineId].revenue += item.totalPrice;
      });
    });

    const topSellingMedicines = Object.values(medicinesSold)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Sales by category
    const categorySales: { [key: string]: { count: number; revenue: number } } = {};
    dailySales.forEach(sale => {
      sale.items.forEach(item => {
        const medicine = medicines.find(m => m.id === item.medicineId);
        const category = medicine?.category || 'Unknown';
        if (!categorySales[category]) {
          categorySales[category] = { count: 0, revenue: 0 };
        }
        categorySales[category].count += item.quantity;
        categorySales[category].revenue += item.totalPrice;
      });
    });

    const salesByCategory = Object.entries(categorySales).map(([category, data]) => ({
      category,
      count: data.count,
      revenue: data.revenue
    }));

    setReport({
      date: selectedDate,
      totalSales,
      totalRevenue,
      totalPurchases,
      lowStockItems,
      expiringItems,
      newCustomers: newCustomers.length,
      topSellingMedicines,
      salesByCategory
    });
  };

  const exportToExcel = () => {
    if (!report) return;

    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Medical Store Daily Report'],
      ['Date:', new Date(report.date).toLocaleDateString()],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['Summary'],
      ['Total Sales:', report.totalSales],
      ['Total Revenue:', `₹${report.totalRevenue.toLocaleString()}`],
      ['Total Purchases:', report.totalPurchases],
      ['New Customers:', report.newCustomers],
      ['Low Stock Items:', report.lowStockItems],
      ['Expiring Items (30 days):', report.expiringItems],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Top selling medicines sheet
    if (report.topSellingMedicines.length > 0) {
      const topMedicinesData = [
        ['Top Selling Medicines'],
        ['Medicine Name', 'Quantity Sold', 'Revenue'],
        ...report.topSellingMedicines.map(med => [
          med.name,
          med.quantity,
          `₹${med.revenue.toLocaleString()}`
        ])
      ];
      const topMedicinesSheet = XLSX.utils.aoa_to_sheet(topMedicinesData);
      XLSX.utils.book_append_sheet(workbook, topMedicinesSheet, 'Top Medicines');
    }

    // Sales by category sheet
    if (report.salesByCategory.length > 0) {
      const categoryData = [
        ['Sales by Category'],
        ['Category', 'Items Sold', 'Revenue'],
        ...report.salesByCategory.map(cat => [
          cat.category,
          cat.count,
          `₹${cat.revenue.toLocaleString()}`
        ])
      ];
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Sales');
    }

    // Generate filename with date and time
    const fileName = `Medical_Store_Report_${new Date(report.date).toISOString().split('T')[0]}_${new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0]}.xlsx`;
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);

    addAlert('success', 'Report exported successfully!');
  };

  if (!report) {
    return <div className="flex items-center justify-center h-64">Loading report...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daily Reports</h2>
          <p className="text-gray-600">Generate and export daily business reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={exportToExcel}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-blue-800">{report.totalSales}</p>
            </div>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Revenue</p>
              <p className="text-2xl font-bold text-green-800">₹{report.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Purchases</p>
              <p className="text-2xl font-bold text-purple-800">{report.totalPurchases}</p>
            </div>
            <Package className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-medium">New Customers</p>
              <p className="text-2xl font-bold text-indigo-800">{report.newCustomers}</p>
            </div>
            <Users className="text-indigo-500" size={24} />
          </div>
        </div>

        <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-red-800">{report.lowStockItems}</p>
            </div>
            <Package className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-800">{report.expiringItems}</p>
            </div>
            <Calendar className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Medicines */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Top Selling Medicines</h3>
          </div>
          <div className="space-y-3">
            {report.topSellingMedicines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            ) : (
              report.topSellingMedicines.map((medicine, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{medicine.name}</p>
                    <p className="text-sm text-gray-600">{medicine.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{medicine.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Sales by Category</h3>
          </div>
          <div className="space-y-3">
            {report.salesByCategory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No category data available</p>
            ) : (
              report.salesByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{category.category}</p>
                    <p className="text-sm text-gray-600">{category.count} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">₹{category.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Business Metrics</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Total transactions processed: {report.totalSales}</li>
              <li>• Revenue generated: ₹{report.totalRevenue.toLocaleString()}</li>
              <li>• New customer acquisitions: {report.newCustomers}</li>
              <li>• Purchase orders completed: {report.totalPurchases}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Inventory Alerts</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Items requiring restock: {report.lowStockItems}</li>
              <li>• Items expiring within 30 days: {report.expiringItems}</li>
              <li>• Top performing category: {report.salesByCategory[0]?.category || 'N/A'}</li>
              <li>• Best selling medicine: {report.topSellingMedicines[0]?.name || 'N/A'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReports;
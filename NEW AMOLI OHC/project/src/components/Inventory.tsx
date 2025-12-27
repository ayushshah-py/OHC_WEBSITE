import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Calendar, Search, Filter, TrendingDown, TrendingUp } from 'lucide-react';
import { Medicine } from '../types';
import { storageUtils } from '../utils/storage';

const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = () => {
    setMedicines(storageUtils.getMedicines());
  };

  const getFilteredMedicines = () => {
    let filtered = medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (filterType) {
      case 'low_stock':
        return filtered.filter(m => m.stockQuantity <= m.minStockLevel);
      case 'expiring':
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return filtered.filter(m => new Date(m.expiryDate) <= thirtyDaysFromNow);
      case 'out_of_stock':
        return filtered.filter(m => m.stockQuantity === 0);
      case 'overstocked':
        return filtered.filter(m => m.stockQuantity > m.minStockLevel * 5);
      default:
        return filtered;
    }
  };

  const filteredMedicines = getFilteredMedicines();

  const getStockStatus = (medicine: Medicine) => {
    if (medicine.stockQuantity === 0) {
      return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: TrendingDown };
    }
    if (medicine.stockQuantity <= medicine.minStockLevel) {
      return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
    }
    if (medicine.stockQuantity > medicine.minStockLevel * 5) {
      return { status: 'Overstocked', color: 'bg-purple-100 text-purple-800', icon: TrendingUp };
    }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: Package };
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    if (expiry <= today) {
      return { status: 'Expired', color: 'bg-red-100 text-red-800' };
    }
    if (expiry <= thirtyDaysFromNow) {
      return { status: 'Expiring Soon', color: 'bg-orange-100 text-orange-800' };
    }
    if (expiry <= ninetyDaysFromNow) {
      return { status: 'Expiring in 3 months', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { status: 'Good', color: 'bg-green-100 text-green-800' };
  };

  const inventoryStats = {
    total: medicines.length,
    lowStock: medicines.filter(m => m.stockQuantity <= m.minStockLevel).length,
    outOfStock: medicines.filter(m => m.stockQuantity === 0).length,
    expiring: medicines.filter(m => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return new Date(m.expiryDate) <= thirtyDaysFromNow;
    }).length,
    totalValue: medicines.reduce((sum, m) => sum + (m.stockQuantity * m.costPrice), 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <p className="text-gray-600">Monitor stock levels, expiry dates, and inventory value</p>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-800">{inventoryStats.total}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-orange-800">{inventoryStats.lowStock}</p>
            </div>
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-800">{inventoryStats.outOfStock}</p>
            </div>
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-800">{inventoryStats.expiring}</p>
            </div>
            <Calendar className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold text-green-800">₹{inventoryStats.totalValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Items</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expiring">Expiring Soon</option>
            <option value="overstocked">Overstocked</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Medicine</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Min Level</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Value</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Expiry</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Stock Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Expiry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No medicines found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => {
                  const stockStatus = getStockStatus(medicine);
                  const expiryStatus = getExpiryStatus(medicine.expiryDate);
                  const StockIcon = stockStatus.icon;
                  
                  return (
                    <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {medicine.image ? (
                            <img
                              src={medicine.image}
                              alt={medicine.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Package className="text-white" size={20} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{medicine.name}</div>
                            <div className="text-sm text-gray-500">{medicine.genericName}</div>
                            <div className="text-xs text-gray-400">{medicine.strength}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{medicine.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <StockIcon size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">{medicine.stockQuantity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{medicine.minStockLevel}</td>
                      <td className="px-6 py-4 text-gray-700">
                        ₹{(medicine.stockQuantity * medicine.costPrice).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${expiryStatus.color}`}>
                          {expiryStatus.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h4 className="font-medium text-red-800 mb-2">Critical Actions Required</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• {inventoryStats.outOfStock} items are out of stock</li>
              <li>• {inventoryStats.lowStock} items need restocking</li>
              <li>• {inventoryStats.expiring} items expiring within 30 days</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">Inventory Value</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Total inventory value: ₹{inventoryStats.totalValue.toLocaleString()}</li>
              <li>• Average item value: ₹{Math.round(inventoryStats.totalValue / inventoryStats.total).toLocaleString()}</li>
              <li>• {inventoryStats.total} unique medicines in stock</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800 mb-2">Recommendations</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Review minimum stock levels regularly</li>
              <li>• Set up automated reorder alerts</li>
              <li>• Monitor expiry dates closely</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
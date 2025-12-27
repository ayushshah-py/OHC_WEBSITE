import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, TrendingUp, ShoppingBag, Calendar, DollarSign, User } from 'lucide-react';
import { Sale, SaleItem, Customer, Medicine } from '../types';
import { storageUtils } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const SalesManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | undefined>();
  const { addAlert } = useAuth();

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    invoiceNumber: '',
    saleDate: new Date().toISOString().split('T')[0],
    discountAmount: '',
    paidAmount: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi' | 'insurance',
    prescriptionRequired: false,
    doctorName: '',
    notes: '',
    items: [] as Array<{
      medicineId: string;
      quantity: string;
      discount: string;
    }>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSales(storageUtils.getSales());
    setCustomers(storageUtils.getCustomers());
    setMedicines(storageUtils.getMedicines());
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerPhone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      addAlert('error', 'Please add at least one item');
      return;
    }

    const items: SaleItem[] = formData.items.map(item => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      const quantity = parseInt(item.quantity);
      const price = medicine?.price || 0;
      const discount = parseFloat(item.discount) || 0;
      const totalPrice = (quantity * price) - discount;

      return {
        medicineId: item.medicineId,
        medicineName: medicine?.name || '',
        batchNumber: medicine?.batchNumber || '',
        quantity,
        price,
        discount,
        totalPrice
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discountAmount = parseFloat(formData.discountAmount) || 0;
    const finalAmount = totalAmount - discountAmount;
    const paidAmount = parseFloat(formData.paidAmount) || finalAmount;
    const changeAmount = Math.max(0, paidAmount - finalAmount);

    if (editingSale) {
      const updatedSale: Sale = {
        ...formData,
        id: editingSale.id,
        invoiceNumber: formData.invoiceNumber || editingSale.invoiceNumber,
        items,
        totalAmount,
        discountAmount,
        finalAmount,
        paidAmount,
        changeAmount,
        createdAt: editingSale.createdAt,
        updatedAt: new Date().toISOString()
      };
      const updatedSales = sales.map(s => s.id === editingSale.id ? updatedSale : s);
      setSales(updatedSales);
      storageUtils.saveSales(updatedSales);
      addAlert('success', 'Sale updated successfully!');
    } else {
      const newSale: Sale = {
        ...formData,
        id: storageUtils.generateId(),
        invoiceNumber: formData.invoiceNumber || storageUtils.generateInvoiceNumber('INV'),
        items,
        totalAmount,
        discountAmount,
        finalAmount,
        paidAmount,
        changeAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      storageUtils.saveSales(updatedSales);

      // Update medicine stock
      items.forEach(item => {
        const medicine = medicines.find(m => m.id === item.medicineId);
        if (medicine) {
          medicine.stockQuantity = Math.max(0, medicine.stockQuantity - item.quantity);
          medicine.updatedAt = new Date().toISOString();
        }
      });
      storageUtils.saveMedicines(medicines);

      // Update customer purchase count
      if (formData.customerId) {
        const customer = customers.find(c => c.id === formData.customerId);
        if (customer) {
          customer.totalPurchases += 1;
          customer.lastVisit = new Date().toISOString();
          customer.updatedAt = new Date().toISOString();
          storageUtils.saveCustomers(customers);
        }
      }

      addAlert('success', 'Sale completed successfully!');
    }

    resetForm();
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      customerId: sale.customerId || '',
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      invoiceNumber: sale.invoiceNumber,
      saleDate: sale.saleDate,
      discountAmount: sale.discountAmount.toString(),
      paidAmount: sale.paidAmount.toString(),
      paymentMethod: sale.paymentMethod,
      prescriptionRequired: sale.prescriptionRequired,
      doctorName: sale.doctorName || '',
      notes: sale.notes || '',
      items: sale.items.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity.toString(),
        discount: item.discount.toString()
      }))
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      const updatedSales = sales.filter(s => s.id !== id);
      setSales(updatedSales);
      storageUtils.saveSales(updatedSales);
      addAlert('success', 'Sale deleted successfully!');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        medicineId: '',
        quantity: '',
        discount: '0'
      }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customerId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerPhone: customer.phone
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      customerPhone: '',
      invoiceNumber: '',
      saleDate: new Date().toISOString().split('T')[0],
      discountAmount: '',
      paidAmount: '',
      paymentMethod: 'cash',
      prescriptionRequired: false,
      doctorName: '',
      notes: '',
      items: []
    });
    setEditingSale(undefined);
    setShowForm(false);
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      const quantity = parseInt(item.quantity) || 0;
      const price = medicine?.price || 0;
      const discount = parseFloat(item.discount) || 0;
      return total + (quantity * price) - discount;
    }, 0) - (parseFloat(formData.discountAmount) || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Management</h2>
          <p className="text-gray-600">Process sales transactions and manage customer orders</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Sale</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search sales..."
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Invoice</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Items</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No sales found. Process your first sale to get started.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{sale.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{sale.customerName}</div>
                        <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-700">{new Date(sale.saleDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp size={16} className="text-gray-400" />
                        <span className="text-gray-700">{sale.items.length} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">₹{sale.finalAmount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sale.paymentMethod === 'cash' 
                          ? 'bg-green-100 text-green-800'
                          : sale.paymentMethod === 'card'
                          ? 'bg-blue-100 text-blue-800'
                          : sale.paymentMethod === 'upi'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {sale.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingSale ? 'Edit Sale' : 'New Sale Transaction'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Customer (Optional)</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Date</label>
                  <input
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Sale Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
                          <select
                            value={item.medicineId}
                            onChange={(e) => updateItem(index, 'medicineId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Medicine</option>
                            {medicines.filter(m => m.stockQuantity > 0).map(medicine => (
                              <option key={medicine.id} value={medicine.id}>
                                {medicine.name} - ₹{medicine.price} (Stock: {medicine.stockQuantity})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => updateItem(index, 'discount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Discount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Total: ₹${calculateTotal().toFixed(2)}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="prescriptionRequired"
                    checked={formData.prescriptionRequired}
                    onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="prescriptionRequired" className="text-sm font-medium text-gray-700">
                    Prescription Required
                  </label>
                </div>
                {formData.prescriptionRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                    <input
                      type="text"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">
                    Total Amount: ₹{calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>

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
                  {editingSale ? 'Update Sale' : 'Complete Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
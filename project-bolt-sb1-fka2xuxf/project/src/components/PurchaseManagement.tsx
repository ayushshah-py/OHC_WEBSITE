import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ShoppingCart, Package, Calendar, DollarSign } from 'lucide-react';
import { Purchase, PurchaseItem, Dealer, Medicine } from '../types';
import { storageUtils } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const PurchaseManagement: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | undefined>();
  const { addAlert } = useAuth();

  const [formData, setFormData] = useState({
    dealerId: '',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'pending' as 'paid' | 'pending' | 'partial',
    paymentMethod: 'cash' as 'cash' | 'cheque' | 'bank_transfer' | 'credit',
    paidAmount: '',
    notes: '',
    items: [] as Array<{
      medicineId: string;
      quantity: string;
      costPrice: string;
      sellingPrice: string;
      expiryDate: string;
      batchNumber: string;
    }>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPurchases(storageUtils.getPurchases());
    setDealers(storageUtils.getDealers());
    setMedicines(storageUtils.getMedicines());
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dealer = dealers.find(d => d.id === formData.dealerId);
    if (!dealer) {
      addAlert('error', 'Please select a dealer');
      return;
    }

    if (formData.items.length === 0) {
      addAlert('error', 'Please add at least one item');
      return;
    }

    const items: PurchaseItem[] = formData.items.map(item => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      return {
        medicineId: item.medicineId,
        medicineName: medicine?.name || '',
        batchNumber: item.batchNumber,
        quantity: parseInt(item.quantity),
        costPrice: parseFloat(item.costPrice),
        sellingPrice: parseFloat(item.sellingPrice),
        expiryDate: item.expiryDate,
        totalCost: parseInt(item.quantity) * parseFloat(item.costPrice)
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const pendingAmount = totalAmount - paidAmount;

    if (editingPurchase) {
      const updatedPurchase: Purchase = {
        ...formData,
        id: editingPurchase.id,
        dealerName: dealer.name,
        items,
        totalAmount,
        paidAmount,
        pendingAmount,
        createdAt: editingPurchase.createdAt,
        updatedAt: new Date().toISOString()
      };
      const updatedPurchases = purchases.map(p => p.id === editingPurchase.id ? updatedPurchase : p);
      setPurchases(updatedPurchases);
      storageUtils.savePurchases(updatedPurchases);
      addAlert('success', 'Purchase updated successfully!');
    } else {
      const newPurchase: Purchase = {
        ...formData,
        id: storageUtils.generateId(),
        dealerName: dealer.name,
        invoiceNumber: formData.invoiceNumber || storageUtils.generateInvoiceNumber('PO'),
        items,
        totalAmount,
        paidAmount,
        pendingAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedPurchases = [...purchases, newPurchase];
      setPurchases(updatedPurchases);
      storageUtils.savePurchases(updatedPurchases);

      // Update medicine stock
      items.forEach(item => {
        const medicine = medicines.find(m => m.id === item.medicineId);
        if (medicine) {
          medicine.stockQuantity += item.quantity;
          medicine.costPrice = item.costPrice;
          medicine.price = item.sellingPrice;
          medicine.updatedAt = new Date().toISOString();
        }
      });
      storageUtils.saveMedicines(medicines);

      addAlert('success', 'Purchase added successfully!');
    }

    resetForm();
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      dealerId: purchase.dealerId,
      invoiceNumber: purchase.invoiceNumber,
      purchaseDate: purchase.purchaseDate,
      paymentStatus: purchase.paymentStatus,
      paymentMethod: purchase.paymentMethod,
      paidAmount: purchase.paidAmount.toString(),
      notes: purchase.notes || '',
      items: purchase.items.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity.toString(),
        costPrice: item.costPrice.toString(),
        sellingPrice: item.sellingPrice.toString(),
        expiryDate: item.expiryDate,
        batchNumber: item.batchNumber
      }))
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      const updatedPurchases = purchases.filter(p => p.id !== id);
      setPurchases(updatedPurchases);
      storageUtils.savePurchases(updatedPurchases);
      addAlert('success', 'Purchase deleted successfully!');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        medicineId: '',
        quantity: '',
        costPrice: '',
        sellingPrice: '',
        expiryDate: '',
        batchNumber: ''
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

  const resetForm = () => {
    setFormData({
      dealerId: '',
      invoiceNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      paidAmount: '',
      notes: '',
      items: []
    });
    setEditingPurchase(undefined);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Purchase Management</h2>
          <p className="text-gray-600">Manage inventory purchases and supplier orders</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Purchase</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search purchases..."
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Dealer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Items</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No purchases found. Create your first purchase order to get started.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{purchase.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{purchase.dealerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-700">{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="text-gray-700">{purchase.items.length} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">₹{purchase.totalAmount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        purchase.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : purchase.paymentStatus === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(purchase)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase.id)}
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

      {/* Purchase Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingPurchase ? 'Edit Purchase' : 'New Purchase Order'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dealer</label>
                  <select
                    value={formData.dealerId}
                    onChange={(e) => setFormData({ ...formData, dealerId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Dealer</option>
                    {dealers.filter(d => d.isActive).map(dealer => (
                      <option key={dealer.id} value={dealer.id}>{dealer.name} - {dealer.companyName}</option>
                    ))}
                  </select>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Purchase Items</h3>
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
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
                          <select
                            value={item.medicineId}
                            onChange={(e) => updateItem(index, 'medicineId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Medicine</option>
                            {medicines.map(medicine => (
                              <option key={medicine.id} value={medicine.id}>{medicine.name}</option>
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
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.costPrice}
                            onChange={(e) => updateItem(index, 'costPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.sellingPrice}
                            onChange={(e) => updateItem(index, 'sellingPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
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
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  {editingPurchase ? 'Update Purchase' : 'Create Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManagement;
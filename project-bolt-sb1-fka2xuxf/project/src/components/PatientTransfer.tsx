import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, Users, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { PatientTransfer, Customer, Hospital } from '../types';
import { storageUtils } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const PatientTransferManagement: React.FC = () => {
  const [transfers, setTransfers] = useState<PatientTransfer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<PatientTransfer | undefined>();
  const { addAlert, user, userType } = useAuth();

  const [formData, setFormData] = useState({
    patientId: '',
    toHospitalId: '',
    transferDate: new Date().toISOString().split('T')[0],
    reason: '',
    medicalCondition: '',
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransfers(storageUtils.getPatientTransfers());
    setCustomers(storageUtils.getCustomers());
    setHospitals(storageUtils.getHospitals());
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toHospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patient = customers.find(c => c.id === formData.patientId);
    const hospital = hospitals.find(h => h.id === formData.toHospitalId);
    
    if (!patient || !hospital) {
      addAlert('error', 'Please select valid patient and hospital');
      return;
    }

    const transferData = {
      ...formData,
      patientName: `${patient.firstName} ${patient.lastName}`,
      fromHospital: 'Amoli Hospital',
      toHospitalName: hospital.name,
      transferredBy: (user as any)?.name || `${(user as any)?.firstName} ${(user as any)?.lastName}`,
      status: 'pending' as const
    };

    if (editingTransfer) {
      const updatedTransfer: PatientTransfer = {
        ...transferData,
        id: editingTransfer.id,
        createdAt: editingTransfer.createdAt,
        updatedAt: new Date().toISOString()
      };
      const updatedTransfers = transfers.map(t => t.id === editingTransfer.id ? updatedTransfer : t);
      setTransfers(updatedTransfers);
      storageUtils.savePatientTransfers(updatedTransfers);
      addAlert('success', 'Transfer request updated successfully!');
    } else {
      const newTransfer: PatientTransfer = {
        ...transferData,
        id: storageUtils.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedTransfers = [...transfers, newTransfer];
      setTransfers(updatedTransfers);
      storageUtils.savePatientTransfers(updatedTransfers);
      addAlert('success', 'Transfer request submitted successfully!');
    }

    resetForm();
  };

  const handleApproval = (transferId: string, status: 'approved' | 'rejected') => {
    const updatedTransfers = transfers.map(transfer => 
      transfer.id === transferId 
        ? { ...transfer, status, updatedAt: new Date().toISOString() }
        : transfer
    );
    setTransfers(updatedTransfers);
    storageUtils.savePatientTransfers(updatedTransfers);
    addAlert('success', `Transfer request ${status} successfully!`);
  };

  const handleEdit = (transfer: PatientTransfer) => {
    setEditingTransfer(transfer);
    setFormData({
      patientId: transfer.patientId,
      toHospitalId: transfer.toHospitalId,
      transferDate: transfer.transferDate,
      reason: transfer.reason,
      medicalCondition: transfer.medicalCondition,
      urgencyLevel: transfer.urgencyLevel,
      notes: transfer.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transfer request?')) {
      const updatedTransfers = transfers.filter(t => t.id !== id);
      setTransfers(updatedTransfers);
      storageUtils.savePatientTransfers(updatedTransfers);
      addAlert('success', 'Transfer request deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      toHospitalId: '',
      transferDate: new Date().toISOString().split('T')[0],
      reason: '',
      medicalCondition: '',
      urgencyLevel: 'medium',
      notes: ''
    });
    setEditingTransfer(undefined);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const isAdmin = userType === 'admin';
  const canApprove = isAdmin || (user as any)?.canApprove;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Transfer Management</h2>
          <p className="text-gray-600">Transfer patients from Amoli Hospital to partner hospitals</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Transfer</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search transfers..."
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Transfer Route</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Urgency</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No transfer requests found. Create your first transfer request to get started.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {transfer.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transfer.patientName}</div>
                          <div className="text-sm text-gray-500">{transfer.reason}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{transfer.fromHospital}</span>
                        <ArrowRight size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{transfer.toHospitalName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-gray-700">{new Date(transfer.transferDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(transfer.urgencyLevel)}`}>
                        {transfer.urgencyLevel.charAt(0).toUpperCase() + transfer.urgencyLevel.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                        {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {canApprove && transfer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproval(transfer.id, 'approved')}
                              className="text-green-500 hover:text-green-700 transition-colors text-sm px-2 py-1 bg-green-50 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(transfer.id, 'rejected')}
                              className="text-red-500 hover:text-red-700 transition-colors text-sm px-2 py-1 bg-red-50 rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(transfer)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(transfer.id)}
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

      {/* Transfer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTransfer ? 'Edit Transfer Request' : 'New Patient Transfer'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Patient</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transfer To Hospital</label>
                  <select
                    value={formData.toHospitalId}
                    onChange={(e) => setFormData({ ...formData, toHospitalId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.filter(h => h.isActive).map(hospital => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name} - {hospital.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Date</label>
                  <input
                    type="date"
                    value={formData.transferDate}
                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                  <select
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Transfer</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Specialized treatment required"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Condition</label>
                <textarea
                  value={formData.medicalCondition}
                  onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the patient's current medical condition..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information or special requirements..."
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
                  {editingTransfer ? 'Update Transfer' : 'Submit Transfer Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientTransferManagement;
import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, UserCheck, Mail, Phone, MapPin, Upload, Download } from 'lucide-react';
import { Employee } from '../types';
import { storageUtils } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const { addAlert } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    dateOfJoining: '',
    dateOfBirth: '',
    emergencyContact: '',
    isActive: true
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setEmployees(storageUtils.getEmployees());
  };

  const filteredEmployees = employees.filter(employee =>
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData
    };

    if (editingEmployee) {
      const updatedEmployee: Employee = {
        ...employeeData,
        id: editingEmployee.id,
        createdAt: editingEmployee.createdAt,
        updatedAt: new Date().toISOString()
      };
      const updatedEmployees = employees.map(e => e.id === editingEmployee.id ? updatedEmployee : e);
      setEmployees(updatedEmployees);
      storageUtils.saveEmployees(updatedEmployees);
      addAlert('success', 'Employee updated successfully!');
    } else {
      const newEmployee: Employee = {
        ...employeeData,
        id: storageUtils.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedEmployees = [...employees, newEmployee];
      setEmployees(updatedEmployees);
      storageUtils.saveEmployees(updatedEmployees);
      addAlert('success', 'Employee added successfully!');
    }

    resetForm();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      dateOfJoining: employee.dateOfJoining,
      dateOfBirth: employee.dateOfBirth,
      emergencyContact: employee.emergencyContact,
      isActive: employee.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = employees.filter(e => e.id !== id);
      setEmployees(updatedEmployees);
      storageUtils.saveEmployees(updatedEmployees);
      addAlert('success', 'Employee deleted successfully!');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedEmployees.length === 0) {
      addAlert('warning', 'Please select employees to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedEmployees.length} employee(s)?`)) {
      const updatedEmployees = employees.filter(emp => !selectedEmployees.includes(emp.id));
      setEmployees(updatedEmployees);
      storageUtils.saveEmployees(updatedEmployees);
      setSelectedEmployees([]);
      addAlert('success', `Successfully deleted ${selectedEmployees.length} employee(s)!`);
    }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const importedEmployees: Employee[] = jsonData.map((row: any) => ({
            id: storageUtils.generateId(),
            firstName: row['First Name'] || row.firstName || '',
            lastName: row['Last Name'] || row.lastName || '',
            email: row['Email'] || row.email || '',
            phone: row['Phone'] || row.phone || '',
            position: row['Position'] || row.position || '',
            department: row['Department'] || row.department || '',
            dateOfJoining: row['Date of Joining'] || row.dateOfJoining || new Date().toISOString().split('T')[0],
            dateOfBirth: row['Date of Birth'] || row.dateOfBirth || '',
            emergencyContact: row['Emergency Contact'] || row.emergencyContact || '',
            isActive: row['Active'] !== 'false' && row.isActive !== false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));

          const updatedEmployees = [...employees, ...importedEmployees];
          setEmployees(updatedEmployees);
          storageUtils.saveEmployees(updatedEmployees);
          addAlert('success', `Successfully imported ${importedEmployees.length} employees!`);
          
          // Reset file input
          e.target.value = '';
        } catch (error) {
          addAlert('error', 'Error importing Excel file. Please check the format.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const exportToExcel = () => {
    const exportData = employees.map(employee => ({
      'First Name': employee.firstName,
      'Last Name': employee.lastName,
      'Email': employee.email,
      'Phone': employee.phone,
      'Position': employee.position,
      'Department': employee.department,
      'Date of Joining': employee.dateOfJoining,
      'Date of Birth': employee.dateOfBirth,
      'Emergency Contact': employee.emergencyContact,
      'Active': employee.isActive ? 'Yes' : 'No',
      'Created Date': new Date(employee.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    const fileName = `Employees_${new Date().toISOString().split('T')[0]}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);

    addAlert('success', 'Employee data exported successfully!');
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      dateOfJoining: '',
      dateOfBirth: '',
      emergencyContact: '',
      isActive: true
    });
    setEditingEmployee(undefined);
    setShowForm(false);
    setSelectedEmployees([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-gray-600">Manage staff records and information</p>
        </div>
        <div className="flex space-x-2">
          <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
            <Upload size={20} />
            <span>Import Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              className="hidden"
            />
          </label>
          <button
            onClick={exportToExcel}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Export Excel</span>
          </button>
          {selectedEmployees.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Trash2 size={20} />
              <span>Delete Selected ({selectedEmployees.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-6">
        {filteredEmployees.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Select All ({filteredEmployees.length} employees)
                </label>
              </div>
              <div className="text-sm text-gray-600">
                {selectedEmployees.length} selected
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UserCheck className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No employees found. Add your first employee to get started.</p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail size={16} />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{employee.phone}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(employee)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Position</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Assistant Pharmacist">Assistant Pharmacist</option>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Sales Representative">Sales Representative</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Sales">Sales</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Administration">Administration</option>
                    <option value="Customer Service">Customer Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining</label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
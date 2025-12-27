export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  manufacturingDate: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  description?: string;
  dosageForm: string; // tablet, capsule, syrup, injection, etc.
  strength: string; // 500mg, 10ml, etc.
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dealer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  licenseNumber?: string;
  contactPerson: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  dateOfJoining: string;
  dateOfBirth: string;
  emergencyContact: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  dateOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  allergies?: string;
  medicalHistory?: string;
  doctorName?: string;
  insuranceNumber?: string;
  emergencyContact: string;
  totalPurchases: number;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  dealerId: string;
  dealerName: string;
  invoiceNumber: string;
  purchaseDate: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  paymentMethod: 'cash' | 'cheque' | 'bank_transfer' | 'credit';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  expiryDate: string;
  totalCost: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  invoiceNumber: string;
  saleDate: string;
  items: SaleItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance';
  prescriptionRequired: boolean;
  doctorName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  contactPerson: string;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientTransfer {
  id: string;
  patientId: string;
  patientName: string;
  fromHospital: string;
  toHospitalId: string;
  toHospitalName: string;
  transferDate: string;
  reason: string;
  medicalCondition: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  transferredBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'pharmacist' | 'cashier';
  phone?: string;
  address?: string;
  canApprove?: boolean;
  profileImage?: string;
  isActive: boolean;
  dateJoined: string;
  lastLogin?: string;
  bio?: string;
}

export interface DailyReport {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalPurchases: number;
  lowStockItems: number;
  expiringItems: number;
  newCustomers: number;
  topSellingMedicines: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export interface DashboardStats {
  totalMedicines: number;
  lowStockMedicines: number;
  expiringSoon: number;
  totalDealers: number;
  totalEmployees: number;
  totalCustomers: number;
  todaySales: number;
  monthlyRevenue: number;
  totalPurchases: number;
  pendingPayments: number;
}

export interface AlertMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}
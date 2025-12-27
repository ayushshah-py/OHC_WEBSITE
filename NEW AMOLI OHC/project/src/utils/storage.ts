import { Medicine, Dealer, Employee, Customer, Purchase, Sale, Admin, User } from '../types';

const MEDICINES_KEY = 'medical_store_medicines';
const DEALERS_KEY = 'medical_store_dealers';
const EMPLOYEES_KEY = 'medical_store_employees';
const CUSTOMERS_KEY = 'medical_store_customers';
const PURCHASES_KEY = 'medical_store_purchases';
const SALES_KEY = 'medical_store_sales';
const ADMINS_KEY = 'medical_store_admins';
const USERS_KEY = 'medical_store_users';
const HOSPITALS_KEY = 'medical_store_hospitals';
const PATIENT_TRANSFERS_KEY = 'medical_store_patient_transfers';

export const storageUtils = {
  // Medicines
  getMedicines: (): Medicine[] => {
    const medicines = localStorage.getItem(MEDICINES_KEY);
    return medicines ? JSON.parse(medicines) : [];
  },

  saveMedicines: (medicines: Medicine[]): void => {
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  },

  // Dealers
  getDealers: (): Dealer[] => {
    const dealers = localStorage.getItem(DEALERS_KEY);
    return dealers ? JSON.parse(dealers) : [];
  },

  saveDealers: (dealers: Dealer[]): void => {
    localStorage.setItem(DEALERS_KEY, JSON.stringify(dealers));
  },

  // Employees
  getEmployees: (): Employee[] => {
    const employees = localStorage.getItem(EMPLOYEES_KEY);
    return employees ? JSON.parse(employees) : [];
  },

  saveEmployees: (employees: Employee[]): void => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  },

  // Customers
  getCustomers: (): Customer[] => {
    const customers = localStorage.getItem(CUSTOMERS_KEY);
    return customers ? JSON.parse(customers) : [];
  },

  saveCustomers: (customers: Customer[]): void => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  // Purchases
  getPurchases: (): Purchase[] => {
    const purchases = localStorage.getItem(PURCHASES_KEY);
    return purchases ? JSON.parse(purchases) : [];
  },

  savePurchases: (purchases: Purchase[]): void => {
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  },

  // Sales
  getSales: (): Sale[] => {
    const sales = localStorage.getItem(SALES_KEY);
    return sales ? JSON.parse(sales) : [];
  },

  saveSales: (sales: Sale[]): void => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  },

  // Admins
  getAdmins: (): Admin[] => {
    const admins = localStorage.getItem(ADMINS_KEY);
    if (!admins) {
      const defaultAdmin: Admin = {
        id: '1',
        username: 'administrator',
        password: 'Ayush@2025',
        email: 'admin@amolihospital.com',
        name: 'Hospital Administrator',
        role: 'super_admin',
        avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      const adminList = [defaultAdmin];
      localStorage.setItem(ADMINS_KEY, JSON.stringify(adminList));
      return adminList;
    }
    return JSON.parse(admins);
  },

  saveAdmins: (admins: Admin[]): void => {
    localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
  },

  // Users
  getUsers: (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    if (!users) {
      const defaultUsers: User[] = [
        {
          id: '1',
          username: 'manager',
          password: 'manager123',
          email: 'manager@medicalstore.com',
          firstName: 'Store',
          lastName: 'Manager',
          role: 'manager',
          canApprove: false,
          phone: '+91-9876543210',
          address: '123 Medical Street',
          isActive: true,
          dateJoined: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          id: '2',
          username: 'pharmacist',
          password: 'pharma123',
          email: 'pharmacist@medicalstore.com',
          firstName: 'John',
          lastName: 'Pharmacist',
          role: 'pharmacist',
          canApprove: false,
          phone: '+91-9876543211',
          address: '456 Pharmacy Lane',
          isActive: true,
          dateJoined: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          id: '3',
          username: 'cashier',
          password: 'cashier123',
          email: 'cashier@medicalstore.com',
          firstName: 'Jane',
          lastName: 'Cashier',
          role: 'cashier',
          canApprove: false,
          phone: '+91-9876543212',
          address: '789 Counter Road',
          isActive: true,
          dateJoined: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(users);
  },

  saveUsers: (users: User[]): void => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Hospitals
  getHospitals: (): Hospital[] => {
    const hospitals = localStorage.getItem(HOSPITALS_KEY);
    return hospitals ? JSON.parse(hospitals) : [];
  },

  saveHospitals: (hospitals: Hospital[]): void => {
    localStorage.setItem(HOSPITALS_KEY, JSON.stringify(hospitals));
  },

  // Patient Transfers
  getPatientTransfers: (): PatientTransfer[] => {
    const transfers = localStorage.getItem(PATIENT_TRANSFERS_KEY);
    return transfers ? JSON.parse(transfers) : [];
  },

  savePatientTransfers: (transfers: PatientTransfer[]): void => {
    localStorage.setItem(PATIENT_TRANSFERS_KEY, JSON.stringify(transfers));
  },

  // Utility functions
  generateId: (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },

  generateInvoiceNumber: (prefix: string): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  },

  // Image compression utility
  compressImage: (file: File, maxSizeKB: number = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(800 / img.width, 600 / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        let quality = 0.9;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Reduce quality until file size is under maxSizeKB
        while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(dataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },
  // Initialize sample data
  initializeSampleData: (): void => {
    // Sample medicines
    if (storageUtils.getMedicines().length === 0) {
      const sampleMedicines: Medicine[] = [
        {
          id: '1',
          name: 'Paracetamol',
          genericName: 'Acetaminophen',
          manufacturer: 'ABC Pharma',
          category: 'Analgesic',
          batchNumber: 'PAR001',
          expiryDate: '2025-12-31',
          manufacturingDate: '2024-01-15',
          price: 25.00,
          costPrice: 18.00,
          stockQuantity: 500,
          minStockLevel: 50,
          description: 'Pain reliever and fever reducer',
          dosageForm: 'Tablet',
          strength: '500mg',
          image: 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Amoxicillin',
          genericName: 'Amoxicillin',
          manufacturer: 'XYZ Pharmaceuticals',
          category: 'Antibiotic',
          batchNumber: 'AMX002',
          expiryDate: '2025-08-20',
          manufacturingDate: '2024-02-10',
          price: 120.00,
          costPrice: 85.00,
          stockQuantity: 200,
          minStockLevel: 30,
          description: 'Broad-spectrum antibiotic',
          dosageForm: 'Capsule',
          strength: '250mg',
          image: 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      storageUtils.saveMedicines(sampleMedicines);
    }

    // Sample dealers
    if (storageUtils.getDealers().length === 0) {
      const sampleDealers: Dealer[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          companyName: 'ABC Pharmaceuticals Ltd.',
          email: 'rajesh@abcpharma.com',
          phone: '+91-9876543210',
          address: '123 Industrial Area, Sector 5',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          gstNumber: '27ABCDE1234F1Z5',
          licenseNumber: 'DL001234',
          contactPerson: 'Rajesh Kumar',
          paymentTerms: '30 days',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      storageUtils.saveDealers(sampleDealers);
    }

    // Sample employees
    if (storageUtils.getEmployees().length === 0) {
      const sampleEmployees: Employee[] = [
        {
          id: '1',
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.sharma@medstore.com',
          phone: '+91-9876543211',
          position: 'Pharmacist',
          department: 'Pharmacy',
          dateOfJoining: '2024-01-15',
          dateOfBirth: '1995-05-20',
          emergencyContact: '+91-9876543212',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      storageUtils.saveEmployees(sampleEmployees);
    }
  }
};
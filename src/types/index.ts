export type DeviceType = 'Laptop' | 'Desktop' | 'Monitor' | 'Printer' | 'Other';

export type JobStatus = 
  | 'Received'                 // গ্রহণ করা হয়েছে
  | 'Diagnosis Pending'        // পরীক্ষা অপেক্ষমাণ
  | 'Under Repair'             // মেরামত চলছে
  | 'Waiting for Parts'        // যন্ত্রাংশের অপেক্ষায়
  | 'Repair Completed'         // মেরামত সম্পন্ন
  | 'Ready for Delivery'       // ডেলিভারির জন্য প্রস্তুত
  | 'Delivered'                // ডেলিভারি সম্পন্ন
  | 'Unrepairable'             // মেরামত অযোগ্য
  | 'Returned Without Repair'; // ফেরত প্রদান (মেরামত ছাড়া)

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Other';

export type UserRole = 'Admin' | 'Receptionist' | 'Technician' | 'Accountant';

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  amount: number;
  date: string; // ISO String or YYYY-MM-DD
  method: PaymentMethod;
  receivedBy: string;
  note?: string;
}

export interface StatusHistoryEntry {
  status: JobStatus;
  timestamp: string;
  updatedBy: string;
  note: string;
}

export interface ServiceJob {
  id: string;
  jobNumber: string;                // e.g. MT-26-0001
  receiveDate: string;              // YYYY-MM-DD
  
  // Branch / Legacy Sheet Name
  branchId: string;                 // 'Divce MAMA' | 'Peragong' | 'Daffodil' etc.
  
  // Customer Details
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  
  // Device Details (Matching Excel Columns)
  deviceType: DeviceType;
  brand: string;                    // HP, Dell, Lenovo, Asus, Acer, Apple, etc.
  modelNumber: string;
  serialNumber: string;
  problemDescription: string;
  accessoriesIncluded?: string;     // Charger, Bag, Cable, RAM, HDD
  
  // Technician & Internal Info
  assignedTechnician?: string;
  receivedBy: string;
  internalNotes?: string;

  // Status & Tracking
  status: JobStatus;
  statusHistory: StatusHistoryEntry[];

  // Financials (Bangladeshi Taka ৳)
  estimatedCost: number;
  finalCost: number;
  totalPaid: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  paymentHistory: PaymentTransaction[];

  // Delivery Tracking (Matching Excel Columns)
  deliveryDate?: string | null;
  deliveredBy?: string | null;
  deliveryName?: string | null;      // Receiver Name
  deliveryNotes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;                      // Divce MAMA, Peragong, Daffodil, Gulsan trest, HS-E, JARA Computer
  phone?: string;
  address?: string;
  isLegacyTab: boolean;
}

export interface ShopSettings {
  shopName: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  terms: string[];
}

export type NewJobInput = {
  receiveDate: string;
  branchId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deviceType: DeviceType;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  problemDescription: string;
  accessoriesIncluded?: string;
  assignedTechnician?: string;
  receivedBy: string;
  internalNotes?: string;
  estimatedCost: number;
};

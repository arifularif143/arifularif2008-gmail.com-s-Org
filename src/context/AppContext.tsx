import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceJob, Branch, ShopSettings, PaymentTransaction, JobStatus, NewJobInput } from '../types';
import { INITIAL_BRANCHES, INITIAL_SETTINGS, INITIAL_JOBS } from '../data/seedData';

interface AppContextType {
  jobs: ServiceJob[];
  branches: Branch[];
  activeBranch: string; // 'ALL' or specific Branch ID
  setActiveBranch: (branchId: string) => void;
  shopSettings: ShopSettings;
  updateShopSettings: (settings: ShopSettings) => void;
  addBranch: (name: string, phone?: string, address?: string) => void;
  addJob: (
    inputData: NewJobInput, 
    initialAdvance?: number
  ) => Promise<ServiceJob>;
  updateJob: (id: string, updates: Partial<ServiceJob>) => Promise<void>;
  updateJobStatus: (id: string, newStatus: JobStatus, note: string, updatedBy: string) => Promise<void>;
  recordPayment: (jobId: string, payment: Omit<PaymentTransaction, 'id' | 'receiptNumber'>) => Promise<void>;
  confirmDelivery: (jobId: string, details: { 
    deliveryName: string; 
    deliveredBy: string; 
    deliveryDate: string; 
    deliveryNotes?: string; 
    finalPayment?: number; 
    paymentMethod?: any 
  }) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  importBatchJobs: (newJobs: ServiceJob[]) => Promise<number>;
  resetToDemoData: () => void;
  stats: {
    totalJobs: number;
    todayReceived: number;
    pendingRepairs: number;
    underRepair: number;
    readyForDelivery: number;
    deliveredCount: number;
    unrepairableCount: number;
    unpaidCount: number;
    todayRevenue: number;
    totalOutstanding: number;
    totalRevenue: number;
  };
}

const STORAGE_KEYS = {
  JOBS: 'MT_SERVICE_JOBS_V2',
  BRANCHES: 'MT_BRANCHES_V2',
  SETTINGS: 'MT_SHOP_SETTINGS_V2'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<ServiceJob[]>(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.JOBS);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse jobs from storage', e);
    }
    return INITIAL_JOBS;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse branches from storage', e);
    }
    return INITIAL_BRANCHES;
  });

  const [activeBranch, setActiveBranch] = useState<string>('ALL');

  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (local) {
        const parsed = JSON.parse(local);
        if (!parsed.email || parsed.email === 'service.mastertechbd@gmail.com') {
          parsed.email = 'mastertechnologybd.net@gmail.com';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse settings from storage', e);
    }
    return INITIAL_SETTINGS;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.warn('Storage quota warning', e);
    }
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    } catch (e) {
      console.warn('Storage quota warning', e);
    }
  }, [branches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(shopSettings));
    } catch (e) {
      console.warn('Storage quota warning', e);
    }
  }, [shopSettings]);

  // Unique sequential Job Number generator: MT-26-0001
  const generateJobNumber = (): string => {
    const yearShort = new Date().getFullYear().toString().slice(-2);
    // Find highest current sequence
    let highestSeq = 0;
    jobs.forEach(j => {
      const parts = j.jobNumber.split('-');
      if (parts.length >= 3 && !isNaN(Number(parts[2]))) {
        const num = Number(parts[2]);
        if (num > highestSeq) highestSeq = num;
      }
    });
    const nextSeq = Math.max(jobs.length + 1, highestSeq + 1);
    return `MT-${yearShort}-${nextSeq.toString().padStart(4, '0')}`;
  };

  const addBranch = (name: string, phone?: string, address?: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 25);
    const newBranch: Branch = {
      id: slug || `branch-${Date.now()}`,
      name: name.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      isLegacyTab: false
    };
    setBranches(prev => [...prev, newBranch]);
  };

  const updateShopSettings = (settings: ShopSettings) => {
    setShopSettings(settings);
  };

  const addJob = async (inputData: any, initialAdvance = 0): Promise<ServiceJob> => {
    const now = new Date().toISOString();
    const jobNumber = generateJobNumber();
    const finalCost = Number(inputData.estimatedCost) || 0;
    const initialPaid = Number(initialAdvance) || 0;
    const remainingBalance = Math.max(0, finalCost - initialPaid);

    const paymentHistory: PaymentTransaction[] = initialPaid > 0 ? [{
      id: crypto.randomUUID(),
      receiptNumber: `PAY-${Date.now().toString().slice(-5)}`,
      amount: initialPaid,
      date: now,
      method: 'Cash',
      receivedBy: inputData.receivedBy || 'Admin',
      note: 'অগ্রিম গ্রহণ (Advance Deposit)'
    }] : [];

    const newJob: ServiceJob = {
      ...inputData,
      id: crypto.randomUUID(),
      customerId: crypto.randomUUID(),
      jobNumber,
      finalCost,
      totalPaid: initialPaid,
      remainingBalance,
      paymentStatus: initialPaid >= finalCost && finalCost > 0 ? 'Paid' : initialPaid > 0 ? 'Partially Paid' : 'Unpaid',
      status: 'Received',
      statusHistory: [{
        status: 'Received',
        timestamp: now,
        updatedBy: inputData.receivedBy || 'Admin',
        note: 'সার্ভিসের জন্য নতুন ডিভাইস গ্রহণ করা হলো।'
      }],
      paymentHistory,
      deliveryDate: null,
      deliveredBy: null,
      deliveryName: null,
      deliveryNotes: null,
      createdAt: now,
      updatedAt: now
    };

    setJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  const updateJob = async (id: string, updates: Partial<ServiceJob>) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== id) return job;
      const updated = { ...job, ...updates, updatedAt: new Date().toISOString() };
      
      // Recalculate financial balances
      const totalPaid = updated.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
      const finalCost = updated.finalCost !== undefined ? Number(updated.finalCost) : job.finalCost;
      const remainingBalance = Math.max(0, finalCost - totalPaid);
      
      updated.totalPaid = totalPaid;
      updated.finalCost = finalCost;
      updated.remainingBalance = remainingBalance;
      updated.paymentStatus = (remainingBalance <= 0 && finalCost > 0) ? 'Paid' : totalPaid > 0 ? 'Partially Paid' : 'Unpaid';
      return updated;
    }));
  };

  const updateJobStatus = async (id: string, newStatus: JobStatus, note: string, updatedBy: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== id) return job;
      return {
        ...job,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...job.statusHistory,
          { 
            status: newStatus, 
            timestamp: new Date().toISOString(), 
            updatedBy: updatedBy || 'Technician', 
            note: note.trim() || `স্ট্যাটাস পরিবর্তন: ${newStatus}` 
          }
        ]
      };
    }));
  };

  const recordPayment = async (jobId: string, payment: Omit<PaymentTransaction, 'id' | 'receiptNumber'>) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const newTransaction: PaymentTransaction = {
        ...payment,
        id: crypto.randomUUID(),
        receiptNumber: `PAY-${Date.now().toString().slice(-5)}`
      };
      const paymentHistory = [...job.paymentHistory, newTransaction];
      const totalPaid = paymentHistory.reduce((sum, item) => sum + item.amount, 0);
      const remainingBalance = Math.max(0, job.finalCost - totalPaid);
      const paymentStatus = remainingBalance === 0 && job.finalCost > 0 ? 'Paid' : 'Partially Paid';

      return {
        ...job,
        totalPaid,
        remainingBalance,
        paymentStatus,
        paymentHistory,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const confirmDelivery = async (jobId: string, details: any) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      let paymentHistory = [...job.paymentHistory];
      if (details.finalPayment && Number(details.finalPayment) > 0) {
        paymentHistory.push({
          id: crypto.randomUUID(),
          receiptNumber: `DELPAY-${Date.now().toString().slice(-4)}`,
          amount: Number(details.finalPayment),
          date: details.deliveryDate ? `${details.deliveryDate}T12:00:00.000Z` : new Date().toISOString(),
          method: details.paymentMethod || 'Cash',
          receivedBy: details.deliveredBy || 'Receptionist',
          note: 'ডেলিভারিকালীন চূড়ান্ত পরিশোধ (Delivery Payment)'
        });
      }

      const totalPaid = paymentHistory.reduce((sum, item) => sum + item.amount, 0);
      const remainingBalance = Math.max(0, job.finalCost - totalPaid);

      return {
        ...job,
        status: 'Delivered',
        deliveryDate: details.deliveryDate || new Date().toISOString().split('T')[0],
        deliveredBy: details.deliveredBy,
        deliveryName: details.deliveryName,
        deliveryNotes: details.deliveryNotes,
        totalPaid,
        remainingBalance,
        paymentStatus: remainingBalance === 0 ? 'Paid' : 'Partially Paid',
        paymentHistory,
        statusHistory: [
          ...job.statusHistory,
          {
            status: 'Delivered',
            timestamp: new Date().toISOString(),
            updatedBy: details.deliveredBy || 'Receptionist',
            note: `গ্রাহক ${details.deliveryName}-এর নিকট সফলভাবে ডেলিভারি সম্পন্ন হয়েছে।`
          }
        ],
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const deleteJob = async (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const importBatchJobs = async (newJobs: ServiceJob[]): Promise<number> => {
    setJobs(prev => [...newJobs, ...prev]);
    return newJobs.length;
  };

  const resetToDemoData = () => {
    setJobs(INITIAL_JOBS);
    setBranches(INITIAL_BRANCHES);
    setShopSettings(INITIAL_SETTINGS);
    setActiveBranch('ALL');
  };

  // Live Statistics (Filtered by Active Branch)
  const filteredJobs = activeBranch === 'ALL' ? jobs : jobs.filter(j => j.branchId === activeBranch);
  const todayStr = new Date().toISOString().split('T')[0];

  const stats = {
    totalJobs: filteredJobs.length,
    todayReceived: filteredJobs.filter(j => j.receiveDate === todayStr).length,
    pendingRepairs: filteredJobs.filter(j => ['Received', 'Diagnosis Pending'].includes(j.status)).length,
    underRepair: filteredJobs.filter(j => ['Under Repair', 'Waiting for Parts'].includes(j.status)).length,
    readyForDelivery: filteredJobs.filter(j => j.status === 'Ready for Delivery').length,
    deliveredCount: filteredJobs.filter(j => j.status === 'Delivered').length,
    unrepairableCount: filteredJobs.filter(j => ['Unrepairable', 'Returned Without Repair'].includes(j.status)).length,
    unpaidCount: filteredJobs.filter(j => j.paymentStatus !== 'Paid').length,
    todayRevenue: filteredJobs.reduce((acc, job) => {
      const todayPayments = job.paymentHistory.filter(p => p.date && p.date.startsWith(todayStr));
      return acc + todayPayments.reduce((pAcc, p) => pAcc + p.amount, 0);
    }, 0),
    totalOutstanding: filteredJobs.reduce((acc, j) => acc + (j.remainingBalance || 0), 0),
    totalRevenue: filteredJobs.reduce((acc, j) => acc + (j.totalPaid || 0), 0)
  };

  return (
    <AppContext.Provider value={{
      jobs,
      branches,
      activeBranch,
      setActiveBranch,
      shopSettings,
      updateShopSettings,
      addBranch,
      addJob,
      updateJob,
      updateJobStatus,
      recordPayment,
      confirmDelivery,
      deleteJob,
      importBatchJobs,
      resetToDemoData,
      stats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

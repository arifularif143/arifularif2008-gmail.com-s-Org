import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardView } from './components/dashboard/DashboardView';
import { ServiceHistoryTable } from './components/service/ServiceHistoryTable';
import { ServiceReceiveForm } from './components/service/ServiceReceiveForm';
import { JobDetailModal } from './components/service/JobDetailModal';
import { PaymentModal } from './components/payment/PaymentModal';
import { DeliveryView } from './components/delivery/DeliveryView';
import { ServiceReceipt } from './components/print/ServiceReceipt';
import { DeliveryReceipt } from './components/print/DeliveryReceipt';
import { ExcelImportModal } from './components/backup/ExcelImportModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ServiceJob } from './types';
import { 
  Laptop, 
  Layers, 
  Clock, 
  Truck, 
  CreditCard, 
  FileSpreadsheet, 
  Settings, 
  Menu, 
  X,
  PlusCircle,
  Download,
  CheckCircle,
  Store
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { jobs, shopSettings, branches, activeBranch, setActiveBranch } = useApp();
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'delivery'>('dashboard');
  
  // Modals
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [paymentTargetJob, setPaymentTargetJob] = useState<ServiceJob | null>(null);
  const [printingIntakeJob, setPrintingIntakeJob] = useState<ServiceJob | null>(null);
  const [printingDeliveryJob, setPrintingDeliveryJob] = useState<ServiceJob | null>(null);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeBranchObj = branches.find(b => b.id === activeBranch);

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-800 overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Navy Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-64 bg-slate-950 text-slate-300 z-50 flex flex-col justify-between transition-transform duration-200 border-r border-slate-800
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div>
          {/* Logo Brand */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                <Laptop size={22} />
              </div>
              <div>
                <h1 className="font-black text-white text-base tracking-tight leading-none uppercase">MASTER TECH</h1>
                <p className="text-[10px] text-blue-400 font-bold tracking-wider mt-1 uppercase">Laptop & Monitor Hub</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Legacy Branch Selector */}
          <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center justify-between">
              <span>শাখা নির্বাচন (Branch)</span>
              <span className="text-[10px] text-blue-400 font-mono">6 TABS</span>
            </label>
            <select 
              value={activeBranch}
              onChange={e => setActiveBranch(e.target.value)}
              className="w-full bg-slate-950 text-xs font-bold text-white border border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">সকল ব্রাঞ্চ (All 6 Sheets)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button 
              onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition
                ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2.5">
                <Layers size={17} />
                <span>ড্যাশবোর্ড (Dashboard)</span>
              </div>
            </button>

            <button 
              onClick={() => { setCurrentView('history'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition
                ${currentView === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2.5">
                <Clock size={17} />
                <span>সার্ভিস হিস্ট্রি (History Table)</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                {jobs.length}
              </span>
            </button>

            <button 
              onClick={() => { setCurrentView('delivery'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition
                ${currentView === 'delivery' ? 'bg-emerald-700 text-white shadow-sm' : 'hover:bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2.5">
                <Truck size={17} />
                <span>ডেলিভারি কাউন্টার</span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                {jobs.filter(j => j.status === 'Ready for Delivery' || j.status === 'Repair Completed').length}
              </span>
            </button>

            <div className="pt-2 pb-1 border-t border-slate-800 my-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider">টুলস ও মাইগ্রেশন</span>
            </div>

            <button 
              onClick={() => { setShowReceiveModal(true); setSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-400 hover:bg-slate-900 hover:text-emerald-300 transition"
            >
              <PlusCircle size={17} />
              <span>+ নতুন রিসিভ (New Intake)</span>
            </button>

            <button 
              onClick={() => { setShowExcelImport(true); setSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900 hover:text-white transition"
            >
              <FileSpreadsheet size={17} className="text-emerald-500" />
              <span>লেগ্যাসি এক্সেল ইম্পোর্ট</span>
            </button>

            <button 
              onClick={() => { setShowSettings(true); setSidebarOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900 hover:text-white transition"
            >
              <Settings size={17} />
              <span>দোকান ও রিসিট সেটিংস</span>
            </button>
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-300 truncate">{shopSettings.shopName}</p>
          <p className="text-[10px] text-blue-400 truncate font-mono">{shopSettings.email}</p>
          <p className="text-[10px] text-slate-500">Dhaka Multiplan Center • v2.4</p>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>

            <div>
              <span className="text-sm font-black text-slate-800 uppercase tracking-tight hidden sm:inline">
                {shopSettings.shopName}
              </span>
              <span className="text-xs text-slate-400 mx-2 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {activeBranch === 'ALL' ? 'সকল ব্রাঞ্চ' : activeBranchObj?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setShowExcelImport(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg transition"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              এক্সেল ইম্পোর্ট
            </button>

            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="সেটিংস"
            >
              <Settings size={18} />
            </button>

            <button 
              onClick={() => setShowReceiveModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle size={15} />
              <span>+ নতুন রিসিভ</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentView === 'dashboard' && (
            <DashboardView 
              onNavigate={(v) => setCurrentView(v)} 
              onOpenReceiveModal={() => setShowReceiveModal(true)}
              onOpenExcelImport={() => setShowExcelImport(true)}
              onSelectJob={(job) => setSelectedJob(job)}
            />
          )}

          {currentView === 'history' && (
            <ServiceHistoryTable 
              onSelectJob={(j) => setSelectedJob(j)} 
              onOpenPayment={(j) => setPaymentTargetJob(j)}
              onPrintIntakeReceipt={(j) => setPrintingIntakeJob(j)}
              onPrintDeliveryReceipt={(j) => setPrintingDeliveryJob(j)}
            />
          )}

          {currentView === 'delivery' && (
            <DeliveryView 
              onSelectJob={(j) => setSelectedJob(j)}
              onPrintDeliveryReceipt={(j) => setPrintingDeliveryJob(j)}
            />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      {showReceiveModal && (
        <ServiceReceiveForm 
          onClose={() => setShowReceiveModal(false)}
          onSuccessPrint={(jobId) => {
            setShowReceiveModal(false);
            const found = jobs.find(j => j.id === jobId);
            if (found) setPrintingIntakeJob(found);
            showToast('নতুন সার্ভিস সফলভাবে গ্রহণ করা হয়েছে!');
          }}
        />
      )}

      {selectedJob && (
        <JobDetailModal 
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onOpenPayment={(j) => {
            setPaymentTargetJob(j);
          }}
          onPrintIntakeReceipt={(j) => setPrintingIntakeJob(j)}
          onPrintDeliveryReceipt={(j) => setPrintingDeliveryJob(j)}
          onOpenDeliveryConfirm={(j) => {
            setSelectedJob(null);
            setCurrentView('delivery');
          }}
        />
      )}

      {paymentTargetJob && (
        <PaymentModal 
          job={paymentTargetJob}
          onClose={() => setPaymentTargetJob(null)}
          onSuccess={() => showToast('পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে!')}
        />
      )}

      {showExcelImport && (
        <ExcelImportModal 
          onClose={() => setShowExcelImport(false)}
          onSuccess={(count) => showToast(`সফলভাবে ${count} টি রেকর্ড এক্সেল থেকে ইম্পোর্ট করা হয়েছে!`)}
        />
      )}

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Intake Receipt Print Modal */}
      {printingIntakeJob && (
        <ServiceReceipt 
          job={printingIntakeJob}
          settings={shopSettings}
          onClose={() => setPrintingIntakeJob(null)}
        />
      )}

      {/* Delivery Receipt Print Modal */}
      {printingDeliveryJob && (
        <DeliveryReceipt 
          job={printingDeliveryJob}
          settings={shopSettings}
          onClose={() => setPrintingDeliveryJob(null)}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

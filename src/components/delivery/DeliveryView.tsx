import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJob, PaymentMethod } from '../../types';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  Search, 
  Printer, 
  User, 
  CreditCard, 
  ArrowRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';

interface DeliveryViewProps {
  onSelectJob: (job: ServiceJob) => void;
  onPrintDeliveryReceipt: (job: ServiceJob) => void;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({ onSelectJob, onPrintDeliveryReceipt }) => {
  const { jobs, activeBranch, branches, confirmDelivery } = useApp();

  const [activeTab, setActiveTab] = useState<'ready' | 'delivered'>('ready');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delivery confirmation modal state
  const [deliveringJob, setDeliveringJob] = useState<ServiceJob | null>(null);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('Service Receptionist');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [collectRemaining, setCollectRemaining] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const branchMatch = activeBranch === 'ALL' || job.branchId === activeBranch;
    const tabMatch = activeTab === 'ready' 
      ? (job.status === 'Ready for Delivery' || job.status === 'Repair Completed')
      : job.status === 'Delivered';
    
    const q = searchQuery.toLowerCase().trim();
    const queryMatch = !q ||
      job.jobNumber.toLowerCase().includes(q) ||
      job.customerName.toLowerCase().includes(q) ||
      job.customerPhone.includes(q) ||
      job.brand.toLowerCase().includes(q) ||
      (job.modelNumber && job.modelNumber.toLowerCase().includes(q));

    return branchMatch && tabMatch && queryMatch;
  });

  const openDeliveryModal = (job: ServiceJob) => {
    setDeliveringJob(job);
    setDeliveryName(job.customerName);
    setDeliveredBy('Receptionist');
    setDeliveryDate(new Date().toISOString().split('T')[0]);
    setDeliveryNotes('ডিভাইস চেক করে অক্ষত অবস্থায় বুঝিয়ে দেওয়া হলো।');
    setCollectRemaining(job.remainingBalance > 0);
    setPaymentMethod('Cash');
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringJob) return;
    if (!deliveryName.trim()) {
      alert('গ্রহীতার নাম আবশ্যক');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalPayment = collectRemaining ? deliveringJob.remainingBalance : 0;
      await confirmDelivery(deliveringJob.id, {
        deliveryName: deliveryName.trim(),
        deliveredBy,
        deliveryDate,
        deliveryNotes,
        finalPayment,
        paymentMethod
      });
      const updatedJob = { ...deliveringJob, status: 'Delivered' as const, deliveryDate, deliveryName };
      setDeliveringJob(null);
      onPrintDeliveryReceipt(updatedJob);
    } catch (e) {
      alert('ডেলিভারি সম্পন্নকরণে ত্রুটি হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="text-emerald-600" size={24} />
            ডেলিভারি ম্যানেজমেন্ট (Device Delivery & Release)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            সার্ভিস সম্পন্ন হওয়া ডিভাইস হস্তান্তর এবং বাকি টাকা সংগ্রহ করে ডেলিভারি মেমো প্রিন্ট করুন।
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('ready')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition ${
              activeTab === 'ready' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ডেলিভারির জন্য প্রস্তুত ({jobs.filter(j => j.status === 'Ready for Delivery' || j.status === 'Repair Completed').length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition ${
              activeTab === 'delivered' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ডেলিভারি সম্পন্ন তালিকা ({jobs.filter(j => j.status === 'Delivered').length})
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="জব নং, গ্রাহকের নাম, ফোন দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          শাখা: <span className="font-bold text-slate-700">
            {activeBranch === 'ALL' ? 'সকল শাখা' : branches.find(b => b.id === activeBranch)?.name}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-xl border border-slate-200 text-center text-slate-400">
            <Truck size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">কোনো ডিভাইস এই তালিকায় নেই</p>
            <p className="text-xs mt-1">সব নতুন মেরামত সম্পন্ন ডিভাইস এখানে দেখা যাবে।</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div 
              key={job.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {job.jobNumber}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    job.status === 'Ready for Delivery' ? 'bg-emerald-100 text-emerald-800' :
                    job.status === 'Repair Completed' ? 'bg-teal-100 text-teal-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">{job.brand} {job.modelNumber}</h3>
                  <p className="text-xs text-slate-500">{job.deviceType} • S/N: {job.serialNumber || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">গ্রাহক:</span>
                    <span className="font-semibold text-slate-800">{job.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ফোন:</span>
                    <span className="font-mono text-slate-700">{job.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">রিসিভ তারিখ:</span>
                    <span className="text-slate-700">{job.receiveDate}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">মোট বিল</span>
                    <span className="font-extrabold text-slate-800">৳{job.finalCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">বাকি টাকা</span>
                    <span className={`font-extrabold ${job.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {job.remainingBalance > 0 ? `৳${job.remainingBalance.toLocaleString('en-IN')}` : 'পরিশোধিত'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectJob(job)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  বিস্তারিত দেখুন
                </button>

                {job.status !== 'Delivered' ? (
                  <button
                    onClick={() => openDeliveryModal(job)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
                  >
                    <Truck size={14} />
                    ডেলিভারি দিন
                  </button>
                ) : (
                  <button
                    onClick={() => onPrintDeliveryReceipt(job)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    <Printer size={14} />
                    ইনভয়েস
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delivery Confirmation Modal */}
      {deliveringJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={20} />
                <h2 className="text-base font-bold">ডেলিভারি চূড়ান্তকরণ (Confirm Handover)</h2>
              </div>
              <button onClick={() => setDeliveringJob(null)} className="text-emerald-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-950 text-sm">{deliveringJob.brand} {deliveringJob.modelNumber}</p>
                  <p className="text-emerald-700 font-mono mt-0.5">জব নং: {deliveringJob.jobNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">বকেয়া রয়েছে</span>
                  <span className="text-lg font-black text-rose-600">৳{deliveringJob.remainingBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">গ্রহীতার নাম (Receiver Name) *</label>
                <input
                  type="text"
                  value={deliveryName}
                  onChange={e => setDeliveryName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডেলিভারি তারিখ</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">হস্তান্তরকারী (Staff)</label>
                  <input
                    type="text"
                    value={deliveredBy}
                    onChange={e => setDeliveredBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Outstanding payment settlement */}
              {deliveringJob.remainingBalance > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={collectRemaining}
                      onChange={e => setCollectRemaining(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-800">
                      ডেলিভারির সময় অবশিষ্ট বকেয়া (৳{deliveringJob.remainingBalance}) সংগ্রহ করুন
                    </span>
                  </label>

                  {collectRemaining && (
                    <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-3">
                      <span className="text-slate-600 font-semibold">পেমেন্ট মেথড:</span>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="px-2 py-1 border rounded bg-white font-semibold"
                      >
                        <option value="Cash">Cash (ক্যাশ)</option>
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Bank">Bank Transfer</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">ডেলিভারি নোট ও টেস্ট বিবরণ</label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={e => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveringJob(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold transition shadow"
                >
                  <CheckCircle size={16} />
                  {isSubmitting ? 'প্রসেসিং...' : 'ডেলিভারি ও ইনভয়েস প্রিন্ট'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

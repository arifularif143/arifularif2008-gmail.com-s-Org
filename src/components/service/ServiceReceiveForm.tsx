import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeviceType } from '../../types';
import { X, Save, Printer, RefreshCw, PlusCircle, Check } from 'lucide-react';

interface FormProps {
  onClose: () => void;
  onSuccessPrint: (jobId: string) => void;
}

const COMMON_BRANDS = ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Samsung', 'LG', 'MSI', 'Gigabyte'];

const COMMON_PROBLEMS = [
  'নো পাওয়ার (No Power)',
  'ডিসপ্লে আসে না / নো ডিসপ্লে',
  'অন হয়ে বন্ধ হয়ে যায় (Auto Restart)',
  'চার্জ হয় না / চার্জিং পোর্ট নষ্ট',
  'কিবোর্ড বা মাউস কাজ করে না',
  'স্লো চলে / হ্যাং করে / উইন্ডোজ ক্র্যাশ',
  'কব্জা (Hinge) ভাঙা / বডি ফাটা',
  'পানি পড়েছে (Water damage / Liquid fault)'
];

const COMMON_ACCESSORIES = ['Original Adapter', 'Power Cable', 'Laptop Bag', 'RAM / Storage', 'Box'];

export const ServiceReceiveForm: React.FC<FormProps> = ({ onClose, onSuccessPrint }) => {
  const { addJob, branches, activeBranch } = useApp();

  const [formData, setFormData] = useState({
    receiveDate: new Date().toISOString().split('T')[0],
    branchId: activeBranch !== 'ALL' ? activeBranch : branches[0]?.id || 'divce-mama',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    deviceType: 'Laptop' as DeviceType,
    brand: 'HP',
    modelNumber: '',
    serialNumber: '',
    problemDescription: '',
    accessoriesIncluded: 'Original Adapter',
    estimatedCost: 0,
    advancePayment: 0,
    receivedBy: 'Admin / Receptionist',
    internalNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'গ্রাহকের নাম আবশ্যক (Customer Name required)';
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 11) {
      errs.customerPhone = 'সঠিক ফোন নম্বর দিন (কমপক্ষে ১১ ডিজিট)';
    }
    if (!formData.problemDescription.trim()) {
      errs.problemDescription = 'সমস্যার লক্ষণ বা বিবরণ লিখুন';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (shouldPrint = false) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await addJob(formData, formData.advancePayment);
      if (shouldPrint) {
        onSuccessPrint(created.id);
      } else {
        onClose();
      }
    } catch (e) {
      alert('তথ্য সংরক্ষণে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectProblemTag = (problem: string) => {
    if (!formData.problemDescription) {
      setFormData(prev => ({ ...prev, problemDescription: problem }));
    } else if (!formData.problemDescription.includes(problem)) {
      setFormData(prev => ({ ...prev, problemDescription: `${prev.problemDescription}, ${problem}` }));
    }
  };

  const handleToggleAccessory = (acc: string) => {
    const current = formData.accessoriesIncluded ? formData.accessoriesIncluded.split(', ').filter(Boolean) : [];
    if (current.includes(acc)) {
      const updated = current.filter(item => item !== acc);
      setFormData(prev => ({ ...prev, accessoriesIncluded: updated.join(', ') }));
    } else {
      const updated = [...current, acc];
      setFormData(prev => ({ ...prev, accessoriesIncluded: updated.join(', ') }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <span className="bg-blue-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">NEW INTAKE</span>
              নতুন কম্পিউটার / ল্যাপটপ সার্ভিস গ্রহণ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">MASTER TECHNOLOGY – Service History Intake Card</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Branch & Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">গ্রহণের তারিখ (Receive Date) *</label>
              <input 
                type="date" 
                value={formData.receiveDate} 
                onChange={e => setFormData({ ...formData, receiveDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">দোকানের ব্রাঞ্চ (Branch / Tab) *</label>
              <select 
                value={formData.branchId} 
                onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-blue-900"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">রিসিভকারী (Received By)</label>
              <input 
                type="text" 
                value={formData.receivedBy} 
                onChange={e => setFormData({ ...formData, receivedBy: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              গ্রাহকের তথ্য (Customer Details)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">গ্রাহকের নাম (Name) *</label>
                <input 
                  type="text" 
                  placeholder="যেমন: মোঃ জাহিদ হাসান"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none ${errors.customerName ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-blue-600'}`}
                />
                {errors.customerName && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর (Phone) *</label>
                <input 
                  type="tel" 
                  placeholder="017XXXXXXXX"
                  value={formData.customerPhone}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-mono focus:outline-none ${errors.customerPhone ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-blue-600'}`}
                />
                {errors.customerPhone && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.customerPhone}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ঠিকানা (Address)</label>
                <input 
                  type="text" 
                  placeholder="এলিফ্যান্ট রোড, ঢাকা"
                  value={formData.customerAddress}
                  onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Device & Problem Details */}
          <div className="border border-slate-200 p-4 rounded-xl space-y-4">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              ডিভাইস বিবরণী (Device & Problem)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ডিভাইস ধরন</label>
                <select 
                  value={formData.deviceType} 
                  onChange={e => setFormData({ ...formData, deviceType: e.target.value as DeviceType })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white"
                >
                  <option value="Laptop">Laptop (ল্যাপটপ)</option>
                  <option value="Desktop">Desktop (ডেস্কটপ)</option>
                  <option value="Monitor">Monitor (মনিটর)</option>
                  <option value="Printer">Printer (প্রিন্টার)</option>
                  <option value="Other">Other (অন্যান্য)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ব্র্যান্ড (Brand) *</label>
                <input 
                  type="text" 
                  placeholder="HP / Dell / Lenovo / Asus"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মডেল নম্বর (Model)</label>
                <input 
                  type="text" 
                  placeholder="ProBook 450 G8 / Inspiron 15"
                  value={formData.modelNumber}
                  onChange={e => setFormData({ ...formData, modelNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">সিরিয়াল নম্বর (Serial)</label>
                <input 
                  type="text" 
                  placeholder="S/N: 5CDXXXXXXXX"
                  value={formData.serialNumber}
                  onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Quick Brand Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-slate-400 font-semibold text-[10px]">জনপ্রিয় ব্র্যান্ড:</span>
              {COMMON_BRANDS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setFormData({ ...formData, brand: b })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    formData.brand.toLowerCase() === b.toLowerCase() 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Accessories checkboxes */}
            <div className="pt-2 border-t">
              <label className="block font-semibold text-slate-700 mb-1.5">
                ডিভাইসের সাথে প্রাপ্ত এক্সেসরিজ (Accessories):
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ACCESSORIES.map(acc => {
                  const isChecked = formData.accessoriesIncluded.includes(acc);
                  return (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => handleToggleAccessory(acc)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                        isChecked 
                          ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked && <Check size={12} className="text-blue-600" />}
                      {acc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem Description with Quick tags */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                সমস্যার বিস্তারিত লক্ষণ (Problem Description) *
              </label>
              <textarea 
                rows={2}
                placeholder="সমস্যার লক্ষণ লিখুন (যেমন: ডিসপ্লে আসে না, নো পাওয়ার, চার্জ হয় না, অন হয়ে রিস্টার্ট নেয়...)"
                value={formData.problemDescription}
                onChange={e => setFormData({ ...formData, problemDescription: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none ${errors.problemDescription ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-blue-600'}`}
              />
              {errors.problemDescription && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.problemDescription}</p>}

              {/* Problem Quick tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-slate-400 font-semibold text-[10px]">কুইক ট্যাগ:</span>
                {COMMON_PROBLEMS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectProblemTag(p)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Advance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div>
              <label className="block font-bold text-slate-800 mb-1">সম্ভাব্য মেরামত খরচ (Estimated Cost - ৳)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">৳</span>
                <input 
                  type="number" 
                  min="0"
                  value={formData.estimatedCost || ''}
                  onChange={e => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 bg-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">অগ্রিম জমা (Advance Payment - ৳)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-emerald-600 font-bold">৳</span>
                <input 
                  type="number" 
                  min="0"
                  value={formData.advancePayment || ''}
                  onChange={e => setFormData({ ...formData, advancePayment: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700 bg-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button 
            type="button" 
            onClick={() => setFormData({
              receiveDate: new Date().toISOString().split('T')[0],
              branchId: branches[0]?.id || 'divce-mama',
              customerName: '',
              customerPhone: '',
              customerAddress: '',
              deviceType: 'Laptop',
              brand: 'HP',
              modelNumber: '',
              serialNumber: '',
              problemDescription: '',
              accessoriesIncluded: 'Original Adapter',
              estimatedCost: 0,
              advancePayment: 0,
              receivedBy: 'Admin / Receptionist',
              internalNotes: ''
            })}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2"
          >
            <RefreshCw size={14} />
            ফর্ম ক্লিয়ার করুন
          </button>

          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              বাতিল
            </button>
            <button 
              type="button" 
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
            >
              <Save size={16} />
              সংরক্ষণ করুন (Save)
            </button>
            <button 
              type="button" 
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow-md"
            >
              <Printer size={16} />
              Save & Print Token
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ServiceJob, PaymentMethod } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, CreditCard, CheckCircle2, DollarSign } from 'lucide-react';

interface PaymentModalProps {
  job: ServiceJob;
  onClose: () => void;
  onSuccess?: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank', 'Other'];

export const PaymentModal: React.FC<PaymentModalProps> = ({ job, onClose, onSuccess }) => {
  const { recordPayment } = useApp();

  const [amount, setAmount] = useState<number>(job.remainingBalance > 0 ? job.remainingBalance : 0);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [receivedBy, setReceivedBy] = useState('Admin / Cashier');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('টাকার পরিমাণ শূন্য হতে পারে না।');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPayment(job.id, {
        amount: Number(amount),
        date: `${date}T${new Date().toTimeString().split(' ')[0]}.000Z`,
        method,
        receivedBy,
        note: note.trim() || undefined
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError('পেমেন্ট সংরক্ষণে ত্রুটি হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700 rounded-lg">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">পেমেন্ট গ্রহণ (Receive Payment)</h2>
              <p className="text-xs text-emerald-200">জব নং: {job.jobNumber} • {job.customerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-300 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Due Info Card */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">মোট খরচ</span>
              <span className="font-extrabold text-slate-800 text-sm">৳ {job.finalCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-slate-400 block font-semibold">জমা হয়েছে</span>
              <span className="font-extrabold text-emerald-600 text-sm">৳ {job.totalPaid.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">অবশিষ্ট বাকি</span>
              <span className="font-extrabold text-rose-600 text-sm">৳ {job.remainingBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পরিশোধের পরিমাণ (Amount - ৳) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount || ''}
                onChange={e => {
                  setAmount(Number(e.target.value));
                  setError('');
                }}
                className="w-full pl-8 pr-3 py-2 text-base font-extrabold text-emerald-700 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="0"
                required
              />
            </div>

            {/* Quick Fill Buttons */}
            {job.remainingBalance > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAmount(job.remainingBalance)}
                  className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-1 rounded hover:bg-emerald-100 transition"
                >
                  সম্পূর্ণ বাকি (৳{job.remainingBalance})
                </button>
                {job.remainingBalance > 500 && (
                  <button
                    type="button"
                    onClick={() => setAmount(500)}
                    className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200 transition"
                  >
                    ৳৫০০
                  </button>
                )}
                {job.remainingBalance > 1000 && (
                  <button
                    type="button"
                    onClick={() => setAmount(1000)}
                    className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200 transition"
                  >
                    ৳১০০০
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পেমেন্ট মেথড *</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">তারিখ</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Received By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">টাকা গ্রহণকারী (Received By)</label>
            <input
              type="text"
              value={receivedBy}
              onChange={e => setReceivedBy(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="ক্যাশিয়ার বা কর্মীর নাম"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">মন্তব্য (Note / Trx ID)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="যেমন: bKash TrxID বা অগ্রিম বিল"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md transition"
            >
              <CheckCircle2 size={16} />
              {isSubmitting ? 'প্রসেসিং...' : 'পেমেন্ট নিশ্চিত করুন'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ServiceJob, JobStatus, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  Printer, 
  CreditCard, 
  Truck, 
  Edit3, 
  Calendar, 
  Phone, 
  MapPin, 
  Laptop, 
  FileText,
  User,
  ShieldCheck,
  Save
} from 'lucide-react';

interface JobDetailModalProps {
  job: ServiceJob;
  onClose: () => void;
  onOpenPayment: (job: ServiceJob) => void;
  onPrintIntakeReceipt: (job: ServiceJob) => void;
  onPrintDeliveryReceipt: (job: ServiceJob) => void;
  onOpenDeliveryConfirm: (job: ServiceJob) => void;
}

const ALL_STATUSES: { key: JobStatus; label: string; color: string }[] = [
  { key: 'Received', label: 'গ্রহণ করা হয়েছে', color: 'bg-blue-100 text-blue-800' },
  { key: 'Diagnosis Pending', label: 'পরীক্ষা অপেক্ষমাণ', color: 'bg-amber-100 text-amber-800' },
  { key: 'Under Repair', label: 'মেরামত চলছে', color: 'bg-orange-100 text-orange-800' },
  { key: 'Waiting for Parts', label: 'যন্ত্রাংশের অপেক্ষায়', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'Repair Completed', label: 'মেরামত সম্পন্ন', color: 'bg-teal-100 text-teal-800' },
  { key: 'Ready for Delivery', label: 'ডেলিভারির জন্য প্রস্তুত', color: 'bg-emerald-100 text-emerald-800' },
  { key: 'Delivered', label: 'ডেলিভারি সম্পন্ন', color: 'bg-slate-200 text-slate-800' },
  { key: 'Unrepairable', label: 'মেরামত অযোগ্য', color: 'bg-rose-100 text-rose-800' },
  { key: 'Returned Without Repair', label: 'ফেরত প্রদান (মেরামত ছাড়া)', color: 'bg-gray-100 text-gray-800' }
];

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  onOpenPayment,
  onPrintIntakeReceipt,
  onPrintDeliveryReceipt,
  onOpenDeliveryConfirm
}) => {
  const { updateJobStatus, updateJob, branches } = useApp();

  const [newStatus, setNewStatus] = useState<JobStatus>(job.status);
  const [statusNote, setStatusNote] = useState('');
  const [updatedBy, setUpdatedBy] = useState('Technician / Service Engineer');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Editing mode for cost & problem description
  const [isEditing, setIsEditing] = useState(false);
  const [editCost, setEditCost] = useState(job.finalCost);
  const [editProblem, setEditProblem] = useState(job.problemDescription);
  const [editAccessories, setEditAccessories] = useState(job.accessoriesIncluded || '');

  const branchName = branches.find(b => b.id === job.branchId)?.name || job.branchId;

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === job.status && !statusNote) return;
    setIsUpdatingStatus(true);
    try {
      await updateJobStatus(job.id, newStatus, statusNote, updatedBy);
      setStatusNote('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveEdits = async () => {
    await updateJob(job.id, {
      finalCost: Number(editCost),
      problemDescription: editProblem,
      accessoriesIncluded: editAccessories
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-slate-950 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-blue-600 text-white font-bold tracking-wider">
              {job.jobNumber}
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {job.brand} {job.modelNumber}
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300">
                  {job.deviceType}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                শাখা: <span className="text-blue-400 font-semibold">{branchName}</span> • রিসিভ তারিখ: {job.receiveDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintIntakeReceipt(job)}
              title="ইনটেক রিসিট প্রিন্ট"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">ইনটেক রিসিট</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Quick Stats & Financial Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">বর্তমান অবস্থা</span>
              <div className="mt-1">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold
                  ${job.status === 'Ready for Delivery' ? 'bg-emerald-100 text-emerald-800' :
                    job.status === 'Delivered' ? 'bg-slate-200 text-slate-800' :
                    job.status === 'Under Repair' ? 'bg-orange-100 text-orange-800' :
                    job.status === 'Unrepairable' ? 'bg-rose-100 text-rose-800' :
                    'bg-blue-100 text-blue-800'}`}>
                  {job.status}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">সার্ভিস চার্জ</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">৳ {job.finalCost.toLocaleString('en-IN')}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">পরিশোধিত টাকা</span>
              <p className="text-lg font-black text-emerald-600 mt-0.5">৳ {job.totalPaid.toLocaleString('en-IN')}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">বকেয়া / বাকি</span>
              <p className={`text-lg font-black mt-0.5 ${job.remainingBalance > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                ৳ {job.remainingBalance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Customer & Device Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-blue-600" />
                গ্রাহকের তথ্য (Customer Details)
              </h3>
              <div className="text-sm">
                <p className="font-bold text-slate-900 text-base">{job.customerName}</p>
                <p className="text-slate-600 flex items-center gap-1.5 mt-1 font-semibold">
                  <Phone size={14} className="text-emerald-600" />
                  <a href={`tel:${job.customerPhone}`} className="hover:underline">{job.customerPhone}</a>
                </p>
                {job.customerAddress && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin size={14} className="text-slate-400" />
                    {job.customerAddress}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  রিসিভ করেছেন: <span className="font-medium text-slate-700">{job.receivedBy || 'Staff'}</span>
                </p>
              </div>
            </div>

            {/* Device Box */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop size={14} className="text-indigo-600" />
                  ডিভাইস ও শনাক্তকরণ
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Edit3 size={13} /> এডিট
                  </button>
                ) : (
                  <button
                    onClick={handleSaveEdits}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <Save size={13} /> সেভ করুন
                  </button>
                )}
              </div>

              <div className="text-xs space-y-1.5">
                <p><span className="text-slate-500">ব্র্যান্ড ও মডেল:</span> <span className="font-bold text-slate-800">{job.brand} {job.modelNumber}</span></p>
                <p><span className="text-slate-500">সিরিয়াল নং:</span> <span className="font-mono text-slate-800 font-semibold">{job.serialNumber || 'N/A'}</span></p>
                {isEditing ? (
                  <div className="space-y-2 pt-2 border-t">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">চার্জ (৳):</label>
                      <input 
                        type="number" 
                        value={editCost} 
                        onChange={e => setEditCost(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">সমস্যার বিবরণ:</label>
                      <textarea 
                        rows={2}
                        value={editProblem} 
                        onChange={e => setEditProblem(e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">সঙ্গে প্রাপ্ত এক্সেসরিজ:</label>
                      <input 
                        type="text" 
                        value={editAccessories} 
                        onChange={e => setEditAccessories(e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p><span className="text-slate-500">এক্সেসরিজ:</span> <span className="text-slate-700 font-medium">{job.accessoriesIncluded || 'শুধু ডিভাইস'}</span></p>
                    <div className="bg-slate-50 p-2 rounded mt-2 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 block">সমস্যার বিবরণ (Reported Problem):</span>
                      <span className="text-slate-800 text-xs font-medium">{job.problemDescription}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Details (if delivered or in progress) */}
          {job.status === 'Delivered' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  ডেলিভারি তথ্য (Delivery Record)
                </h4>
                <p className="text-xs text-emerald-900 mt-1">
                  গ্রহীতার নাম: <strong className="font-bold">{job.deliveryName || job.customerName}</strong> • তারিখ: {job.deliveryDate || 'N/A'} • প্রদানকারী: {job.deliveredBy || 'Staff'}
                </p>
                {job.deliveryNotes && (
                  <p className="text-xs text-emerald-700 mt-0.5 italic">নোট: {job.deliveryNotes}</p>
                )}
              </div>
              <button
                onClick={() => onPrintDeliveryReceipt(job)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
              >
                <Printer size={15} />
                ডেলিভারি রিসিট প্রিন্ট
              </button>
            </div>
          )}

          {/* Update Status Workflow Form */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench size={15} />
              মেরামত স্ট্যাটাস পরিবর্তন করুন (Update Status)
            </h3>

            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">নতুন স্ট্যাটাস</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as JobStatus)}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s.key} value={s.key}>{s.key} ({s.label})</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">টেকনিশিয়ান / আপডেটকারী</label>
                  <input
                    type="text"
                    value={updatedBy}
                    onChange={e => setUpdatedBy(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="টেকনিশিয়ানের নাম"
                  />
                </div>

                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition shadow-sm"
                  >
                    {isUpdatingStatus ? 'আপডেট হচ্ছে...' : 'স্ট্যাটাস আপডেট করুন'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">কাজের অগ্রগতি নোট (Work / Repair Note)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="যেমন: মসফেট পরিবর্তন করা হয়েছে, ডিসপ্লে চেক সম্পন্ন, পার্টসের জন্য অর্ডার দেওয়া হলো..."
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </form>
          </div>

          {/* Payment History & Installments */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={15} className="text-emerald-600" />
                পেমেন্ট ইতিহাস (Payment Ledger)
              </h3>
              <button
                onClick={() => onOpenPayment(job)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                <CreditCard size={14} />
                + নতুন পেমেন্ট গ্রহণ
              </button>
            </div>

            {job.paymentHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 rounded">
                এখনো পর্যন্ত কোনো অগ্রিম বা পেমেন্ট জমা হয়নি (সম্পূর্ণ বকেয়া)।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                      <th className="py-2 px-3">রিসিট নং</th>
                      <th className="py-2 px-3">তারিখ</th>
                      <th className="py-2 px-3">পদ্ধতি</th>
                      <th className="py-2 px-3 text-right">টাকা</th>
                      <th className="py-2 px-3">গ্রহীতা</th>
                      <th className="py-2 px-3">মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {job.paymentHistory.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-700">{p.receiptNumber}</td>
                        <td className="py-2 px-3 text-slate-600">{p.date.split('T')[0]}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {p.method}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600">৳ {p.amount.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-slate-600">{p.receivedBy}</td>
                        <td className="py-2 px-3 text-slate-500 italic">{p.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Status Timeline History */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={15} className="text-slate-500" />
              কাজের টাইমলাইন ও ইতিহাস (Timeline Audit)
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {job.statusHistory.slice().reverse().map((entry, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{entry.status}</span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(entry.timestamp).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{entry.note}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">আপডেটকারী: {entry.updatedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {job.status !== 'Delivered' && (
              <button
                onClick={() => onOpenDeliveryConfirm(job)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Truck size={16} />
                ডেলিভারি সম্পন্ন করুন
              </button>
            )}
            {job.status === 'Delivered' && (
              <button
                onClick={() => onPrintDeliveryReceipt(job)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
              >
                <Printer size={16} />
                ডেলিভারি ইনভয়েস প্রিন্ট
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            বন্ধ করুন (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

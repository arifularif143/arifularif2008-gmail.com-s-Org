import React from 'react';
import { ServiceJob, ShopSettings } from '../../types';
import { Printer, X, CheckCircle } from 'lucide-react';

interface DeliveryReceiptProps {
  job: ServiceJob;
  settings: ShopSettings;
  onClose: () => void;
}

export const DeliveryReceipt: React.FC<DeliveryReceiptProps> = ({ job, settings, onClose }) => {
  const triggerPrint = () => {
    window.print();
  };

  const isFullyPaid = job.remainingBalance <= 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-300 p-6 flex flex-col max-h-[96vh] overflow-y-auto">
        
        {/* Onscreen action bar */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded font-bold flex items-center gap-1">
              <CheckCircle size={14} />
              ডেলিভারি ইনভয়েস ও ক্যাশ মেমো (Delivery Memo)
            </span>
            <span className="text-xs text-slate-500 font-mono">{job.jobNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={triggerPrint} 
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow"
            >
              <Printer size={15} />
              ইনভয়েস প্রিন্ট (Print Invoice)
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="print-area font-sans text-slate-900 space-y-4 border border-slate-300 p-6 rounded-lg bg-white print:border-none print:p-0">
          
          {/* Header */}
          <div className="text-center border-b pb-3 space-y-0.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {settings.shopName}
            </h1>
            <p className="text-xs font-bold text-slate-700 tracking-wide">{settings.subtitle}</p>
            <p className="text-[11px] text-slate-600 max-w-md mx-auto">{settings.address}</p>
            <div className="flex justify-center items-center gap-3 text-xs font-bold text-blue-800 pt-1">
              <span>📞 {settings.phone}</span>
              <span>✉️ {settings.email}</span>
            </div>
          </div>

          {/* Invoice Banner */}
          <div className="flex justify-between items-center bg-slate-100 p-3 rounded border border-slate-300">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">সার্ভিস ইনভয়েস / জব নম্বর</p>
              <p className="text-xl font-black text-blue-900 tracking-tight">{job.jobNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">ডেলিভারির তারিখ</p>
              <p className="text-sm font-bold text-slate-800">{job.deliveryDate || new Date().toISOString().split('T')[0]}</p>
              <p className="text-[10px] text-slate-500">গ্রহণ তারিখ: {job.receiveDate}</p>
            </div>
          </div>

          {/* Customer & Delivery Handover info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5 border border-slate-200 p-3 rounded bg-slate-50/50">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b pb-1">
                গ্রাহক ও প্রাপক তথ্য
              </p>
              <p className="font-bold text-sm text-slate-900">{job.customerName}</p>
              <p className="font-semibold text-slate-800">ফোন: <span className="font-mono">{job.customerPhone}</span></p>
              <p className="text-slate-600">
                পণ্য গ্রহণকারী: <strong className="text-slate-900 font-bold">{job.deliveryName || job.customerName}</strong>
              </p>
            </div>

            <div className="space-y-1.5 border border-slate-200 p-3 rounded bg-slate-50/50">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b pb-1">
                মেরামতকৃত ডিভাইস
              </p>
              <p className="font-bold text-sm text-slate-900">{job.deviceType}: {job.brand} {job.modelNumber}</p>
              <p className="text-slate-700 font-mono">সিরিয়াল: {job.serialNumber || 'N/A'}</p>
              <p className="text-emerald-700 font-bold">স্ট্যাটাস: ডেলিভারি সম্পন্ন (Tested OK)</p>
            </div>
          </div>

          {/* Services & Parts Table */}
          <div className="border border-slate-300 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="p-2 border-r border-slate-300">বিবরণ / কাজের বিবরণী (Service & Parts Description)</th>
                  <th className="p-2 text-right">টাকা (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="p-2.5 border-r border-slate-300">
                    <p className="font-bold text-slate-800">{job.problemDescription} — সমাধান ও সার্ভিসিং</p>
                    <p className="text-[10px] text-slate-500">ডিভাইস ফিটিং, কুলিং পেস্ট প্রয়োগ এবং সম্পূর্ণ ফাংশনাল টেস্টিং সম্পন্ন।</p>
                  </td>
                  <td className="p-2.5 text-right font-bold text-slate-900">৳ {job.finalCost.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-300 font-bold text-xs">
                <tr>
                  <td className="p-2 text-right border-r border-slate-300">সর্বমোট চার্জ (Total Amount):</td>
                  <td className="p-2 text-right">৳ {job.finalCost.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-2 text-right border-r border-slate-300 text-emerald-700">পরিশোধিত মোট টাকা (Total Paid):</td>
                  <td className="p-2 text-right text-emerald-700">৳ {job.totalPaid.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-2 text-right border-r border-slate-300">অবশিষ্ট বকেয়া (Due Amount):</td>
                  <td className={`p-2 text-right ${isFullyPaid ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {isFullyPaid ? 'পরিশোধিত (PAID)' : `৳ ${job.remainingBalance.toLocaleString('en-IN')}`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Paid Stamp / Badge */}
          {isFullyPaid && (
            <div className="border-2 border-dashed border-emerald-600 bg-emerald-50/50 p-2 text-center rounded text-emerald-800 font-black tracking-widest text-sm uppercase">
              ✓ সম্পূর্ণ পরিশোধিত (FULL PAYMENT RECEIVED)
            </div>
          )}

          {/* Warranty Notice */}
          <div className="text-[10px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
            <p className="font-bold text-slate-800">ওয়ারেন্টি ও শর্তাবলী:</p>
            <p>• মেরামতের ওয়ারেন্টি শুধুমাত্র মেরামতকৃত অংশ বা প্রতিস্থাপিত নতুন হার্ডওয়্যারের ক্ষেত্রে প্রযোজ্য।</p>
            <p>• পোড়া, ফিজিক্যাল ড্যামেজ বা তরল পদার্থের (Liquid damage) ক্ষেত্রে কোনো ওয়ারেন্টি প্রযোজ্য নহে।</p>
            <p>• কোনো ধরনের সমস্যা পরিলক্ষিত হলে ডেলিভারির তারিখ হতে ৭ দিনের মধ্যে এই মেমোসহ যোগাযোগ করুন।</p>
          </div>

          {/* Signature Lines */}
          <div className="flex justify-between items-end pt-12 text-xs font-bold text-slate-800">
            <div className="text-center border-t border-slate-400 w-44 pt-1">
              পণ্য গ্রহীতার স্বাক্ষর
            </div>
            <div className="text-center border-t border-slate-400 w-44 pt-1">
              কর্তৃপক্ষের সিল ও স্বাক্ষর
            </div>
          </div>

          {/* Watermark footer */}
          <div className="text-center text-[9px] text-slate-400 pt-3 border-t">
            MASTER TECHNOLOGY Service Management System • Print Generated on {new Date().toLocaleString('en-US')}
          </div>

        </div>

      </div>
    </div>
  );
};

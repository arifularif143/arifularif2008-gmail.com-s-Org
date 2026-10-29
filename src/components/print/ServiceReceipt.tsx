import React from 'react';
import { ServiceJob, ShopSettings } from '../../types';
import { Printer, X } from 'lucide-react';

interface PrintProps {
  job: ServiceJob;
  settings: ShopSettings;
  onClose: () => void;
}

export const ServiceReceipt: React.FC<PrintProps> = ({ job, settings, onClose }) => {
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-300 p-6 flex flex-col max-h-[96vh] overflow-y-auto">
        
        {/* Onscreen action bar */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded font-bold">
              ইনটেক রিসিট (Service Intake Token)
            </span>
            <span className="text-xs text-slate-500 font-mono">{job.jobNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={triggerPrint} 
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow"
            >
              <Printer size={15} />
              প্রিন্ট করুন (Print Token)
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 / POS receipt compatible) */}
        <div className="print-area font-sans text-slate-900 space-y-4 border border-slate-300 p-6 rounded-lg bg-white print:border-none print:p-0">
          
          {/* Shop Header */}
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

          {/* Job Card Banner */}
          <div className="flex justify-between items-center bg-slate-100 p-3 rounded border border-slate-300">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">সার্ভিস জব টোকেন নম্বর</p>
              <p className="text-xl font-black text-blue-900 tracking-tight">{job.jobNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">গ্রহণের তারিখ</p>
              <p className="text-sm font-bold text-slate-800">{job.receiveDate}</p>
              <p className="text-[10px] text-slate-500">শাখা: {job.branchId}</p>
            </div>
          </div>

          {/* Customer & Device grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5 border border-slate-200 p-3 rounded bg-slate-50/50">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b pb-1">
                গ্রাহকের বিবরণ (Customer Details)
              </p>
              <p className="font-bold text-sm text-slate-900">{job.customerName}</p>
              <p className="font-semibold text-slate-800">ফোন: <span className="font-mono">{job.customerPhone}</span></p>
              {job.customerAddress && <p className="text-slate-600">ঠিকানা: {job.customerAddress}</p>}
            </div>

            <div className="space-y-1.5 border border-slate-200 p-3 rounded bg-slate-50/50">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b pb-1">
                ডিভাইসের বিবরণ (Device Details)
              </p>
              <p className="font-bold text-sm text-slate-900">{job.deviceType}: {job.brand} {job.modelNumber}</p>
              <p className="text-slate-700 font-mono">সিরিয়াল: {job.serialNumber || 'N/A'}</p>
              <p className="text-slate-600">এক্সেসরিজ: {job.accessoriesIncluded || 'শুধু ডিভাইস'}</p>
            </div>
          </div>

          {/* Problem Box */}
          <div className="border border-slate-200 p-3 rounded text-xs bg-slate-50">
            <p className="font-bold text-slate-700 mb-0.5">গ্রাহক বর্ণিত সমস্যা (Reported Fault / Problem):</p>
            <p className="text-slate-900 font-semibold">{job.problemDescription}</p>
          </div>

          {/* Payment & Estimated Cost Summary */}
          <div className="border border-slate-300 rounded overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">আনুমানিক সার্ভিস খরচ</th>
                  <th className="p-2 border-r border-slate-300 text-center">অগ্রিম জমা (Advance)</th>
                  <th className="p-2 text-right">অবশিষ্ট বকেয়া (Estimated Due)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold text-sm">
                  <td className="p-2.5 border-r border-slate-300">৳ {job.finalCost.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 border-r border-slate-300 text-center text-emerald-700">৳ {job.totalPaid.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right text-rose-600">৳ {job.remainingBalance.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms & Conditions */}
          <div className="text-[10px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
            <p className="font-bold text-slate-800">সেবা গ্রহণের গুরুত্বপূর্ণ নিয়ম ও শর্তাবলী:</p>
            {settings.terms.map((t, idx) => (
              <p key={idx} className="leading-tight">• {t}</p>
            ))}
          </div>

          {/* Signature Lines */}
          <div className="flex justify-between items-end pt-12 text-xs font-bold text-slate-800">
            <div className="text-center border-t border-slate-400 w-40 pt-1">
              গ্রাহকের স্বাক্ষর
            </div>
            <div className="text-center border-t border-slate-400 w-40 pt-1">
              রিসিভকারী / স্টাফ স্বাক্ষর
            </div>
          </div>

          {/* Footer watermark */}
          <div className="text-center text-[9px] text-slate-400 pt-3 border-t">
            MASTER TECHNOLOGY Service Management System • Generated on {new Date().toLocaleString('en-US')}
          </div>

        </div>

      </div>
    </div>
  );
};

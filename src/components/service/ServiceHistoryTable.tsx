import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJob, JobStatus } from '../../types';
import { exportJobsToExcel } from '../../services/excelService';
import { 
  Search, 
  Download, 
  Printer, 
  Filter, 
  CreditCard, 
  Eye, 
  FileSpreadsheet, 
  Trash2, 
  Truck,
  RotateCcw,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface TableProps {
  onSelectJob: (job: ServiceJob) => void;
  onOpenPayment: (job: ServiceJob) => void;
  onPrintIntakeReceipt: (job: ServiceJob) => void;
  onPrintDeliveryReceipt: (job: ServiceJob) => void;
}

export const ServiceHistoryTable: React.FC<TableProps> = ({ 
  onSelectJob, 
  onOpenPayment,
  onPrintIntakeReceipt,
  onPrintDeliveryReceipt
}) => {
  const { jobs, activeBranch, branches, setActiveBranch, deleteJob } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'Paid' | 'Unpaid'>('ALL');

  // Search & Filter
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchBranch = activeBranch === 'ALL' || job.branchId === activeBranch;
      const matchStatus = statusFilter === 'ALL' || job.status === statusFilter;
      const matchPayment = paymentFilter === 'ALL' || 
        (paymentFilter === 'Paid' && job.remainingBalance <= 0) ||
        (paymentFilter === 'Unpaid' && job.remainingBalance > 0);
      
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        job.jobNumber.toLowerCase().includes(q) ||
        job.customerName.toLowerCase().includes(q) ||
        job.customerPhone.includes(q) ||
        job.brand.toLowerCase().includes(q) ||
        (job.modelNumber && job.modelNumber.toLowerCase().includes(q)) ||
        (job.serialNumber && job.serialNumber.toLowerCase().includes(q)) ||
        job.problemDescription.toLowerCase().includes(q);

      return matchBranch && matchStatus && matchPayment && matchQuery;
    });
  }, [jobs, activeBranch, statusFilter, paymentFilter, searchQuery]);

  // Export Filtered Table directly to Excel (.xlsx) with multi-sheet support
  const handleExport = () => {
    exportJobsToExcel(filteredJobs, branches, 'Master_Technology_Services');
  };

  const handleDelete = async (e: React.MouseEvent, job: ServiceJob) => {
    e.stopPropagation();
    if (window.confirm(`আপনি কি নিশ্চিত যে জব নং "${job.jobNumber}" (${job.customerName}) মুছে ফেলতে চান?`)) {
      await deleteJob(job.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden space-y-4 p-5">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">সার্ভিস হিস্ট্রি (Service History Ledger)</h2>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {filteredJobs.length} টি রেকর্ড
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            মূল এক্সেল শীটের পূর্ণ প্রতিরূপ: Receive Date | Name | Brand | Problem | Serial / Model | Taka | Job Number | Status | Delivery Date | Paid Date | Delivery Name
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export to Excel */}
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download size={15} />
            Excel Export (.xlsx)
          </button>
        </div>
      </div>

      {/* Filter Row: Branch Tabs, Status, Due, Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        
        {/* Branch Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveBranch('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeBranch === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল ব্রাঞ্চ
          </button>
          {branches.map(b => (
            <button
              key={b.id}
              onClick={() => setActiveBranch(b.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeBranch === b.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Filters and Search Box */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">সকল স্ট্যাটাস</option>
            <option value="Received">Received (গ্রহণকৃত)</option>
            <option value="Diagnosis Pending">Diagnosis Pending</option>
            <option value="Under Repair">Under Repair (মেরামত চলছে)</option>
            <option value="Waiting for Parts">Waiting for Parts</option>
            <option value="Repair Completed">Repair Completed</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
            <option value="Delivered">Delivered (ডেলিভারি সম্পন্ন)</option>
            <option value="Unrepairable">Unrepairable (অযোগ্য)</option>
          </select>

          {/* Payment Filter */}
          <select 
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">সকল পেমেন্ট</option>
            <option value="Paid">পরিশোধিত (Paid)</option>
            <option value="Unpaid">বকেয়া রয়েছে (Due)</option>
          </select>

          {/* Live Search */}
          <div className="relative min-w-[200px]">
            <Search size={15} className="absolute left-2.5 top-2 text-slate-400" />
            <input 
              type="text"
              placeholder="জব নং, নাম, ফোন, মডেল..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* Excel Sheet Style Sticky Table */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[68vh] shadow-inner">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-950 text-white uppercase text-[10px] tracking-wider z-10 shadow-xs">
            <tr>
              <th className="py-3 px-3 border-r border-slate-800 whitespace-nowrap">Receive Date</th>
              <th className="py-3 px-3 border-r border-slate-800 whitespace-nowrap">Customer Name</th>
              <th className="py-3 px-3 border-r border-slate-800 whitespace-nowrap">Brand</th>
              <th className="py-3 px-3 border-r border-slate-800 min-w-[220px]">Problem</th>
              <th className="py-3 px-3 border-r border-slate-800 whitespace-nowrap">Serial / Model</th>
              <th className="py-3 px-3 border-r border-slate-800 text-right whitespace-nowrap">Taka (৳)</th>
              <th className="py-3 px-3 border-r border-slate-800 text-center whitespace-nowrap">Job Number</th>
              <th className="py-3 px-3 border-r border-slate-800 whitespace-nowrap">Status / Result</th>
              <th className="py-3 px-3 border-r border-slate-800 whitespace-nowrap">Delivery Date</th>
              <th className="py-3 px-3 border-r border-slate-800 whitespace-nowrap">Paid Date</th>
              <th className="py-3 px-3 border-r border-slate-800 whitespace-nowrap">Delivery Name</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-14 text-center text-slate-400 font-medium">
                  কোনো রেকর্ড পাওয়া যায়নি। নতুন সার্ভিস রিসিভ করুন অথবা ফিল্টার পরিবর্তন করুন।
                </td>
              </tr>
            ) : (
              filteredJobs.map((job, index) => {
                const latestPayment = job.paymentHistory.length ? job.paymentHistory[job.paymentHistory.length - 1] : null;

                const rowBg = job.status === 'Ready for Delivery' ? 'bg-emerald-50/40' :
                              job.status === 'Delivered' ? 'bg-slate-50/70' :
                              job.remainingBalance > 0 && job.status === 'Under Repair' ? 'bg-orange-50/30' :
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';

                return (
                  <tr 
                    key={job.id} 
                    onClick={() => onSelectJob(job)}
                    className={`${rowBg} hover:bg-blue-50/70 transition cursor-pointer`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-600 border-r border-slate-200">
                      {job.receiveDate}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{job.customerName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{job.customerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                      {job.brand}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate border-r border-slate-200 font-medium" title={job.problemDescription}>
                      {job.problemDescription}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                      <div className="text-slate-900 font-semibold">{job.modelNumber || '-'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{job.serialNumber || '-'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      <div>৳ {job.finalCost.toLocaleString('en-IN')}</div>
                      {job.remainingBalance > 0 ? (
                        <div className="text-[10px] text-rose-600 font-bold">বাকি: ৳{job.remainingBalance}</div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 font-semibold">পরিশোধিত</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-blue-700 border-r border-slate-200 whitespace-nowrap">
                      {job.jobNumber}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold
                        ${job.status === 'Ready for Delivery' ? 'bg-emerald-100 text-emerald-800' :
                          job.status === 'Delivered' ? 'bg-slate-200 text-slate-800' :
                          job.status === 'Under Repair' ? 'bg-orange-100 text-orange-800' :
                          job.status === 'Unrepairable' ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap border-r border-slate-200">
                      {job.deliveryDate || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap border-r border-slate-200">
                      {latestPayment ? latestPayment.date.split('T')[0] : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-semibold border-r border-slate-200 whitespace-nowrap">
                      {job.deliveryName || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => onSelectJob(job)} 
                          title="বিস্তারিত ও স্ট্যাটাস আপডেট" 
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => onOpenPayment(job)} 
                          title="পেমেন্ট গ্রহণ করুন" 
                          className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                        >
                          <CreditCard size={15} />
                        </button>
                        <button 
                          onClick={() => onPrintIntakeReceipt(job)} 
                          title="ইনটেক রিসিট প্রিন্ট" 
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                        >
                          <Printer size={15} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, job)} 
                          title="মুছে ফেলুন" 
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 pt-1 gap-2">
        <span>ফিল্টারকৃত মোট সার্ভিস: <strong className="text-slate-800">{filteredJobs.length} টি</strong></span>
        <span>MASTER TECHNOLOGY • Computer City Center (Multiplan), Dhaka-1205</span>
      </div>

    </div>
  );
};

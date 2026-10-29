import React from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceJob } from '../../types';
import { 
  Laptop, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  CreditCard,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: 'dashboard' | 'history' | 'delivery') => void;
  onOpenReceiveModal: () => void;
  onOpenExcelImport: () => void;
  onSelectJob: (job: ServiceJob) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onNavigate, 
  onOpenReceiveModal,
  onOpenExcelImport,
  onSelectJob
}) => {
  const { stats, jobs, activeBranch, branches, setActiveBranch } = useApp();

  const currentBranchName = activeBranch === 'ALL' 
    ? 'সকল ব্রাঞ্চ (All 6 Branches Consolidated)' 
    : branches.find(b => b.id === activeBranch)?.name || activeBranch;

  const statCards = [
    { 
      label: 'মোট সার্ভিস জব', 
      sub: 'Total Registered', 
      value: stats.totalJobs, 
      icon: Laptop, 
      color: 'border-l-blue-600', 
      iconColor: 'text-blue-600', 
      bg: 'bg-blue-50',
      action: () => onNavigate('history')
    },
    { 
      label: 'আজকের রিসিভ', 
      sub: "Today's Intake", 
      value: stats.todayReceived, 
      icon: PlusCircle, 
      color: 'border-l-indigo-600', 
      iconColor: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      action: onOpenReceiveModal
    },
    { 
      label: 'অপেক্ষমাণ মেরামত', 
      sub: 'Pending Diagnostics', 
      value: stats.pendingRepairs, 
      icon: Clock, 
      color: 'border-l-amber-500', 
      iconColor: 'text-amber-500', 
      bg: 'bg-amber-50',
      action: () => onNavigate('history')
    },
    { 
      label: 'মেরামত চলছে', 
      sub: 'Under Active Repair', 
      value: stats.underRepair, 
      icon: Wrench, 
      color: 'border-l-orange-500', 
      iconColor: 'text-orange-500', 
      bg: 'bg-orange-50',
      action: () => onNavigate('history')
    },
    { 
      label: 'ডেলিভারির জন্য প্রস্তুত', 
      sub: 'Ready for Release', 
      value: stats.readyForDelivery, 
      icon: CheckCircle2, 
      color: 'border-l-emerald-600', 
      iconColor: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      action: () => onNavigate('delivery')
    },
    { 
      label: 'ডেলিভারি সম্পন্ন', 
      sub: 'Delivered to Customer', 
      value: stats.deliveredCount, 
      icon: Truck, 
      color: 'border-l-cyan-600', 
      iconColor: 'text-cyan-600', 
      bg: 'bg-cyan-50',
      action: () => onNavigate('delivery')
    },
    { 
      label: 'বকেয়া রয়েছে (জব)', 
      sub: 'Unpaid / Partial Due', 
      value: stats.unpaidCount, 
      icon: AlertCircle, 
      color: 'border-l-rose-500', 
      iconColor: 'text-rose-500', 
      bg: 'bg-rose-50',
      action: () => onNavigate('history')
    },
    { 
      label: 'আজকের কালেকশন', 
      sub: "Today's Cash In", 
      value: `৳ ${stats.todayRevenue.toLocaleString('en-IN')}`, 
      icon: CreditCard, 
      color: 'border-l-teal-600', 
      iconColor: 'text-teal-600', 
      bg: 'bg-teal-50',
      action: () => onNavigate('history')
    },
    { 
      label: 'সর্বমোট বকেয়া পাওনা', 
      sub: 'Total Outstanding Balance', 
      value: `৳ ${stats.totalOutstanding.toLocaleString('en-IN')}`, 
      icon: AlertCircle, 
      color: 'border-l-red-600', 
      iconColor: 'text-red-600', 
      bg: 'bg-red-50',
      action: () => onNavigate('history')
    }
  ];

  // Filtered jobs by active branch
  const activeBranchJobs = activeBranch === 'ALL' ? jobs : jobs.filter(j => j.branchId === activeBranch);
  const recentJobs = activeBranchJobs.slice(0, 8);

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">ড্যাশবোর্ড (Dashboard)</h1>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            শাখা ফিল্টার: <span className="text-blue-700 font-bold">{currentBranchName}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={onOpenReceiveModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
          >
            <PlusCircle size={16} />
            নতুন সার্ভিস রিসিভ (New Intake)
          </button>
          
          <button 
            onClick={() => onNavigate('delivery')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Truck size={16} />
            ডেলিভারি কাউন্টার
          </button>

          <button 
            onClick={onOpenExcelImport}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            এক্সেল ইম্পোর্ট
          </button>
        </div>
      </div>

      {/* Legacy Branch Quick Tabs Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 overflow-x-auto shadow-xs text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] pl-2 whitespace-nowrap">
          ব্রাঞ্চ নির্বাচন:
        </span>
        <button
          onClick={() => setActiveBranch('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
            activeBranch === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          সকল ব্রাঞ্চ ({jobs.length})
        </button>
        {branches.map(b => {
          const count = jobs.filter(j => j.branchId === b.id).length;
          return (
            <button
              key={b.id}
              onClick={() => setActiveBranch(b.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeBranch === b.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{b.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeBranch === b.id ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of 9 stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              onClick={card.action}
              className={`bg-white rounded-2xl p-4 border border-slate-200 border-l-4 ${card.color} shadow-xs hover:shadow-md cursor-pointer transition flex items-center justify-between group`}
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.sub}</p>
                <h3 className="text-xs font-bold text-slate-700 mt-0.5">{card.label}</h3>
                <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-110 transition`}>
                <Icon size={24} className={card.iconColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">সাম্প্রতিক সার্ভিস জব (Recent Service Jobs)</h2>
            <p className="text-xs text-slate-400">সর্বশেষ গ্রহণকৃত কম্পিউটার ও ল্যাপটপ তালিকা (ক্লিক করে বিস্তারিত দেখুন)</p>
          </div>
          <button 
            onClick={() => onNavigate('history')}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            সম্পূর্ণ এক্সেল হিস্ট্রি টেবিল <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">জব নং</th>
                <th className="px-5 py-3">তারিখ</th>
                <th className="px-5 py-3">গ্রাহক</th>
                <th className="px-5 py-3">ব্র্যান্ড ও মডেল</th>
                <th className="px-5 py-3">সমস্যা</th>
                <th className="px-5 py-3 text-right">চার্জ (৳)</th>
                <th className="px-5 py-3 text-right">বাকি (৳)</th>
                <th className="px-5 py-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    এই শাখায় কোনো সার্ভিস ডাটা পাওয়া যায়নি। &quot;নতুন সার্ভিস রিসিভ&quot; বাটনে ক্লিক করে ডিভাইস যুক্ত করুন।
                  </td>
                </tr>
              ) : (
                recentJobs.map(job => (
                  <tr 
                    key={job.id} 
                    onClick={() => onSelectJob(job)}
                    className="hover:bg-blue-50/60 transition cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {job.jobNumber}
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{job.receiveDate}</td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-800">{job.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{job.customerPhone}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-slate-800">{job.brand}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5">{job.modelNumber}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate" title={job.problemDescription}>
                      {job.problemDescription}
                    </td>
                    <td className="px-5 py-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      ৳ {job.finalCost.toLocaleString('en-IN')}
                    </td>
                    <td className={`px-5 py-3 text-right font-bold whitespace-nowrap ${job.remainingBalance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {job.remainingBalance > 0 ? `৳ ${job.remainingBalance.toLocaleString('en-IN')}` : '০'}
                    </td>
                    <td className="px-5 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold
                        ${job.status === 'Ready for Delivery' ? 'bg-emerald-100 text-emerald-800' :
                          job.status === 'Delivered' ? 'bg-slate-100 text-slate-700' :
                          job.status === 'Under Repair' ? 'bg-orange-100 text-orange-800' :
                          job.status === 'Unrepairable' ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

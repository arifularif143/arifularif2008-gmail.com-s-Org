import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parseExcelServiceHistory, downloadExcelTemplate, ImportSummary } from '../../services/excelService';
import { 
  X, 
  FileSpreadsheet, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  ArrowRight,
  Layers
} from 'lucide-react';

interface ExcelImportModalProps {
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ onClose, onSuccess }) => {
  const { jobs, branches, importBatchJobs } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setParsing(true);
    try {
      const res = await parseExcelServiceHistory(selected, jobs, branches);
      setSummary(res);
    } catch (err: any) {
      setError(err.message || 'ফাইল প্রসেসিং ব্যর্থ হয়েছে।');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!summary || summary.records.length === 0) return;
    setImporting(true);
    try {
      const importedCount = await importBatchJobs(summary.records);
      onSuccess(importedCount);
      onClose();
    } catch (err: any) {
      setError('ডাটাবেজে সংরক্ষণে ব্যর্থ হয়েছে।');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-emerald-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold">লেগ্যাসি এক্সেল ইম্পোর্ট (Excel Migration)</h2>
              <p className="text-xs text-emerald-200">
                Divce MAMA, Peragong, Daffodil, Gulsan trest, HS-E, JARA Computer শীট থেকে ডাটা যুক্ত করুন
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Instructions Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800">এক্সেল ফরম্যাট গাইডলাইন:</p>
              <p className="text-slate-600 mt-0.5">
                কলাম: Receive Date | Name | Phone | Brand | Problem | Serial / Model | Taka | Job Number | Status
              </p>
            </div>
            <button
              onClick={downloadExcelTemplate}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition shadow-2xs whitespace-nowrap"
            >
              <Download size={14} className="text-emerald-600" />
              টেমপ্লেট ডাউনলোড
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50/50 transition">
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer space-y-2 block">
              <Upload size={32} className="mx-auto text-emerald-600" />
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  {file ? file.name : 'কম্পিউটার থেকে এক্সেল ফাইল সিলেক্ট করুন'}
                </span>
                <span className="text-slate-400">.xlsx অথবা .xls ফরম্যাট সাপোর্ট করে</span>
              </div>
            </label>
          </div>

          {parsing && (
            <div className="text-center py-4 text-emerald-700 font-bold animate-pulse">
              এক্সেল শীট ও ব্রাঞ্চ বিশ্লেষণ করা হচ্ছে...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Inspection Summary */}
          {summary && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle size={15} className="text-emerald-600" />
                ফাইল বিশ্লেষণ ফলাফল (Inspection Summary)
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-100 p-2.5 rounded-lg border">
                  <span className="text-slate-500 block text-[10px] font-bold">মোট পাওয়া গেছে</span>
                  <span className="text-base font-extrabold text-slate-800">{summary.totalProcessed} টি</span>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <span className="text-emerald-800 block text-[10px] font-bold">নতুন ইম্পোর্ট হবে</span>
                  <span className="text-base font-extrabold text-emerald-700">{summary.importedCount} টি</span>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <span className="text-amber-800 block text-[10px] font-bold">ডুপ্লিকেট / বাদ</span>
                  <span className="text-base font-extrabold text-amber-700">{summary.duplicateCount} টি</span>
                </div>
              </div>

              {/* Sheet breakdown */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-1.5">
                <p className="font-bold text-slate-700 text-[11px]">শীট অনুযায়ী পাওয়া রেকর্ড:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(summary.sheetBreakdown).map(([sheet, count]) => (
                    <div key={sheet} className="bg-slate-50 px-2.5 py-1.5 rounded border text-[11px] flex justify-between items-center">
                      <span className="font-semibold text-slate-700 truncate">{sheet}:</span>
                      <span className="font-mono font-bold text-blue-700 ml-1">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings if any */}
              {summary.warnings.length > 0 && (
                <div className="max-h-24 overflow-y-auto bg-amber-50/70 p-2.5 rounded border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <p className="font-bold">সতর্কবার্তা ({summary.warnings.length}):</p>
                  {summary.warnings.slice(0, 5).map((w, idx) => (
                    <p key={idx}>• {w}</p>
                  ))}
                  {summary.warnings.length > 5 && (
                    <p className="italic text-slate-500">এবং আরও {summary.warnings.length - 5} টি সতর্কবার্তা...</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition"
          >
            বাতিল
          </button>
          
          <button
            type="button"
            disabled={!summary || summary.importedCount === 0 || importing}
            onClick={handleConfirmImport}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-2 rounded-lg font-bold transition shadow-sm"
          >
            <CheckCircle size={16} />
            {importing ? 'ইম্পোর্ট হচ্ছে...' : `ডাটাবেজে যুক্ত করুন (${summary?.importedCount || 0} টি)`}
          </button>
        </div>

      </div>
    </div>
  );
};

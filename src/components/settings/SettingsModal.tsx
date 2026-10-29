import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShopSettings } from '../../types';
import { X, Settings, Store, Plus, Save, RotateCcw, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { shopSettings, updateShopSettings, branches, addBranch, resetToDemoData } = useApp();

  const [settings, setSettings] = useState<ShopSettings>({ ...shopSettings });
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    addBranch(newBranchName, newBranchPhone, newBranchAddress);
    setNewBranchName('');
    setNewBranchPhone('');
    setNewBranchAddress('');
    setShowAddBranch(false);
  };

  const handleTermChange = (index: number, val: string) => {
    const updated = [...settings.terms];
    updated[index] = val;
    setSettings({ ...settings, terms: updated });
  };

  const addTerm = () => {
    setSettings({ ...settings, terms: [...settings.terms, 'নতুন শর্তাবলী যুক্ত করুন'] });
  };

  const removeTerm = (index: number) => {
    const updated = settings.terms.filter((_, i) => i !== index);
    setSettings({ ...settings, terms: updated });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">দোকান ও সিস্টেম সেটিংস (Shop Settings)</h2>
              <p className="text-xs text-slate-400">রিসিট হেডার, হেল্পলাইন নম্বর, ওয়ারেন্টি শর্ত ও ব্রাঞ্চ পরিচালনা</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg font-bold text-center">
              ✓ সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
            </div>
          )}

          {/* Shop Branding */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="border border-slate-200 p-4 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Store size={15} className="text-blue-600" />
                দোকানের তথ্য ও রিসিট হেডার
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">দোকানের নাম (Shop Name)</label>
                  <input
                    type="text"
                    value={settings.shopName}
                    onChange={e => setSettings({ ...settings, shopName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">সাবটাইটেল / সার্ভিস ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={settings.subtitle}
                    onChange={e => setSettings({ ...settings, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">দোকানের ঠিকানা (Address)</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">হেল্পলাইন ফোন নম্বর</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={e => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={e => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  রিসিটের নিয়ম ও শর্তাবলী (Receipt Terms)
                </h3>
                <button
                  type="button"
                  onClick={addTerm}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  + শর্ত যোগ করুন
                </button>
              </div>

              <div className="space-y-2">
                {settings.terms.map((term, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">{index + 1}.</span>
                    <input
                      type="text"
                      value={term}
                      onChange={e => handleTermChange(index, e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeTerm(index)}
                      className="text-red-500 hover:text-red-700 p-1 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg transition shadow-sm"
              >
                <Save size={15} />
                সেটিংস সংরক্ষণ করুন (Save Settings)
              </button>
            </div>
          </form>

          {/* Branches list & manager */}
          <div className="border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                সক্রিয় শাখা তালিকা (Shop Branches / Excel Tabs)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBranch(!showAddBranch)}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> নতুন শাখা
              </button>
            </div>

            {showAddBranch && (
              <form onSubmit={handleAddBranch} className="bg-slate-50 p-3 rounded-lg border space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="শাখার নাম *"
                    value={newBranchName}
                    onChange={e => setNewBranchName(e.target.value)}
                    className="px-2.5 py-1.5 border rounded bg-white text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ফোন নম্বর"
                    value={newBranchPhone}
                    onChange={e => setNewBranchPhone(e.target.value)}
                    className="px-2.5 py-1.5 border rounded bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="ঠিকানা"
                    value={newBranchAddress}
                    onChange={e => setNewBranchAddress(e.target.value)}
                    className="px-2.5 py-1.5 border rounded bg-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBranch(false)}
                    className="px-3 py-1 text-slate-500 hover:bg-slate-200 rounded text-xs"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-3 py-1 rounded font-bold text-xs hover:bg-emerald-700"
                  >
                    শাখা যোগ করুন
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {branches.map(b => (
                <div key={b.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800">{b.name}</p>
                  {b.isLegacyTab && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.2 rounded inline-block mt-0.5">
                      Legacy Excel Tab
                    </span>
                  )}
                  {b.phone && <p className="text-[11px] text-slate-500 mt-1 font-mono">{b.phone}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="border border-red-100 bg-red-50/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-red-900">ডেমো ডাটা পুনঃস্থাপন (Reset Demo Data)</p>
              <p className="text-slate-500 mt-0.5">মূল ৬টি ব্রাঞ্চ ও প্রাথমিক স্যাম্পল ডাটা পুনরায় লোড করতে চান?</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত যে ডেমো ডাটা রিসেট করতে চান?')) {
                  resetToDemoData();
                  alert('ডেমো ডাটা সফলভাবে রিস্টোর হয়েছে!');
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
            >
              <RotateCcw size={14} />
              রিসেট ডেমো
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            বন্ধ করুন (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

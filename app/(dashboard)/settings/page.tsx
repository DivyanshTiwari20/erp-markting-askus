"use client";

import { Save, Bell, Globe, Building, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call or saving to local storage
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-8 p-8 max-w-4xl relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Workspace Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your agency details, billing, and automation preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Workspace Details */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Agency Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name</label>
                <input type="text" defaultValue="Askus Studio" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / GSTIN</label>
                <input type="text" placeholder="Optional" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Address</label>
              <textarea rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400"></textarea>
            </div>
          </div>
        </div>

        {/* Currency & Tax (Phase 2) */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Localization & Tax</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Currency</label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400 bg-white">
                  <option>INR (₹)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Tax Rate (%)</label>
                <input type="number" defaultValue="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Smart Automation (Phase 2) */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Smart Automation</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-800">Auto Payment Reminders</p>
                <p className="text-sm text-slate-500">Send emails 3 days before and on due date.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-800">Automatic Late Fees</p>
                <p className="text-sm text-slate-500">Apply a 5% fee when invoice is 7 days overdue.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 items-center gap-4">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-teal-600">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved!
            </span>
          )}
          <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-600 disabled:opacity-70 disabled:cursor-not-allowed">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

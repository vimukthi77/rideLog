'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  HiOutlineCog,
  HiOutlineSave,
  HiOutlineOfficeBuilding,
  HiOutlineRefresh,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import { FaDatabase, FaBuilding } from 'react-icons/fa';

export default function AdminSettingsPage() {
  const [projectName, setProjectName] = useState(
    'Sahasdhanavi 350 MW LNG Combined Cycle Power Plant (CCPP) EPC Project'
  );
  const [companyName, setCompanyName] = useState('Lakdhanavi Limited');
  const [location, setLocation] = useState('Kerawalapitiya, Sri Lanka');
  const [transportOfficer, setTransportOfficer] = useState('K. N. Perera');
  const [contactEmail, setContactEmail] = useState('transport@lakdhanavi.com');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System configuration saved successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1B262C]">System Settings</h1>
        <p className="text-xs text-[#7F8C8D]">
          Configure project metadata, transport department officers, and logbook defaults
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
          <FaBuilding className="text-[#3282B8] text-base" />
          <h2 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider">
            Project & Entity Branding
          </h2>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#1B262C] uppercase mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-semibold text-[#1B262C] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1B262C] uppercase mb-1">
              Project Description / Site
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-semibold text-[#1B262C] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#1B262C] uppercase mb-1">
                Project Site Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B262C] uppercase mb-1">
                Transport Officer In-charge
              </label>
              <input
                type="text"
                value={transportOfficer}
                onChange={(e) => setTransportOfficer(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#1B262C] uppercase mb-1">
              Official Transport Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#0F4C75] hover:bg-[#1B262C] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <HiOutlineSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Monthly Reset Documentation Info Card */}
      <div className="bg-[#BBE1FA]/30 border border-[#3282B8]/40 p-5 rounded-2xl flex items-start space-x-3 text-xs">
        <HiOutlineInformationCircle className="w-6 h-6 text-[#3282B8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-[#0F4C75] text-sm">
            Automated Monthly Kilometer Reset Logic
          </h3>
          <p className="text-[#1B262C] leading-relaxed">
            The dashboard analytics automatically reset to 0 KM at the beginning of each calendar month for active fleet KPIs. All trip records and vehicle historical odometer progression remain permanently preserved in the MongoDB database and are accessible anytime via the Reports & PDF generation module.
          </p>
        </div>
      </div>
    </div>
  );
}

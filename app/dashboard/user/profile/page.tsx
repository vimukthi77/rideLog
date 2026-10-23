'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlineShieldCheck,
  HiOutlineLogout,
  HiOutlineLockClosed,
} from 'react-icons/hi';
import { FaCar, FaBuilding } from 'react-icons/fa';

export default function UserProfilePage() {
  const { user, logout, refreshUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const payload: any = { phone, department };
      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error('New password must be at least 6 characters.');
          setSaving(false);
          return;
        }
        payload.password = newPassword;
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      toast.success('Profile updated successfully!');
      setNewPassword('');
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Card Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#1B262C] via-[#0F4C75] to-[#3282B8] p-6 text-white text-center">
          <div className="w-20 h-20 rounded-full bg-white text-[#0F4C75] mx-auto flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white/20">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <h2 className="text-xl font-bold mt-3 text-white">{user?.fullName}</h2>
          <p className="text-xs text-[#BBE1FA] font-medium mt-0.5">{user?.email}</p>

          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="px-3 py-0.5 rounded-full bg-white/20 text-[#BBE1FA] text-xs font-bold uppercase tracking-wider">
              {user?.role}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-[#3282B8] text-white text-xs font-semibold">
              ID: {user?.employeeId || 'LAK-STAFF'}
            </span>
          </div>
        </div>

        {/* Project Branding Banner */}
        <div className="bg-[#BBE1FA]/30 px-5 py-3 border-y border-[#BBE1FA] text-xs text-[#0F4C75] flex items-center space-x-2">
          <FaBuilding className="text-base text-[#3282B8] shrink-0" />
          <span className="font-semibold">
            Lakdhanavi Limited • Sahasdhanavi 350 MW LNG EPC Project
          </span>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleUpdateProfile} className="p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B262C]">
            Account & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#7F8C8D] mb-1">
                Department
              </label>
              <div className="relative">
                <HiOutlineOfficeBuilding className="absolute left-3 top-3 text-[#3282B8] w-4 h-4" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Civil Engineering"
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-semibold text-[#1B262C] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7F8C8D] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-3 text-[#3282B8] w-4 h-4" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 7X XXX XXXX"
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-semibold text-[#1B262C] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-2">
              Change Password
            </h4>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-3 text-[#3282B8] w-4 h-4" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-semibold text-[#1B262C] outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 bg-[#0F4C75] hover:bg-[#1B262C] text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-[0.98]"
            >
              {saving ? 'Saving Changes...' : 'Save Profile Updates'}
            </button>

            <button
              type="button"
              onClick={logout}
              className="py-3 px-4 bg-red-50 hover:bg-red-100 text-[#E74C3C] border border-red-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <HiOutlineLogout className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

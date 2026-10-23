'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineOfficeBuilding,
  HiOutlineArrowRight,
} from 'react-icons/hi';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone,
          department,
          employeeId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      toast.success('Account created successfully! Welcome to Lakdhanavi Rides.');
      if (data.user) {
        login(data.user);
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-[#1B262C] via-[#0F4C75] to-[#1B262C] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#BBE1FA]/40">
          {/* Card Top Header */}
          <div className="bg-gradient-to-r from-[#1B262C] to-[#0F4C75] p-6 text-center border-b border-[#3282B8]/40">
            <div className="inline-block bg-white px-5 py-2 rounded-xl shadow-md mb-3">
              <Image
                src="/logo.png"
                alt="Lakdhanavi Limited"
                width={190}
                height={45}
                className="h-8 w-auto object-contain mx-auto"
                priority
              />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Create New Account
            </h2>
            <p className="text-xs text-[#BBE1FA] mt-1">
              Join the Lakdhanavi Transport Logbook System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {/* Section 1: Basic Info with #BBE1FA accent */}
            <div className="bg-[#BBE1FA]/30 p-4 rounded-xl border border-[#BBE1FA] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F4C75]">
                Personal & Work Details
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#1B262C] mb-1">
                  Full Name <span className="text-[#E74C3C]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                    <HiOutlineUser className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kasun Fernando"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#BBE1FA] focus:border-[#3282B8] rounded-lg text-sm text-[#1B262C] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1B262C] mb-1">
                    Employee ID
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                      <HiOutlineIdentification className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. LAK-302"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#BBE1FA] focus:border-[#3282B8] rounded-lg text-sm text-[#1B262C] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1B262C] mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                      <HiOutlineOfficeBuilding className="w-5 h-5" />
                    </span>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#BBE1FA] focus:border-[#3282B8] rounded-lg text-sm text-[#1B262C] outline-none"
                    >
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Transport">Transport / Logistics</option>
                      <option value="Safety & HSE">Safety & HSE</option>
                      <option value="Project Management">Project Management</option>
                      <option value="Administration">Administration</option>
                      <option value="Procurement">Procurement</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1B262C] mb-1">
                    Email Address <span className="text-[#E74C3C]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                      <HiOutlineMail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@lakdhanavi.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#BBE1FA] focus:border-[#3282B8] rounded-lg text-sm text-[#1B262C] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1B262C] mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                      <HiOutlinePhone className="w-5 h-5" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 7X XXX XXXX"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#BBE1FA] focus:border-[#3282B8] rounded-lg text-sm text-[#1B262C] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Security */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
                    Password <span className="text-[#E74C3C]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                      <HiOutlineLockClosed className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-lg text-sm text-[#1B262C] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
                    Confirm Password <span className="text-[#E74C3C]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                      <HiOutlineLockClosed className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-lg text-sm text-[#1B262C] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#7F8C8D]">
              Note: Accounts are registered as <strong className="text-[#0F4C75]">Passenger</strong> by default. Role upgrades to Driver or Admin can be performed by the Transport Administrator.
            </p>

            {/* Submit Button in #0F4C75 as requested */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#0F4C75] hover:bg-[#1B262C] text-white font-semibold rounded-xl shadow-lg shadow-[#0F4C75]/30 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-[#7F8C8D]">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-bold text-[#3282B8] hover:text-[#0F4C75] underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

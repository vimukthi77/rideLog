'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi';
import { FaCar, FaKey } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      toast.success(`Welcome back, ${data.user.fullName}!`);
      login(data.user);
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'driver' | 'passenger') => {
    if (role === 'admin') {
      setEmail('admin@lakdhanavi.com');
      setPassword('admin123');
    } else if (role === 'driver') {
      setEmail('lakshan@lakdhanavi.com');
      setPassword('driver123');
    } else {
      setEmail('gaveen@lakdhanavi.com');
      setPassword('pass123');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-[#1B262C] via-[#0F4C75] to-[#1B262C] overflow-hidden">
      {/* Subtle Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#3282B8] blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#0F4C75] blur-3xl" />

        {/* Subtle decorative road & car animation in background */}
        <div className="absolute bottom-10 left-0 right-0 h-1 road-stripe opacity-40" />
        <motion.div
          animate={{ x: ['-20vw', '120vw'] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
          className="absolute bottom-12 text-[#BBE1FA]/30 text-3xl"
        >
          <FaCar />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Card Header with Logo */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#BBE1FA]/40">
          <div className="bg-gradient-to-r from-[#1B262C] to-[#0F4C75] p-6 text-center border-b border-[#3282B8]/40">
            <div className="inline-block bg-white px-5 py-2.5 rounded-xl shadow-md mb-3">
              <Image
                src="/logo.png"
                alt="Lakdhanavi Limited"
                width={200}
                height={50}
                className="h-9 w-auto object-contain mx-auto"
                priority
              />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Ride Recording System
            </h2>
            <p className="text-xs text-[#BBE1FA] mt-1 font-medium">
              Sahasdhanavi 350 MW LNG Power Plant EPC
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7F8C8D]">
                  <HiOutlineMail className="w-5 h-5 text-[#3282B8]" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. gaveen@lakdhanavi.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-medium text-[#1B262C] transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7F8C8D]">
                  <HiOutlineLockClosed className="w-5 h-5 text-[#3282B8]" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-medium text-[#1B262C] transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-[#1B262C] font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#BBE1FA] text-[#3282B8] focus:ring-[#3282B8]"
                />
                <span>Remember me</span>
              </label>
              <span className="text-[#3282B8] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-[#3282B8] hover:bg-[#0F4C75] text-white font-semibold rounded-xl shadow-lg shadow-[#3282B8]/30 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#7F8C8D] uppercase tracking-wider flex items-center gap-1">
                  <FaKey className="text-[#3282B8]" /> Demo Accounts
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-[#BBE1FA]/60 text-[#1B262C] text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('passenger')}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-[#BBE1FA]/60 text-[#1B262C] text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors"
                >
                  Passenger
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('driver')}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-[#BBE1FA]/60 text-[#1B262C] text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors"
                >
                  Driver
                </button>
              </div>
            </div>

            {/* Registration Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-[#7F8C8D]">
                Don&apos;t have an account yet?{' '}
                <Link
                  href="/register"
                  className="font-bold text-[#0F4C75] hover:text-[#3282B8] underline decoration-[#3282B8]/40"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#BBE1FA]/70 mt-4">
          © {new Date().getFullYear()} Lakdhanavi Limited • Transport Department
        </p>
      </motion.div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineClipboardList } from 'react-icons/hi';
import { FaCarSide, FaRoad } from 'react-icons/fa';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/dashboard/user');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B262C] via-[#0F4C75] to-[#1B262C] text-white flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-[#1B262C]/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Image
                src="/logo.png"
                alt="Lakdhanavi Limited"
                width={170}
                height={40}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-[#BBE1FA] hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold bg-[#3282B8] hover:bg-white hover:text-[#1B262C] text-white rounded-xl shadow-md transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#3282B8]/20 border border-[#3282B8]/40 text-[#BBE1FA] text-xs font-semibold uppercase tracking-wider">
            <FaRoad className="text-sm" />
            <span>Transport Department • Kerawalapitiya EPC</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Lakdhanavi Ride Recording System
          </h1>

          <p className="text-lg sm:text-xl text-[#BBE1FA] font-light max-w-2xl mx-auto">
            Digitized logbook management for Sahasdhanavi 350 MW LNG Combined Cycle Power Plant. Real-time mileage tracking, automated distance computation, and digital audit-ready reporting.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-[#3282B8] hover:bg-[#BBE1FA] hover:text-[#1B262C] text-white font-bold rounded-2xl shadow-xl shadow-[#3282B8]/30 flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Access Transport Logbook</span>
              <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-[#BBE1FA] border border-white/20 font-bold rounded-2xl backdrop-blur-md flex items-center justify-center transition-all"
            >
              <span>Create Passenger Account</span>
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full text-left">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[#3282B8]/30 flex items-center justify-center text-[#BBE1FA] text-2xl mb-4">
              <FaCarSide />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Mobile-First Logbook</h3>
            <p className="text-sm text-[#BBE1FA]/80">
              Native app-like touch interface for passengers and drivers. Instant odometer capture and zero paper hassle.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[#0F4C75] flex items-center justify-center text-[#BBE1FA] text-2xl mb-4">
              <HiOutlineClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Paper Logbook Replica</h3>
            <p className="text-sm text-[#BBE1FA]/80">
              Digital reports replicate the original paper logbook layout down to authorizing officer initials, mileage, and travel details.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[#27AE60]/30 flex items-center justify-center text-emerald-400 text-2xl mb-4">
              <HiOutlineShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fleet Analytics & Reset</h3>
            <p className="text-sm text-[#BBE1FA]/80">
              Monthly KM auto-reset dashboards, fuel tracking, PDF generation with official signatures, and full history retention.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-[#BBE1FA]/60 bg-[#1B262C]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Lakdhanavi Limited • Sahasdhanavi 350 MW LNG Power Plant EPC Project</span>
          <span>Kerawalapitiya, Sri Lanka</span>
        </div>
      </footer>
    </div>
  );
}

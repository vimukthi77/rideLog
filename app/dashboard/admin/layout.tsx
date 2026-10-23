'use client';

import React from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineBell, HiOutlineSearch, HiOutlineShieldCheck } from 'react-icons/hi';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-[#1B262C] flex flex-col">
      {/* Sidebar (Desktop fixed left, Mobile drawer) */}
      <AdminSidebar />

      {/* Main Container */}
      <div className="lg:pl-[260px] flex-1 flex flex-col min-w-0">
        {/* Top Desktop Bar */}
        <header className="hidden lg:flex items-center justify-between h-16 bg-white border-b border-slate-200 px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-[#0F4C75] uppercase tracking-wider bg-[#BBE1FA]/40 px-2.5 py-1 rounded-md border border-[#BBE1FA]">
              EPC Transport Portal
            </span>
            <span className="text-xs text-[#7F8C8D]">
              Sahasdhanavi 350 MW LNG Combined Cycle Power Plant
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/user/new-ride"
              className="px-3 py-1.5 bg-[#3282B8] hover:bg-[#0F4C75] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              + Quick Record Trip
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center space-x-2 text-xs">
              <div className="w-8 h-8 rounded-full bg-[#1B262C] text-[#BBE1FA] flex items-center justify-center font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <span className="font-bold text-[#1B262C] block leading-tight">
                  {user?.fullName || 'Administrator'}
                </span>
                <span className="text-[10px] text-[#27AE60] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60]" />
                  Active Admin Session
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 bg-white border-t border-slate-200 text-xs text-[#7F8C8D] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            © {new Date().getFullYear()} Lakdhanavi Limited • Transport Department • Kerawalapitiya
          </span>
          <span className="text-[11px] font-mono text-[#0F4C75]">
            Sahasdhanavi 350 MW CCPP Project Management System
          </span>
        </footer>
      </div>
    </div>
  );
}

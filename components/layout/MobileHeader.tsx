'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineLogout, HiOutlineViewGrid } from 'react-icons/hi';
import { FaShieldAlt } from 'react-icons/fa';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function MobileHeader({ title, subtitle }: MobileHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#1B262C]/95 backdrop-blur-xl border-b border-[#3282B8]/20 text-white px-3.5 py-2.5 shadow-md md:hidden">
      <div className="flex items-center justify-between">
        {/* Brand & Project Info */}
        <div className="flex items-center space-x-2.5">
          <Link href="/dashboard/user" className="bg-white px-2 py-1 rounded-lg shadow-sm block shrink-0">
            <Image
              src="/logo.png"
              alt="Lakdhanavi"
              width={110}
              height={26}
              className="h-4.5 w-auto object-contain"
              priority
            />
          </Link>

          <div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-pulse" />
              <h1 className="text-[11px] font-bold text-white tracking-tight uppercase">
                {title || 'Sahasdhanavi 350MW'}
              </h1>
            </div>
            <p className="text-[10px] text-[#BBE1FA]/70 font-mono">
              {subtitle || 'Fleet Logbook'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {user?.role === 'admin' && (
            <Link
              href="/dashboard/admin"
              className="px-2.5 py-1 text-[10px] font-bold bg-[#0F4C75] hover:bg-[#3282B8] text-white rounded-lg flex items-center space-x-1 border border-[#3282B8]/40 transition-colors"
            >
              <HiOutlineViewGrid className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {/* User badge */}
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 pl-2 pr-1 py-0.5 rounded-full">
            <span className="text-[10px] font-semibold text-[#BBE1FA] max-w-[70px] truncate">
              {user?.fullName?.split(' ')[0] || 'User'}
            </span>
            <button
              onClick={logout}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/20 text-[#BBE1FA] hover:text-[#E74C3C] flex items-center justify-center transition-colors"
              title="Sign Out"
            >
              <HiOutlineLogout className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

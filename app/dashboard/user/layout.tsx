'use client';

import React from 'react';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { HiOutlineLogout, HiOutlineViewGrid, HiOutlinePlusCircle, HiOutlineClipboardList, HiOutlineUser, HiOutlineHome } from 'react-icons/hi';
import { usePathname } from 'next/navigation';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/dashboard/user', icon: HiOutlineHome },
    { label: 'Start Ride', href: '/dashboard/user/new-ride', icon: HiOutlinePlusCircle },
    { label: 'My Rides', href: '/dashboard/user/my-rides', icon: HiOutlineClipboardList },
    { label: 'My Profile', href: '/dashboard/user/profile', icon: HiOutlineUser },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-[#1B262C] flex flex-col">
      {/* Mobile Header (< 768px) */}
      <MobileHeader />

      {/* Desktop / Tablet Top Navigation Header (>= 768px) */}
      <header className="hidden md:block bg-[#1B262C] text-white border-b border-[#0F4C75] sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
              <Image
                src="/logo.png"
                alt="Lakdhanavi Limited"
                width={160}
                height={38}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Sahasdhanavi 350 MW EPC</span>
              <span className="text-[11px] text-[#BBE1FA] block">Passenger & Driver Portal</span>
            </div>
          </div>

          <nav className="flex items-center space-x-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    isActive
                      ? 'bg-[#3282B8] text-white'
                      : 'text-[#BBE1FA]/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            {user?.role === 'admin' && (
              <Link
                href="/dashboard/admin"
                className="px-3 py-1.5 bg-[#0F4C75] hover:bg-[#3282B8] text-white text-xs font-bold rounded-lg flex items-center space-x-1 transition-all"
              >
                <HiOutlineViewGrid className="w-4 h-4" />
                <span>Admin View</span>
              </Link>
            )}

            <button
              onClick={logout}
              className="p-2 text-[#BBE1FA]/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg md:max-w-2xl lg:max-w-3xl w-full mx-auto pb-28 md:pb-10 pt-4 px-4 sm:px-6">
        {children}
      </main>

      {/* Fixed Mobile Bottom Nav (< 768px) */}
      <MobileBottomNav />
    </div>
  );
}

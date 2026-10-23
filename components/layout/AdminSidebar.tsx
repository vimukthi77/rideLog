'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineTruck,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineUserGroup,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import { FaCar, FaUserTie } from 'react-icons/fa';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard/admin', icon: HiOutlineViewGrid },
    { label: 'Vehicles', href: '/dashboard/admin/vehicles', icon: HiOutlineTruck },
    { label: 'Drivers', href: '/dashboard/admin/drivers', icon: FaUserTie },
    { label: 'Users', href: '/dashboard/admin/users', icon: HiOutlineUsers },
    { label: 'Ride Records', href: '/dashboard/admin/rides', icon: HiOutlineClipboardList },
    { label: 'Reports & PDF', href: '/dashboard/admin/reports', icon: HiOutlineDocumentReport },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: HiOutlineCog },
  ];

  return (
    <>
      {/* Mobile Top Bar with Toggle for Admin */}
      <div className="lg:hidden bg-[#1B262C] text-white px-4 py-3 flex items-center justify-between border-b border-[#0F4C75] sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-[#0F4C75] text-[#BBE1FA] hover:text-white"
          >
            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenuAlt2 className="w-6 h-6" />}
          </button>
          <div className="bg-white px-2.5 py-1 rounded-md">
            <Image
              src="/logo.png"
              alt="Lakdhanavi"
              width={120}
              height={28}
              className="h-5 w-auto object-contain"
              priority
            />
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-white block">Admin Console</span>
          <span className="text-[10px] text-[#BBE1FA] block">Sahasdhanavi 350MW</span>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-[#1B262C] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#0F4C75]/60 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header in #0F4C75 as specified */}
          <div className="bg-[#0F4C75] p-5 border-b border-[#3282B8]/40 flex flex-col items-center text-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-md mb-2.5 w-full flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Lakdhanavi Limited"
                width={180}
                height={45}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Lakdhanavi Limited
            </h1>
            <p className="text-[11px] text-[#BBE1FA] font-medium leading-tight mt-0.5">
              Sahasdhanavi 350 MW LNG Power Plant EPC
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#BBE1FA]/60">
              Transport Management
            </span>

            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3282B8] text-white shadow-md shadow-[#3282B8]/30 font-bold'
                      : 'text-[#BBE1FA]/80 hover:text-white hover:bg-[#0F4C75]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Details, Switch to Mobile view, Logout */}
        <div className="p-3 border-t border-[#0F4C75]/80 bg-[#162025] space-y-2">
          {/* Link to Passenger / Mobile View */}
          <Link
            href="/dashboard/user"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#BBE1FA] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <FaCar className="text-[#3282B8]" />
              <span>Mobile User View</span>
            </span>
            <HiOutlineExternalLink className="w-3.5 h-3.5 text-[#BBE1FA]/60" />
          </Link>

          {/* Logged in admin card */}
          <div className="p-2.5 rounded-xl bg-[#0F4C75]/40 border border-[#3282B8]/30 flex items-center justify-between">
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">
                {user?.fullName || 'Administrator'}
              </span>
              <span className="text-[10px] text-[#BBE1FA] block truncate">
                {user?.email || 'admin@lakdhanavi.com'}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#BBE1FA] hover:text-[#E74C3C] hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

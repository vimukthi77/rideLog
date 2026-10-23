'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiOutlineHome,
  HiHome,
  HiOutlinePlus,
  HiOutlineClipboardList,
  HiClipboardList,
  HiOutlineUser,
  HiUser,
} from 'react-icons/hi';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard/user',
      iconOutline: HiOutlineHome,
      iconSolid: HiHome,
    },
    {
      label: 'My Rides',
      href: '/dashboard/user/my-rides',
      iconOutline: HiOutlineClipboardList,
      iconSolid: HiClipboardList,
    },
    {
      label: 'New Ride',
      href: '/dashboard/user/new-ride',
      isAction: true,
    },
    {
      label: 'Profile',
      href: '/dashboard/user/profile',
      iconOutline: HiOutlineUser,
      iconSolid: HiUser,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-0 right-0 z-50 pointer-events-none px-3">
      <nav className="pointer-events-auto max-w-sm mx-auto bg-[#1B262C]/95 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-[#3282B8]/25 flex items-center justify-between relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 py-2 group flex items-center justify-center"
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-bold text-xs text-white shadow-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#27AE60] to-[#219150] shadow-[#27AE60]/40 ring-2 ring-emerald-400/50'
                      : 'bg-gradient-to-r from-[#3282B8] to-[#0F4C75] shadow-[#3282B8]/40 hover:from-[#3282B8] hover:to-[#3282B8]'
                  }`}
                >
                  <HiOutlinePlus className="w-4 h-4 stroke-[2.5]" />
                  <span className="tracking-wide text-[11px] font-extrabold uppercase">
                    New Trip
                  </span>
                </motion.div>
              </Link>
            );
          }

          const IconOutline = item.iconOutline!;
          const IconSolid = item.iconSolid!;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 py-1.5 flex flex-col items-center justify-center transition-all group"
            >
              {/* Smooth animated active pill background */}
              {isActive && (
                <motion.div
                  layoutId="activeMobileTab"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-[#0F4C75] rounded-full -z-10 shadow-inner border border-[#3282B8]/40"
                />
              )}

              <div className="relative flex flex-col items-center justify-center py-0.5">
                {isActive ? (
                  <IconSolid className="w-5 h-5 text-white transition-colors" />
                ) : (
                  <IconOutline className="w-5 h-5 text-[#BBE1FA]/60 group-hover:text-[#BBE1FA] transition-colors" />
                )}

                <span
                  className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-[#BBE1FA]/55 font-medium group-hover:text-[#BBE1FA]'
                  }`}
                >
                  {item.label}
                </span>

                {/* Subtle active indicator dot */}
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#3282B8] mt-0.5" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

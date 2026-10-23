'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PreloaderProps {
  forceShow?: boolean;
  minDuration?: number; // ms
}

export default function Preloader({ forceShow = false, minDuration = 1200 }: PreloaderProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(timer);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    const finishTimeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
      }, 350);
    }, minDuration);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimeout);
    };
  }, [minDuration]);

  if (!loading && !forceShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#1B262C] via-[#0F4C75] to-[#1B262C] px-6 text-center select-none"
      >
        {/* Top Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
        >
          <div className="relative h-12 w-48 sm:h-14 sm:w-56 bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Lakdhanavi Logo"
              width={200}
              height={50}
              className="object-contain max-h-full"
              priority
            />
          </div>
        </motion.div>

        {/* Animated Road & Vehicle */}
        <div className="relative w-full max-w-sm h-28 flex flex-col justify-end items-center overflow-hidden mb-6">
          {/* Moving Vehicle */}
          <motion.div
            initial={{ x: '-150%' }}
            animate={{ x: '150%' }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: 'linear',
            }}
            className="absolute bottom-4 z-10 flex flex-col items-center"
          >
            {/* Custom SVG Vehicle for Lakdhanavi fleet */}
            <div className="relative drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]">
              <svg
                width="72"
                height="36"
                viewBox="0 0 72 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Vehicle Body */}
                <path
                  d="M4 22L12 10H48L58 16L66 18C68 18.5 70 20 70 22V27C70 28.1 69.1 29 68 29H63C63 26.2 60.8 24 58 24C55.2 24 53 26.2 53 29H25C25 26.2 22.8 24 20 24C17.2 24 15 26.2 15 29H4C2.9 29 2 28.1 2 27V24C2 22.9 2.9 22 4 22Z"
                  fill="#3282B8"
                />
                {/* Roof & Cabin */}
                <path
                  d="M14 11L22 4H44L52 11H14Z"
                  fill="#0F4C75"
                />
                {/* Windows */}
                <path
                  d="M16 11L22 6H32V11H16Z"
                  fill="#BBE1FA"
                  opacity="0.85"
                />
                <path
                  d="M34 6H43L48 11H34V6Z"
                  fill="#BBE1FA"
                  opacity="0.85"
                />
                {/* Headlights & Tail Lights */}
                <circle cx="68" cy="22" r="2.5" fill="#FFE600" />
                <rect x="2" y="22" width="3" height="4" rx="1" fill="#E74C3C" />
                {/* Wheels */}
                <circle cx="20" cy="29" r="6" fill="#1B262C" stroke="#BBE1FA" strokeWidth="2" />
                <circle cx="20" cy="29" r="2.5" fill="#BBE1FA" />
                <circle cx="58" cy="29" r="6" fill="#1B262C" stroke="#BBE1FA" strokeWidth="2" />
                <circle cx="58" cy="29" r="2.5" fill="#BBE1FA" />
              </svg>
            </div>
          </motion.div>

          {/* Road Surface */}
          <div className="w-full h-3 bg-[#1B262C] rounded-full border-t border-[#3282B8]/40 relative overflow-hidden">
            {/* Animated Road Markings */}
            <div className="absolute inset-0 road-stripe opacity-80" />
          </div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1.5"
        >
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Lakdhanavi Ride Recording System
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#BBE1FA]/80">
            Sahasdhanavi 350 MW LNG Power Plant EPC Project
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-64 max-w-full mt-6">
          <div className="h-2 w-full bg-[#1B262C]/80 rounded-full overflow-hidden border border-[#3282B8]/30 shadow-inner p-[1px]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#3282B8] to-[#BBE1FA] rounded-full"
              initial={{ width: '10%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#BBE1FA]/70 mt-2 font-mono">
            <span>Kerawalapitiya EPC Transport</span>
            <span>{Math.min(100, progress)}%</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

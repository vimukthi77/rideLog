'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlinePlusCircle,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import { FaCarSide, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';

export default function UserHomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState<any[]>([]);
  const [ongoingRides, setOngoingRides] = useState<any[]>([]);
  const [stats, setStats] = useState({
    ridesThisMonth: 0,
    kmThisMonth: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rides/my-rides?scope=my');
      if (res.ok) {
        const data = await res.json();
        const all = data.rides || [];
        setRides(all.slice(0, 5)); // Last 5 rides
        setOngoingRides(all.filter((r: any) => r.status === 'ongoing'));

        // Calculate this month's stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthRides = all.filter((r: any) => {
          const d = new Date(r.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalKM = thisMonthRides.reduce((sum: number, r: any) => sum + (r.noOfKMDone || 0), 0);

        setStats({
          ridesThisMonth: thisMonthRides.length,
          kmThisMonth: Math.round(totalKM),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1B262C] to-[#0F4C75] text-white p-5 rounded-2xl shadow-md border border-[#3282B8]/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#BBE1FA] uppercase tracking-wider block">
              Sahasdhanavi 350 MW EPC
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
              Hello, {user?.fullName?.split(' ')[0] || 'Team'}! 👋
            </h2>
            <p className="text-xs text-[#BBE1FA]/80 mt-1">
              Department: {user?.department || 'Operations'} • {user?.employeeId || 'Staff'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl text-[#BBE1FA]">
            <FaCarSide />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-[#BBE1FA] block">Total Rides This Month</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-white">{stats.ridesThisMonth}</span>
              <span className="text-xs text-[#BBE1FA]">trips</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-[#BBE1FA] block">Distance Traveled</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-white">{stats.kmThisMonth}</span>
              <span className="text-xs text-[#BBE1FA]">KM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Ride Alert (If Any) */}
      {ongoingRides.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-[#F39C12] bg-[#FFFBF0] rounded-2xl p-4 shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-[#F39C12] font-bold text-sm">
              <FaSpinner className="animate-spin text-base" />
              <span>Trip In Progress</span>
            </div>
            <span className="text-[11px] bg-[#F39C12] text-white px-2 py-0.5 rounded-full font-bold">
              Active Now
            </span>
          </div>

          {ongoingRides.map((ride) => (
            <div key={ride._id} className="space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-[#F39C12]/30 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[#1B262C]">
                      {ride.vehicle?.vehicleName || 'Lakdhanavi Fleet'}
                    </h3>
                    <p className="text-xs font-semibold text-[#0F4C75]">
                      Reg No: {ride.vehicle?.vehicleRegNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#7F8C8D] block">Started At</span>
                    <span className="text-xs font-bold text-[#1B262C] font-mono">{ride.startTime}</span>
                  </div>
                </div>

                <div className="text-xs text-[#1B262C] flex items-center space-x-1.5 pt-1">
                  <HiOutlineLocationMarker className="w-4 h-4 text-[#3282B8] shrink-0" />
                  <span className="truncate font-medium">{ride.placesVisited}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#7F8C8D] pt-1">
                  <span>Driver: <strong className="text-[#1B262C]">{ride.driver?.fullName || 'Assigned'}</strong></span>
                  <span>Start: <strong className="text-[#1B262C]">{ride.startMileageKM} KM</strong></span>
                </div>
              </div>

              <Link
                href={`/dashboard/user/ride/${ride._id}`}
                className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.98]"
              >
                <FaCheckCircle className="text-base" />
                <span>Complete / End This Ride</span>
              </Link>
            </div>
          ))}
        </motion.div>
      )}

      {/* Quick Action: Start New Ride */}
      <Link
        href="/dashboard/user/new-ride"
        className="w-full py-4 px-5 bg-gradient-to-r from-[#3282B8] to-[#0F4C75] text-white rounded-2xl shadow-lg shadow-[#3282B8]/25 flex items-center justify-between group transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            <HiOutlinePlusCircle />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-base text-white">Record New Ride</h3>
            <p className="text-xs text-[#BBE1FA]">Start odometer entry & route assignment</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-white group-hover:text-[#0F4C75] flex items-center justify-center transition-colors">
          <HiOutlineChevronRight className="w-5 h-5" />
        </div>
      </Link>

      {/* Recent Trips Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider flex items-center space-x-2">
            <HiOutlineTrendingUp className="text-[#3282B8] text-base" />
            <span>Recent Ride History</span>
          </h3>
          <Link
            href="/dashboard/user/my-rides"
            className="text-xs font-semibold text-[#3282B8] hover:text-[#0F4C75]"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#7F8C8D] mt-2">Loading ride records...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <FaCarSide className="text-4xl mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-[#1B262C]">No rides recorded yet</p>
            <p className="text-xs text-[#7F8C8D]">Tap &quot;Record New Ride&quot; above to log your first trip.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => {
              const isDone = ride.status === 'completed';
              return (
                <Link
                  key={ride._id}
                  href={`/dashboard/user/ride/${ride._id}`}
                  className={`block p-3.5 rounded-xl border transition-all hover:shadow-md ${
                    isDone
                      ? 'border-[#27AE60]/40 bg-white hover:border-[#27AE60]'
                      : 'border-[#F39C12]/50 bg-[#FFFBF0]'
                  }`}
                >
                  <div className="flex justify-between items-start text-xs">
                    <span className="font-bold text-[#1B262C]">
                      {ride.date ? format(new Date(ride.date), 'MMM dd, yyyy') : 'Recent'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isDone
                          ? 'bg-emerald-100 text-[#27AE60]'
                          : 'bg-amber-100 text-[#F39C12]'
                      }`}
                    >
                      {isDone ? 'Done' : 'Ongoing'}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0F4C75]">
                      {ride.vehicle?.vehicleType} • {ride.vehicle?.vehicleRegNo}
                    </span>
                    {isDone && (
                      <span className="text-xs font-black text-[#1B262C] bg-[#BBE1FA]/40 px-2 py-0.5 rounded">
                        {ride.noOfKMDone} KM
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#7F8C8D] mt-1 truncate flex items-center gap-1">
                    <HiOutlineLocationMarker className="text-[#3282B8] shrink-0" />
                    <span>{ride.placesVisited}</span>
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#7F8C8D] mt-2 pt-2 border-t border-slate-100">
                    <span>Driver: <strong className="text-[#1B262C]">{ride.driver?.fullName}</strong></span>
                    <span className="flex items-center gap-1 font-mono">
                      <HiOutlineClock className="text-[#3282B8]" />
                      {ride.startTime} {ride.endTime ? `- ${ride.endTime}` : ''}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

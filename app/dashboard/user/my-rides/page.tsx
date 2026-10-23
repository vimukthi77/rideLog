'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  HiOutlineFilter,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineChevronRight,
  HiOutlineUser,
} from 'react-icons/hi';
import { FaCarSide, FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function MyRidesPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalRides: 0, totalKM: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [scope, setScope] = useState<'my' | 'all'>('my');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRides = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('scope', scope);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);

      const res = await fetch(`/api/rides/my-rides?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRides(data.rides || []);
        setSummary(data.summary || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [scope, statusFilter, fromDate, toDate]);

  // Client-side text filter
  const filteredRides = rides.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const places = (r.placesVisited || '').toLowerCase();
    const purpose = (r.tripPurpose || '').toLowerCase();
    const regNo = (r.vehicle?.vehicleRegNo || '').toLowerCase();
    const driver = (r.driver?.fullName || '').toLowerCase();
    const passenger = (r.passenger?.fullName || '').toLowerCase();
    return (
      places.includes(term) ||
      purpose.includes(term) ||
      regNo.includes(term) ||
      driver.includes(term) ||
      passenger.includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Scope Toggle & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1B262C]">Ride Logbook</h2>
          <p className="text-xs text-[#7F8C8D]">
            Sahasdhanavi 350 MW CCPP Fleet Records
          </p>
        </div>

        {/* Toggle: "My Rides" / "All Rides" */}
        <div className="bg-[#BBE1FA]/40 p-1 rounded-xl flex border border-[#BBE1FA] self-start sm:self-auto">
          <button
            onClick={() => setScope('my')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scope === 'my'
                ? 'bg-[#0F4C75] text-white shadow-sm'
                : 'text-[#1B262C] hover:text-[#0F4C75]'
            }`}
          >
            My Rides
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scope === 'all'
                ? 'bg-[#0F4C75] text-white shadow-sm'
                : 'text-[#1B262C] hover:text-[#0F4C75]'
            }`}
          >
            All Rides (Fleet)
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#7F8C8D] block">Total Trips</span>
            <span className="text-2xl font-black text-[#1B262C] font-mono">{summary.totalRides || 0}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#BBE1FA]/40 text-[#0F4C75] flex items-center justify-center text-lg">
            <FaCarSide />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#7F8C8D] block">Total KM Traveled</span>
            <span className="text-2xl font-black text-[#0F4C75] font-mono">{Math.round(summary.totalKM || 0)} KM</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#27AE60] flex items-center justify-center text-lg">
            <FaCheckCircle />
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3.5 top-3 text-[#3282B8] w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by destination, vehicle reg, driver..."
            className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-medium text-[#1B262C] outline-none"
          />
        </div>

        {/* Date Pickers & Status Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#BBE1FA] rounded-lg text-xs text-[#1B262C] outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#BBE1FA] rounded-lg text-xs text-[#1B262C] outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">
              Trip Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#BBE1FA] rounded-lg text-xs text-[#1B262C] outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="ongoing">Ongoing Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
        </div>

        {(fromDate || toDate || searchTerm || statusFilter !== 'all') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="text-[11px] font-bold text-[#E74C3C] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Rides List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#7F8C8D] mt-2">Loading ride records...</p>
        </div>
      ) : filteredRides.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
          <FaCarSide className="text-4xl mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-[#1B262C]">No rides match criteria</p>
          <p className="text-xs text-[#7F8C8D] mt-0.5">Try clearing your filters or start a new trip.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRides.map((ride) => {
            const isCompleted = ride.status === 'completed';

            return (
              <motion.div
                key={ride._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/dashboard/user/ride/${ride._id}`}
                  className={`block bg-white p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                    isCompleted
                      ? 'border-[#27AE60] hover:border-[#1E824C]'
                      : 'border-[#F39C12] bg-[#FFFDF7] hover:border-[#D68910]'
                  }`}
                >
                  {/* Top card row: Date and Status */}
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                    <span className="font-bold text-[#1B262C] flex items-center space-x-1.5">
                      <HiOutlineCalendar className="text-[#3282B8]" />
                      <span>{ride.date ? format(new Date(ride.date), 'MMM dd, yyyy') : 'Trip'}</span>
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase flex items-center space-x-1 ${
                        isCompleted
                          ? 'bg-emerald-100 text-[#27AE60]'
                          : 'bg-amber-100 text-[#F39C12]'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60]" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F39C12] animate-ping" />
                          <span>Ongoing</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Vehicle details */}
                  <div className="mt-2.5 flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-[#1B262C]">
                        {ride.vehicle?.vehicleType} - {ride.vehicle?.vehicleRegNo}
                      </h3>
                      <p className="text-[11px] text-[#7F8C8D]">
                        {ride.vehicle?.vehicleName}
                      </p>
                    </div>

                    {isCompleted ? (
                      <span className="px-2.5 py-1 bg-[#BBE1FA]/40 text-[#0F4C75] font-black font-mono text-sm rounded-lg border border-[#BBE1FA]">
                        {ride.noOfKMDone} KM
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#F39C12] bg-amber-50 px-2 py-1 rounded border border-[#F39C12]/40">
                        In Progress
                      </span>
                    )}
                  </div>

                  {/* Driver and Route */}
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 text-[#1B262C]">
                      <HiOutlineUser className="text-[#3282B8] shrink-0" />
                      <span>
                        Driver: <strong className="font-bold">{ride.driver?.fullName}</strong>
                      </span>
                    </div>

                    <div className="flex items-start space-x-1.5 text-[#7F8C8D]">
                      <HiOutlineLocationMarker className="text-[#3282B8] shrink-0 mt-0.5" />
                      <span className="truncate text-[#1B262C] font-medium">
                        {ride.placesVisited}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Stats Footer */}
                  <div className="flex items-center justify-between text-[11px] text-[#7F8C8D] mt-3 pt-2.5 border-t border-slate-100 font-mono">
                    <span className="flex items-center space-x-1">
                      <HiOutlineClock className="text-[#3282B8]" />
                      <span>
                        {ride.startTime} {ride.endTime ? `- ${ride.endTime}` : ''}
                      </span>
                    </span>

                    <span className="flex items-center text-[#3282B8] font-bold font-sans">
                      <span>View details</span>
                      <HiOutlineChevronRight className="w-4 h-4 ml-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

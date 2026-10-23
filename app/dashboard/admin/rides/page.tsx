'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardList,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { FaCarSide, FaSpinner } from 'react-icons/fa';

export default function AdminRidesPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchRides = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);

      const res = await fetch(`/api/rides?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRides(data.rides || []);
        setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ride records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides(1);
  }, [status, fromDate, toDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRides(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B262C]">Master Ride Logbook</h1>
          <p className="text-xs text-[#7F8C8D]">
            Complete permanent database of all digitized vehicle ride records
          </p>
        </div>

        <Link
          href="/dashboard/user/new-ride"
          className="px-4 py-2.5 bg-[#3282B8] hover:bg-[#0F4C75] text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <span>+ Log Trip</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3.5 top-3 text-[#3282B8] w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by route destination, purpose, or authorizing initials..."
              className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-medium text-[#1B262C] outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#0F4C75] hover:bg-[#1B262C] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div>
            <label className="block text-[10px] font-bold text-[#7F8C8D] uppercase mb-1">
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#BBE1FA] rounded-lg text-xs text-[#1B262C] outline-none"
            >
              <option value="all">All Trips</option>
              <option value="ongoing">Ongoing (Active)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

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

          <div className="flex items-end">
            {(search || status !== 'all' || fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                  setFromDate('');
                  setToDate('');
                }}
                className="text-[11px] font-bold text-[#E74C3C] hover:underline pb-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#1B262C] text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3 text-center">Date</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Driver</th>
                <th className="py-3 px-3">Passenger</th>
                <th className="py-3 px-3 text-center">Time</th>
                <th className="py-3 px-3 text-right">Start KM</th>
                <th className="py-3 px-3 text-right">End KM</th>
                <th className="py-3 px-3 text-right bg-[#0F4C75]">KM Done</th>
                <th className="py-3 px-4 min-w-[200px]">Places Visited</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#7F8C8D]">
                    <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-2 text-xs">Loading master logbook records...</p>
                  </td>
                </tr>
              ) : rides.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-[#7F8C8D]">
                    No ride records found matching filters.
                  </td>
                </tr>
              ) : (
                rides.map((r) => {
                  const isDone = r.status === 'completed';
                  return (
                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center font-mono font-medium text-[#1B262C]">
                        {r.date ? format(new Date(r.date), 'MM-dd') : '--'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[#1B262C] font-mono block">
                          {r.vehicle?.vehicleRegNo}
                        </span>
                        <span className="text-[10px] text-[#7F8C8D]">
                          {r.vehicle?.vehicleType}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-[#1B262C]">
                        {r.driver?.fullName || '--'}
                      </td>

                      <td className="py-3 px-3 font-medium text-[#1B262C]">
                        {r.passenger?.fullName || '--'}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        {r.startTime} {r.endTime ? `- ${r.endTime}` : ''}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {r.startMileageKM}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium">
                        {r.endMileageKM ?? '--'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-[#0F4C75] bg-[#BBE1FA]/20">
                        {r.noOfKMDone !== undefined ? `${r.noOfKMDone} KM` : '--'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-[#1B262C] block">
                          {r.placesVisited}
                        </span>
                        {r.tripPurpose && (
                          <span className="text-[10px] text-[#7F8C8D] truncate block">
                            {r.tripPurpose}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isDone
                              ? 'bg-emerald-100 text-[#27AE60]'
                              : r.status === 'ongoing'
                              ? 'bg-amber-100 text-[#F39C12]'
                              : 'bg-red-100 text-[#E74C3C]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <Link
                          href={`/dashboard/user/ride/${r._id}`}
                          className="p-1.5 text-[#3282B8] hover:text-[#0F4C75] hover:bg-slate-100 rounded-lg inline-block"
                          title="View / Complete trip details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-[#7F8C8D]">
          <span>
            Showing {rides.length} of {pagination.total} records (Page {pagination.page} of{' '}
            {pagination.totalPages})
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => fetchRides(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#1B262C] hover:bg-slate-100 disabled:opacity-40"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchRides(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#1B262C] hover:bg-slate-100 disabled:opacity-40"
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

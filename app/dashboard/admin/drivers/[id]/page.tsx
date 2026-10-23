'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { FaUserTie, FaCar } from 'react-icons/fa';

export default function DriverDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;

  const [driver, setDriver] = useState<any>(null);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/drivers/${driverId}`);
        if (res.ok) {
          const data = await res.json();
          setDriver(data.driver);
          setRecentRides(data.recentRides || []);
        } else {
          router.push('/dashboard/admin/drivers');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (driverId) loadData();
  }, [driverId, router]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#7F8C8D] mt-2">Loading driver profile...</p>
      </div>
    );
  }

  if (!driver) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin/drivers"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0F4C75] hover:text-[#3282B8]"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        <span>Back to Driver Roster</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B262C] via-[#0F4C75] to-[#3282B8] p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center text-3xl shadow-inner border border-white/20">
              <FaUserTie />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-[#BBE1FA] text-[#0F4C75] px-2.5 py-0.5 rounded-full uppercase">
                  Driver Crew
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    driver.isAvailable ? 'bg-[#27AE60] text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {driver.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <h1 className="text-2xl font-bold mt-1 text-white">{driver.userId?.fullName}</h1>
              <p className="text-sm font-mono text-[#BBE1FA]">{driver.userId?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[#7F8C8D] block text-[11px]">License Number</span>
            <span className="text-base font-bold font-mono text-[#0F4C75] mt-0.5 block">
              {driver.licenseNumber || 'Not recorded'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[#7F8C8D] block text-[11px]">License Expiry</span>
            <span className="text-sm font-bold font-mono text-slate-700 mt-0.5 block">
              {driver.licenseExpiry ? format(new Date(driver.licenseExpiry), 'dd MMM yyyy') : '--'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[#7F8C8D] block text-[11px]">Phone Contact</span>
            <span className="text-sm font-bold font-mono text-[#1B262C] mt-0.5 block">
              {driver.userId?.phone || '--'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[#7F8C8D] block text-[11px]">Department</span>
            <span className="text-sm font-bold text-[#1B262C] mt-0.5 block">
              {driver.userId?.department || 'Transport'}
            </span>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold text-[#1B262C] uppercase tracking-wider">
            Recent Trips by {driver.userId?.fullName}
          </h3>

          {recentRides.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No trips recorded for this driver yet.</p>
          ) : (
            <div className="space-y-2">
              {recentRides.map((r) => (
                <div
                  key={r._id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#1B262C]">
                        {format(new Date(r.date), 'dd MMM yyyy')}
                      </span>
                      <span className="font-mono text-slate-500">
                        {r.startTime} {r.endTime ? `- ${r.endTime}` : ''}
                      </span>
                      <span className="font-mono font-bold text-[#0F4C75]">
                        [{r.vehicle?.vehicleRegNo || 'Vehicle'}]
                      </span>
                    </div>
                    <p className="text-[#7F8C8D] flex items-center gap-1">
                      <HiOutlineLocationMarker className="text-[#3282B8]" />
                      <span>{r.placesVisited}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-[#0F4C75] block">
                      {r.noOfKMDone !== undefined ? `${r.noOfKMDone} KM` : '--'}
                    </span>
                    <span className="text-[10px] text-[#7F8C8D]">
                      Passenger: {r.passenger?.fullName || '--'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

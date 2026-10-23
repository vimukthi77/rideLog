'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  HiOutlineArrowLeft,
  HiOutlineTruck,
  HiOutlineDocumentReport,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { FaCar, FaGasPump } from 'react-icons/fa';

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<any>(null);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/vehicles/${vehicleId}`);
        if (res.ok) {
          const data = await res.json();
          setVehicle(data.vehicle);
          setRecentRides(data.recentRides || []);
        } else {
          router.push('/dashboard/admin/vehicles');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (vehicleId) loadData();
  }, [vehicleId, router]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#7F8C8D] mt-2">Loading vehicle profile...</p>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/admin/vehicles"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0F4C75] hover:text-[#3282B8]"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        <span>Back to Vehicles Fleet</span>
      </Link>

      {/* Main Vehicle Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B262C] via-[#0F4C75] to-[#3282B8] p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center text-3xl shadow-inner border border-white/20">
              <FaCar />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-[#BBE1FA] text-[#0F4C75] px-2.5 py-0.5 rounded-full uppercase">
                  {vehicle.vehicleType}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    vehicle.isActive ? 'bg-[#27AE60] text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {vehicle.isActive ? 'Active' : 'Deactivated'}
                </span>
              </div>
              <h1 className="text-2xl font-bold mt-1 text-white">{vehicle.vehicleName}</h1>
              <p className="text-sm font-mono text-[#BBE1FA]">Reg No: {vehicle.vehicleRegNo}</p>
            </div>
          </div>

          <Link
            href={`/dashboard/admin/reports?vehicleId=${vehicle._id}`}
            className="px-4 py-2 bg-white text-[#0F4C75] hover:bg-[#BBE1FA] font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-colors"
          >
            <HiOutlineDocumentReport className="w-4 h-4" />
            <span>Vehicle Logbook Report</span>
          </Link>
        </div>

        {/* Specs Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[#7F8C8D] block text-[11px]">Current Odometer</span>
            <span className="text-xl font-black font-mono text-[#0F4C75]">
              {vehicle.currentMeterReading} KM
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[#7F8C8D] block text-[11px]">Initial Base Reading</span>
            <span className="text-xl font-black font-mono text-slate-600">
              {vehicle.initialMeterReading} KM
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[#7F8C8D] block text-[11px]">Fuel Specification</span>
            <span className="text-base font-bold text-[#1B262C] flex items-center gap-1.5 mt-0.5">
              <FaGasPump className="text-[#3282B8]" />
              <span>{vehicle.fuelType}</span>
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[#7F8C8D] block text-[11px]">Registration Date</span>
            <span className="text-sm font-bold text-[#1B262C] mt-0.5 block">
              {vehicle.createdAt ? format(new Date(vehicle.createdAt), 'dd MMM yyyy') : '--'}
            </span>
          </div>
        </div>

        {/* Assigned Drivers */}
        <div className="p-6 border-b border-slate-100 text-xs">
          <h3 className="text-xs font-bold text-[#1B262C] uppercase tracking-wider mb-2">
            Assigned Drivers
          </h3>
          {vehicle.assignedDrivers && vehicle.assignedDrivers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {vehicle.assignedDrivers.map((d: any) => (
                <div
                  key={d._id}
                  className="px-3 py-1.5 bg-[#BBE1FA]/30 border border-[#BBE1FA] text-[#0F4C75] rounded-xl font-bold flex items-center space-x-1"
                >
                  <span>{d.fullName}</span>
                  {d.phone && <span className="font-mono text-slate-500 font-normal">({d.phone})</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No dedicated driver assigned. Open for general fleet allocation.</p>
          )}
        </div>

        {/* Recent Trips */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold text-[#1B262C] uppercase tracking-wider">
            Recent Trips Logged for {vehicle.vehicleRegNo}
          </h3>

          {recentRides.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No trips recorded for this vehicle yet.</p>
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
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'completed'
                            ? 'bg-emerald-100 text-[#27AE60]'
                            : 'bg-amber-100 text-[#F39C12]'
                        }`}
                      >
                        {r.status}
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
                      Driver: {r.driver?.fullName || '--'}
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

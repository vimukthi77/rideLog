'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  HiOutlineCalendar,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlinePencilAlt,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import { FaCar, FaRocket } from 'react-icons/fa';
import Link from 'next/link';

export default function NewRidePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [authorizingOfficer, setAuthorizingOfficer] = useState('');
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [startMileageKM, setStartMileageKM] = useState<number | string>('');
  const [placesVisited, setPlacesVisited] = useState('');
  const [tripPurpose, setTripPurpose] = useState('');

  // Fetch active vehicles & drivers
  useEffect(() => {
    async function loadData() {
      try {
        const [vehRes, drvRes] = await Promise.all([
          fetch('/api/vehicles?activeOnly=true'),
          fetch('/api/drivers?activeOnly=true'),
        ]);

        if (vehRes.ok) {
          const vehData = await vehRes.json();
          setVehicles(vehData.vehicles || []);

          // Auto-select first available vehicle if any
          const available = (vehData.vehicles || []).find((v: any) => !v.isCurrentlyInUse);
          if (available) {
            setSelectedVehicleId(available._id);
            setStartMileageKM(available.currentMeterReading || available.initialMeterReading || 0);

            // If vehicle has assigned drivers, pick the first
            if (available.assignedDrivers && available.assignedDrivers.length > 0) {
              setSelectedDriverId(available.assignedDrivers[0]._id || available.assignedDrivers[0]);
            }
          }
        }

        if (drvRes.ok) {
          const drvData = await drvRes.json();
          const driverList = drvData.drivers || [];
          setDrivers(driverList);
          if (!selectedDriverId && driverList.length > 0) {
            setSelectedDriverId(driverList[0].userId?._id || driverList[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load fleet data.');
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // When vehicle changes, update start odometer
  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const found = vehicles.find((v) => v._id === vId);
    if (found) {
      setStartMileageKM(found.currentMeterReading ?? found.initialMeterReading ?? 0);
      if (found.assignedDrivers && found.assignedDrivers.length > 0) {
        const driverObj = found.assignedDrivers[0];
        setSelectedDriverId(driverObj._id || driverObj);
      }
    }
  };

  const selectedVehicleObj = vehicles.find((v) => v._id === selectedVehicleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicleId) {
      toast.error('Please select a vehicle.');
      return;
    }
    if (!selectedDriverId) {
      toast.error('Please select a driver.');
      return;
    }
    if (!startTime) {
      toast.error('Please enter start time.');
      return;
    }
    if (startMileageKM === '' || isNaN(Number(startMileageKM))) {
      toast.error('Please provide a valid starting odometer reading.');
      return;
    }
    if (!placesVisited.trim()) {
      toast.error('Please specify the places to visit / route.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          driverId: selectedDriverId,
          authorizingOfficer: authorizingOfficer.trim(),
          startTime,
          startMileageKM: Number(startMileageKM),
          placesVisited: placesVisited.trim(),
          tripPurpose: tripPurpose.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start ride.');
      }

      toast.success('🚀 Ride started successfully!');
      router.push(`/dashboard/user/ride/${data.ride._id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error creating ride record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#1B262C] mt-3">Loading Vehicle Fleet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Link
        href="/dashboard/user"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0F4C75] hover:text-[#3282B8]"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md border border-[#BBE1FA] overflow-hidden"
      >
        {/* Form Header */}
        <div className="bg-gradient-to-r from-[#1B262C] to-[#0F4C75] text-white p-5 border-b border-[#3282B8]/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl text-[#BBE1FA]">
              <FaCar />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                New Ride Record
              </h2>
              <p className="text-xs text-[#BBE1FA]/80">
                Lakdhanavi Transport Logbook Entry
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* 1. Date (Read-only, auto-filled) */}
          <div className="bg-[#BBE1FA]/20 p-3.5 rounded-xl border border-[#BBE1FA] flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#0F4C75]">
              <HiOutlineCalendar className="w-5 h-5 text-[#3282B8]" />
              <span>Date:</span>
            </div>
            <div className="text-xs font-bold font-mono text-[#1B262C] bg-white px-3 py-1 rounded-lg border border-[#BBE1FA]">
              {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </div>
          </div>

          {/* 2. Select Vehicle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
              Select Vehicle <span className="text-[#E74C3C]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                <HiOutlineTruck className="w-5 h-5" />
              </span>
              <select
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-semibold text-[#1B262C] outline-none"
              >
                <option value="">-- Choose Assigned Fleet Vehicle --</option>
                {vehicles.map((v) => (
                  <option
                    key={v._id}
                    value={v._id}
                    disabled={v.isCurrentlyInUse}
                  >
                    {v.vehicleType} - {v.vehicleRegNo} ({v.vehicleName}) {v.isCurrentlyInUse ? '⚠️ (In Use)' : `[${v.currentMeterReading} KM]`}
                  </option>
                ))}
              </select>
            </div>

            {selectedVehicleObj?.isCurrentlyInUse && (
              <p className="text-xs text-[#E74C3C] font-semibold mt-1">
                ⚠️ This vehicle is currently in use on an ongoing trip.
              </p>
            )}
          </div>

          {/* 3. Select Driver */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
              Select Driver <span className="text-[#E74C3C]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                <HiOutlineUser className="w-5 h-5" />
              </span>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-semibold text-[#1B262C] outline-none"
              >
                <option value="">-- Choose Driver --</option>
                {drivers.map((d) => {
                  const uId = d.userId?._id || d.userId;
                  const name = d.userId?.fullName || 'Driver';
                  return (
                    <option key={d._id} value={uId}>
                      {name} {d.isCurrentlyOnTrip ? '⚠️ (On Trip)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* 4. Authorizing Officer Initials & Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
                Authorizing Officer Initials
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                  <HiOutlinePencilAlt className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={authorizingOfficer}
                  onChange={(e) => setAuthorizingOfficer(e.target.value.toUpperCase())}
                  placeholder="e.g. KN, HM, PR"
                  maxLength={6}
                  className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-semibold text-[#1B262C] uppercase outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
                Start Time <span className="text-[#E74C3C]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                  <HiOutlineClock className="w-5 h-5" />
                </span>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-semibold text-[#1B262C] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* 5. Start Mileage (KM) - Pre-filled */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C]">
                Start Mileage (KM Reading) <span className="text-[#E74C3C]">*</span>
              </label>
              <span className="text-[11px] text-[#3282B8] font-semibold">
                Auto-filled from vehicle odometer
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                required
                min={0}
                value={startMileageKM}
                onChange={(e) => setStartMileageKM(e.target.value)}
                placeholder="e.g. 9178"
                className="w-full px-4 py-3 bg-[#BBE1FA]/20 border-2 border-[#3282B8] focus:bg-white rounded-xl text-lg font-black text-[#1B262C] font-mono outline-none"
              />
              <span className="absolute right-4 top-3.5 text-xs font-black text-[#0F4C75]">
                KM
              </span>
            </div>
          </div>

          {/* 6. Places Visited / Route */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
              Places Visited / Route <span className="text-[#E74C3C]">*</span>
            </label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-[#3282B8]">
                <HiOutlineLocationMarker className="w-5 h-5" />
              </span>
              <textarea
                required
                rows={2}
                value={placesVisited}
                onChange={(e) => setPlacesVisited(e.target.value)}
                placeholder="e.g. Kerawalapitiya Site to Kadawatha, Site to Colombo"
                className="w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-medium text-[#1B262C] outline-none resize-none"
              />
            </div>
          </div>

          {/* 7. Trip Purpose */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
              Trip Purpose / Reason
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                <HiOutlineDocumentText className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={tripPurpose}
                onChange={(e) => setTripPurpose(e.target.value)}
                placeholder="e.g. EPC Project Review, Site Equipment Procurement"
                className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-medium text-[#1B262C] outline-none"
              />
            </div>
          </div>

          {/* START RIDE Button in #3282B8 */}
          <button
            type="submit"
            disabled={submitting || selectedVehicleObj?.isCurrentlyInUse}
            className="w-full py-4 px-6 bg-[#3282B8] hover:bg-[#0F4C75] text-white font-bold text-base rounded-2xl shadow-xl shadow-[#3282B8]/40 flex items-center justify-center space-x-2.5 transition-all transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaRocket className="text-lg" />
                <span>START RIDE</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

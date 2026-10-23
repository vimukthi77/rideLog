'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlinePencilAlt,
  HiOutlineDocumentReport,
} from 'react-icons/hi';
import { FaFlagCheckered, FaCheck } from 'react-icons/fa';

export default function RideDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.id as string;

  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Complete Ride form fields
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [endMileageKM, setEndMileageKM] = useState<number | string>('');
  const [otHours, setOtHours] = useState<number | string>(0);
  const [driverSignature, setDriverSignature] = useState(true);
  const [passengerSignature, setPassengerSignature] = useState(true);

  // Fetch ride
  const fetchRide = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rides/${rideId}`);
      if (res.ok) {
        const data = await res.json();
        setRide(data.ride);
        if (data.ride.endMileageKM) {
          setEndMileageKM(data.ride.endMileageKM);
        }
        if (data.ride.endTime) {
          setEndTime(data.ride.endTime);
        }
        if (data.ride.otHours !== undefined) {
          setOtHours(data.ride.otHours);
        }
      } else {
        toast.error('Ride record not found');
        router.push('/dashboard/user/my-rides');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ride record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rideId) fetchRide();
  }, [rideId]);

  // Compute distance traveled dynamically
  const startKM = ride ? Number(ride.startMileageKM) : 0;
  const currentEndKM = Number(endMileageKM);
  const calculatedDistance =
    !isNaN(currentEndKM) && currentEndKM >= startKM
      ? Math.round(currentEndKM - startKM)
      : null;

  const handleCompleteRide = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!endTime) {
      toast.error('Please specify the end time.');
      return;
    }

    if (endMileageKM === '' || isNaN(currentEndKM)) {
      toast.error('Please enter the end mileage reading.');
      return;
    }

    if (currentEndKM < startKM) {
      toast.error(`End mileage (${currentEndKM} KM) cannot be less than start mileage (${startKM} KM).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          endTime,
          endMileageKM: currentEndKM,
          otHours: Number(otHours) || 0,
          driverSignature,
          passengerSignature,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete ride.');
      }

      toast.success('🎉 Ride successfully completed and odometer updated!');
      setRide(data.ride);
    } catch (err: any) {
      toast.error(err.message || 'Error completing ride');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#1B262C] mt-3">Loading Ride Record...</p>
      </div>
    );
  }

  if (!ride) return null;

  const isCompleted = ride.status === 'completed';

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Link
        href="/dashboard/user/my-rides"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0F4C75] hover:text-[#3282B8]"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        <span>Back to Rides</span>
      </Link>

      {/* Ride Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        {/* Header Banner */}
        <div
          className={`p-5 text-white ${
            isCompleted
              ? 'bg-gradient-to-r from-[#1B262C] via-[#0F4C75] to-[#27AE60]'
              : 'bg-gradient-to-r from-[#1B262C] via-[#0F4C75] to-[#F39C12]'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold text-[#BBE1FA] uppercase tracking-wider block">
                Trip Record • {format(new Date(ride.date), 'dd MMMM yyyy')}
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {ride.vehicle?.vehicleName || 'Lakdhanavi Fleet'}
              </h2>
              <p className="text-xs font-mono text-[#BBE1FA]">
                Reg No: {ride.vehicle?.vehicleRegNo} ({ride.vehicle?.vehicleType})
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCompleted
                  ? 'bg-[#27AE60] text-white shadow-md'
                  : 'bg-[#F39C12] text-white animate-pulse'
              }`}
            >
              {isCompleted ? 'Completed' : 'Ongoing'}
            </span>
          </div>
        </div>

        {/* Ride Meta Grid */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-[#7F8C8D] block font-medium">Assigned Driver</span>
              <span className="font-bold text-[#1B262C] block mt-0.5">{ride.driver?.fullName}</span>
              <span className="text-[10px] text-[#7F8C8D] font-mono">{ride.driver?.phone || 'No phone'}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-[#7F8C8D] block font-medium">Passenger (Responsible)</span>
              <span className="font-bold text-[#1B262C] block mt-0.5">{ride.passenger?.fullName}</span>
              <span className="text-[10px] text-[#7F8C8D]">{ride.passenger?.department || 'Staff'}</span>
            </div>
          </div>

          <div className="bg-[#BBE1FA]/20 p-3.5 rounded-xl border border-[#BBE1FA] text-xs space-y-2">
            <div className="flex items-start space-x-2">
              <HiOutlineLocationMarker className="w-5 h-5 text-[#3282B8] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F4C75] block">Places Visited / Route:</span>
                <span className="text-[#1B262C] font-medium">{ride.placesVisited}</span>
              </div>
            </div>

            {ride.tripPurpose && (
              <div className="pt-2 border-t border-[#BBE1FA]/50 text-xs">
                <span className="font-bold text-[#0F4C75]">Trip Purpose: </span>
                <span className="text-[#1B262C]">{ride.tripPurpose}</span>
              </div>
            )}

            {ride.authorizingOfficer && (
              <div className="text-xs">
                <span className="font-bold text-[#0F4C75]">Authorizing Officer: </span>
                <span className="font-mono font-bold text-[#1B262C] bg-white px-2 py-0.5 rounded border border-[#BBE1FA]">
                  {ride.authorizingOfficer}
                </span>
              </div>
            )}
          </div>

          {/* Odometer & Timing Summary (if completed) */}
          {isCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-3">
              <span className="text-xs font-bold text-[#27AE60] uppercase tracking-wider block">
                Trip Distance Summary
              </span>
              <div className="py-2 px-4 bg-white rounded-xl border border-emerald-200 shadow-sm inline-block">
                <span className="text-3xl font-black text-[#1B262C] font-mono">
                  {ride.noOfKMDone} KM
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-emerald-100">
                <div>
                  <span className="text-[10px] text-emerald-700 block">Start Mileage</span>
                  <span className="font-bold font-mono text-[#1B262C]">{ride.startMileageKM} KM</span>
                  <span className="text-[10px] text-slate-500 block font-mono">{ride.startTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block">End Mileage</span>
                  <span className="font-bold font-mono text-[#1B262C]">{ride.endMileageKM} KM</span>
                  <span className="text-[10px] text-slate-500 block font-mono">{ride.endTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block">OT Hours</span>
                  <span className="font-bold font-mono text-[#1B262C]">{ride.otHours || 0} hrs</span>
                  <span className="text-[10px] text-emerald-600 block">Logged</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Complete Ride Form (If status is ongoing) */}
      {!isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md border-2 border-[#3282B8] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#1B262C] to-[#0F4C75] text-white p-4 flex items-center space-x-2">
            <FaFlagCheckered className="text-lg text-[#BBE1FA]" />
            <h3 className="font-bold text-sm tracking-wide">
              Complete & End Trip
            </h3>
          </div>

          <form onSubmit={handleCompleteRide} className="p-5 space-y-4">
            {/* End Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
                End Time <span className="text-[#E74C3C]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3282B8]">
                  <HiOutlineClock className="w-5 h-5" />
                </span>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-semibold text-[#1B262C] outline-none font-mono"
                />
              </div>
            </div>

            {/* End Mileage */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C]">
                  End Mileage (KM Reading) <span className="text-[#E74C3C]">*</span>
                </label>
                <span className="text-[11px] text-[#7F8C8D]">
                  Start was: <strong className="text-[#1B262C]">{ride.startMileageKM} KM</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={startKM}
                  value={endMileageKM}
                  onChange={(e) => setEndMileageKM(e.target.value)}
                  placeholder={`Must be ≥ ${startKM}`}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#3282B8] focus:bg-white rounded-xl text-lg font-black text-[#1B262C] font-mono outline-none"
                />
                <span className="absolute right-4 top-3.5 text-xs font-black text-[#0F4C75]">
                  KM
                </span>
              </div>
            </div>

            {/* Auto-calculated Distance Traveled - Highlighted Box as requested */}
            <div className="bg-[#BBE1FA]/30 border-2 border-[#3282B8] rounded-2xl p-4 text-center shadow-inner">
              <span className="text-xs font-bold text-[#0F4C75] uppercase tracking-wider block">
                📊 Distance Traveled (Auto-Calculated)
              </span>
              <div className="mt-2 py-2 px-6 bg-white rounded-xl border border-[#3282B8]/40 shadow-sm inline-block">
                {calculatedDistance !== null ? (
                  <span className="text-3xl sm:text-4xl font-black text-[#0F4C75] font-mono">
                    {calculatedDistance} KM
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-[#7F8C8D]">
                    Enter end mileage reading above
                  </span>
                )}
              </div>
            </div>

            {/* OT Hours */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B262C] mb-1">
                Overtime (OT) Hours
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={otHours}
                onChange={(e) => setOtHours(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] focus:bg-white rounded-xl text-sm font-semibold text-[#1B262C] outline-none font-mono"
              />
            </div>

            {/* Digital Signature Confirmation Checkboxes */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center space-x-2.5 text-xs font-medium text-[#1B262C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={passengerSignature}
                  onChange={(e) => setPassengerSignature(e.target.checked)}
                  className="rounded border-[#BBE1FA] text-[#3282B8] focus:ring-[#3282B8]"
                />
                <span>Confirm Passenger signature & odometer accuracy</span>
              </label>
              <label className="flex items-center space-x-2.5 text-xs font-medium text-[#1B262C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={driverSignature}
                  onChange={(e) => setDriverSignature(e.target.checked)}
                  className="rounded border-[#BBE1FA] text-[#3282B8] focus:ring-[#3282B8]"
                />
                <span>Confirm Driver handover signature</span>
              </label>
            </div>

            {/* COMPLETE RIDE Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-[#27AE60] hover:bg-[#219150] text-white font-bold text-base rounded-2xl shadow-xl shadow-[#27AE60]/30 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaCheck className="text-base" />
                  <span>COMPLETE RIDE</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiOutlineTruck,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineExternalLink,
  HiOutlineDocumentReport,
} from 'react-icons/hi';
import { FaCar, FaUserTie, FaRoad, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import VehicleKMChart from '@/components/dashboard/VehicleKMChart';
import DriverKMChart from '@/components/dashboard/DriverKMChart';
import DailyRidesChart from '@/components/dashboard/DailyRidesChart';
import VehicleUsagePieChart from '@/components/dashboard/VehicleUsagePieChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes, vehRes, drvRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/charts'),
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s.stats);
      }
      if (chartsRes.ok) {
        const c = await chartsRes.json();
        setChartData(c);
      }
      if (vehRes.ok) {
        const v = await vehRes.json();
        setVehicles(v.vehicles || []);
      }
      if (drvRes.ok) {
        const d = await drvRes.json();
        setDrivers(d.drivers || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B262C]">
            Transport Fleet Dashboard
          </h1>
          <p className="text-xs text-[#7F8C8D]">
            Lakdhanavi Limited • Sahasdhanavi 350 MW LNG Power Plant EPC Project
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#BBE1FA]/40 text-[#0F4C75] rounded-xl text-xs font-bold border border-[#BBE1FA]">
            <HiOutlineCalendar className="w-4 h-4 text-[#3282B8]" />
            <span>Cycle: {stats?.currentMonth || 'Current Month'}</span>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-100 text-[#1B262C] border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center"
            title="Refresh statistics"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Stats Cards (4 cards in a row with #BBE1FA accent stripe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Vehicles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          {/* Top Accent Stripe in #BBE1FA */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#BBE1FA] group-hover:bg-[#3282B8] transition-colors" />

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7F8C8D]">
                Total Vehicles
              </span>
              <div className="text-3xl font-black text-[#1B262C] font-mono mt-1">
                {stats?.totalVehicles ?? '--'}
              </div>
              <span className="text-[11px] text-[#27AE60] font-semibold mt-1 block">
                ● Registered Fleet
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#3282B8]/15 text-[#3282B8] flex items-center justify-center text-2xl">
              <FaCar />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Active Drivers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#BBE1FA] group-hover:bg-[#0F4C75] transition-colors" />

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7F8C8D]">
                Active Drivers
              </span>
              <div className="text-3xl font-black text-[#1B262C] font-mono mt-1">
                {stats?.activeDrivers ?? '--'}
              </div>
              <span className="text-[11px] text-[#0F4C75] font-semibold mt-1 block">
                ● Licensed Crew
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#0F4C75]/15 text-[#0F4C75] flex items-center justify-center text-2xl">
              <FaUserTie />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Total KM This Month */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#BBE1FA] group-hover:bg-[#3282B8] transition-colors" />

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7F8C8D]">
                Total KM This Month
              </span>
              <div className="text-3xl font-black text-[#0F4C75] font-mono mt-1">
                {stats ? stats.totalKMThisMonth.toLocaleString() : '--'}
                <span className="text-sm font-bold text-[#7F8C8D] ml-1">KM</span>
              </div>
              <span className="text-[11px] text-[#3282B8] font-semibold mt-1 block">
                Auto-resets monthly
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#BBE1FA]/40 text-[#0F4C75] flex items-center justify-center text-2xl">
              <FaRoad />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Rides This Month */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#BBE1FA] group-hover:bg-[#27AE60] transition-colors" />

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7F8C8D]">
                Rides This Month
              </span>
              <div className="text-3xl font-black text-[#1B262C] font-mono mt-1">
                {stats?.ridesCountThisMonth ?? '--'}
              </div>
              <span className="text-[11px] text-[#27AE60] font-semibold mt-1 block">
                {stats?.completedRidesThisMonth ?? 0} Completed • {stats?.ongoingRidesCount ?? 0} Ongoing
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#27AE60] flex items-center justify-center text-2xl">
              <HiOutlineClipboardList />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ongoing Ride Alert if any */}
      {stats?.ongoingRidesCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-amber-800 font-semibold">
            <FaSpinner className="animate-spin text-amber-600 text-sm" />
            <span>
              There {stats.ongoingRidesCount === 1 ? 'is 1 active vehicle ride' : `are ${stats.ongoingRidesCount} active vehicle rides`} currently in progress on site.
            </span>
          </div>
          <Link
            href="/dashboard/admin/rides?status=ongoing"
            className="text-amber-900 font-bold hover:underline"
          >
            Monitor Live Trips →
          </Link>
        </div>
      )}

      {/* Charts Section: 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Vehicle KM Usage (Bar Chart) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider">
                Vehicle Kilometers - This Month
              </h2>
              <p className="text-[11px] text-[#7F8C8D]">
                Total distance covered per fleet vehicle
              </p>
            </div>
            <span className="text-xs font-bold font-mono text-[#3282B8] bg-[#BBE1FA]/30 px-2.5 py-1 rounded-lg">
              KM Usage
            </span>
          </div>

          <VehicleKMChart data={chartData?.vehicleKM || []} />
        </div>

        {/* Chart 2: Driver KM Usage (Bar Chart) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider">
                Driver Kilometers - This Month
              </h2>
              <p className="text-[11px] text-[#7F8C8D]">
                Operational distance driven per driver
              </p>
            </div>
            <span className="text-xs font-bold font-mono text-[#0F4C75] bg-[#BBE1FA]/30 px-2.5 py-1 rounded-lg">
              Crew Activity
            </span>
          </div>

          <DriverKMChart data={chartData?.driverKM || []} />
        </div>

        {/* Chart 3: Daily Rides Trend (Line Chart) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider">
                Daily Ride Trends
              </h2>
              <p className="text-[11px] text-[#7F8C8D]">
                Number of logged trips per day across current month
              </p>
            </div>
            <span className="text-xs font-bold font-mono text-[#3282B8] bg-[#BBE1FA]/30 px-2.5 py-1 rounded-lg">
              Trip Frequency
            </span>
          </div>

          <DailyRidesChart data={chartData?.dailyTrend || []} />
        </div>

        {/* Chart 4: Vehicle Usage Pie Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider">
                Vehicle Usage Distribution
              </h2>
              <p className="text-[11px] text-[#7F8C8D]">
                Percentage fleet share of total monthly kilometers
              </p>
            </div>
            <span className="text-xs font-bold font-mono text-[#0F4C75] bg-[#BBE1FA]/30 px-2.5 py-1 rounded-lg">
              Fleet Share
            </span>
          </div>

          <VehicleUsagePieChart data={chartData?.vehiclePie || []} />
        </div>
      </div>

      {/* Vehicle Fleet Cards Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider">
              Fleet Vehicles & Status
            </h2>
            <p className="text-xs text-[#7F8C8D]">
              Real-time odometer readings and monthly kilometer consumption
            </p>
          </div>
          <Link
            href="/dashboard/admin/vehicles"
            className="text-xs font-bold text-[#3282B8] hover:text-[#0F4C75]"
          >
            Manage Fleet →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            // Find stats for this vehicle
            const vKM =
              chartData?.vehicleKM?.find((item: any) => item.shortName === v.vehicleRegNo)?.km || 0;
            const maxKM = Math.max(1, ...(chartData?.vehicleKM?.map((x: any) => x.km) || [100]));
            const pct = Math.min(100, Math.round((vKM / maxKM) * 100));

            return (
              <div
                key={v._id}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#3282B8] transition-all bg-white shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#0F4C75] uppercase px-2 py-0.5 rounded bg-[#BBE1FA]/40 border border-[#BBE1FA]">
                      {v.vehicleType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        v.isCurrentlyInUse
                          ? 'bg-amber-100 text-[#F39C12]'
                          : 'bg-emerald-100 text-[#27AE60]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${v.isCurrentlyInUse ? 'bg-[#F39C12] animate-ping' : 'bg-[#27AE60]'}`} />
                      {v.isCurrentlyInUse ? 'In Use' : 'Available'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1B262C] mt-2">
                    {v.vehicleName}
                  </h3>
                  <p className="text-xs font-mono font-bold text-[#3282B8]">
                    Reg: {v.vehicleRegNo}
                  </p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#7F8C8D]">Odometer Reading:</span>
                      <span className="font-bold font-mono text-[#1B262C]">{v.currentMeterReading} KM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7F8C8D]">This Month KM:</span>
                      <span className="font-bold font-mono text-[#0F4C75]">{vKM} KM</span>
                    </div>

                    {/* Progress bar of usage */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-[#3282B8] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <Link
                    href={`/dashboard/admin/vehicles/${v._id}`}
                    className="py-1.5 text-center font-bold text-[#1B262C] bg-slate-100 hover:bg-[#BBE1FA]/60 rounded-lg transition-colors"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/dashboard/admin/reports?vehicleId=${v._id}`}
                    className="py-1.5 text-center font-bold text-white bg-[#3282B8] hover:bg-[#0F4C75] rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <HiOutlineDocumentReport className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Fleet Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider">
              Assigned Drivers & Activity
            </h2>
            <p className="text-xs text-[#7F8C8D]">
              Crew availability and monthly operational hours
            </p>
          </div>
          <Link
            href="/dashboard/admin/drivers"
            className="text-xs font-bold text-[#3282B8] hover:text-[#0F4C75]"
          >
            Manage Drivers →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <div
              key={d._id}
              className="p-4 rounded-xl border border-slate-200 hover:border-[#0F4C75] transition-all bg-white shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#0F4C75]/15 text-[#0F4C75] flex items-center justify-center font-bold text-base">
                    {d.userId?.fullName?.charAt(0) || 'D'}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.isCurrentlyOnTrip
                        ? 'bg-amber-100 text-[#F39C12]'
                        : 'bg-emerald-100 text-[#27AE60]'
                    }`}
                  >
                    {d.isCurrentlyOnTrip ? 'On Trip' : 'Available'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1B262C] mt-2">
                  {d.userId?.fullName}
                </h3>
                <p className="text-[11px] text-[#7F8C8D] font-mono">
                  License: {d.licenseNumber || 'Verified'}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#7F8C8D]">Monthly Distance:</span>
                    <span className="font-bold font-mono text-[#0F4C75]">{d.totalKMThisMonth || 0} KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7F8C8D]">Trips Completed:</span>
                    <span className="font-bold font-mono text-[#1B262C]">{d.totalTripsThisMonth || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[11px] text-[#7F8C8D]">
                  Phone: <strong className="text-[#1B262C]">{d.userId?.phone || 'N/A'}</strong>
                </span>
                <Link
                  href={`/dashboard/admin/drivers/${d._id}`}
                  className="font-bold text-[#3282B8] hover:underline"
                >
                  Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

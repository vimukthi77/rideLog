'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  HiOutlineDocumentReport,
  HiOutlineDownload,
  HiOutlineFilter,
  HiOutlineTruck,
  HiOutlineCalendar,
  HiOutlineTable,
} from 'react-icons/hi';
import { FaFilePdf, FaFileExcel, FaPrint } from 'react-icons/fa';
import { generateVehicleLogbookPDF } from '@/components/reports/PDFGenerator';

export default function AdminReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#7F8C8D] mt-2">Loading reports module...</p>
        </div>
      }
    >
      <AdminReportsContent />
    </Suspense>
  );
}

function AdminReportsContent() {
  const searchParams = useSearchParams();
  const initialVehicleId = searchParams.get('vehicleId') || '';

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
  });
  const [toDate, setToDate] = useState(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Load vehicles list
  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch('/api/vehicles');
        if (res.ok) {
          const data = await res.json();
          setVehicles(data.vehicles || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadVehicles();
  }, []);

  // Fetch report data
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedVehicleId) params.set('vehicleId', selectedVehicleId);
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);

      const res = await fetch(`/api/rides/report?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await res.json();
      setReportData(data);
      toast.success(`Generated report with ${data.rides?.length || 0} trip records.`);
    } catch (err: any) {
      toast.error(err.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [selectedVehicleId]);

  // CSV Export
  const handleExportCSV = () => {
    if (!reportData?.rides || reportData.rides.length === 0) {
      toast.error('No data available to export');
      return;
    }

    const headers = [
      'Date',
      'Initials of Officer Authorizing the Trip',
      'Start Time',
      'End Time',
      'Start Mileage KM Reading',
      'End Mileage KM Reading',
      'No of KM Done',
      'Driver Name',
      'Name of Person Traveling (Responsible)',
      'Places Visited',
      'Trip Purpose',
      'OT Hours',
      'Status',
    ];

    const rows = reportData.rides.map((r: any) => [
      r.date ? format(new Date(r.date), 'yyyy-MM-dd') : '',
      `"${r.authorizingOfficer || ''}"`,
      r.startTime || '',
      r.endTime || '',
      r.startMileageKM ?? '',
      r.endMileageKM ?? '',
      r.noOfKMDone ?? '',
      `"${r.driver?.fullName || ''}"`,
      `"${r.passenger?.fullName || ''}"`,
      `"${(r.placesVisited || '').replace(/"/g, '""')}"`,
      `"${(r.tripPurpose || '').replace(/"/g, '""')}"`,
      r.otHours || 0,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Lakdhanavi_Logbook_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!reportData?.rides || reportData.rides.length === 0) {
      toast.error('No trip records to include in PDF');
      return;
    }

    try {
      await generateVehicleLogbookPDF({
        vehicle: reportData.vehicle,
        rides: reportData.rides,
        summary: reportData.summary,
        fromDate,
        toDate,
      });
      toast.success('PDF Logbook successfully downloaded!');
    } catch (e: any) {
      toast.error('Failed to generate PDF: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B262C]">
            Vehicle Ride Logbook Reports
          </h1>
          <p className="text-xs text-[#7F8C8D]">
            Official logbook documentation for Sahasdhanavi 350 MW CCPP Project
          </p>
        </div>

        {reportData && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#1B262C] font-bold text-xs rounded-xl border border-slate-200 shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <FaFileExcel className="text-emerald-600 text-sm" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-[#0F4C75] hover:bg-[#1B262C] text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all"
            >
              <FaFilePdf className="text-sm text-red-400" />
              <span>Download PDF (A4 Landscape)</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B262C] flex items-center space-x-2">
          <HiOutlineFilter className="text-[#3282B8] text-base" />
          <span>Report Parameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Select Vehicle */}
          <div>
            <label className="block text-[11px] font-bold text-[#1B262C] mb-1">
              Select Vehicle
            </label>
            <div className="relative">
              <HiOutlineTruck className="absolute left-3 top-3 text-[#3282B8] w-4 h-4" />
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-semibold text-[#1B262C] outline-none"
              >
                <option value="">-- All Fleet Vehicles --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleRegNo} ({v.vehicleType} - {v.vehicleName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-bold text-[#1B262C] mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-semibold text-[#1B262C] outline-none"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-bold text-[#1B262C] mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-semibold text-[#1B262C] outline-none"
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#3282B8] hover:bg-[#0F4C75] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineDocumentReport className="w-4 h-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Official Logbook Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header Details */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#1B262C] uppercase tracking-wider flex items-center gap-2">
              <HiOutlineTable className="text-[#3282B8]" />
              <span>Logbook Records (Paper-Form Mirror)</span>
            </h2>
            <p className="text-xs text-[#7F8C8D]">
              Vehicle:{' '}
              <strong className="text-[#0F4C75]">
                {reportData?.vehicle?.vehicleRegNo || 'All Vehicles'}
              </strong>{' '}
              {reportData?.vehicle && `(${reportData?.vehicle?.vehicleName})`} • Range:{' '}
              {fromDate} to {toDate}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-[#1B262C] border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm"
            >
              <FaPrint className="text-slate-500" />
              <span>Print Table</span>
            </button>
          </div>
        </div>

        {/* The Exact Logbook Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#1B262C] text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3 border border-[#3282B8]/40 text-center">Date</th>
                <th className="py-3 px-3 border border-[#3282B8]/40 text-center">
                  Initials of Officer<br />Authorizing Trip
                </th>
                <th className="py-3 px-2 border border-[#3282B8]/40 text-center">Start<br />Time</th>
                <th className="py-3 px-2 border border-[#3282B8]/40 text-center">End<br />Time</th>
                <th className="py-3 px-3 border border-[#3282B8]/40 text-right">
                  Start Mileage<br />KM Reading
                </th>
                <th className="py-3 px-3 border border-[#3282B8]/40 text-right">
                  End Mileage<br />KM Reading
                </th>
                <th className="py-3 px-3 border border-[#3282B8]/40 text-right bg-[#0F4C75]">
                  No of KM<br />Done
                </th>
                <th className="py-3 px-3 border border-[#3282B8]/40">Driver Name</th>
                <th className="py-3 px-3 border border-[#3282B8]/40">
                  Name of Person Traveling<br />(Responsible)
                </th>
                <th className="py-3 px-4 border border-[#3282B8]/40 min-w-[200px]">
                  Places Visited
                </th>
                <th className="py-3 px-2 border border-[#3282B8]/40 text-center">OT<br />Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#7F8C8D]">
                    <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-2 text-xs">Compiling logbook data...</p>
                  </td>
                </tr>
              ) : !reportData?.rides || reportData.rides.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-[#7F8C8D]">
                    No rides recorded for the selected parameters.
                  </td>
                </tr>
              ) : (
                reportData.rides.map((r: any, idx: number) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={r._id}
                      className={`hover:bg-[#BBE1FA]/30 transition-colors ${
                        isEven ? 'bg-white' : 'bg-[#BBE1FA]/10'
                      }`}
                    >
                      <td className="py-2.5 px-3 border border-slate-200 text-center font-mono font-medium text-[#1B262C]">
                        {r.date ? format(new Date(r.date), 'MM-dd') : '--'}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-200 text-center font-mono font-bold text-[#0F4C75]">
                        {r.authorizingOfficer || '--'}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-200 text-center font-mono">
                        {r.startTime}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-200 text-center font-mono">
                        {r.endTime || (r.status === 'ongoing' ? 'Ongoing' : '--')}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-200 text-right font-mono font-medium">
                        {r.startMileageKM}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-200 text-right font-mono font-medium">
                        {r.endMileageKM ?? '--'}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-200 text-right font-mono font-bold text-[#0F4C75] bg-[#BBE1FA]/20">
                        {r.noOfKMDone ?? '--'}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-200 font-medium text-[#1B262C]">
                        {r.driver?.fullName || '--'}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-200 font-medium text-[#1B262C]">
                        {r.passenger?.fullName || '--'}
                      </td>
                      <td className="py-2.5 px-4 border border-slate-200 text-[#1B262C]">
                        <span className="font-medium">{r.placesVisited}</span>
                        {r.tripPurpose && (
                          <span className="block text-[10px] text-[#7F8C8D]">
                            Purpose: {r.tripPurpose}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-200 text-center font-mono font-medium">
                        {r.otHours || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section below the table */}
        {reportData && (
          <div className="p-5 bg-gradient-to-r from-[#1B262C] to-[#0F4C75] text-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-xs">
              <div>
                <span className="text-[10px] uppercase text-[#BBE1FA] block font-bold">
                  Total KM Done
                </span>
                <span className="text-xl font-black font-mono text-white">
                  {reportData.summary?.totalKMDone?.toLocaleString() || 0} KM
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-[#BBE1FA] block font-bold">
                  Total Trips
                </span>
                <span className="text-xl font-black font-mono text-white">
                  {reportData.summary?.totalTrips || 0} Trips
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-[#BBE1FA] block font-bold">
                  Last Meter Reading
                </span>
                <span className="text-xl font-black font-mono text-[#BBE1FA]">
                  {reportData.summary?.lastMeterReading?.toLocaleString() || 0} KM
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] text-[#BBE1FA]/80">
              <p>Generated by Lakdhanavi Transport Management</p>
              <p className="font-mono">Checked By: ___________________________</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

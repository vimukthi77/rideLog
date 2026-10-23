'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineTruck,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineBan,
  HiOutlineDocumentReport,
  HiOutlineX,
  HiOutlineCheck,
} from 'react-icons/hi';
import { FaCar, FaGasPump } from 'react-icons/fa';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [regNo, setRegNo] = useState('');
  const [type, setType] = useState('Van');
  const [name, setName] = useState('');
  const [initialMeter, setInitialMeter] = useState<number | string>(0);
  const [currentMeter, setCurrentMeter] = useState<number | string>(0);
  const [fuelType, setFuelType] = useState('Diesel');
  const [image, setImage] = useState('');
  const [assignedDriverIds, setAssignedDriverIds] = useState<string[]>([]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const [vehRes, drvRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
      ]);

      if (vehRes.ok) {
        const vData = await vehRes.json();
        setVehicles(vData.vehicles || []);
      }
      if (drvRes.ok) {
        const dData = await drvRes.json();
        setDrivers(dData.drivers || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fleet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setRegNo('');
    setType('Van');
    setName('');
    setInitialMeter(0);
    setCurrentMeter(0);
    setFuelType('Diesel');
    setImage('');
    setAssignedDriverIds([]);
    setModalOpen(true);
  };

  const openEditModal = (v: any) => {
    setEditingVehicle(v);
    setRegNo(v.vehicleRegNo);
    setType(v.vehicleType);
    setName(v.vehicleName);
    setInitialMeter(v.initialMeterReading);
    setCurrentMeter(v.currentMeterReading);
    setFuelType(v.fuelType);
    setImage(v.vehicleImage || '');
    setAssignedDriverIds(
      Array.isArray(v.assignedDrivers)
        ? v.assignedDrivers.map((d: any) => d._id || d)
        : []
    );
    setModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim() || !name.trim()) {
      toast.error('Please enter registration number and vehicle name.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingVehicle) {
        // PUT
        const res = await fetch(`/api/vehicles/${editingVehicle._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleRegNo: regNo,
            vehicleType: type,
            vehicleName: name,
            fuelType,
            vehicleImage: image,
            currentMeterReading: Number(currentMeter),
            assignedDrivers: assignedDriverIds,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update vehicle');
        toast.success('Vehicle updated successfully!');
      } else {
        // POST
        const res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleRegNo: regNo,
            vehicleType: type,
            vehicleName: name,
            initialMeterReading: Number(initialMeter),
            fuelType,
            vehicleImage: image,
            assignedDrivers: assignedDriverIds,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add vehicle');
        toast.success('New vehicle added to fleet!');
      }

      setModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (vId: string) => {
    if (!confirm('Are you sure you want to deactivate this vehicle?')) return;
    try {
      const res = await fetch(`/api/vehicles/${vId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to deactivate');
      toast.success('Vehicle deactivated');
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Error deactivating');
    }
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.vehicleRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || v.vehicleType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B262C]">Fleet Vehicles</h1>
          <p className="text-xs text-[#7F8C8D]">
            Manage Lakdhanavi vehicles, initial meter readings, and driver assignments
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#3282B8] hover:bg-[#0F4C75] text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="absolute left-3.5 top-3 text-[#3282B8] w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Reg No or Model..."
            className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-medium text-[#1B262C] outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#7F8C8D]">Filter Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#F8FAFC] border border-[#BBE1FA] rounded-lg text-xs font-semibold text-[#1B262C] outline-none"
          >
            <option value="all">All Types</option>
            <option value="Van">Van</option>
            <option value="Car">Car</option>
            <option value="Pickup">Pickup</option>
            <option value="Bus">Bus</option>
            <option value="Truck">Truck</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#1B262C] text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Initial Meter (KM)</th>
                <th className="py-3 px-3 text-right">Current Meter (KM)</th>
                <th className="py-3 px-3">Fuel Type</th>
                <th className="py-3 px-3">Assigned Driver(s)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7F8C8D]">
                    <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-2 text-xs">Loading fleet records...</p>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#7F8C8D]">
                    No vehicles found.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-[#BBE1FA]/40 text-[#0F4C75] flex items-center justify-center text-lg font-bold">
                          <FaCar />
                        </div>
                        <div>
                          <span className="font-bold text-[#1B262C] font-mono block text-sm">
                            {v.vehicleRegNo}
                          </span>
                          <span className="text-[11px] text-[#7F8C8D]">
                            {v.vehicleName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-[#0F4C75]">
                      {v.vehicleType}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-500">
                      {v.initialMeterReading?.toLocaleString()} KM
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-[#1B262C]">
                      {v.currentMeterReading?.toLocaleString()} KM
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-[#1B262C]">
                        <FaGasPump className="text-[#3282B8] text-[10px]" />
                        <span>{v.fuelType}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#1B262C]">
                      {v.assignedDrivers && v.assignedDrivers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {v.assignedDrivers.map((d: any) => (
                            <span
                              key={d._id || d}
                              className="px-2 py-0.5 bg-[#BBE1FA]/40 text-[#0F4C75] text-[10px] font-bold rounded"
                            >
                              {d.fullName || 'Driver'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Any driver</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          !v.isActive
                            ? 'bg-slate-200 text-slate-600'
                            : v.isCurrentlyInUse
                            ? 'bg-amber-100 text-[#F39C12]'
                            : 'bg-emerald-100 text-[#27AE60]'
                        }`}
                      >
                        {!v.isActive ? 'Inactive' : v.isCurrentlyInUse ? 'In Use' : 'Available'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 text-[#3282B8] hover:text-[#0F4C75] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit vehicle"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/dashboard/admin/reports?vehicleId=${v._id}`}
                          className="p-1.5 text-[#0F4C75] hover:text-[#3282B8] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Generate report"
                        >
                          <HiOutlineDocumentReport className="w-4 h-4" />
                        </Link>
                        {v.isActive && (
                          <button
                            onClick={() => handleDeactivate(v._id)}
                            className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                            title="Deactivate vehicle"
                          >
                            <HiOutlineBan className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#BBE1FA]"
            >
              <div className="bg-gradient-to-r from-[#1B262C] to-[#0F4C75] text-white p-5 flex items-center justify-between">
                <h3 className="font-bold text-base">
                  {editingVehicle ? 'Edit Fleet Vehicle' : 'Add New Fleet Vehicle'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-[#BBE1FA] hover:text-white p-1"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVehicle} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1B262C] uppercase mb-1">
                    Vehicle Registration Number <span className="text-[#E74C3C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g. 62-5845, WP-CAD-4290"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-mono font-bold text-sm text-[#1B262C] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Vehicle Type <span className="text-[#E74C3C]">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-semibold text-[#1B262C] outline-none"
                    >
                      <option value="Van">Van</option>
                      <option value="Car">Car</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Bus">Bus</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Fuel Type
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-semibold text-[#1B262C] outline-none"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="LNG">LNG</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1B262C] uppercase mb-1">
                    Vehicle Model / Name <span className="text-[#E74C3C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Toyota HiAce High Roof"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-semibold text-[#1B262C] outline-none"
                  />
                </div>

                {!editingVehicle ? (
                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Initial Meter Reading (KM) <span className="text-[#E74C3C]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={initialMeter}
                      onChange={(e) => setInitialMeter(e.target.value)}
                      placeholder="e.g. 9178"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-mono font-bold text-[#1B262C] outline-none"
                    />
                    <p className="text-[10px] text-[#7F8C8D] mt-1">
                      This establishes the base odometer reading when first registering.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Current Meter Reading (KM)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={currentMeter}
                      onChange={(e) => setCurrentMeter(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-mono font-bold text-[#1B262C] outline-none"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1B262C] font-semibold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#3282B8] hover:bg-[#0F4C75] text-white font-bold rounded-xl text-xs shadow-md transition-all"
                  >
                    {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

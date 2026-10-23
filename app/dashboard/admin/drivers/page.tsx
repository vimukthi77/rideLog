'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineBan,
  HiOutlineX,
  HiOutlineTruck,
  HiOutlineIdentification,
} from 'react-icons/hi';
import { FaUserTie, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [assignedVehicleIds, setAssignedVehicleIds] = useState<string[]>([]);

  // If new user
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('driver123');
  const [newPhone, setNewPhone] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const [drvRes, vehRes, usrRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/vehicles'),
        fetch('/api/users'),
      ]);

      if (drvRes.ok) {
        const d = await drvRes.json();
        setDrivers(d.drivers || []);
      }
      if (vehRes.ok) {
        const v = await vehRes.json();
        setVehicles(v.vehicles || []);
      }
      if (usrRes.ok) {
        const u = await usrRes.json();
        setUsers(u.users || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openAddModal = () => {
    setEditingDriver(null);
    setMode('existing');
    setSelectedUserId('');
    setLicenseNumber('');
    setLicenseExpiry('');
    setAssignedVehicleIds([]);
    setNewFullName('');
    setNewEmail('');
    setNewPassword('driver123');
    setNewPhone('');
    setModalOpen(true);
  };

  const openEditModal = (d: any) => {
    setEditingDriver(d);
    setMode('existing');
    setSelectedUserId(d.userId?._id || '');
    setLicenseNumber(d.licenseNumber || '');
    setLicenseExpiry(
      d.licenseExpiry ? format(new Date(d.licenseExpiry), 'yyyy-MM-dd') : ''
    );
    setAssignedVehicleIds(
      Array.isArray(d.assignedVehicles)
        ? d.assignedVehicles.map((v: any) => v._id || v)
        : []
    );
    setModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingDriver) {
        const res = await fetch(`/api/drivers/${editingDriver._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            licenseNumber,
            licenseExpiry,
            assignedVehicles: assignedVehicleIds,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update driver');
        toast.success('Driver record updated successfully!');
      } else {
        const payload: any = {
          licenseNumber,
          licenseExpiry,
          assignedVehicles: assignedVehicleIds,
        };

        if (mode === 'existing') {
          if (!selectedUserId) {
            toast.error('Please select an existing user to assign as driver.');
            setSubmitting(false);
            return;
          }
          payload.userId = selectedUserId;
        } else {
          if (!newFullName || !newEmail || !newPassword) {
            toast.error('Please fill in required fields for new driver.');
            setSubmitting(false);
            return;
          }
          payload.newUserData = {
            fullName: newFullName,
            email: newEmail,
            password: newPassword,
            phone: newPhone,
            department: 'Transport',
          };
        }

        const res = await fetch('/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register driver');
        toast.success('Driver registered successfully!');
      }

      setModalOpen(false);
      fetchDrivers();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (dId: string) => {
    if (!confirm('Are you sure you want to deactivate this driver?')) return;
    try {
      const res = await fetch(`/api/drivers/${dId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to deactivate');
      toast.success('Driver deactivated');
      fetchDrivers();
    } catch (err: any) {
      toast.error(err.message || 'Error deactivating');
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const name = (d.userId?.fullName || '').toLowerCase();
    const license = (d.licenseNumber || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || license.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B262C]">Driver Roster</h1>
          <p className="text-xs text-[#7F8C8D]">
            Manage authorized drivers, license details, and fleet assignments
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#0F4C75] hover:bg-[#1B262C] text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Add New Driver</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <HiOutlineSearch className="absolute left-3.5 top-3 text-[#3282B8] w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search driver by name or license..."
            className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-medium text-[#1B262C] outline-none"
          />
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#1B262C] text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Driver Name & Contact</th>
                <th className="py-3 px-3">License Number</th>
                <th className="py-3 px-3">License Expiry</th>
                <th className="py-3 px-3">Assigned Vehicle(s)</th>
                <th className="py-3 px-3 text-right">This Month KM</th>
                <th className="py-3 px-3 text-right">Trips Logged</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7F8C8D]">
                    <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-2 text-xs">Loading driver records...</p>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#7F8C8D]">
                    No drivers registered.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0F4C75]/15 text-[#0F4C75] flex items-center justify-center font-bold text-sm">
                          {d.userId?.fullName?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <span className="font-bold text-[#1B262C] block">
                            {d.userId?.fullName || 'Driver'}
                          </span>
                          <span className="text-[11px] text-[#7F8C8D]">
                            {d.userId?.phone || d.userId?.email || '--'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-[#0F4C75]">
                      {d.licenseNumber || 'Not Entered'}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500">
                      {d.licenseExpiry
                        ? format(new Date(d.licenseExpiry), 'yyyy-MM-dd')
                        : '--'}
                    </td>

                    <td className="py-3 px-3">
                      {d.assignedVehicles && d.assignedVehicles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {d.assignedVehicles.map((v: any) => (
                            <span
                              key={v._id || v}
                              className="px-2 py-0.5 bg-[#BBE1FA]/40 text-[#0F4C75] text-[10px] font-bold rounded"
                            >
                              {v.vehicleRegNo || 'Vehicle'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">General Pool</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0F4C75]">
                      {d.totalKMThisMonth?.toLocaleString() || 0} KM
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-[#1B262C]">
                      {d.totalTripsThisMonth || 0}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          d.isCurrentlyOnTrip
                            ? 'bg-amber-100 text-[#F39C12]'
                            : d.isAvailable
                            ? 'bg-emerald-100 text-[#27AE60]'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {d.isCurrentlyOnTrip ? 'On Trip' : d.isAvailable ? 'Available' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(d)}
                          className="p-1.5 text-[#3282B8] hover:text-[#0F4C75] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit driver"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(d._id)}
                          className="p-1.5 text-slate-400 hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate driver"
                        >
                          <HiOutlineBan className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Driver Modal */}
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
                  {editingDriver ? 'Edit Driver Record' : 'Register Authorized Driver'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-[#BBE1FA] hover:text-white p-1"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDriver} className="p-6 space-y-4 text-xs">
                {!editingDriver && (
                  <div className="flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setMode('existing')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        mode === 'existing'
                          ? 'bg-white text-[#0F4C75] shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      From Existing User
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('new')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        mode === 'new'
                          ? 'bg-white text-[#0F4C75] shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Create New Driver
                    </button>
                  </div>
                )}

                {/* If picking existing user */}
                {!editingDriver && mode === 'existing' && (
                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Select Registered User <span className="text-[#E74C3C]">*</span>
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-semibold text-[#1B262C] outline-none"
                    >
                      <option value="">-- Choose User --</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.fullName} ({u.email}) - {u.role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If creating brand new driver */}
                {!editingDriver && mode === 'new' && (
                  <div className="space-y-3 bg-[#BBE1FA]/20 p-3 rounded-xl border border-[#BBE1FA]">
                    <div>
                      <label className="block font-bold text-[#1B262C] mb-1">
                        Full Name <span className="text-[#E74C3C]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="e.g. Sunil Perera"
                        className="w-full px-3 py-1.5 bg-white border border-[#BBE1FA] rounded-lg text-[#1B262C] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-[#1B262C] mb-1">
                          Email <span className="text-[#E74C3C]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="driver@lakdhanavi.com"
                          className="w-full px-3 py-1.5 bg-white border border-[#BBE1FA] rounded-lg text-[#1B262C] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#1B262C] mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+94 77 XXX XXXX"
                          className="w-full px-3 py-1.5 bg-white border border-[#BBE1FA] rounded-lg text-[#1B262C] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* License Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Driving License No
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. B-8472910"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-mono text-[#1B262C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      License Expiry Date
                    </label>
                    <input
                      type="date"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none"
                    />
                  </div>
                </div>

                {/* Assigned Vehicles */}
                <div>
                  <label className="block font-bold text-[#1B262C] uppercase mb-1">
                    Assign Primary Fleet Vehicle
                  </label>
                  <select
                    value={assignedVehicleIds[0] || ''}
                    onChange={(e) =>
                      setAssignedVehicleIds(e.target.value ? [e.target.value] : [])
                    }
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-semibold text-[#1B262C] outline-none"
                  >
                    <option value="">-- General Pool (Any Vehicle) --</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.vehicleRegNo} ({v.vehicleName})
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="px-5 py-2 bg-[#0F4C75] hover:bg-[#1B262C] text-white font-bold rounded-xl text-xs shadow-md transition-all"
                  >
                    {submitting ? 'Saving...' : editingDriver ? 'Update Record' : 'Save Driver'}
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

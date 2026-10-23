'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineBan,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'passenger' | 'driver'>('passenger');
  const [department, setDepartment] = useState('Engineering');
  const [employeeId, setEmployeeId] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRole('passenger');
    setDepartment('Engineering');
    setEmployeeId('');
    setModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setPassword('');
    setPhone(u.phone || '');
    setRole(u.role);
    setDepartment(u.department || '');
    setEmployeeId(u.employeeId || '');
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        const payload: any = { fullName, phone, role, department, employeeId };
        if (password) payload.password = password;

        const res = await fetch(`/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update user');
        toast.success('User updated successfully!');
      } else {
        if (!fullName || !email || !password) {
          toast.error('Full name, email, and password are required.');
          setSubmitting(false);
          return;
        }

        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password, phone, role, department, employeeId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create user');
        toast.success('New user account created!');
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (u: any) => {
    try {
      const res = await fetch(`/api/users/${u._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      toast.success(`User ${!u.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.employeeId || '').toLowerCase().includes(term) ||
      (u.department || '').toLowerCase().includes(term);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B262C]">User Directory</h1>
          <p className="text-xs text-[#7F8C8D]">
            Manage project team members, roles (Admin / Passenger / Driver), and access
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#3282B8] hover:bg-[#0F4C75] text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Add New User</span>
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
            placeholder="Search by name, email, employee ID..."
            className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-xs font-medium text-[#1B262C] outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#7F8C8D]">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#F8FAFC] border border-[#BBE1FA] rounded-lg text-xs font-semibold text-[#1B262C] outline-none"
          >
            <option value="all">All Roles</option>
            <option value="passenger">Passengers</option>
            <option value="driver">Drivers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#1B262C] text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Employee ID</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7F8C8D]">
                    <div className="w-8 h-8 border-3 border-[#3282B8] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-2 text-xs">Loading user list...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#7F8C8D]">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleColors: any = {
                    admin: 'bg-[#1B262C] text-white',
                    driver: 'bg-[#0F4C75] text-white',
                    passenger: 'bg-[#BBE1FA]/60 text-[#0F4C75]',
                  };

                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0F4C75] font-bold flex items-center justify-center text-xs">
                            {u.fullName?.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#1B262C] block">
                              {u.fullName}
                            </span>
                            <span className="text-[11px] text-[#7F8C8D]">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            roleColors[u.role] || 'bg-slate-100'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-medium text-[#1B262C]">
                        {u.department || '--'}
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-[#0F4C75]">
                        {u.employeeId || '--'}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500">
                        {u.phone || '--'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.isActive ? 'bg-emerald-100 text-[#27AE60]' : 'bg-red-100 text-[#E74C3C]'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-[#3282B8] hover:text-[#0F4C75] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <HiOutlinePencilAlt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.isActive
                                ? 'text-slate-400 hover:text-[#E74C3C] hover:bg-red-50'
                                : 'text-[#27AE60] hover:bg-emerald-50'
                            }`}
                            title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {u.isActive ? <HiOutlineBan className="w-4 h-4" /> : <HiOutlineCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
                  {editingUser ? 'Edit User Profile' : 'Add New User'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-[#BBE1FA] hover:text-white p-1"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1B262C] uppercase mb-1">
                    Full Name <span className="text-[#E74C3C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kasun Fernando"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none font-semibold"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Email Address <span className="text-[#E74C3C]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kasun@lakdhanavi.com"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Assigned Role <span className="text-[#E74C3C]">*</span>
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] font-semibold outline-none"
                    >
                      <option value="passenger">Passenger</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Civil Engineering"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. LAK-201"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl font-mono text-[#1B262C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B262C] uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 XXX XXXX"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1B262C] uppercase mb-1">
                    {editingUser ? 'Reset Password (optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Leave blank to preserve' : 'Min 6 characters'}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#BBE1FA] focus:border-[#3282B8] rounded-xl text-[#1B262C] outline-none"
                  />
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
                    className="px-5 py-2 bg-[#3282B8] hover:bg-[#0F4C75] text-white font-bold rounded-xl text-xs shadow-md transition-all"
                  >
                    {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
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

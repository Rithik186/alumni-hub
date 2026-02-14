import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShieldCheck, Users, Clock, CheckCircle, XCircle,
    BarChart3, Search, Plus, Zap,
    Calendar, Trash2, X, Megaphone, Sparkles,
    UserX, UserCheck, Shield, GraduationCap, Briefcase
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';

const AdminDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [memberSearch, setMemberSearch] = useState('');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', type: 'general' });

    // Fetch Stats
    const { data: stats } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    // Fetch Pending Alumni
    const { data: pending = [] } = useQuery({
        queryKey: ['pendingAlumni'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/pending-alumni', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 10000
    });

    // Fetch All Users
    const { data: allUsers = [] } = useQuery({
        queryKey: ['allUsers'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 30000
    });

    // Fetch Events
    const { data: events = [] } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const { data } = await axios.get('/api/events', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    // Mutation for approval
    const approvalMutation = useMutation({
        mutationFn: async ({ userId, status }) => {
            return axios.post('/api/admin/update-approval',
                { userId, status },
                { headers: { 'Authorization': `Bearer ${user.token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingAlumni', 'adminStats', 'allUsers']);
        }
    });

    // Mutation for toggling user status
    const toggleUserStatusMutation = useMutation({
        mutationFn: async (userId) => {
            return axios.patch(`/api/admin/users/${userId}/toggle-status`, {}, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['allUsers', 'adminStats']);
        }
    });

    // Mutation for creating event
    const createEventMutation = useMutation({
        mutationFn: async (eventData) => {
            return axios.post('/api/events', eventData, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['events']);
            setIsEventModalOpen(false);
            setNewEvent({ title: '', description: '', date: '', type: 'general' });
        }
    });

    // Mutation for deleting event
    const deleteEventMutation = useMutation({
        mutationFn: async (eventId) => {
            return axios.delete(`/api/events/${eventId}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['events']);
        }
    });

    return (
        <div className="space-y-12 pb-20">
            {/* Admin Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-2xl overflow-hidden relative group">
                        <ShieldCheck className="w-8 h-8 relative z-10" />
                        <div className="absolute inset-0 bg-primary-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Command Center</h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 mt-2">
                            Status: Online <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEventModalOpen(true)}
                        className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-primary-600 hover:border-primary-500 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Create Broadcast
                    </button>
                    <button className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-2 group">
                        <Megaphone className="w-4 h-4 group-hover:animate-bounce" /> Announcement
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Members', value: stats?.users?.reduce((a, b) => a + parseInt(b.count), 0) || 0, icon: Users, trend: 'Verified', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending Approvals', value: pending.length, icon: Clock, trend: 'Immediate', color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Active Events', value: events.length, icon: Calendar, trend: 'Upcoming', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Reach', value: '4.2k', icon: BarChart3, trend: 'Organic', color: 'text-indigo-600', bg: 'bg-indigo-50' }
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between h-44 hover:shadow-xl hover:border-primary-100 transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-4 ${s.bg} rounded-2xl transition-transform group-hover:scale-110`}>
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${s.color} px-2 py-1 rounded bg-white/50 border border-current/10`}>{s.trend}</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{s.value}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Pending Approvals */}
                    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                                <Clock className="w-7 h-7 text-orange-500" /> Pending Alumni
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Fast search..."
                                    className="pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-[10px] uppercase tracking-widest transition-all w-full md:w-64"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Info</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence mode="popLayout">
                                        {pending.length > 0 ? (
                                            pending.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="group hover:bg-slate-50/80 transition-all"
                                                >
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-black text-lg group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                                                {item.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{item.name}</p>
                                                                <p className="text-[9px] font-black text-slate-400 lowercase italic">{item.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <p className="text-xs font-black text-slate-700 uppercase tracking-tighter leading-none">{item.job_role}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase flex items-center gap-1.5">
                                                            <Shield className="w-3 h-3" /> {item.company}
                                                        </p>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => approvalMutation.mutate({ userId: item.id, status: 'rejected' })}
                                                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => approvalMutation.mutate({ userId: item.id, status: 'approved' })}
                                                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                                            >
                                                                Approve Account
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-20 text-center">
                                                    <Zap className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">All candidates verified.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Member Directory */}
                    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                                <Users className="w-7 h-7 text-primary-600" /> Member Directory
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search directory..."
                                    className="pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-[10px] uppercase tracking-widest transition-all w-full md:w-64"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 sticky top-0 z-10">
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Access Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {allUsers.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase())).map((member) => (
                                        <tr key={member.id} className="hover:bg-slate-50/50 transition-all font-bold">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4 text-sm font-black text-slate-900 uppercase">
                                                    {member.name}
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 lowercase tracking-tight mt-1">{member.email}</p>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${member.role === 'alumni' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                    {member.role === 'alumni' ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                {member.is_active ? (
                                                    <span className="text-emerald-500 flex items-center gap-1 text-[10px] font-black tracking-widest uppercase">
                                                        Active <CheckCircle className="w-3 h-3" />
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 flex items-center gap-1 text-[10px] font-black tracking-widest uppercase">
                                                        Deactivated <XCircle className="w-3 h-3" />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button
                                                    onClick={() => toggleUserStatusMutation.mutate(member.id)}
                                                    className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${member.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'}`}
                                                >
                                                    {member.is_active ? <>Deactivate User</> : <>Restore Access</>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Broadcast & Events */}
                <div className="space-y-10">
                    <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Events</h3>
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black">{events.length}</span>
                        </div>
                        <div className="space-y-6">
                            {events.map((event) => (
                                <motion.div
                                    key={event.id}
                                    layout
                                    className="group p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary-200 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => deleteEventMutation.mutate(event.id)}
                                            className="p-2 bg-white text-red-500 rounded-xl border border-red-100 shadow-sm hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="px-2 py-0.5 bg-white rounded text-[8px] font-black uppercase tracking-widest text-primary-600 border border-primary-100 w-fit mb-3">
                                        {event.type}
                                    </div>
                                    <h4 className="font-black text-slate-900 text-sm uppercase leading-tight">{event.title}</h4>
                                    <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))}
                            {events.length === 0 && (
                                <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-3xl">No broadcasts</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Post Modal */}
            <AnimatePresence>
                {isEventModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEventModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-12">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Launch Event</h3>
                                    <button onClick={() => setIsEventModalOpen(false)} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"><X className="w-5 h-5 text-slate-400 group-hover:rotate-90 transition-transform" /></button>
                                </div>
                                <form className="space-y-8" onSubmit={(e) => {
                                    e.preventDefault();
                                    createEventMutation.mutate(newEvent);
                                }}>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Master Title</label>
                                        <input type="text" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-primary-500 outline-none transition-all font-black text-sm uppercase" placeholder="e.g. ALUMNI CONNECT 2026" required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Date</label>
                                            <input type="datetime-local" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-primary-500 outline-none transition-all font-black text-[10px]" required value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stream Category</label>
                                            <select className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-primary-500 outline-none transition-all font-black text-[10px] uppercase" value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
                                                <option value="general">General Broadcast</option>
                                                <option value="training">Deep Dive Training</option>
                                                <option value="alumni_meet">Alumni Network</option>
                                                <option value="placement">Placement Alert</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Broadcast Copy</label>
                                        <textarea className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-primary-500 outline-none transition-all font-bold text-sm min-h-[160px]" placeholder="Brief context about the event..." value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>
                                    </div>
                                    <button type="submit" disabled={createEventMutation.isPending} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                                        {createEventMutation.isPending ? 'Propagating...' : 'Blast Broadcast'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;

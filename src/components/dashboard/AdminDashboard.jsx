import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShieldCheck, Users, Clock, CheckCircle, XCircle,
    BarChart3, Search, Plus, Zap, Calendar, Trash2, X,
    Megaphone, Sparkles, UserX, UserCheck, Shield,
    GraduationCap, Briefcase, Filter, MoreHorizontal,
    Activity, ArrowUpRight, Lock, Unlock, Settings
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

    // Global High-Frequency Sync (5s Polling for Admin)
    const { data: adminData, isLoading, isFetching } = useQuery({
        queryKey: ['adminControlPanel'],
        queryFn: async () => {
            const [stats, pending, users, events] = await Promise.all([
                axios.get('/api/admin/stats', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/admin/pending-alumni', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/admin/users', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/events', { headers: { 'Authorization': `Bearer ${user.token}` } })
            ]);
            return {
                stats: stats.data,
                pending: pending.data,
                users: users.data,
                events: events.data
            };
        },
        refetchInterval: 5000
    });

    const approvalMutation = useMutation({
        mutationFn: async ({ userId, status }) => {
            return axios.post('/api/admin/update-approval', { userId, status }, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => queryClient.invalidateQueries(['adminControlPanel'])
    });

    const toggleUserStatusMutation = useMutation({
        mutationFn: async (userId) => {
            return axios.patch(`/api/admin/users/${userId}/toggle-status`, {}, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => queryClient.invalidateQueries(['adminControlPanel'])
    });

    const createEventMutation = useMutation({
        mutationFn: async (eventData) => {
            return axios.post('/api/events', eventData, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminControlPanel']);
            setIsEventModalOpen(false);
            setNewEvent({ title: '', description: '', date: '', type: 'general' });
        }
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (eventId) => {
            return axios.delete(`/api/events/${eventId}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => queryClient.invalidateQueries(['adminControlPanel'])
    });

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[600px]">
            <div className="w-12 h-12 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
    );

    const { stats, pending = [], users = [], events = [] } = adminData;
    const totalUsers = stats?.users?.reduce((a, b) => a + parseInt(b.count), 0) || 0;

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
            {/* Realtime Status */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-slate-100">
                    <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-slate-900 animate-pulse' : 'bg-emerald-500'} relative`}>
                        <div className={`absolute inset-0 rounded-full ${isFetching ? 'bg-slate-900' : 'bg-emerald-500'} animate-ping`}></div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Node Syncing</span>
                </div>
            </div>

            <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Admin Omni</div>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Control Root</span>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">Platform <span className="text-slate-500">Control</span></h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Master management interface • v4.0.2</p>
                </motion.div>
                <div className="flex gap-4">
                    <button onClick={() => setIsEventModalOpen(true)} className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-slate-200"><Plus className="w-6 h-6" /></button>
                    <button className="w-16 h-16 bg-white border border-slate-200 text-slate-900 rounded-[24px] flex items-center justify-center hover:bg-slate-50 transition-all"><Settings className="w-5 h-5" /></button>
                </div>
            </header>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                {[
                    { label: 'Network Cells', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Unverified Signals', value: pending.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Event Broadcasts', value: events.length, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Security Status', value: '100%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="premium-card p-10 h-44 flex flex-col justify-between group cursor-default hover:bg-slate-900 transition-all duration-700">
                        <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors`}><s.icon className="w-5 h-5" /></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">{s.label}</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tighter">{s.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Main Control Tables */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Verification Queue */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card overflow-hidden">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-3">
                                <Clock className="w-5 h-5 text-amber-500" /> Verification Queue
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-56 pl-11 pr-4 h-10 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-slate-900/5 outline-none transition-all"
                                    placeholder="Filter signals..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                    <tr>
                                        <th className="px-10 py-6">Identity Source</th>
                                        <th className="px-10 py-6">Professional Context</th>
                                        <th className="px-10 py-6 text-right">Approval Protocol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pending.length > 0 ? (
                                        pending.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-10 py-8">
                                                    <div className="font-black text-slate-900 text-sm mb-1">{item.name}</div>
                                                    <div className="text-xs font-bold text-slate-400">{item.email}</div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="font-bold text-slate-700 text-xs mb-1">{item.job_role}</div>
                                                    <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-tighter rounded inline-block">{item.company}</div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                        <button onClick={() => approvalMutation.mutate({ userId: item.id, status: 'rejected' })} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                                                        <button onClick={() => approvalMutation.mutate({ userId: item.id, status: 'approved' })} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-slate-200 transition-all">Authorize</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="px-10 py-24 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">Queue fully synchronized</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Member Directory */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card overflow-hidden bg-slate-900 text-white">
                        <div className="p-10 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tighter">Central Node Directory</h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Export DB</button>
                        </div>
                        <div className="overflow-x-auto max-h-[600px] modern-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] sticky top-0 backdrop-blur-md">
                                    <tr>
                                        <th className="px-10 py-6">Member Node</th>
                                        <th className="px-10 py-6">Role Sector</th>
                                        <th className="px-10 py-6">Status Signal</th>
                                        <th className="px-10 py-6 text-right">Access Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase())).map((member) => (
                                        <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-10 py-8 font-black text-sm">{member.name}</td>
                                            <td className="px-10 py-8">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${member.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${member.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${member.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {member.is_active ? 'Online' : 'Restricted'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button onClick={() => toggleUserStatusMutation.mutate(member.id)} className={`text-[10px] font-black uppercase tracking-widest transition-all ${member.is_active ? 'text-slate-500 hover:text-red-400' : 'text-emerald-400 hover:scale-110'}`}>
                                                    {member.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Broadcast Sidebar */}
                <div className="lg:col-span-4 space-y-12">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="premium-card p-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-10 flex items-center justify-between">
                            Event Broadcasts <Megaphone className="w-5 h-5 text-indigo-500" />
                        </h3>
                        <div className="space-y-6">
                            {events.map((event) => (
                                <div key={event.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] group relative hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-500">
                                    <button onClick={() => deleteEventMutation.mutate(event.id)} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3">{event.type}</div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-4 tracking-tight">{event.title}</h4>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</div>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <div className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No transmissions active</div>
                            )}
                        </div>
                    </motion.div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-800 p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000"><Shield className="w-32 h-32" /></div>
                        <h4 className="text-2xl font-black tracking-tight mb-4">Core Integrity</h4>
                        <p className="text-sm font-bold text-white/70 leading-relaxed mb-8">All master nodes are synchronized. Automatic fallback protocols are engaged for 0 downtime maintenance.</p>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Synchronized
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Modals and high-end overlays */}
            <AnimatePresence>
                {isEventModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEventModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-12">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Post Broadcast</h3>
                                    <button onClick={() => setIsEventModalOpen(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
                                </div>
                                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); createEventMutation.mutate(newEvent); }}>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">Transmission Title</label>
                                        <input type="text" className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[28px] px-8 text-sm font-bold focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all" required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">Temporal Node (Date)</label>
                                            <input type="datetime-local" className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[28px] px-8 text-xs font-bold focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all" required value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">Signal Category</label>
                                            <select className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[28px] px-8 text-xs font-bold focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all appearance-none" value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
                                                <option value="general">Broadcast</option>
                                                <option value="training">Technical</option>
                                                <option value="placement">Career Node</option>
                                                <option value="alumni_meet">Assembly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">Payload Description</label>
                                        <textarea className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium min-h-[140px] focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all" required value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                                    </div>
                                    <button type="submit" disabled={createEventMutation.isPending} className="w-full bg-slate-900 py-6 rounded-[32px] text-white font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95">
                                        {createEventMutation.isPending ? 'Propagating...' : 'Post Broadcast'} <Zap className="w-5 h-5" />
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

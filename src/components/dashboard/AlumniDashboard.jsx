import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Activity, Bell, Settings, Check, X,
    GraduationCap, Briefcase, LayoutDashboard,
    Users, MessageSquare, ShieldCheck, Power,
    FileText, User, ChevronRight, Clock,
    Zap, Rocket, Target, Star, Building
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import BulletinBoard from './BulletinBoard';

const AlumniDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');

    // Realtime Sync Engine (2s Polling)
    const { data: dashboardData, isLoading, isFetching } = useQuery({
        queryKey: ['alumniDashboard'],
        queryFn: async () => {
            const [requestsRes, profileRes] = await Promise.all([
                axios.get('/api/alumni/requests', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/auth/me', { headers: { 'Authorization': `Bearer ${user.token}` } })
            ]);
            return { requests: requestsRes.data, profile: profileRes.data };
        },
        refetchInterval: 2000,
        refetchOnWindowFocus: true
    });

    const updateMutation = useMutation({
        mutationFn: async ({ requestId, status }) => {
            return axios.patch(`/api/mentorship/${requestId}/status`, { status }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['alumniDashboard']);
        }
    });

    const toggleAvailabilityMutation = useMutation({
        mutationFn: async () => {
            return axios.patch('/api/alumni/mentorship-status', {}, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['alumniDashboard']);
        }
    });

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[600px]">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    const profile = dashboardData?.profile?.profile;
    const isAvailable = profile?.mentorship_available;
    const requests = dashboardData?.requests || [];
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const acceptedRequests = requests.filter(r => r.status === 'accepted');

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
            {/* Realtime Synchronizer Status */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 transition-all">
                    <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'} relative`}>
                        <div className={`absolute inset-0 rounded-full ${isFetching ? 'bg-indigo-500' : 'bg-emerald-500'} animate-ping`}></div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">System Live</span>
                </div>
            </div>

            <header className="mb-20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="flex items-center gap-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500 rounded-[30px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[30px] flex items-center justify-center text-4xl font-black text-white relative z-10 shadow-2xl shadow-indigo-100">
                                {user.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 z-20">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            </div>
                        </div>
                        <div>
                            <p className="text-indigo-600 font-extrabold uppercase text-[10px] tracking-[0.3em] mb-3">Professional Suite</p>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Morning, {user.name.split(' ')[0]}</h1>
                            <div className="flex items-center gap-4 text-slate-500 font-bold">
                                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {profile?.job_role || 'Executive'}</span>
                                <span className="text-slate-200">|</span>
                                <span className="flex items-center gap-2"><Building className="w-4 h-4" /> {profile?.company || 'Network Partner'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-slate-100/60 backdrop-blur-md p-2 rounded-[28px] border border-slate-200/50">
                        {[
                            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'requests', label: 'Inbox', icon: Bell, count: pendingRequests.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : ''}`} />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="ml-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg shadow-red-200 animate-bounce">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main>
                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        {/* High-Impact Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card group hover:bg-slate-900 transition-all duration-500">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-white/10 group-hover:text-white transition-colors"><Rocket className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500">Success Rate</span>
                                </div>
                                <div className="text-5xl font-black text-slate-900 mb-1 tracking-tighter group-hover:text-white transition-colors">98%</div>
                                <p className="text-xs font-bold text-slate-400 group-hover:text-slate-500 transition-colors">Mentorship engagement score</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl"><Target className="w-6 h-6" /></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Links</span>
                                </div>
                                <div className="text-5xl font-black text-slate-900 mb-1 tracking-tighter">{acceptedRequests.length}</div>
                                <p className="text-xs font-bold text-slate-400">Current mentorship sessions</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card p-4 border-indigo-100 bg-indigo-50/20">
                                <div className="p-8 space-y-8">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Network Visibility</h3>
                                        <p className="text-xs font-bold text-slate-400 leading-relaxed">Turn this on to appear in the student directory for guidance requests.</p>
                                    </div>
                                    <button
                                        onClick={() => toggleAvailabilityMutation.mutate()}
                                        className={`w-full py-6 rounded-[28px] text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${isAvailable ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-white border border-slate-200 text-slate-600'}`}
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-slate-300'}`}></div>
                                        {isAvailable ? 'System Online' : 'Signal Offline'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Recent Requests Feed */}
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="premium-card overflow-hidden">
                            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Live Mentorship Stream</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time update frequency: 2s</p>
                                </div>
                                <button onClick={() => setActiveTab('requests')} className="px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Expand View</button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <AnimatePresence mode="popLayout">
                                    {pendingRequests.length > 0 ? (
                                        pendingRequests.map((req, i) => (
                                            <motion.div
                                                key={req.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:bg-slate-50/50 transition-all"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-white border border-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 transition-transform">
                                                        {req.student_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-lg mb-1">{req.student_name}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md">{req.purpose.replace('_', ' ')}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Just now</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={() => updateMutation.mutate({ requestId: req.id, status: 'rejected' })} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all"><X className="w-5 h-5" /></button>
                                                    <button onClick={() => updateMutation.mutate({ requestId: req.id, status: 'accepted' })} className="px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 group-hover:shadow-indigo-100">Establish Link</button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="p-32 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <MessageSquare className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Inbox Zero Frequency</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Transmission Archive</h2>
                        </div>
                        <div className="grid gap-6">
                            {requests.length > 0 ? (
                                requests.map((request) => (
                                    <motion.div
                                        key={request.id}
                                        layout
                                        className="premium-card p-10 flex flex-col md:flex-row md:items-center justify-between gap-10"
                                    >
                                        <div className="flex items-center gap-8 flex-1">
                                            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center text-2xl font-black">{request.student_name?.charAt(0)}</div>
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-4">
                                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{request.student_name}</h4>
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${request.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : request.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                    <span className="flex items-center gap-1.5 uppercase tracking-widest"><Target className="w-4 h-4" /> {request.purpose.replace('_', ' ')}</span>
                                                    <span className="text-slate-200">|</span>
                                                    <span className="flex items-center gap-1.5 uppercase tracking-widest"><GraduationCap className="w-4 h-4" /> {request.department}</span>
                                                </div>
                                                <div className="mt-6 p-6 bg-slate-50 rounded-[28px] border border-slate-100 text-slate-600 font-medium italic relative">
                                                    <div className="absolute -top-3 left-6 px-3 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">Message Payload</div>
                                                    "{request.message}"
                                                </div>
                                            </div>
                                        </div>

                                        {request.status === 'pending' && (
                                            <div className="flex flex-col gap-3 min-w-[200px]">
                                                <button
                                                    onClick={() => updateMutation.mutate({ requestId: request.id, status: 'accepted' })}
                                                    className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all active:scale-95"
                                                >
                                                    Secure Connection
                                                </button>
                                                <button
                                                    onClick={() => updateMutation.mutate({ requestId: request.id, status: 'rejected' })}
                                                    className="w-full bg-white border border-slate-200 text-slate-500 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                                                >
                                                    Discard
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-32 text-center border-4 border-dashed border-slate-100 rounded-[64px]">
                                    <Activity className="w-16 h-16 text-slate-200 mx-auto mb-8 animate-pulse" />
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Clean Slate</h3>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">All transmissions cleared</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default AlumniDashboard;

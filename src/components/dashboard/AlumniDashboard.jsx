import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserPlus, Check, X, GraduationCap,
    Calendar, MessageSquare, Briefcase, FileText,
    Sparkles, ShieldCheck, Zap,
    Trophy, Activity, Bell, Settings, Power,
    Mail, MapPin, ChevronRight, Star, ArrowRight,
    Users, LayoutDashboard
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import BulletinBoard from './BulletinBoard';

const AlumniDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch Dashboard Data
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['alumniDashboard'],
        queryFn: async () => {
            const [requestsRes, profileRes] = await Promise.all([
                axios.get('/api/alumni/requests', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/auth/me', { headers: { 'Authorization': `Bearer ${user.token}` } })
            ]);
            return {
                requests: requestsRes.data,
                profile: profileRes.data
            };
        },
        refetchInterval: 5000,
    });

    const updateMutation = useMutation({
        mutationFn: async ({ requestId, status }) => {
            return axios.patch(`/api/mentorship/${requestId}/status`,
                { status },
                { headers: { 'Authorization': `Bearer ${user.token}` } }
            );
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
            <Activity className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
    );

    const profile = dashboardData?.profile?.profile;
    const isAvailable = profile?.mentorship_available;
    const requests = dashboardData?.requests || [];

    const stats = [
        { title: 'Mentorships', count: requests.filter(r => r.status === 'accepted').length, icon: UserPlus, color: 'bg-blue-600' },
        { title: 'New Requests', count: requests.filter(r => r.status === 'pending').length, icon: Zap, color: 'bg-amber-500' },
        { title: 'Impact Score', count: '98', icon: Trophy, color: 'bg-emerald-600' },
    ];

    return (
        <div className="flex flex-col xl:flex-row gap-10 items-start">
            {/* Elite Sidebar */}
            <aside className="w-full xl:w-80 space-y-6 sticky top-32">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 shadow-xl border border-white/40">
                    <div className="flex items-center gap-5 mb-12 px-2">
                        <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl relative group overflow-hidden">
                            <span className="relative z-10">{user.name.charAt(0)}</span>
                            <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">{user.name.split(' ')[0]}</h2>
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alumni Verified</span>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-2 mb-10">
                        {[
                            { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
                            { id: 'requests', label: 'Pursuit Requests', icon: Bell, count: requests.filter(r => r.status === 'pending').length },
                            { id: 'bulletin', label: 'News & Events', icon: Calendar },
                            { id: 'settings', label: 'Link Settings', icon: Settings }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-2xl translate-x-3' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </div>
                                {item.count > 0 && (
                                    <span className="w-5 h-5 bg-amber-500 text-white text-[9px] rounded-full flex items-center justify-center animate-pulse">
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="pt-8 border-t border-slate-100">
                        <button
                            onClick={() => toggleAvailabilityMutation.mutate()}
                            className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all group ${isAvailable ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-100 border border-slate-200'}`}
                        >
                            <div className="text-left">
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {isAvailable ? 'Status: Available' : 'Status: Offline'}
                                </p>
                                <p className="text-[11px] font-bold text-slate-600">Open for Pursuits</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full space-y-10">
                {activeTab === 'overview' && (
                    <div className="space-y-10">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 group hover:border-primary-200 transition-all overflow-hidden relative"
                                >
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}></div>
                                    <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{stat.title}</h4>
                                        <p className="text-4xl font-black text-slate-900 leading-none">{stat.count}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Activity Grid */}
                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* Profile Insights */}
                            <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-slate-100 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Profile Nexus</h3>
                                        <div className="p-3 bg-slate-50 rounded-xl text-primary-600"><Activity className="w-5 h-5" /></div>
                                    </div>
                                    <p className="text-slate-500 font-bold leading-relaxed">Your professional identity is synchronized. Students see your expertise in <span className="text-indigo-600">{profile?.department || 'Engineering'}</span>.</p>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-4 text-slate-600">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Briefcase className="w-4 h-4" /></div>
                                            <span className="text-sm font-black uppercase tracking-widest">{profile?.job_role || 'Elite Professional'} at {profile?.company || 'Top Firm'}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(profile?.skills || ['Leadership', 'System Design']).map((skill, s) => (
                                                <span key={s} className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button className="mt-10 w-full py-5 bg-slate-50 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Sync with LinkedIn</button>
                            </div>

                            {/* Incoming Pursuits Peek */}
                            <div className="bg-slate-900 p-10 rounded-[4rem] shadow-2xl text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                                    <Zap className="w-40 h-40" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Urgent Actions</h3>
                                    <p className="text-slate-400 font-bold mb-10 leading-relaxed">There are <span className="text-amber-400 font-black">{requests.filter(r => r.status === 'pending').length} pending pursuits</span> waiting for your approval.</p>

                                    <div className="space-y-4">
                                        {requests.filter(r => r.status === 'pending').slice(0, 2).map((req, rid) => (
                                            <div key={rid} className="bg-white/5 p-5 rounded-3xl border border-white/10 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">{req.student_name?.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{req.student_name}</p>
                                                        <p className="text-[10px] text-slate-400">{req.purpose.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-500" />
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={() => setActiveTab('requests')} className="mt-10 w-full py-5 bg-primary-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-900/40 hover:bg-primary-500 transition-all">Launch Pursuit Deck</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-8">
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-1">Pursuit Deck</h1>
                                <p className="text-slate-400 font-bold text-sm">Manage your mentorship impact and active guidance loops.</p>
                            </div>
                            <div className="flex items-center gap-4 p-2 bg-white rounded-3xl border shadow-sm">
                                <span className={`px-4 py-2 rounded-2xl text-[10px] uppercase font-black tracking-widest border transition-all ${requests.length > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                    {requests.filter(r => r.status === 'pending').length} Pending
                                </span>
                            </div>
                        </header>

                        <div className="grid gap-6">
                            <AnimatePresence mode="popLayout">
                                {requests.length > 0 ? (
                                    requests.map((request, i) => (
                                        <motion.div
                                            key={request.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative group transition-all hover:border-primary-100 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 font-black text-3xl border border-slate-100">
                                                        {request.student_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="text-xl font-black text-slate-900 tracking-wide uppercase leading-none">{request.student_name}</h4>
                                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${request.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : request.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <GraduationCap className="w-3 h-3" /> {request.purpose.replace('_', ' ')}
                                                        </p>
                                                        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 max-w-xl">
                                                            <p className="text-xs font-bold text-slate-500 italic leading-relaxed">"{request.message}"</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {request.status === 'pending' && (
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => updateMutation.mutate({ requestId: request.id, status: 'rejected' })}
                                                            className="flex-1 md:flex-none px-8 py-5 bg-slate-50 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100 disabled:opacity-50"
                                                            disabled={updateMutation.isPending}
                                                        >
                                                            Decline
                                                        </button>
                                                        <button
                                                            onClick={() => updateMutation.mutate({ requestId: request.id, status: 'accepted' })}
                                                            className="flex-1 md:flex-none px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-slate-200 transition-all disabled:opacity-50"
                                                            disabled={updateMutation.isPending}
                                                        >
                                                            Accept
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-white/40 rounded-[5rem] border-4 border-dashed border-white">
                                        <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-8" />
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Quiet Network</h3>
                                        <p className="text-slate-500 font-bold max-w-xs mx-auto mt-4">No active pursuit requests at the moment. Your availability status is currently {isAvailable ? 'Active' : 'Offline'}.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {activeTab === 'bulletin' && <BulletinBoard />}
                {activeTab === 'settings' && (
                    <div className="py-40 text-center bg-white rounded-[4rem] border shadow-xl">
                        <Settings className="w-20 h-20 text-slate-200 animate-spin-slow mx-auto mb-10" />
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Link Configuration</h2>
                        <p className="text-slate-500 font-bold mt-4">Module is being re-calibrated for ultimate performance.</p>
                        <button onClick={() => setActiveTab('overview')} className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all">Command Center</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AlumniDashboard;

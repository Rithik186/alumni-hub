import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserPlus, Check, X, GraduationCap,
    Calendar, MessageSquare, Briefcase, FileText,
    Sparkles, ShieldCheck, Zap,
    Trophy, Activity, Bell, Settings, Power,
    Mail, MapPin, ChevronRight, Star
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import BulletinBoard from './BulletinBoard';

const AlumniDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();

    // Fetch Dashboard Data (Mentorship Requests, Profile Details)
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

    // Mutation for connection/mentorship status update
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

    // Mutation for toggling availability
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
        <div className="flex items-center justify-center min-h-[400px]">
            <Activity className="w-10 h-10 text-primary-600 animate-pulse" />
        </div>
    );

    const profile = dashboardData?.profile?.profile;
    const isAvailable = profile?.mentorship_available;

    const stats = [
        { title: 'Mentorships', count: dashboardData?.requests?.filter(r => r.status === 'accepted').length || 0, icon: UserPlus, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
        { title: 'Pending Pursuits', count: dashboardData?.requests?.filter(r => r.status === 'pending').length || 0, icon: GraduationCap, color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-200' },
        { title: 'Impact Score', count: '92', icon: Trophy, color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-200' },
        { title: 'Contributions', count: '12', icon: Star, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' }
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Elite Profile Header */}
            <header className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                <div className="flex items-center gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-tr from-primary-600 to-blue-500 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-white transform hover:rotate-6 transition-transform">
                            {user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl border-4 border-white shadow-lg">
                            <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                                Welcome back, {user.name.split(' ')[0]}
                            </h1>
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-[10px] font-black tracking-widest uppercase">Certified Elite</span>
                        </div>
                        <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary-600" />
                            {profile?.job_role || 'Senior Software Engineer'} @ {profile?.company || 'Tech Corp'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl border border-slate-100">
                    <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-primary-600 hover:bg-primary-50 transition-all relative">
                        <Bell className="w-6 h-6" />
                        {dashboardData?.requests?.some(r => r.status === 'pending') && (
                            <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>
                    <button
                        onClick={() => toggleAvailabilityMutation.mutate()}
                        disabled={toggleAvailabilityMutation.isPending}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all group ${isAvailable ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                        <Power className={`w-4 h-4 group-hover:scale-110 transition-transform ${isAvailable ? 'text-emerald-500' : 'text-red-500'}`} />
                        {isAvailable ? 'Mentorship Active' : 'Mentorship Offline'}
                    </button>
                </div>
            </header>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex items-center gap-6 hover:shadow-2xl hover:border-primary-100 transition-all group"
                    >
                        <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} ${stat.shadow} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                            <h2 className="text-3xl font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{stat.count}</h2>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Live Announcements */}
            <BulletinBoard />

            {/* Main Content Areas */}
            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                            <Zap className="w-6 h-6 text-primary-600" /> Incoming Pursuits
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {dashboardData?.requests?.filter(r => r.status === 'pending').length > 0 ? (
                                dashboardData.requests.filter(r => r.status === 'pending').map((req) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl hover:border-primary-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-6 flex-1">
                                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl flex items-center justify-center text-primary-600 font-black text-2xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                {req.student_name.charAt(0)}
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">{req.student_name}</h4>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                                        {req.purpose.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                                        {req.department} • {req.batch}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium line-clamp-1 italic">"{req.message}"</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {req.resume_url && (
                                                <a
                                                    href={`/uploads/resumes/${req.resume_url}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-primary-50 hover:text-primary-600 transition-all"
                                                    title="View Resume"
                                                >
                                                    <FileText className="w-6 h-6" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => updateMutation.mutate({ requestId: req.id, status: 'rejected' })}
                                                className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all font-bold"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => updateMutation.mutate({ requestId: req.id, status: 'accepted' })}
                                                className="flex items-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-100 transition-all active:scale-95"
                                            >
                                                <Check className="w-5 h-5" /> Accept
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-24 text-center bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-white">
                                    <MessageSquare className="w-16 h-16 mx-auto mb-6 text-slate-300 opacity-50" />
                                    <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">Digital Silence</h4>
                                    <p className="text-slate-400 font-bold mt-2">No active mentorship pursuits at the moment.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Sparkles className="w-32 h-32" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-yellow-500" /> Career Journey
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                <span className="font-bold text-slate-600">Total Mentorships</span>
                                <span className="text-2xl font-black text-primary-600 uppercase tracking-tighter">
                                    {dashboardData?.requests?.filter(r => r.status === 'accepted').length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                <span className="font-bold text-slate-600">Impact Score</span>
                                <span className="text-2xl font-black text-indigo-600 uppercase tracking-tighter">92</span>
                            </div>
                        </div>
                        <button className="w-full mt-8 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlumniDashboard;

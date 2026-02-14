import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, Users, Building, GraduationCap,
    ChevronRight, Sparkles, ArrowRight,
    X, Globe, Filter, Briefcase, MapPin,
    Zap, Bell, Bookmark, MessageCircle
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import BulletinBoard from './BulletinBoard';

const StudentDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        name: '', company: '', department: '', batch: '', mentorship_available: ''
    });
    const [activeTab, setActiveTab] = useState('explore');

    // Debounced Search Sync
    useEffect(() => {
        const delay = setTimeout(() => {
            setFilters(prev => ({ ...prev, name: searchTerm }));
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // High-Frequency Realtime Sync (2s Polling)
    const { data: alumni = [], isLoading, isFetching } = useQuery({
        queryKey: ['alumni', filters],
        queryFn: async () => {
            const queryParams = new URLSearchParams(filters).toString();
            const { data } = await axios.get(`/api/student/alumni?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        enabled: !!user.token,
        refetchInterval: 2000, // Ultra-fast sync
        staleTime: 0
    });

    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [requestData, setRequestData] = useState({ purpose: 'career_guidance', message: '' });

    const connectMutation = useMutation({
        mutationFn: async (details) => {
            return axios.post('/api/student/request-mentorship',
                { alumni_id: details.alumniId, purpose: details.purpose, message: details.message },
                { headers: { 'Authorization': `Bearer ${user.token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['alumni']);
            setSelectedAlumni(null);
            setRequestData({ purpose: 'career_guidance', message: '' });
        }
    });

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        connectMutation.mutate({ alumniId: selectedAlumni.id, ...requestData });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
            {/* Realtime Synchronizer Status */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 transition-all">
                    <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'} relative`}>
                        <div className={`absolute inset-0 rounded-full ${isFetching ? 'bg-blue-500' : 'bg-emerald-500'} animate-ping`}></div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Live Sync Active</span>
                </div>
            </div>

            <header className="mb-16">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Directory Alpha</div>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase">v2.0 Performance</span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-3">Professional <span className="text-blue-600">Network</span></h1>
                        <p className="text-slate-500 text-lg max-w-lg leading-relaxed">Instantly connect with the next generation of industry leaders and alumni mentors.</p>
                    </motion.div>

                    <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[20px] border border-slate-200/50 self-start">
                        {[
                            { id: 'explore', label: 'Network', icon: Users },
                            { id: 'bulletin', label: 'Bulletin', icon: Bell }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {activeTab === 'explore' && (
                <div className="space-y-12">
                    {/* Search Deck */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        <div className="lg:col-span-8 relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors">
                                <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, expertise, or company..."
                                className="w-full pl-16 pr-6 h-16 bg-white border border-slate-200 rounded-[28px] text-lg font-medium placeholder:text-slate-400 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="lg:col-span-4 flex gap-4">
                            <select
                                className="flex-1 px-6 h-16 bg-white border border-slate-200 rounded-[28px] text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                            >
                                <option value="">Global Department</option>
                                <option value="CSE">Technology (CSE)</option>
                                <option value="ECE">Electronics (ECE)</option>
                                <option value="IT">Information (IT)</option>
                                <option value="MECH">Mechanical</option>
                            </select>
                            <button className="w-16 h-16 flex items-center justify-center bg-slate-900 text-white rounded-[28px] hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
                                <Zap className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Results Portfolio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="h-[420px] bg-slate-100 animate-pulse rounded-[40px]"></div>
                                ))
                            ) : alumni.length > 0 ? (
                                alumni.map((person, i) => (
                                    <motion.div
                                        key={person.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group premium-card p-10 flex flex-col h-[480px] relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        </div>

                                        <div className="flex items-center gap-6 mb-10">
                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[30px] flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                                                {person.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{person.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{person.job_role || 'Executive'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Building className="w-4 h-4 text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Operations</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-800">{person.company || 'Global Enterprise'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sector</span>
                                                    </div>
                                                    <p className="text-[11px] font-black text-slate-800">{person.department}</p>
                                                </div>
                                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Batch</span>
                                                    </div>
                                                    <p className="text-[11px] font-black text-slate-800">{person.batch}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10">
                                            <button
                                                onClick={() => setSelectedAlumni(person)}
                                                className="w-full bg-slate-900 group-hover:bg-blue-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200 active:scale-[0.98]"
                                            >
                                                Request Protocol <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-32 text-center"
                                >
                                    <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                                        <Users className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Signal Lost</h3>
                                    <p className="text-slate-500 font-medium">No connection points matching your current filters.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {activeTab === 'bulletin' && <BulletinBoard />}

            {/* NextLevel Request Modal */}
            <AnimatePresence>
                {selectedAlumni && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAlumni(null)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-white/20"
                        >
                            <div className="p-12">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Initialize Connection</h3>
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">To: {selectedAlumni.name}</p>
                                    </div>
                                    <button onClick={() => setSelectedAlumni(null)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleRequestSubmit} className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">Mission Purpose</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['career_guidance', 'resume_review', 'interview_prep', 'referral'].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setRequestData({ ...requestData, purpose: p })}
                                                    className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${requestData.purpose === p ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
                                                >
                                                    {p.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">Personal Briefing</label>
                                        <textarea
                                            className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium placeholder:text-slate-300 min-h-[180px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all"
                                            placeholder="Introduce yourself and explain the value of this connection..."
                                            value={requestData.message}
                                            onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 py-6 rounded-[32px] text-white font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
                                        disabled={connectMutation.isPending}
                                    >
                                        {connectMutation.isPending ? 'Transmitting...' : 'Send Transmission'} <Zap className="w-5 h-5" />
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

export default StudentDashboard;

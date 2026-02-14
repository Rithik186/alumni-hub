import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, Filter, Users, UserPlus, Check,
    MessageSquare, Building, GraduationCap,
    Calendar, Sparkles, Briefcase, Zap,
    ChevronRight, MapPin, Star, Clock,
    FileText, ShieldCheck, X, SlidersHorizontal,
    Compass, Bell, Megaphone, ArrowRight
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import BulletinBoard from './BulletinBoard';

const StudentDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        name: '',
        company: '',
        department: '',
        batch: '',
        mentorship_available: '' // Show all by default
    });
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('browse');

    // Debounced search logic - Fixes search delay and sync
    useEffect(() => {
        const delay = setTimeout(() => {
            setFilters(prev => ({ ...prev, name: searchTerm }));
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // Fetch Alumni with real-time sync
    const { data: alumni = [], isLoading } = useQuery({
        queryKey: ['alumni', filters],
        queryFn: async () => {
            const queryParams = new URLSearchParams(filters).toString();
            const { data } = await axios.get(`/api/student/alumni?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        enabled: !!user.token,
        refetchInterval: 10000,
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
            alert("Mentorship request sent successfully!");
        }
    });

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        connectMutation.mutate({
            alumniId: selectedAlumni.id,
            ...requestData
        });
    };

    return (
        <div className="flex flex-col xl:flex-row gap-10 items-start">
            {/* Sidebar Navigation */}
            <aside className="w-full xl:w-80 space-y-6 sticky top-32">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/40">
                    <div className="flex items-center gap-4 mb-10 px-2">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                            <Compass className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Student Hub</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Version 2.0.4</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'browse', label: 'Explore Network', icon: Users },
                            { id: 'my_requests', label: 'Active Pursuits', icon: Zap },
                            { id: 'bulletin', label: 'Bulletin Board', icon: Megaphone }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 translate-x-3' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-primary-400' : ''}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="bg-gradient-to-br from-indigo-600 to-primary-600 rounded-[2rem] p-6 text-white overflow-hidden relative group">
                            <div className="relative z-10">
                                <Sparkles className="w-10 h-10 mb-4 text-white/50" />
                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Build Network</h4>
                                <p className="text-[11px] font-medium leading-relaxed text-white/80 transition-opacity">Connect with high-impact alumni to accelerate your career path.</p>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full space-y-10">
                {activeTab === 'browse' && (
                    <>
                        {/* Integrated Premium Search & Filter Bar */}
                        <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-[3rem] shadow-2xl border border-white/60 flex flex-col md:flex-row items-center gap-4 relative z-50">
                            <div className="relative flex-1 group w-full">
                                <div className="absolute left-7 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                                    <div className="w-[1px] h-6 bg-slate-200"></div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, role or expertise..."
                                    className="w-full pl-20 pr-8 py-6 bg-slate-50/50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-slate-700 placeholder:text-slate-400 transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-3 px-10 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${showFilters ? 'bg-primary-600 text-white shadow-xl shadow-primary-200' : 'bg-slate-900 text-white shadow-xl'}`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                {showFilters ? 'Hide Logic' : 'Advanced Filters'}
                            </button>
                        </div>

                        {/* Expandable Filter UI */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, scaleY: 0.9 }}
                                    animate={{ height: 'auto', opacity: 1, scaleY: 1 }}
                                    exit={{ height: 0, opacity: 0, scaleY: 0.9 }}
                                    className="overflow-hidden origin-top"
                                >
                                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Company</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Microsoft"
                                                className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-primary-100 outline-none font-bold text-slate-600 text-xs"
                                                value={filters.company}
                                                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Field / Dept</label>
                                            <select
                                                className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-primary-100 outline-none font-bold text-slate-600 appearance-none cursor-pointer text-xs"
                                                value={filters.department}
                                                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                            >
                                                <option value="">All Streams</option>
                                                <option value="CSE">CSE / IT</option>
                                                <option value="ECE">ECE / EEE</option>
                                                <option value="MECH">Mechanical</option>
                                                <option value="CIVIL">Civil</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Availability Loop</label>
                                            <select
                                                className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-primary-100 outline-none font-bold text-slate-600 appearance-none cursor-pointer text-xs"
                                                value={filters.mentorship_available}
                                                onChange={(e) => setFilters({ ...filters, mentorship_available: e.target.value })}
                                            >
                                                <option value="">Global Search</option>
                                                <option value="true">Open for Mentorship</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFilters({ name: '', company: '', department: '', batch: '', mentorship_available: '' });
                                                }}
                                                className="w-full py-4 bg-slate-900 text-white hover:bg-primary-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
                                            >
                                                Reset Engine
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Elite Results Grid */}
                        <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-10">
                            {isLoading ? (
                                [1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-96 bg-white/40 animate-pulse rounded-[4rem] border border-white"></div>
                                ))
                            ) : alumni.length > 0 ? (
                                <AnimatePresence mode="popLayout">
                                    {alumni.map((person, i) => (
                                        <motion.div
                                            key={person.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: i * 0.03 }}
                                            whileHover={{ y: -15 }}
                                            className="bg-white rounded-[4rem] p-10 shadow-xl border border-slate-100 hover:border-primary-200 transition-all group overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary-600/10 transition-colors duration-500"></div>

                                            <div className="flex items-center gap-6 mb-10 relative z-10">
                                                <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl group-hover:rotate-6 transition-transform shadow-2xl">
                                                    {person.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-1 leading-none">{person.name}</h4>
                                                    <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em] mb-3">{person.job_role}</p>
                                                    {person.mentorship_available && (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active Mentor</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-10 relative z-10">
                                                <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors">
                                                    <Building className="w-5 h-5 text-indigo-500" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Company</span>
                                                        <span className="text-sm font-black text-slate-700">{person.company || 'Tech Leader'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors">
                                                    <GraduationCap className="w-5 h-5 text-primary-500" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Loop</span>
                                                        <span className="text-sm font-black text-slate-700">{person.department} • Class of {person.batch}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedAlumni(person)}
                                                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary-600 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 group/btn"
                                            >
                                                Initialize Pursuit <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-40 text-center bg-white/40 rounded-[5rem] border-4 border-dashed border-white"
                                >
                                    <div className="w-24 h-24 bg-white shadow-2xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                                        <Search className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">No Connections Formed</h3>
                                    <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto leading-relaxed">The search engine couldn't find matches. Try broadening your criteria.</p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilters({ name: '', company: '', department: '', batch: '', mentorship_available: '' });
                                        }}
                                        className="mt-12 px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-2xl"
                                    >
                                        Reset Search Loop
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'bulletin' && <BulletinBoard />}
                {activeTab === 'my_requests' && (
                    <div className="py-40 text-center bg-white rounded-[5rem] border shadow-xl">
                        <Zap className="w-24 h-24 text-slate-200 animate-pulse mx-auto mb-10" />
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">Synchronization In Progress</h2>
                        <p className="text-slate-500 font-bold text-lg max-w-lg mx-auto leading-relaxed">Your active mentorship pursuits are being synced with the secure cloud repository.</p>
                        <button onClick={() => setActiveTab('browse')} className="mt-12 px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-2xl">Return to Exploration</button>
                    </div>
                )}
            </main>

            {/* Modal: Pursuit Initialization */}
            <AnimatePresence>
                {selectedAlumni && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAlumni(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                            className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-12">
                                <header className="flex justify-between items-start mb-12">
                                    <div>
                                        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2 leading-none">Initialize Pursuit</h3>
                                        <p className="text-slate-500 font-bold text-sm">Target: <span className="text-primary-600 uppercase tracking-widest">{selectedAlumni.name}</span></p>
                                    </div>
                                    <button onClick={() => setSelectedAlumni(null)} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </header>

                                <form onSubmit={handleRequestSubmit} className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Engagement Protocol</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['career_guidance', 'resume_review', 'interview_prep', 'referral'].map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setRequestData({ ...requestData, purpose: mode })}
                                                    className={`py-4 px-6 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all border-2 ${requestData.purpose === mode ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-primary-100'}`}
                                                >
                                                    {mode.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Personalized Message</label>
                                        <textarea
                                            className="w-full p-8 bg-slate-50/80 rounded-[2.5rem] border-none focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-sm min-h-[160px] placeholder:text-slate-300"
                                            placeholder="Introduce yourself with impact..."
                                            value={requestData.message}
                                            onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-primary-600 shadow-2xl shadow-slate-200 transition-all active:scale-95">Send Pulsar Request</button>
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

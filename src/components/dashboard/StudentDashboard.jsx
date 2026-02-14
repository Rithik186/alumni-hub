import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, Filter, Users, UserPlus, Check,
    MessageSquare, Building, GraduationCap,
    Calendar, Sparkles, Briefcase, Zap,
    ChevronRight, MapPin, Star, Clock,
    FileText, ShieldCheck, X, SlidersHorizontal
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
        mentorship_available: 'true'
    });
    const [showFilters, setShowFilters] = useState(false);

    // Sync searchTerm to filters.name (simplified for user)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setFilters(prev => ({ ...prev, name: searchTerm }));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Fetch Alumni with React Query
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
    });

    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [requestData, setRequestData] = useState({ purpose: 'career_guidance', message: '' });

    const connectMutation = useMutation({
        mutationFn: async ({ alumniId, ...details }) => {
            return axios.post('/api/student/request-mentorship',
                { alumni_id: alumniId, ...details },
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
        <div className="space-y-12 pb-24 max-w-[1400px] mx-auto">
            {/* Mentorship Request Modal */}
            <AnimatePresence>
                {selectedAlumni && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAlumni(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10">
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Connect with Mentor</h3>
                                <p className="text-slate-500 font-bold text-sm mb-8">Requesting guidance from <span className="text-primary-600">{selectedAlumni.name}</span></p>

                                <form onSubmit={handleRequestSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Purpose</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: 'resume_review', label: 'Resume Review', icon: FileText },
                                                { id: 'career_guidance', label: 'Career Guidance', icon: Zap },
                                                { id: 'interview_prep', label: 'Interview Prep', icon: ShieldCheck }
                                            ].map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setRequestData({ ...requestData, purpose: p.id })}
                                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${requestData.purpose === p.id ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                                >
                                                    <p.icon className={`w-5 h-5 ${requestData.purpose === p.id ? 'text-primary-600' : 'text-slate-400'}`} />
                                                    <span className="font-bold">{p.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personal Message</label>
                                        <textarea
                                            placeholder="Write a brief note about why you're reaching out..."
                                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-slate-700 min-h-[120px]"
                                            value={requestData.message}
                                            onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAlumni(null)}
                                            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={connectMutation.isPending}
                                            className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all disabled:opacity-50 font-bold"
                                        >
                                            {connectMutation.isPending ? 'Sending...' : 'Send Request'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Dynamic Welcome Header */}
            <header className="relative p-12 rounded-[3.5rem] bg-slate-900 text-white overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-primary-600/30 to-transparent"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] group-hover:bg-primary-600/30 transition-all duration-1000"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-xs font-black uppercase tracking-widest"
                        >
                            <Sparkles className="w-4 h-4 text-yellow-400" /> Discover Your Future
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
                            Find Your <br /><span className="text-primary-400">Elite Mentor.</span>
                        </h1>
                        <p className="text-slate-300 text-xl max-w-xl font-medium">
                            The alumni network is now live. Connect with global leaders from {alumni.length > 0 ? "various" : "top"} industries.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 text-center flex flex-col items-center justify-center">
                            <Users className="w-8 h-8 mb-3 text-primary-400" />
                            <div className="text-3xl font-black">{alumni.length}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Ready to Mentor</div>
                        </div>
                        <div className="bg-primary-600 p-8 rounded-[2.5rem] shadow-xl shadow-primary-500/30 text-center flex flex-col items-center justify-center">
                            <Zap className="w-8 h-8 mb-3 text-white" />
                            <div className="text-3xl font-black">2.4k</div>
                            <div className="text-[10px] text-primary-100 uppercase font-black tracking-widest mt-1">Connections Made</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Announcements */}
            <BulletinBoard />

            {/* Perfect Search & Filters */}
            <div className="sticky top-24 z-40">
                <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-2xl border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                {isFetching && <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent animate-spin rounded-full"></div>}
                                <Search className={`w-5 h-5 ${isFetching ? 'hidden' : 'text-slate-400'} group-focus-within:text-primary-600 transition-colors`} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, company, role or skills..."
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all border-2 ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200'}`}
                            >
                                <SlidersHorizontal className="w-5 h-5" /> Filters
                            </button>
                            <button
                                onClick={() => setFilters({ ...filters, mentorship_available: filters.mentorship_available === 'true' ? '' : 'true' })}
                                className={`px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all border-2 ${filters.mentorship_available === 'true' ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-200' : 'bg-white text-slate-700 border-slate-100 hover:border-primary-500'}`}
                            >
                                <ShieldCheck className={`w-5 h-5 ${filters.mentorship_available === 'true' ? 'text-yellow-300' : 'text-primary-500'}`} />
                                Available Only
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-slate-100 mt-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 pb-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Industry/Company</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Google, Microsoft"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-600"
                                            value={filters.company}
                                            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Department</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-600 cursor-pointer"
                                            value={filters.department}
                                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                        >
                                            <option value="">All Departments</option>
                                            <option value="CSE">CSE</option>
                                            <option value="ECE">ECE</option>
                                            <option value="IT">IT</option>
                                            <option value="MECH">Mechanical</option>
                                            <option value="CIVIL">Civil</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Batch Year</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 2022"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary-500 outline-none font-bold text-slate-600"
                                            value={filters.batch}
                                            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Alumni Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[450px] bg-white rounded-[3rem] shadow-sm animate-pulse flex flex-col p-10 space-y-6 border border-slate-100">
                            <div className="flex justify-between">
                                <div className="w-24 h-24 bg-slate-100 rounded-3xl"></div>
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                            </div>
                            <div className="h-10 bg-slate-100 rounded-xl w-3/4"></div>
                            <div className="h-4 bg-slate-100 rounded-xl w-1/2"></div>
                            <div className="flex-1 space-y-4 pt-6">
                                <div className="h-12 bg-slate-50 rounded-2xl"></div>
                                <div className="h-12 bg-slate-50 rounded-2xl"></div>
                            </div>
                            <div className="h-16 bg-slate-100 rounded-3xl"></div>
                        </div>
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {alumni.map((person) => (
                            <motion.div
                                layout
                                key={person.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                                className="relative bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-primary-200 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all group overflow-hidden"
                            >
                                {/* Status Chip */}
                                <div className="absolute top-10 right-10 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-tighter">Verified</span>
                                </div>

                                <div className="flex items-start gap-8 mb-10">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 relative z-10">
                                            {person.name.charAt(0)}
                                        </div>
                                        <div className="absolute inset-0 bg-primary-600 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        {person.mentorship_available && (
                                            <div className="absolute -bottom-3 -right-3 bg-primary-600 p-2 rounded-2xl shadow-xl border-4 border-white z-20">
                                                <Star className="w-4 h-4 text-white fill-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="text-3xl font-black text-slate-900 leading-none group-hover:text-primary-600 transition-colors uppercase tracking-tighter mb-2">
                                            {person.name}
                                        </h3>
                                        <p className="text-primary-600 font-black text-xs uppercase tracking-[0.15em] opacity-80">
                                            {person.job_role}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 group-hover:bg-white transition-colors">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Company</p>
                                            <span className="text-sm font-black text-slate-700">{person.company || 'Confidential'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 group-hover:bg-white transition-colors">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Background</p>
                                            <span className="text-sm font-black text-slate-700">{person.department} • {person.batch}</span>
                                        </div>
                                    </div>

                                    {/* Advanced Skills Grid */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {(person.skills || ['Leadership', 'Mentorship']).map((skill, i) => (
                                            <span key={i} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-colors">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSelectedAlumni(person)}
                                        className="flex-[2] py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-600 shadow-2xl hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-3 group/btn active:scale-95 disabled:opacity-50"
                                    >
                                        <UserPlus className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                        Request Pursuit
                                    </button>
                                    <button className="flex-1 py-5 bg-slate-50 text-slate-800 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 border border-slate-200">
                                        Profile
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {!isLoading && alumni.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-full py-40 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100"
                >
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10">
                        <Search className="w-16 h-16 text-slate-200" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">No matches found</h3>
                    <p className="text-slate-400 max-w-sm mx-auto font-bold text-lg leading-relaxed">
                        The elite network is vast, but we couldn't find this specific combination. Resetting your filters might reveal hidden opportunities.
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilters({ name: '', company: '', department: '', batch: '', mentorship_available: '' });
                        }}
                        className="mt-12 px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-xl"
                    >
                        Reset All Filters
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default StudentDashboard;

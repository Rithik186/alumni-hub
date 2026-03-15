import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, Zap, Flame, UserPlus, FileText, Bookmark, BookOpen, Send, CheckCircle2, ChevronRight, MessageSquare, Heart, Loader2, Link as LinkIcon, Image as ImageIcon, Video, X, Filter, LayoutDashboard, Settings, Bell, Sparkles, TrendingUp, Compass, Edit2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostItem from '../shared/PostItem';

const StudentDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('feed'); // feed, search
    const [filters, setFilters] = useState({
        name: '', company: '', college: '', department: '', batch: '',
        skills: '', job_role: '', experience_level: '', mentorship_available: ''
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [activeDomain, setActiveDomain] = useState('All Domains');
    const domains = ['All Domains', 'Software Developer', 'Backend', 'Frontend', 'Data Science', 'Product Manager', 'Design'];
    const [isPosting, setIsPosting] = useState(false);
    const [postData, setPostData] = useState({ content: '', image_url: '', video_url: '' });

    // Fetch Feed
    const { data: feed = [], isLoading: feedLoading } = useQuery({
        queryKey: ['feed'],
        queryFn: async () => {
            const { data } = await axios.get('/api/posts/feed', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 5000
    });

    // Fetch Search Results
    const { data: searchResultsQuery = [], isFetching: isSearchingQuery } = useQuery({
        queryKey: ['alumniSearch', filters, searchTerm],
        queryFn: async () => {
            const params = new URLSearchParams({ ...filters, name: searchTerm });
            const { data } = await axios.get(`/api/student/alumni?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        enabled: activeTab === 'search' || !!searchTerm || Object.values(filters).some(v => !!v)
    });

    // Fetch My Follow Statues (Requested, Accepted)
    const { data: myFollowStatuses = {} } = useQuery({
        queryKey: ['myFollowStatuses'],
        queryFn: async () => {
            const { data } = await axios.get('/api/connections/my-statuses', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 5000
    });

    // Fetch Stats
    const { data: stats = { followers: 0, following: 0 } } = useQuery({
        queryKey: ['socialStats'],
        queryFn: async () => {
            const { data } = await axios.get('/api/connections/stats', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 10000
    });

    // Fetch Suggestions
    const { data: suggestions = [] } = useQuery({
        queryKey: ['suggestions'],
        queryFn: async () => {
            const { data } = await axios.get('/api/connections/suggestions', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    // Mutations
    const likeMutation = useMutation({
        mutationFn: ({ postId, isDislike }) =>
            axios.post(`/api/posts/${postId}/like`, { isDislike }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            }),
        onSuccess: () => queryClient.invalidateQueries(['feed'])
    });

    const followMutation = useMutation({
        mutationFn: (followingId) =>
            axios.post(`/api/connections/follow/${followingId}`, {}, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(['suggestions']);
            queryClient.invalidateQueries(['socialStats']);
            queryClient.invalidateQueries(['feed']);
            queryClient.invalidateQueries(['myFollowStatuses']);
        }
    });

    const handleMediaUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await axios.post('/api/upload/media', formData, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (type === 'image') setPostData(prev => ({ ...prev, image_url: data.url, video_url: '' }));
            else setPostData(prev => ({ ...prev, video_url: data.url, image_url: '' }));
        } catch (err) {
            console.error('Upload Error:', err);
            alert('Upload failed');
        }
    };

    const createPostMutation = useMutation({
        mutationFn: async (data) => axios.post('/api/posts', data, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            setPostData({ content: '', image_url: '', video_url: '' });
            setIsPosting(false);
            queryClient.invalidateQueries(['feed']);
        }
    });

    const navItems = [
        { id: 'feed', label: 'News Feed', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'network', label: 'Network', icon: UserPlus, path: '/network' },
        { id: 'chat', label: 'Messages', icon: MessageSquare, path: '/chat' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/profile' }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
            {/* Ambient Animated Background for a Stunning effect */}
            <div className="fixed inset-0 z-[0] pointer-events-none opacity-[0.4] md:opacity-[0.6]">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-teal-300/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-indigo-400/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 relative z-10 block pb-24 md:pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10">

                    {/* === LEFT SIDEBAR (Desktop) === */}
                    <div className="hidden lg:block lg:col-span-3 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Profile Card */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 relative">
                                <div className="h-28 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full"></div>
                                </div>
                                <div className="px-8 pb-8">
                                    <div className="relative -mt-12 mb-4 flex justify-center">
                                        <div className="w-24 h-24 bg-white/50 backdrop-blur-xl rounded-[28px] p-1.5 shadow-2xl relative">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-[28px] opacity-20 animate-pulse"></div>
                                            <div className="w-full h-full bg-slate-100 rounded-[22px] flex items-center justify-center text-3xl font-black text-blue-600 uppercase overflow-hidden bg-cover bg-center relative z-10" style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}>
                                                {!user.profile_picture && user.name.charAt(0)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1 mb-6 inline-flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full"><Sparkles className="w-3 h-3" /> {user.role}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100/50">
                                        <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-blue-200 transition-colors group cursor-pointer">
                                            <span className="block text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{stats.followers}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Followers</span>
                                        </div>
                                        <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-indigo-200 transition-colors group cursor-pointer">
                                            <span className="block text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{stats.following}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Following</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Nav Mneu */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                                {navItems.map(item => (
                                    <Link key={item.id} to={item.path} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm mb-1 ${item.id === 'feed' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                        <item.icon className={`w-5 h-5 ${item.id === 'feed' ? 'text-white' : 'text-slate-400'}`} />
                                        {item.label}
                                    </Link>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {/* === CENTRAL FEED === */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* Mobile Header elements */}
                        <div className="lg:hidden flex flex-col gap-4 mb-2">
                            {/* Welcome Bar */}
                            <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-5 rounded-[28px] flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] rounded-[18px]">
                                        <div className="w-full h-full bg-slate-100 rounded-[16px] flex items-center justify-center font-black text-xl text-blue-600 overflow-hidden bg-cover bg-center" style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}>
                                            {!user.profile_picture && user.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Welcome back</p>
                                        <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">{user.name}</h2>
                                    </div>
                                </div>
                                <button className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
                                </button>
                            </div>

                            {/* Mobile Nav Scroller */}
                            <div className="flex gap-3 overflow-x-auto modern-scrollbar pb-2 snap-x px-1">
                                {navItems.map(item => (
                                    <Link key={item.id} to={item.path} className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider snap-start ${item.id === 'feed' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white/60 backdrop-blur-md border border-white/40 text-slate-500'}`}>
                                        <item.icon className="w-4 h-4" /> {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl rounded-[28px] p-2 md:p-3 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative z-20">
                            <div className="relative flex-1 group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (e.target.value && activeTab !== 'search') setActiveTab('search');
                                        if (!e.target.value && !Object.values(filters).some(v => !!v)) setActiveTab('feed');
                                    }}
                                    placeholder="Search connections, roles, colleges..."
                                    className="w-full pl-12 pr-4 py-4 md:py-4 bg-transparent border-none rounded-2xl text-[13px] md:text-sm font-bold text-slate-900 focus:ring-0 outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setIsFilterOpen(!isFilterOpen);
                                    if (!isFilterOpen) setActiveTab('search');
                                }}
                                className={`p-4 md:p-4 rounded-[20px] transition-all flex hidden md:flex items-center justify-center shrink-0 ${isFilterOpen ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <Filter className="w-5 h-5 md:w-5 md:h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsFilterOpen(!isFilterOpen);
                                    if (!isFilterOpen) setActiveTab('search');
                                }}
                                className={`p-3 rounded-xl transition-all md:hidden flex items-center justify-center shrink-0 ${isFilterOpen ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </motion.div>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div initial={{ opacity: 0, height: 0, scale: 0.98 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.98 }} className="overflow-hidden">
                                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[28px] p-6 shadow-xl mb-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2"><Filter className="w-4 h-4 text-blue-500" /> Advanced Filters</h3>
                                            <button onClick={() => { setFilters({ name: '', company: '', college: '', department: '', batch: '', skills: '', job_role: '', experience_level: '', mentorship_available: '' }); setActiveTab('feed'); setIsFilterOpen(false); }} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Clear All</button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {Object.keys(filters).map(key => (
                                                <div key={key}>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{key.replace('_', ' ')}</label>
                                                    <input
                                                        type="text"
                                                        value={filters[key]}
                                                        onChange={(e) => {
                                                            const newFilters = { ...filters, [key]: e.target.value };
                                                            setFilters(newFilters);
                                                            if (Object.values(newFilters).some(v => !!v)) setActiveTab('search');
                                                        }}
                                                        className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/60 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                                        placeholder={`Any ${key}...`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Create Post Area */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px] shrink-0 hidden sm:block">
                                    <div className="w-full h-full bg-white rounded-[18px] flex items-center justify-center text-indigo-600 font-black overflow-hidden bg-cover bg-center" style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}>
                                        {!user.profile_picture && user.name.charAt(0)}
                                    </div>
                                </div>
                                <div className="flex-1 w-full">
                                    <div
                                        onClick={() => setIsPosting(true)}
                                        className={`w-full transition-all cursor-text rounded-2xl ${isPosting ? '' : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-100/60 p-4'}`}
                                    >
                                        {!isPosting ? (
                                            <div className="flex items-center gap-3 text-slate-400 text-[13px] md:text-sm font-bold">
                                                <Edit2 className="w-4 h-4" /> <span className="truncate">Share an update, opportunity, or question...</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <textarea
                                                    autoFocus
                                                    value={postData.content}
                                                    onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                                                    className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 text-slate-900 text-sm md:text-base font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none min-h-[140px] resize-none transition-all"
                                                    placeholder="What do you want to share with your network?"
                                                />
                                                {(postData.image_url || postData.video_url) && (
                                                    <div className="mt-4 relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 group shadow-inner">
                                                        {postData.image_url && <img src={postData.image_url} alt="Attached" className="w-full h-auto max-h-[400px] object-cover" />}
                                                        {postData.video_url && <video src={postData.video_url} controls className="w-full h-auto max-h-[400px] object-contain bg-slate-900" />}
                                                        <button onClick={() => setPostData({ ...postData, image_url: '', video_url: '' })} className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl shadow-xl backdrop-blur-md transition-all">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex items-center justify-between mt-4 overflow-hidden ${!isPosting && 'pt-0 mt-0 sm:mt-4'}`}>
                                        <div className={`flex gap-1 md:gap-2 transition-all duration-300 ${!isPosting && 'opacity-100'}`}>
                                            <label className="px-3 py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 border border-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4 md:w-5 md:h-5" /> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block">Photo</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
                                            </label>
                                            <label className="px-3 py-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 bg-slate-50 border border-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-2">
                                                <Video className="w-4 h-4 md:w-5 md:h-5" /> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block">Video</span>
                                                <input type="file" className="hidden" accept="video/*" onChange={(e) => handleMediaUpload(e, 'video')} />
                                            </label>
                                        </div>
                                        {isPosting && (
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => setIsPosting(false)}
                                                    className="px-4 md:px-6 py-2.5 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => createPostMutation.mutate(postData)}
                                                    disabled={!postData.content || createPostMutation.isPending}
                                                    className="px-6 md:px-8 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center gap-2 shrink-0"
                                                >
                                                    {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3 h-3 md:w-4 md:h-4" />}
                                                    <span className="hidden xs:inline">{createPostMutation.isPending ? 'Posting...' : 'Post'}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Domain Filter Pills / Tabs */}
                        {activeTab === 'feed' && (
                            <div className="flex items-center gap-3 overflow-x-auto modern-scrollbar pb-2 px-1 snap-x">
                                <div className="shrink-0 flex items-center gap-2 pr-3 border-r border-slate-200/60 text-slate-400 hidden md:flex">
                                    <Compass className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
                                </div>
                                {domains.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setActiveDomain(d)}
                                        className={`shrink-0 px-5 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-wider transition-all snap-start shadow-sm border ${activeDomain === d
                                            ? 'bg-blue-500 border-blue-500 text-white shadow-blue-200/50'
                                            : 'bg-white/60 border-white/40 text-slate-500 hover:bg-white hover:text-slate-900 backdrop-blur-sm'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Feed / Search Content Header */}
                        {activeTab === 'search' && (
                            <div className="flex items-center justify-between px-2 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-2xl border-l-[3px] border-blue-500 mb-6">
                                <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">Search Results <span className="text-blue-500 ml-2 bg-blue-100 px-2 py-0.5 rounded-full">{searchResultsQuery.length}</span></h3>
                                <button onClick={() => setActiveTab('feed')} className="text-[10px] font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white">Back to Feed</button>
                            </div>
                        )}

                        {/* Feed Content */}
                        {activeTab === 'search' ? (
                            <div className="space-y-6">
                                {isSearchingQuery ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center">
                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                        <span className="uppercase text-[11px] font-black text-blue-500 tracking-[0.3em] animate-pulse">Scanning Network...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                                        {searchResultsQuery.map((result, idx) => (
                                            <motion.div
                                                key={result.id}
                                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                                className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-5 md:p-6 rounded-[28px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-blue-100 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[20px] flex items-center justify-center text-2xl font-black text-slate-400 group-hover:shadow-lg group-hover:shadow-blue-200/40 transition-all overflow-hidden bg-cover bg-center shrink-0" style={{ backgroundImage: result.profile_picture ? `url(${result.profile_picture})` : 'none' }}>
                                                        {!result.profile_picture && result.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-base md:text-lg font-black text-slate-900 tracking-tight truncate group-hover:text-blue-600 transition-colors">{result.name}</h4>
                                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-slate-400 shrink-0" /> {result.job_role} <span className="text-slate-300">•</span> {result.company}</p>
                                                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-100/50">{result.batch || 'Network'}</span>
                                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200/50 truncate max-w-[120px]">{result.department}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                                    <button
                                                        onClick={() => !myFollowStatuses[result.id] && followMutation.mutate(result.id)}
                                                        className={`w-full sm:w-auto px-6 py-3 md:py-3.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center break-keep min-w-[120px] ${myFollowStatuses[result.id] === 'pending'
                                                            ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default shadow-none'
                                                            : myFollowStatuses[result.id] === 'accepted'
                                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default shadow-none'
                                                                : 'bg-slate-900 border border-slate-900 text-white hover:bg-blue-600 hover:border-blue-600 shadow-slate-200 hover:shadow-blue-200 shadow-lg'
                                                            }`}
                                                    >
                                                        {myFollowStatuses[result.id] === 'pending' ? 'Requested' : myFollowStatuses[result.id] === 'accepted' ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Following</> : 'Connect'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {searchResultsQuery.length === 0 && (
                                            <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 p-16 md:p-20 text-center rounded-[32px]">
                                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">No matching connections found</p>
                                                <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">Try adjusting your filters or search terms to discover more alumni.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : feedLoading ? (
                            <div className="py-20 font-black flex flex-col items-center justify-center">
                                <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-4" />
                                <span className="uppercase text-[11px] font-black text-teal-500 tracking-[0.3em] animate-pulse">Syncing Feed...</span>
                            </div>
                        ) : (
                            <div className="space-y-6 md:space-y-8">
                                {feed.filter(post => activeDomain === 'All Domains' ? true : post.author_role?.toLowerCase().includes(activeDomain.toLowerCase())).length === 0 && (
                                    <div className="bg-white/50 backdrop-blur-sm p-16 md:p-20 text-center border-2 border-dashed border-slate-200 rounded-[32px]">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                            <Zap className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <p className="text-slate-600 font-black uppercase text-xs md:text-sm tracking-widest mb-2">Your Feed is Empty</p>
                                        <p className="text-slate-400 font-medium text-[13px] md:text-sm max-w-xs mx-auto">Follow more peers and alumni across the network to see their updates here.</p>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {feed
                                        .filter(post => activeDomain === 'All Domains' ? true : post.author_role?.toLowerCase().includes(activeDomain.toLowerCase()))
                                        .map((post) => (
                                            <PostItem key={post.id} post={post} user={user} expandedPostId={expandedPostId} setExpandedPostId={setExpandedPostId} likeMutation={likeMutation} />
                                        ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* === RIGHT SIDEBAR (Suggestions) === */}
                    <div className="hidden xl:block lg:col-span-3 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 md:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" /> Discover
                                    </h3>
                                </div>
                                <div className="space-y-6">
                                    {suggestions.slice(0, 5).map(s => (
                                        <div key={s.id} className="group relative">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[16px] flex items-center justify-center text-lg font-black text-slate-400 uppercase group-hover:shadow-lg transition-all duration-300 overflow-hidden bg-cover bg-center shrink-0 border border-slate-200/50" style={{ backgroundImage: s.profile_picture ? `url(${s.profile_picture})` : 'none' }}>
                                                        {!s.profile_picture && s.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[13px] font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors truncate">{s.name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{s.job_role || 'Academic Peer'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => followMutation.mutate(s.id)}
                                                    className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-[12px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                                >
                                                    Connect
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {suggestions.length === 0 && (
                                        <p className="text-[10px] text-center uppercase tracking-widest font-bold text-slate-400 py-6">No suggestions right now</p>
                                    )}
                                </div>
                                {suggestions.length > 5 && (
                                    <button onClick={() => setActiveTab('search')} className="w-full mt-6 py-3 text-[10px] uppercase tracking-widest font-black text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl">View More</button>
                                )}
                            </motion.div>

                            {/* Promotional / Event Mini Card placeholder */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[32px] text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mb-4">
                                        <Bookmark className="w-4 h-4 text-white" />
                                    </div>
                                    <h4 className="font-black text-base md:text-lg mb-1">Upcoming Event</h4>
                                    <p className="text-slate-300 text-[11px] font-medium leading-relaxed mb-4">Join the Annual Tech Alumni Meetup 2026. Network with leaders.</p>
                                    <button className="text-[10px] uppercase tracking-widest font-black bg-white text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors">Register Now</button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>

                {/* Mobile Extra Spacing */}
                <div className="h-10 lg:hidden"></div>
            </div>

            {/* Live Synchronizer Status (Subtle) */}
            <div className="fixed bottom-4 left-4 z-[100] hidden md:block">
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 transition-all">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">Network Synced</span>
                </div>
            </div>

        </div>
    );
};

export default StudentDashboard;

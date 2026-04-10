import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Search, UserPlus, Send, CheckCircle2, MessageSquare,
    Heart, Loader2, Image as ImageIcon, Video, X, Filter,
    LayoutDashboard, Settings, TrendingUp, Compass, Edit2,
    BookOpen, Users, Zap, Smile, Sparkles, Bell,
    Briefcase, GraduationCap, Clock, Calendar, Building2, Megaphone,
    ChevronRight, ExternalLink, Hash, Check, UserCheck

} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostItem from '../shared/PostItem';
import SpotlightCard from '../animations/SpotlightCard';
import Avatar from './Avatar';
import { tamilNaduColleges, engineeringDepartments, collegeSpecificDepartments } from '../../data/colleges';


// ─── Helpers ──────────────────────────────────────────────────────────────────
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const formatRelativeTime = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


// ─── Create Post ────────────────────────────────────────────────────────────────
const CreatePostCard = ({ user }) => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const textareaRef = useRef(null);

    const createMutation = useMutation({
        mutationFn: () => axios.post('/api/posts', { content, image_url: imageUrl, video_url: videoUrl }, authHeader(user.token)),
        onSuccess: () => {
            setContent(''); setImageUrl(''); setVideoUrl(''); setExpanded(false);
            queryClient.invalidateQueries(['feed']);
        }
    });

    const handleUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await axios.post('/api/upload/media', fd, authHeader(user.token));
            if (type === 'image') { setImageUrl(data.url); setVideoUrl(''); }
            else { setVideoUrl(data.url); setImageUrl(''); }
        } catch { /* silently fail */ }
        setUploading(false);
    };

    const expand = () => {
        setExpanded(true);
        setTimeout(() => textareaRef.current?.focus(), 60);
    };

    return (
        <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.1)">
            <div className="sd-card">
                <div className="p-4">
                <div className="flex gap-3">
                    <Avatar src={user.profile_picture} name={user.name} size={44} />
                    <div className="flex-1 min-w-0">
                        {!expanded ? (
                            <button
                                onClick={expand}
                                className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-400 font-medium transition-all flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">What's on your mind, {user.name?.split(' ')[0]}?</span>
                            </button>
                        ) : (
                            <div className="space-y-3" onClick={e => e.stopPropagation()}>
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Share your thoughts, achievements, or ask the community..."
                                    rows={4}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-300 resize-none transition-all"
                                />
                                {(imageUrl || videoUrl) && (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                        {imageUrl && <img src={imageUrl} alt="Preview" className="w-full max-h-52 object-cover" />}
                                        {videoUrl && <video src={videoUrl} controls className="w-full max-h-52" />}
                                        <button onClick={() => { setImageUrl(''); setVideoUrl(''); }} className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-0.5">
                                        <label className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-all" title="Photo">
                                            <ImageIcon className="w-5 h-5" />
                                            <input type="file" hidden accept="image/*" onChange={e => handleUpload(e, 'image')} />
                                        </label>
                                        <label className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-all" title="Video">
                                            <Video className="w-5 h-5" />
                                            <input type="file" hidden accept="video/*" onChange={e => handleUpload(e, 'video')} />
                                        </label>
                                        {uploading && (
                                            <div className="flex items-center gap-1.5 ml-2 text-indigo-500">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-xs font-medium">Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setExpanded(false); setContent(''); setImageUrl(''); setVideoUrl(''); }} className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => createMutation.mutate()}
                                            disabled={!content.trim() || createMutation.isPending}
                                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-40 flex items-center gap-1.5"
                                        >
                                            {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {!expanded && (
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                        <label onClick={expand} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg cursor-pointer transition-all text-[13px] font-medium">
                            <ImageIcon className="w-[18px] h-[18px]" /> Photo
                        </label>
                        <label onClick={expand} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-500 hover:bg-purple-50 hover:text-purple-600 rounded-lg cursor-pointer transition-all text-[13px] font-medium">
                            <Video className="w-[18px] h-[18px]" /> Video
                        </label>
                        <button onClick={expand} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all text-[13px] font-medium">
                            <Smile className="w-[18px] h-[18px]" /> Feeling
                        </button>
                    </div>
                )}
            </div>
        </div>
        </SpotlightCard>
    );
};

// ─── People Card ────────────────────────────────────────────────────────────────
const PeopleCard = ({ person, followStatus, onFollow }) => (
    <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.1)">
    <div className="sd-card p-4 flex items-center gap-3">
        <Avatar src={person.profile_picture} name={person.name} size={44} />
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{person.name}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{person.job_role || person.department || 'Alumni'}{person.company ? ` at ${person.company}` : ''}</p>
            {person.batch && <p className="text-[11px] text-indigo-500 font-medium mt-0.5">Batch of {person.batch}</p>}
        </div>
        <button
            onClick={onFollow}
            disabled={!!followStatus}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 flex-shrink-0 border ${
                followStatus === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default' :
                followStatus === 'pending'  ? 'bg-amber-50 text-amber-600 border-amber-200 cursor-default' :
                'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm'
            }`}
        >
            {followStatus === 'accepted' ? <><CheckCircle2 className="w-3 h-3" /> Connected</> :
             followStatus === 'pending'  ? 'Pending' :
             <><UserPlus className="w-3 h-3" /> Connect</>}
        </button>
    </div>
    </SpotlightCard>
);

// ─── Skeletons ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.05)">
    <div className="sd-card p-4 animate-pulse">
        <div className="flex gap-3 mb-4">
            <div className="w-11 h-11 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-slate-200 rounded-full w-28" />
                <div className="h-2.5 bg-slate-100 rounded-full w-20" />
            </div>
        </div>
        <div className="space-y-2 mb-4">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
            <div className="h-3 bg-slate-100 rounded w-3/5" />
        </div>
        <div className="h-8 bg-slate-50 rounded-lg w-full" />
    </div>
    </SpotlightCard>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const StudentDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();

    const [view, setView] = useState('feed');
    const [networkTab, setNetworkTab] = useState('requests');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDomain, setFilterDomain] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [searchFilters, setSearchFilters] = useState({ company: '', college: '', branch: '', batch: '', skills: '', job_role: '' });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventFilters, setEventFilters] = useState({ 
        status: 'upcoming', 
        category: 'all', 
        company: '', 
        role: '', 
        minLpa: '', 
        maxLpa: '', 
        location: '' 
    });

    const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
    const collegeSuggestions = useMemo(() => {
        if (!searchFilters.college) return [];
        return tamilNaduColleges.filter(c => 
            c.toLowerCase().includes(searchFilters.college.toLowerCase())
        ).slice(0, 8);
    }, [searchFilters.college]);

    const [showBranchSuggestions, setShowBranchSuggestions] = useState(false);
    const branchSuggestions = useMemo(() => {
        if (!searchFilters.branch) return [];
        const collegeName = (searchFilters.college || '').trim().toLowerCase();
        const specificListKey = Object.keys(collegeSpecificDepartments).find(k => k.toLowerCase() === collegeName);
        const baseList = specificListKey ? collegeSpecificDepartments[specificListKey] : engineeringDepartments;
        return baseList.filter(d => 
            d.toLowerCase().includes(searchFilters.branch.toLowerCase())
        ).slice(0, 8);
    }, [searchFilters.branch, searchFilters.college]);

    const commonRoles = [
        'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'Data Scientist', 'Data Analyst', 'Product Manager', 'UX Designer', 'UI Designer',
        'DevOps Engineer', 'Cloud Architect', 'Mobile Developer', 'Security Analyst',
        'Quality Assurance', 'Marketing Associate', 'Business Development', 'Human Resources'
    ];




    const domains = ['All', 'Engineering', 'Design', 'Data Science', 'Product', 'Marketing'];

    const navItems = [
        { id: 'feed',    label: 'Feed',     icon: LayoutDashboard, path: null },
        { id: 'events',  label: 'Events',   icon: Calendar,        path: null },
        { id: 'network', label: 'Network',  icon: Users,           path: null },
        { id: 'search',  label: 'Discover', icon: Compass,         path: null },
        { id: 'chat',    label: 'Messages', icon: MessageSquare,   path: '/chat' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },

    ];

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: feed = [], isLoading: feedLoading, error: feedError } = useQuery({
        queryKey: ['feed'],
        queryFn: async () => {
            const { data } = await axios.get('/api/posts/feed', authHeader(user.token));
            return Array.isArray(data) ? data : [];
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    
    const { data: eventsList = [] } = useQuery({
        queryKey: ['events'],
        queryFn: async () => (await axios.get('/api/events', authHeader(user.token))).data,
        staleTime: 10 * 1000,
    });


    const { data: stats = { followers: 0, following: 0 } } = useQuery({
        queryKey: ['socialStats'],
        queryFn: async () => (await axios.get('/api/connections/stats', authHeader(user.token))).data,
        staleTime: 10 * 60 * 1000, retry: 1,
        refetchOnWindowFocus: false,
    });

    const { data: suggestions = [] } = useQuery({
        queryKey: ['suggestions'],
        queryFn: async () => {
            const { data } = await axios.get('/api/connections/suggestions', authHeader(user.token));
            return Array.isArray(data) ? data.slice(0, 5) : [];
        },
        staleTime: 15 * 60 * 1000, retry: 1,
        refetchOnWindowFocus: false,
    });

    const { data: followStatuses = {} } = useQuery({
        queryKey: ['myFollowStatuses'],
        queryFn: async () => (await axios.get('/api/connections/my-statuses', authHeader(user.token))).data || {},
        staleTime: 2 * 60 * 1000, retry: 1,
        refetchOnWindowFocus: false,
    });

    // ── Network Queries (loaded when network view is active) ──────────────
    const { data: followRequests = [], isLoading: loadingRequests } = useQuery({
        queryKey: ['followRequests'],
        queryFn: async () => (await axios.get('/api/connections/requests', authHeader(user.token))).data,
        enabled: view === 'network',
    });

    const { data: networkFollowers = [], isLoading: loadingFollowers } = useQuery({
        queryKey: ['followers'],
        queryFn: async () => (await axios.get('/api/connections/followers', authHeader(user.token))).data,
        enabled: view === 'network',
    });

    const { data: networkFollowing = [], isLoading: loadingFollowing } = useQuery({
        queryKey: ['following'],
        queryFn: async () => (await axios.get('/api/connections/following', authHeader(user.token))).data,
        enabled: view === 'network',
    });

    const searchEnabled = view === 'search' && (!!searchQuery || Object.values(searchFilters).some(Boolean));
    const { data: searchResults = [], isFetching: searchLoading } = useQuery({
        queryKey: ['alumniSearch', searchQuery, searchFilters],
        queryFn: async () => {
            const params = new URLSearchParams({ name: searchQuery, ...searchFilters });
            const { data } = await axios.get(`/api/student/alumni?${params}`, authHeader(user.token));
            return Array.isArray(data) ? data : [];
        },
        enabled: searchEnabled, staleTime: 30000, retry: 1,
    });

    // ── Mutations ────────────────────────────────────────────────────────────
    const followMutation = useMutation({
        mutationFn: (id) => axios.post(`/api/connections/follow/${id}`, {}, authHeader(user.token)),
        onSuccess: () => {
            queryClient.invalidateQueries(['myFollowStatuses']);
            queryClient.invalidateQueries(['suggestions']);
            queryClient.invalidateQueries(['socialStats']);
        }
    });

    const updateRequestMutation = useMutation({
        mutationFn: async ({ followerId, status }) => axios.put('/api/connections/follow/status', { followerId, status }, authHeader(user.token)),
        onSuccess: () => {
            queryClient.invalidateQueries(['followRequests']);
            queryClient.invalidateQueries(['followers']);
            queryClient.invalidateQueries(['following']);
            queryClient.invalidateQueries(['socialStats']);
            queryClient.invalidateQueries(['myFollowStatuses']);
            queryClient.invalidateQueries(['suggestions']);
        }
    });

    // ── Derived Data ─────────────────────────────────────────────────────────
    const filteredFeed = useMemo(() => {
        if (filterDomain === 'All') return feed;
        return feed.filter(p => p.content?.toLowerCase().includes(filterDomain.toLowerCase()));
    }, [feed, filterDomain]);

    const myPostsCount = useMemo(() => feed.filter(p => p.user_id === user.id).length, [feed, user.id]);

    const trendingTopics = useMemo(() => {
        const words = {};
        feed.forEach(p => {
            const matches = p.content?.match(/#\w+/g);
            if (matches) matches.forEach(tag => { words[tag] = (words[tag] || 0) + 1; });
        });
        return Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [feed]);

    if (!user) return null;

    // ═════════════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, #f7fafd 0%, #e6ecf5 60%, #e0e7ef 100%)',
        }}>
            {/* Inline Scoped Styles */}
            <style>{`
                .sd-card {
                    background: #fafdff;
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    transition: box-shadow 0.15s ease;
                }
                .sd-card:hover {
                    box-shadow: 0 2px 8px -2px rgba(16,30,54,0.07);
                }
                .sd-nav-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 8px 12px; border-radius: 8px;
                    font-size: 13px; font-weight: 500;
                    color: #334155; transition: all 0.15s;
                    width: 100%;
                }
                .sd-nav-item:hover { background: #e6ecf5; color: #1e293b; }
                .sd-nav-item.active { background: #e0e7ff; color: #1d4ed8; font-weight: 600; }
                .sd-nav-item.active svg { color: #1d4ed8; }
            `}</style>

            <div className="w-full px-4 lg:px-5 pt-2 pb-5">
                {/* ═══ THREE-COLUMN LAYOUT ═══ */}
                <div className="flex gap-5">

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* LEFT SIDEBAR — fixed 240px width                      */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <aside className="hidden lg:block w-[240px] flex-shrink-0">
                        <div className="sticky top-[68px] space-y-3">
                            {/* Profile Card */}
                            <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.1)">
                            <div className="sd-card overflow-hidden">
                                <div className="h-14 bg-gradient-to-r from-[#1e293b] via-[#334155] to-[#2563eb] relative">
                                    <div className="absolute -bottom-5 left-4">
                                        <Avatar src={user.profile_picture} name={user.name} size={48} userId={user.id} className="border-[3px] border-white shadow-md" />
                                    </div>

                                </div>
                                <div className="pt-7 pb-4 px-4">
                                    <h2 className="font-semibold text-[#1e293b] text-[14px] leading-tight truncate">{user.name}</h2>
                                    <p className="text-[11px] text-[#64748b] font-medium capitalize truncate mt-0.5">{user.role}{user.department ? ` · ${user.department}` : ''}</p>
                                    <div className="flex gap-5 mt-3 pt-3 border-t border-slate-100">
                                        <button onClick={() => { setView('network'); setNetworkTab('followers'); }} className="group text-left">
                                            <p className="font-bold text-[#1e293b] text-sm leading-none group-hover:text-[#2563eb] transition-colors">{stats.followers}</p>
                                            <p className="text-[10px] text-[#64748b] font-medium mt-0.5">Followers</p>
                                        </button>
                                        <button onClick={() => { setView('network'); setNetworkTab('following'); }} className="group text-left">
                                            <p className="font-bold text-[#1e293b] text-sm leading-none group-hover:text-[#2563eb] transition-colors">{stats.following}</p>
                                            <p className="text-[10px] text-[#64748b] font-medium mt-0.5">Following</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            </SpotlightCard>

                            {/* Navigation */}
                            <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.1)">
                            <nav className="sd-card p-2">
                                {navItems.map(item => {
                                    const isActive = item.id === 'feed' ? view === 'feed' : item.id === view;
                                    const inner = (
                                        <span className={`sd-nav-item ${isActive ? 'active' : ''}`}>
                                            <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? '' : 'text-slate-400'}`} />
                                            {item.label}
                                        </span>
                                    );
                                    if (item.path && item.id !== 'search') return <Link key={item.id} to={item.path}>{inner}</Link>;
                                    return <button key={item.id} className="w-full" onClick={() => setView(item.id)}>{inner}</button>;
                                })}
                            </nav>
                            </SpotlightCard>

                            {/* Activity Stats */}
                            <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.1)">
                            <div className="sd-card p-4">
                                <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-2.5">Your Activity</p>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Posts Shared', val: myPostsCount, dot: 'bg-indigo-500' },
                                        { label: 'Connections', val: stats.following, dot: 'bg-emerald-500' },
                                        { label: 'Network Size', val: stats.followers, dot: 'bg-violet-500' }
                                    ].map(s => (
                                        <div key={s.label} className="flex items-center justify-between">
                                            <span className="text-xs text-[#334155] font-medium flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                {s.label}
                                            </span>
                                            <span className="text-xs font-bold text-[#1e293b]">{s.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </SpotlightCard>

                            {/* Trending Topics */}
                            {trendingTopics.length > 0 && (
                                <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.1)">
                                <div className="sd-card p-4">
                                    <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-2.5">Trending</p>
                                    <div className="space-y-1.5">
                                        {trendingTopics.map(([tag, count]) => (
                                            <div key={tag} className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-[#2563eb] flex items-center gap-1.5">
                                                    <Hash className="w-3 h-3" /> {tag.replace('#', '')}
                                                </span>
                                                <span className="text-[10px] text-[#64748b]">{count} posts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                </SpotlightCard>
                            )}
                        </div>
                    </aside>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* CENTER FEED — flexible, takes remaining space         */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <main className="flex-1 min-w-0 space-y-3">
                        {/* Search Bar */}
                        <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.08)" overflowHidden={false}>
                        <div className="sd-card">
                            <div className="p-3 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onFocus={() => setView('search')}
                                        placeholder="Search people, skills, companies..."
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-300 focus:bg-white transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(f => !f)}
                                    className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <Filter className="w-4 h-4" />
                                </button>
                                {view === 'search' && (
                                    <button onClick={() => { setView('feed'); setSearchQuery(''); setShowFilters(false); }} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {showFilters && (
                                <div className="px-3 pb-3 pt-0 border-t border-slate-100">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2.5">
                                        {Object.entries(searchFilters).map(([key, val]) => {
                                            if (key === 'college') {
                                                return (
                                                    <div key={key} className="relative group">
                                                        <input
                                                            type="text"
                                                            placeholder="College Name"
                                                            value={val}
                                                            onFocus={() => setShowCollegeSuggestions(true)}
                                                            onBlur={() => setTimeout(() => setShowCollegeSuggestions(false), 200)}
                                                            onChange={e => { setSearchFilters(f => ({ ...f, college: e.target.value })); setView('search'); setShowCollegeSuggestions(true); }}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 capitalize outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500/10 transition-all"
                                                        />
                                                        <AnimatePresence>
                                                            {showCollegeSuggestions && collegeSuggestions.length > 0 && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    className="absolute z-[300] top-full mt-1.5 w-[140%] sm:w-[180%] left-0 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
                                                                >
                                                                    <div className="p-1 px-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Suggested Institutions</span>
                                                                        <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                                                    </div>
                                                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                                        {collegeSuggestions.map((college, idx) => (
                                                                            <button
                                                                                key={idx}
                                                                                onClick={() => {
                                                                                    setSearchFilters(f => ({ ...f, college }));
                                                                                    setShowCollegeSuggestions(false);
                                                                                    setView('search');
                                                                                }}
                                                                                className="w-full text-left px-3 py-2.5 text-[11px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border-b border-slate-50 last:border-0 flex items-center gap-2 group/item"
                                                                            >
                                                                                <GraduationCap className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-indigo-400" />
                                                                                <span className="flex-1 truncate">{college}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            }
                                            if (key === 'branch') {
                                                return (
                                                    <div key={key} className="relative group">
                                                        <input
                                                            type="text"
                                                            placeholder="Branch / Dept"
                                                            value={val}
                                                            onFocus={() => setShowBranchSuggestions(true)}
                                                            onBlur={() => setTimeout(() => setShowBranchSuggestions(false), 200)}
                                                            onChange={e => { setSearchFilters(f => ({ ...f, branch: e.target.value })); setView('search'); setShowBranchSuggestions(true); }}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 capitalize outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500/10 transition-all"
                                                        />
                                                        <AnimatePresence>
                                                            {showBranchSuggestions && branchSuggestions.length > 0 && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    className="absolute z-[300] top-full mt-1.5 w-[140%] sm:w-[180%] left-0 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
                                                                >
                                                                    <div className="p-1 px-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Suggested Branches</span>
                                                                        <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                                                    </div>
                                                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                                        {branchSuggestions.map((branch, idx) => (
                                                                            <button
                                                                                key={idx}
                                                                                onClick={() => {
                                                                                    setSearchFilters(f => ({ ...f, branch }));
                                                                                    setShowBranchSuggestions(false);
                                                                                    setView('search');
                                                                                }}
                                                                                className="w-full text-left px-3 py-2.5 text-[11px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border-b border-slate-50 last:border-0 flex items-center gap-2 group/item"
                                                                            >
                                                                                <BookOpen className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-indigo-400" />
                                                                                <span className="flex-1 truncate">{branch}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <input
                                                    key={key}
                                                    type="text"
                                                    placeholder={key.replace('_', ' ')}
                                                    value={val}
                                                    onChange={e => { setSearchFilters(f => ({ ...f, [key]: e.target.value })); setView('search'); }}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 capitalize outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500/10 transition-all"
                                                />
                                            );
                                        })}
                                        <button onClick={() => setSearchFilters({ company: '', college: '', branch: '', batch: '', skills: '', job_role: '' })} className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-all text-center">
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        </SpotlightCard>

                        {/* Domain Tags */}
                        {view === 'feed' && (
                            <div className="flex gap-1.5 overflow-x-auto pb-0.5 modern-scrollbar">
                                {domains.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setFilterDomain(d)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                                            filterDomain === d
                                                ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                                                : 'bg-[#fafdff] text-[#334155] border-[#d1d5db] hover:border-[#94a3b8] hover:text-[#1e293b]'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ─── FEED VIEW ───────────────────────────────────────── */}
                        {view === 'feed' && (
                            <>
                                <CreatePostCard user={user} />

                                {feedLoading ? (
                                    <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
                                ) : feedError ? (
                                    <div className="sd-card p-10 text-center">
                                        <Zap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="font-semibold text-slate-600 text-sm mb-1">Couldn't load your feed</p>
                                        <p className="text-xs text-slate-400 mb-3">Something went wrong. Please try again.</p>
                                        <button onClick={() => queryClient.invalidateQueries(['feed'])} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all">
                                            Retry
                                        </button>
                                    </div>
                                ) : filteredFeed.length === 0 ? (
                                    <div className="sd-card p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BookOpen className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="font-semibold text-slate-700 text-sm mb-1">Your feed is empty</p>
                                        <p className="text-xs text-slate-400 max-w-xs mx-auto">Connect with alumni and peers to start seeing posts here.</p>
                                        <button onClick={() => setView('search')} className="mt-4 px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all">
                                            Discover People
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredFeed.map(post => (
                                            <PostItem key={post.id} post={post} user={user} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ─── SEARCH VIEW ──────────────────────────────────────── */}
                        {view === 'search' && (
                            <div className="space-y-2.5">
                                <p className="text-xs font-semibold text-slate-500 px-1">
                                    {searchLoading ? 'Searching...' : searchEnabled ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}` : 'Type to search'}
                                </p>
                                {searchLoading ? (
                                    <div className="sd-card p-10 flex flex-col items-center gap-2">
                                        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                                        <p className="text-xs text-slate-400 font-medium">Searching your network...</p>
                                    </div>
                                ) : !searchEnabled ? (
                                    <div className="sd-card p-10 text-center">
                                        <Search className="w-9 h-9 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-500">Start typing to find alumni & peers</p>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="sd-card p-10 text-center">
                                        <Users className="w-9 h-9 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-500">No people found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms</p>
                                    </div>
                                ) : (
                                    searchResults.map(person => (
                                        <PeopleCard
                                            key={person.id}
                                            person={person}
                                            followStatus={followStatuses[person.id]}
                                            onFollow={() => !followStatuses[person.id] && followMutation.mutate(person.id)}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* ─── EVENTS VIEW ───────────────────────────────────────── */}
                        {view === 'events' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <Calendar className="w-6 h-6 text-indigo-600" /> Campus & Careers
                                        </h2>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Discover jobs, internships, and platform events</p>
                                    </div>
                                    <button onClick={() => setView('feed')} className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all font-bold">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Filters Header */}
                                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                                    <div className="flex flex-wrap gap-3 mb-5">
                                        <button onClick={() => setEventFilters({...eventFilters, status: 'upcoming'})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${eventFilters.status === 'upcoming' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Upcoming</button>
                                        <button onClick={() => setEventFilters({...eventFilters, status: 'completed'})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${eventFilters.status === 'completed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>Completed</button>
                                        <div className="h-8 w-[1px] bg-slate-200 mx-1" />
                                        {['all', 'placement', 'job', 'internship', 'training', 'alumni_meet'].map(cat => (
                                            <button key={cat} onClick={() => setEventFilters({...eventFilters, category: cat})} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${eventFilters.category === cat ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                                {cat.replace('_', ' ')}
                                            </button>
                                        ))}

                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input type="text" placeholder="Company..." className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-50 outline-none" value={eventFilters.company} onChange={(e) => setEventFilters({...eventFilters, company: e.target.value})} />
                                        </div>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input 
                                                type="text" 
                                                list="role-suggestions"
                                                placeholder="Role (e.g. SDE)..." 
                                                className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-50 outline-none" 
                                                value={eventFilters.role} 
                                                onChange={(e) => setEventFilters({...eventFilters, role: e.target.value})} 
                                            />
                                            <datalist id="role-suggestions">
                                                {commonRoles.map(role => <option key={role} value={role} />)}
                                            </datalist>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input type="number" placeholder="Min LPA" className="w-full h-10 pl-9 pr-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-medium focus:ring-2 focus:ring-indigo-50 outline-none" value={eventFilters.minLpa} onChange={(e) => setEventFilters({...eventFilters, minLpa: e.target.value})} />
                                            </div>
                                            <span className="text-slate-300">-</span>
                                            <div className="relative flex-1">
                                                <input type="number" placeholder="Max LPA" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-medium focus:ring-2 focus:ring-indigo-50 outline-none" value={eventFilters.maxLpa} onChange={(e) => setEventFilters({...eventFilters, maxLpa: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input type="text" placeholder="Location..." className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-50 outline-none" value={eventFilters.location} onChange={(e) => setEventFilters({...eventFilters, location: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                {/* Events List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {eventsList.filter(e => {
                                        const now = new Date();
                                        const eventDate = new Date(e.date);
                                        // Allow a 6-hour grace period for events to stay in 'upcoming'
                                        const gracePeriod = 6 * 60 * 60 * 1000;
                                        const matchesStatus = eventFilters.status === 'upcoming' 
                                            ? (eventDate.getTime() + gracePeriod) >= now.getTime() 
                                            : (eventDate.getTime() + gracePeriod) < now.getTime();
                                        const matchesCategory = eventFilters.category === 'all' || e.type === eventFilters.category;
                                        const matchesCompany = !eventFilters.company || e.metadata?.company?.toLowerCase().includes(eventFilters.company.toLowerCase());
                                        const matchesRole = !eventFilters.role || e.metadata?.role?.toLowerCase().includes(eventFilters.role.toLowerCase());
                                        
                                        // Package Filtering logic
                                        const eventSalary = e.metadata?.salary ? parseFloat(e.metadata.salary.replace(/[^0-9.]/g, '')) : 0;
                                        const min = eventFilters.minLpa ? parseFloat(eventFilters.minLpa) : 0;
                                        const max = eventFilters.maxLpa ? parseFloat(eventFilters.maxLpa) : Infinity;
                                        const matchesPackage = eventSalary >= min && eventSalary <= max;

                                        const matchesLocation = !eventFilters.location || e.metadata?.location?.toLowerCase().includes(eventFilters.location.toLowerCase());
                                        return matchesStatus && matchesCategory && matchesCompany && matchesRole && matchesPackage && matchesLocation;
                                    }).length === 0 ? (
                                        <div className="col-span-2 py-20 text-center bg-white rounded-[32px] border border-slate-200">
                                            <Calendar className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                            <p className="text-slate-500 font-bold">No events found matching your criteria</p>
                                            <button onClick={() => setEventFilters({ status: 'upcoming', category: 'all', company: '', role: '', minLpa: '', maxLpa: '', location: '' })} className="mt-4 text-indigo-600 font-bold text-xs underline">Clear all filters</button>
                                        </div>
                                    ) : (
                                        eventsList.filter(e => {
                                            const now = new Date();
                                            const eventDate = new Date(e.date);
                                            const gracePeriod = 6 * 60 * 60 * 1000;
                                            const matchesStatus = eventFilters.status === 'upcoming' 
                                                ? (eventDate.getTime() + gracePeriod) >= now.getTime() 
                                                : (eventDate.getTime() + gracePeriod) < now.getTime();
                                            const matchesCategory = eventFilters.category === 'all' || e.type === eventFilters.category;
                                            const matchesCompany = !eventFilters.company || e.metadata?.company?.toLowerCase().includes(eventFilters.company.toLowerCase());
                                            const matchesRole = !eventFilters.role || e.metadata?.role?.toLowerCase().includes(eventFilters.role.toLowerCase());
                                            
                                            const eventSalary = e.metadata?.salary ? parseFloat(e.metadata.salary.replace(/[^0-9.]/g, '')) : 0;
                                            const min = eventFilters.minLpa ? parseFloat(eventFilters.minLpa) : 0;
                                            const max = eventFilters.maxLpa ? parseFloat(eventFilters.maxLpa) : Infinity;
                                            const matchesPackage = eventSalary >= min && eventSalary <= max;

                                            const matchesLocation = !eventFilters.location || e.metadata?.location?.toLowerCase().includes(eventFilters.location.toLowerCase());
                                            return matchesStatus && matchesCategory && matchesCompany && matchesRole && matchesPackage && matchesLocation;
                                        }).map(event => (

                                            <div key={event.id} className="bg-white rounded-[28px] border border-slate-200 p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                                                <div className={`absolute top-0 left-0 w-1 h-full ${
                                                    ['placement', 'job', 'internship'].includes(event.type) ? 'bg-indigo-500' :
                                                    event.type === 'training' ? 'bg-emerald-500' :
                                                    event.type === 'alumni_meet' ? 'bg-amber-500' : 'bg-slate-400'
                                                }`} />
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                        ['placement', 'job', 'internship'].includes(event.type) ? 'bg-indigo-50 text-indigo-600' :
                                                        event.type === 'training' ? 'bg-emerald-50 text-emerald-600' :
                                                        event.type === 'alumni_meet' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {event.type.replace('_', ' ')}
                                                    </span>

                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-slate-900">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{event.title}</h3>
                                                
                                                <div className="space-y-3 mb-6">
                                                    {['placement', 'job', 'internship'].includes(event.type) && (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                                <Building2 className="w-3.5 h-3.5 text-slate-400" /> {event.metadata?.company}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {event.metadata?.role}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                                                                {event.metadata?.salary}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                                <Compass className="w-3.5 h-3.5 text-slate-400" /> {event.metadata?.location || 'Campus'}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!['placement', 'job', 'internship'].includes(event.type) && (
                                                        <p className="text-xs text-slate-500 font-medium line-clamp-2">{event.description}</p>
                                                    )}
                                                </div>


                                                <button onClick={() => setSelectedEvent(event)} className="w-full py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                                                    View Full Details <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── NETWORK VIEW ─────────────────────────────────────── */}
                        {view === 'network' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-indigo-500" /> Connections & Network
                                        </h2>
                                        <p className="text-[11px] text-slate-400 mt-0.5 ml-6">Manage your professional network</p>
                                    </div>
                                    <button onClick={() => setView('feed')} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Network Tabs */}
                                <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.1)">
                                    <div className="sd-card p-1.5 flex gap-1">
                                        {[
                                            { id: 'requests', label: 'Requests', icon: UserPlus, count: followRequests.length },
                                            { id: 'followers', label: 'Followers', icon: Users, count: networkFollowers.length },
                                            { id: 'following', label: 'Following', icon: UserCheck, count: networkFollowing.length },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setNetworkTab(tab.id)}
                                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                                                    networkTab === tab.id
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                                }`}
                                            >
                                                <tab.icon className="w-3.5 h-3.5" />
                                                {tab.label}
                                                {tab.count > 0 && (
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        networkTab === tab.id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
                                                    }`}>{tab.count}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </SpotlightCard>

                                {/* Requests */}
                                {networkTab === 'requests' && (
                                    loadingRequests ? (
                                        <div className="sd-card p-10 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-indigo-400" /></div>
                                    ) : followRequests.length === 0 ? (
                                        <div className="sd-card p-10 text-center">
                                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <UserPlus className="w-7 h-7 text-indigo-200" />
                                            </div>
                                            <p className="font-semibold text-slate-700 text-sm mb-1">No Pending Requests</p>
                                            <p className="text-xs text-slate-400">When someone requests to follow you, it will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {followRequests.map(req => (
                                                <SpotlightCard key={req.follower_id || req.id} className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.08)">
                                                    <div className="sd-card p-4 flex items-center gap-3">
                                                        <Avatar src={req.profile_picture} name={req.follower_name || req.name} size={44} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-900 text-sm truncate">{req.follower_name || req.name}</p>
                                                            <p className="text-[11px] text-slate-400 capitalize truncate mt-0.5">
                                                                {req.follower_role || req.role}{req.follower_college ? ` • ${req.follower_college}` : ''}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1.5 flex-shrink-0">
                                                            <button onClick={() => updateRequestMutation.mutate({ followerId: req.follower_id || req.id, status: 'rejected' })} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => updateRequestMutation.mutate({ followerId: req.follower_id || req.id, status: 'accepted' })} className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1.5">
                                                                <Check className="w-3.5 h-3.5" /> Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                </SpotlightCard>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* Followers */}
                                {networkTab === 'followers' && (
                                    loadingFollowers ? (
                                        <div className="sd-card p-10 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-indigo-400" /></div>
                                    ) : networkFollowers.length === 0 ? (
                                        <div className="sd-card p-10 text-center">
                                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Users className="w-7 h-7 text-indigo-200" />
                                            </div>
                                            <p className="font-semibold text-slate-700 text-sm mb-1">No Followers Yet</p>
                                            <p className="text-xs text-slate-400">People who follow you will appear here.</p>
                                        </div>
                                    ) : (
                                        <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.08)">
                                            <div className="sd-card overflow-hidden">
                                                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">All Followers ({networkFollowers.length})</p>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {networkFollowers.map(f => (
                                                        <div key={f.id} className="p-3.5 flex items-center gap-3 hover:bg-indigo-50/30 transition-colors">
                                                            <Avatar src={f.avatar || f.profile_picture} name={f.name} size={40} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-slate-900 truncate">{f.name}</p>
                                                                <p className="text-[11px] text-slate-400 capitalize mt-0.5">{f.role}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    )
                                )}

                                {/* Following */}
                                {networkTab === 'following' && (
                                    loadingFollowing ? (
                                        <div className="sd-card p-10 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-indigo-400" /></div>
                                    ) : networkFollowing.length === 0 ? (
                                        <div className="sd-card p-10 text-center">
                                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <UserCheck className="w-7 h-7 text-indigo-200" />
                                            </div>
                                            <p className="font-semibold text-slate-700 text-sm mb-1">Not Following Anyone</p>
                                            <p className="text-xs text-slate-400">People you follow will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {networkFollowing.map(f => (
                                                <SpotlightCard key={f.id} className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.08)">
                                                    <div className="sd-card p-4 text-center">
                                                        <Avatar src={f.avatar || f.profile_picture} name={f.name} size={48} className="mx-auto mb-2" />
                                                        <p className="font-semibold text-slate-900 text-sm truncate">{f.name}</p>
                                                        <p className="text-[10px] text-slate-400 capitalize mt-0.5 mb-3">{f.role}</p>
                                                        <button
                                                            onClick={() => updateRequestMutation.mutate({ followerId: f.id, status: 'rejected' })}
                                                            className="w-full py-1.5 bg-slate-900 text-white hover:bg-rose-600 rounded-lg text-[11px] font-semibold transition-colors"
                                                        >
                                                            Unfollow
                                                        </button>
                                                    </div>
                                                </SpotlightCard>
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </main>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* RIGHT SIDEBAR — fixed 280px width                     */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <aside className="hidden lg:block w-[280px] flex-shrink-0">
                        <div className="sticky top-[68px] space-y-3">
                            {/* People You May Know */}
                            <div className="sd-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> People you may know
                                    </p>
                                    <button onClick={() => setView('search')} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                        See all
                                    </button>
                                </div>
                                {suggestions.length === 0 ? (
                                    <div className="text-center py-5">
                                        <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-xs text-slate-400">No suggestions yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {suggestions.slice(0, 3).map(s => (
                                            <div key={s.id} className="flex items-center gap-2.5">
                                                <Avatar src={s.profile_picture} name={s.name} size={36} userId={s.id} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-semibold text-slate-900 truncate leading-none cursor-pointer hover:text-indigo-600" onClick={() => navigate(`/profile/${s.id}`)}>{s.name}</p>
                                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.job_role || s.department || 'Alumni'}</p>
                                                </div>
                                                <button
                                                    onClick={() => followMutation.mutate(s.id)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                    </div>
                                )}
                            </div>

                            {/* Resume Intelligence Section */}
                            <SpotlightCard className="bg-transparent" spotlightColor="rgba(99, 102, 241, 0.15)">
                                <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-[32px] p-6 shadow-sm overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors" />
                                    
                                    <div className="relative">
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                                <Sparkles className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 leading-tight">Resume Intelligence</h3>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">AI Powered</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-5">
                                            Get an instant analysis of your resume and see how it matches with top alumni companies.
                                        </p>

                                        <div className="space-y-3 mb-6">
                                            {[
                                                { icon: Check, label: 'ATS Score Prediction' },
                                                { icon: Zap, label: 'Skill Gap Analysis' },
                                                { icon: Briefcase, label: 'Smart Job Matching' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center">
                                                        <item.icon className="w-2.5 h-2.5 text-indigo-600" />
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-slate-600">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 group">
                                            Analyze Resume <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </SpotlightCard>



                            {/* Quick Links */}
                            <div className="sd-card p-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Links</p>
                                <div className="space-y-0.5">
                                    {[
                                        { label: 'My Profile', path: '/profile', icon: Settings, desc: 'View your profile' },
                                        { label: 'Settings', path: '/settings', icon: Settings, desc: 'Manage preferences' },
                                        { label: 'Messages', path: '/chat', icon: MessageSquare, desc: 'Chat with connections' },
                                        { label: 'My Network', path: '/network', icon: Users, desc: 'View your connections' },
                                    ].map(l => (
                                        <Link key={l.path} to={l.path} className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-slate-50 transition-all group">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                                                <l.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{l.label}</p>
                                                <p className="text-[10px] text-slate-400">{l.desc}</p>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity Summary */}
                            <div className="sd-card p-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Recent Posts</p>
                                {feed.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-3">No recent activity.</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {feed.slice(0, 4).map(p => (
                                            <div key={p.id} className="flex items-start gap-2.5">
                                                <Avatar src={p.author_profile_picture} name={p.author_name} size={28} className="mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] text-slate-700 leading-snug">
                                                        <span className="font-semibold text-slate-900">{p.author_name}</span>{' '}
                                                        {p.content?.substring(0, 50)}{p.content?.length > 50 ? '...' : ''}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" /> {formatRelativeTime(p.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 rounded-xl p-4 text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-indigo-200" />
                                    <p className="font-semibold text-sm">Complete your profile</p>
                                </div>
                                <p className="text-indigo-200 text-xs leading-relaxed mb-3">
                                    Profiles with a photo and bio get 3× more connection requests.
                                </p>
                                <Link to="/profile" className="block text-center px-3 py-2 bg-white text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-50 transition-all">
                                    Update Profile →
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ─── MOBILE BOTTOM NAV ──────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#fafdff] border-t border-[#d1d5db] z-50 lg:hidden safe-area-inset">
                <div className="flex items-center justify-around py-1.5 px-2 max-w-lg mx-auto">
                    {[
                        { id: 'feed',    icon: LayoutDashboard, label: 'Home',     path: null },
                        { id: 'network', icon: Users,           label: 'Network',  path: null },
                        { id: 'search',  icon: Compass,         label: 'Discover', path: null },
                        { id: 'chat',    icon: MessageSquare,   label: 'Chat',     path: '/chat' },
                        { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
                    ].map(item => {
                        const isActive = item.id === 'feed' ? view === 'feed' : item.id === view;
                        const inner = (
                            <div className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                                isActive ? 'text-[#2563eb]' : 'text-[#94a3b8]'
                            }`}>
                                <item.icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </div>
                        );
                        if (item.path && item.id !== 'search') return <Link key={item.id} to={item.path}>{inner}</Link>;
                        return <button key={item.id} onClick={() => setView(item.id)}>{inner}</button>;
                    })}
                </div>
            </div>
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvent(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden z-[101]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header Gradient */}
                            <div className={`h-24 bg-gradient-to-br p-6 flex flex-col justify-end ${
                                selectedEvent.type === 'placement' ? 'from-indigo-600 to-violet-600' :
                                selectedEvent.type === 'training' ? 'from-emerald-600 to-teal-600' :
                                selectedEvent.type === 'alumni_meet' ? 'from-amber-500 to-orange-600' :
                                'from-slate-600 to-slate-800'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/20">
                                        {selectedEvent.type.replace('_', ' ')}
                                    </span>
                                    <button onClick={() => setSelectedEvent(null)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-white hover:bg-black/20 transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{selectedEvent.title}</h3>
                                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                            {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {new Date(selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Metadata Card */}
                                {selectedEvent.metadata && (
                                    <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                                        {selectedEvent.type === 'placement' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                                <Building2 className="w-4 h-4 text-indigo-600" />
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-800">{selectedEvent.metadata.company}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                                <Briefcase className="w-4 h-4 text-indigo-600" />
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-800">{selectedEvent.metadata.role}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Package</p>
                                                        <p className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg w-fit">
                                                            {selectedEvent.metadata.salary || 'Varies'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                                        <p className="text-sm font-semibold text-slate-700">{selectedEvent.metadata.location || 'On-campus / Remote'}</p>
                                                    </div>
                                                </div>
                                                {selectedEvent.metadata.eligibility && (
                                                    <div className="pt-2 border-t border-slate-200">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Eligibility Criteria</p>
                                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedEvent.metadata.eligibility}</p>
                                                    </div>
                                                )}

                                                {/* Alumni Insights Card */}
                                                {(selectedEvent.alumni_count > 0 || selectedEvent.type === 'placement') && selectedEvent.metadata?.company && (
                                                    <Link 
                                                        to={`/company/${selectedEvent.metadata.company}`}
                                                        className="mt-4 block p-4 bg-indigo-900 rounded-2xl group transition-all hover:bg-slate-900 relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl -mr-8 -mt-8" />
                                                        <div className="relative flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                                    <Users className="w-5 h-5 text-indigo-300" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">Alumni Insights</h4>
                                                                    <p className="text-[11px] font-bold text-indigo-300">
                                                                        {selectedEvent.alumni_count > 0 
                                                                            ? `${selectedEvent.alumni_count}+ Alumni's work here` 
                                                                            : `Find Alumni at ${selectedEvent.metadata.company}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-indigo-900 group-hover:translate-x-1 transition-all">
                                                                <ChevronRight className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                )}
                                            </div>
                                        )}


                                        {selectedEvent.type === 'training' && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Mentor / Speaker</p>
                                                        <p className="text-sm font-bold text-slate-800">{selectedEvent.metadata.speaker}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                                                        <Sparkles className="w-5 h-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Topic</p>
                                                        <p className="text-sm font-bold text-slate-800">{selectedEvent.metadata.topic}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedEvent.type === 'alumni_meet' && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                                        <Compass className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Venue</p>
                                                        <p className="text-sm font-bold text-slate-800">{selectedEvent.metadata.venue}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                                        <GraduationCap className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Target Audience</p>
                                                        <p className="text-sm font-bold text-slate-800">{selectedEvent.metadata.batch || 'All Batches'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">About the event</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        {selectedEvent.description}
                                    </p>
                                </div>

                                <button onClick={() => setSelectedEvent(null)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                    Dismiss Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="h-14 lg:hidden" />

        </div>
    );
};

export default StudentDashboard;

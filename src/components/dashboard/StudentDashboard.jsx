import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, UserPlus, Send, CheckCircle2, MessageSquare,
    Heart, Loader2, Image as ImageIcon, Video, X, Filter,
    LayoutDashboard, Settings, TrendingUp, Compass, Edit2,
    BookOpen, Users, Zap, Smile, Sparkles, Bell,
    Briefcase, GraduationCap, Clock, Calendar,
    ChevronRight, ExternalLink, Hash
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostItem from '../shared/PostItem';
import SpotlightCard from '../animations/SpotlightCard';

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

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 40, className = '' }) => (
    <div
        className={`rounded-full bg-gradient-to-br from-indigo-100 to-slate-100 flex items-center justify-center font-semibold text-slate-500 overflow-hidden bg-cover bg-center flex-shrink-0 border-2 border-white shadow-sm ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.38, backgroundImage: src ? `url(${src})` : 'none' }}
    >
        {!src && (name || '?').charAt(0).toUpperCase()}
    </div>
);

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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDomain, setFilterDomain] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [searchFilters, setSearchFilters] = useState({ company: '', college: '', batch: '', skills: '', job_role: '' });

    const domains = ['All', 'Engineering', 'Design', 'Data Science', 'Product', 'Marketing'];

    const navItems = [
        { id: 'feed',    label: 'Feed',     icon: LayoutDashboard, path: '/dashboard' },
        { id: 'network', label: 'Network',  icon: Users,           path: '/network' },
        { id: 'search',  label: 'Discover', icon: Compass,         path: null },
        { id: 'chat',    label: 'Messages', icon: MessageSquare,   path: '/chat' },
        { id: 'settings', label: 'Settings',  icon: Settings,        path: '/settings' },
    ];

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: feed = [], isLoading: feedLoading, error: feedError } = useQuery({
        queryKey: ['feed'],
        queryFn: async () => {
            const { data } = await axios.get('/api/posts/feed', authHeader(user.token));
            return Array.isArray(data) ? data : [];
        },
        staleTime: 60000,
        refetchInterval: 60000,
        retry: 2,
    });

    const { data: stats = { followers: 0, following: 0 } } = useQuery({
        queryKey: ['socialStats'],
        queryFn: async () => (await axios.get('/api/connections/stats', authHeader(user.token))).data,
        staleTime: 120000, retry: 1,
    });

    const { data: suggestions = [] } = useQuery({
        queryKey: ['suggestions'],
        queryFn: async () => {
            const { data } = await axios.get('/api/connections/suggestions', authHeader(user.token));
            return Array.isArray(data) ? data.slice(0, 5) : [];
        },
        staleTime: 300000, retry: 1,
    });

    const { data: followStatuses = {} } = useQuery({
        queryKey: ['myFollowStatuses'],
        queryFn: async () => (await axios.get('/api/connections/my-statuses', authHeader(user.token))).data || {},
        staleTime: 30000, retry: 1,
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
                                        <Avatar src={user.profile_picture} name={user.name} size={48} className="border-[3px] border-white shadow-md" />
                                    </div>
                                </div>
                                <div className="pt-7 pb-4 px-4">
                                    <h2 className="font-semibold text-[#1e293b] text-[14px] leading-tight truncate">{user.name}</h2>
                                    <p className="text-[11px] text-[#64748b] font-medium capitalize truncate mt-0.5">{user.role}{user.department ? ` · ${user.department}` : ''}</p>
                                    <div className="flex gap-5 mt-3 pt-3 border-t border-slate-100">
                                        <Link to="/network" className="group">
                                            <p className="font-bold text-[#1e293b] text-sm leading-none group-hover:text-[#2563eb] transition-colors">{stats.followers}</p>
                                            <p className="text-[10px] text-[#64748b] font-medium mt-0.5">Followers</p>
                                        </Link>
                                        <Link to="/network" className="group">
                                            <p className="font-bold text-[#1e293b] text-sm leading-none group-hover:text-[#2563eb] transition-colors">{stats.following}</p>
                                            <p className="text-[10px] text-[#64748b] font-medium mt-0.5">Following</p>
                                        </Link>
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
                        <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.08)">
                        <div className="sd-card overflow-hidden">
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
                                        {Object.entries(searchFilters).map(([key, val]) => (
                                            <input
                                                key={key}
                                                type="text"
                                                placeholder={key.replace('_', ' ')}
                                                value={val}
                                                onChange={e => { setSearchFilters(f => ({ ...f, [key]: e.target.value })); setView('search'); }}
                                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 capitalize outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500/10 transition-all"
                                            />
                                        ))}
                                        <button onClick={() => setSearchFilters({ company: '', college: '', batch: '', skills: '', job_role: '' })} className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-all">
                                            Clear
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
                                        <p className="text-[11px] text-slate-400 mt-0.5">Connect with more people to get recommendations.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {suggestions.map(s => (
                                            <div key={s.id} className="flex items-center gap-2.5">
                                                <Avatar src={s.profile_picture} name={s.name} size={36} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-semibold text-slate-900 truncate leading-none">{s.name}</p>
                                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.job_role || s.department || 'Alumni'}</p>
                                                </div>
                                                <button
                                                    onClick={() => followMutation.mutate(s.id)}
                                                    disabled={followStatuses[s.id]}
                                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all flex-shrink-0 border ${
                                                        followStatuses[s.id] === 'accepted' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                                        followStatuses[s.id] === 'pending' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                        'text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                                                    }`}
                                                >
                                                    {followStatuses[s.id] === 'accepted' ? 'Connected' :
                                                     followStatuses[s.id] === 'pending' ? 'Pending' : 'Connect'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Links */}
                            <div className="sd-card p-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Links</p>
                                <div className="space-y-0.5">
                                    {[
                                        { label: 'My Profile', path: '/profile', icon: Settings, desc: 'Edit your information' },
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
                        { id: 'feed',    icon: LayoutDashboard, label: 'Home',     path: '/dashboard' },
                        { id: 'network', icon: Users,           label: 'Network',  path: '/network' },
                        { id: 'search',  icon: Compass,         label: 'Discover', path: null },
                        { id: 'chat',    icon: MessageSquare,   label: 'Chat',     path: '/chat' },
                        { id: 'profile', icon: Settings,        label: 'Profile',  path: '/profile' },
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
            <div className="h-14 lg:hidden" />
        </div>
    );
};

export default StudentDashboard;

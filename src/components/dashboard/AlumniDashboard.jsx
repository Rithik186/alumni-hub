import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bell, Settings, CheckCircle2, X,
    LayoutDashboard, MessageSquare,
    Send, Image as ImageIcon,
    Video, Heart, Search, Users,
    TrendingUp, UserPlus,
    Loader2, Edit2, Zap, Bookmark,
    Clock, ChevronRight, Hash, Smile, BookOpen,
    Briefcase, Award, GraduationCap, UserCheck, Check

} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import PostItem from '../shared/PostItem';
import AvatarShared from './Avatar';


// ─── UI Components ────────────────────────────────────────────────────────────
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip } from '../ui/tooltip';
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
            queryClient.invalidateQueries(['myPosts']);
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
        <SpotlightCard className="bg-transparent" spotlightColor="rgba(20, 184, 166, 0.12)">
            <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex gap-3">
                    <AvatarShared src={user.profile_picture} name={user.name} size={44} userId={user.id} />
                    <div className="flex-1 min-w-0">
                        {!expanded ? (
                            <button
                                onClick={expand}
                                className="w-full text-left bg-slate-100/50 hover:bg-slate-100 border border-slate-200/60 rounded-full px-5 py-3 text-[14px] text-slate-500 font-medium transition-all flex items-center gap-3"
                            >
                                <Edit2 className="w-4 h-4 text-slate-400" />
                                <span className="truncate text-slate-500/80 font-semibold">What's on your mind, {user.name?.split(' ')[0]}?</span>
                            </button>
                        ) : (
                            <div className="space-y-4" onClick={e => e.stopPropagation()}>
                                <Textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Share your thoughts, achievements, or ask the community..."
                                    rows={4}
                                    className="min-h-[120px] border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 rounded-2xl transition-all resize-none text-[15px]"
                                />
                                {(imageUrl || videoUrl) && (
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                                        {imageUrl && <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-cover" />}
                                        {videoUrl && <video src={videoUrl} controls className="w-full max-h-64" />}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => { setImageUrl(''); setVideoUrl(''); }} 
                                            className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-slate-600 rounded-full hover:bg-white hover:text-rose-500 h-8 w-8 transition-all border border-slate-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        <Tooltip content="Add photo">
                                            <label className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all">
                                                <ImageIcon className="w-5.5 h-5.5" />
                                                <input type="file" hidden accept="image/*" onChange={e => handleUpload(e, 'image')} />
                                            </label>
                                        </Tooltip>
                                        <Tooltip content="Add video">
                                            <label className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all">
                                                <Video className="w-5.5 h-5.5" />
                                                <input type="file" hidden accept="video/*" onChange={e => handleUpload(e, 'video')} />
                                            </label>
                                        </Tooltip>
                                        {uploading && (
                                            <div className="flex items-center gap-1.5 ml-2 text-indigo-500">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-xs font-semibold">Syncing media...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => { setExpanded(false); setContent(''); setImageUrl(''); setVideoUrl(''); }}
                                            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <Button
                                            onClick={() => createMutation.mutate()}
                                            disabled={!content.trim() || createMutation.isPending}
                                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl px-6 py-5 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 group"
                                        >
                                            {createMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            )}
                                            Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {!expanded && (
                    <>
                        <Separator className="my-3 opacity-50" />
                        <div className="flex items-center justify-around">
                            <Tooltip content="Share a photo">
                                <button onClick={expand} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-100/80 rounded-xl transition-all text-sm font-semibold group">
                                    <ImageIcon className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" /> 
                                    <span>Photo</span>
                                </button>
                            </Tooltip>
                            <Tooltip content="Share a video">
                                <button onClick={expand} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-100/80 rounded-xl transition-all text-sm font-semibold group">
                                    <Video className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" /> 
                                    <span>Video</span>
                                </button>
                            </Tooltip>
                            <Tooltip content="Share how you feel">
                                <button onClick={expand} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-100/80 rounded-xl transition-all text-sm font-semibold group">
                                    <Smile className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" /> 
                                    <span>Feeling</span>
                                </button>
                            </Tooltip>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
        </SpotlightCard>
    );
};

// ─── Skeleton Card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <Card className="border-slate-200/80 bg-white/95">
        <CardContent className="p-4">
            <div className="flex gap-3 mb-4">
                <Skeleton className="w-11 h-11 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-3 w-28 rounded-full" />
                    <Skeleton className="h-2.5 w-20 rounded-full" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
        </CardContent>
    </Card>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const AlumniDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('feed');
    const [networkTab, setNetworkTab] = useState('requests');





    const navItems = [
        { id: 'feed', label: 'Feed', icon: LayoutDashboard, isTab: true },
        { id: 'network', label: 'Network', icon: Users, isTab: true },
        { id: 'notifications', label: 'Alerts', icon: Bell, isTab: true },
        { id: 'chat', label: 'Messages', icon: MessageSquare, path: '/chat' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ];


    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['alumniDashboard'],
        queryFn: async () => {
            const [followRequestsRes, profileRes] = await Promise.all([
                axios.get('/api/connections/requests', authHeader(user.token)),
                axios.get('/api/auth/me', authHeader(user.token))
            ]);
            return { requests: followRequestsRes.data, profile: profileRes.data };
        },
        staleTime: 5 * 60 * 1000, 
        refetchInterval: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    // Dedicated unread count for the badge (much lighter than full list)
    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => (await axios.get('/api/notifications/unread-count', authHeader(user.token))).data.count,
        refetchInterval: 60000, // Every 60s is sufficient
    });

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => (await axios.get('/api/notifications', authHeader(user.token))).data,
        enabled: activeTab === 'notifications', // Only fetch when looking at notifications
        staleTime: 60000,
    });

    const { data: stats = { followers: 0, following: 0 } } = useQuery({
        queryKey: ['socialStats'],
        queryFn: async () => (await axios.get('/api/connections/stats', authHeader(user.token))).data,
        staleTime: 10 * 60 * 1000, retry: 1,
        refetchOnWindowFocus: false,
    });

    const { data: myPosts = [], isLoading: feedLoading, error: feedError } = useQuery({
        queryKey: ['myPosts'],
        queryFn: async () => {
            const { data } = await axios.get('/api/posts/feed', authHeader(user.token));
            return Array.isArray(data) ? data : [];
        },
        staleTime: 2 * 60 * 1000,
        refetchInterval: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    });


    // ── Network Queries (loaded when network tab is active) ──────────────


    const { data: networkFollowers = [], isLoading: loadingFollowers } = useQuery({
        queryKey: ['followers'],
        queryFn: async () => (await axios.get('/api/connections/followers', authHeader(user.token))).data,
        enabled: activeTab === 'network',
    });

    const { data: networkFollowing = [], isLoading: loadingFollowing } = useQuery({
        queryKey: ['following'],
        queryFn: async () => (await axios.get('/api/connections/following', authHeader(user.token))).data,
        enabled: activeTab === 'network',
    });

    // ── Mutations ────────────────────────────────────────────────────────────
    const updateFollowMutation = useMutation({
        mutationFn: async ({ followerId, status }) => axios.put('/api/connections/follow/status', { followerId, status }, authHeader(user.token)),
        onSuccess: () => {
            queryClient.invalidateQueries(['alumniDashboard']);
            queryClient.invalidateQueries(['socialStats']);
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const markReadMutation = useMutation({
        mutationFn: async (id) => axios.put(`/api/notifications/${id}/read`, {}, authHeader(user.token)),
        onSuccess: () => queryClient.invalidateQueries(['notifications'])
    });

    if (!user) return null;

    // ── Derived ──────────────────────────────────────────────────────────────
    const followRequests = (dashboardData?.requests || []).filter(req => (req?.follower_id || req?.id) !== user?.id);
    const myPostsCount = useMemo(() => myPosts.filter(p => p?.user_id === user?.id).length, [myPosts, user?.id]);

    const trendingTopics = useMemo(() => {
        const words = {};
        myPosts.forEach(p => {
            const matches = p.content?.match(/#\w+/g);
            if (matches) matches.forEach(tag => { words[tag] = (words[tag] || 0) + 1; });
        });
        return Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [myPosts]);

    // Profile completion
    const profileCompletion = useMemo(() => {
        let score = 0;
        if (user.name) score += 25;
        if (user.profile_picture) score += 25;
        if (user.department) score += 25;
        if (user.bio || user.company || user.job_role) score += 25;
        return score;
    }, [user]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #f4faf8 0%, #e2eeeb 60%, #dae8e4 100%)' }}>
            <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-3" />
                <span className="text-xs font-semibold text-slate-500 tracking-wide">Loading Dashboard...</span>
            </div>
        </div>
    );

    // ═════════════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, #f4faf8 0%, #e2eeeb 60%, #dae8e4 100%)',
        }}>
            <div className="w-full px-4 lg:px-5 pt-2 pb-5">
                {/* ═══ THREE-COLUMN LAYOUT ═══ */}
                <div className="flex gap-5">

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* LEFT SIDEBAR — fixed 240px width                      */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <aside className="hidden lg:block w-[240px] flex-shrink-0">
                        <div className="sticky top-[68px] space-y-3">
                            {/* Profile Card */}
                            <Card className="overflow-hidden border-slate-200/80 bg-white/95 backdrop-blur-sm">
                                <div className="h-16 bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#14b8a6] relative">
                                    <div className="absolute -bottom-5 left-4">
                                        <AvatarShared src={user.profile_picture} name={user.name} size={48} userId={user.id} className="border-[3px] border-white shadow-md" />
                                    </div>

                                    <div className="absolute top-2 right-2">
                                        <Badge variant="teal" className="text-[9px] bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                            <Award className="w-2.5 h-2.5 mr-0.5" /> Alumni
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="pt-8 pb-4 px-4">
                                    <h2 className="font-semibold text-slate-900 text-[14px] leading-tight truncate">{user.name}</h2>
                                    <p className="text-[11px] text-slate-500 font-medium capitalize truncate mt-0.5">
                                        {user.role}{user.department ? ` · ${user.department}` : ''}
                                    </p>
                                    {user.company && (
                                        <p className="text-[10px] text-teal-600 font-medium mt-1 flex items-center gap-1">
                                            <Briefcase className="w-2.5 h-2.5" /> {user.company}
                                        </p>
                                    )}
                                    <Separator className="my-3" />
                                    <div className="flex gap-5">
                                        <Tooltip content="View Followers">
                                            <button onClick={() => { setActiveTab('network'); setNetworkTab('followers'); }} className="group text-left">
                                                <p className="font-bold text-slate-900 text-sm leading-none group-hover:text-teal-600 transition-colors">{stats.followers}</p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Followers</p>
                                            </button>
                                        </Tooltip>
                                        <Tooltip content="View Following">
                                            <button onClick={() => { setActiveTab('network'); setNetworkTab('following'); }} className="group text-left">
                                                <p className="font-bold text-slate-900 text-sm leading-none group-hover:text-teal-600 transition-colors">{stats.following}</p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Following</p>
                                            </button>
                                        </Tooltip>
                                    </div>
                                    {/* Profile Completion */}
                                    {profileCompletion < 100 && (
                                        <div className="mt-3 pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-semibold text-slate-500">Profile Strength</span>
                                                <span className="text-[10px] font-bold text-teal-600">{profileCompletion}%</span>
                                            </div>
                                            <Progress value={profileCompletion} className="h-1.5" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Navigation */}
                            <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm p-1.5">
                                <nav className="space-y-0.5">
                                    {navItems.map(item => {
                                        const isActive = item.id === 'feed' ? activeTab === 'feed' : item.id === activeTab;
                                        const inner = (
                                            <span className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all w-full ${
                                                isActive
                                                    ? 'bg-teal-50 text-teal-700 font-semibold'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}>
                                                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                                                {item.label}
                                                {item.id === 'notifications' && unreadCount > 0 && (
                                                    <Badge variant="destructive" className="ml-auto text-[9px] px-1.5 py-0">{unreadCount}</Badge>
                                                )}
                                                {item.id === 'network' && followRequests.length > 0 && (
                                                    <Badge variant="warning" className="ml-auto text-[9px] px-1.5 py-0">{followRequests.length}</Badge>
                                                )}
                                            </span>
                                        );
                                        if (item.path && !item.isTab) return <Link key={item.id} to={item.path}>{inner}</Link>;
                                        return <button key={item.id} className="w-full" onClick={() => setActiveTab(item.id)}>{inner}</button>;
                                    })}
                                </nav>
                            </Card>

                            {/* Activity Stats */}
                            <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Your Activity</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Posts Shared', val: myPostsCount, dot: 'bg-teal-500', icon: Edit2 },
                                            { label: 'Connections', val: stats.following, dot: 'bg-amber-500', icon: Users },
                                            { label: 'Network Size', val: stats.followers, dot: 'bg-emerald-600', icon: TrendingUp }
                                        ].map(s => (
                                            <div key={s.label} className="flex items-center justify-between">
                                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                    {s.label}
                                                </span>
                                                <Badge variant="secondary" className="text-[10px] font-bold">{s.val}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trending Topics */}
                            {trendingTopics.length > 0 && (
                                <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <TrendingUp className="w-3 h-3 text-teal-500" /> Trending
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-1.5">
                                            {trendingTopics.map(([tag, count]) => (
                                                <div key={tag} className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-teal-600 flex items-center gap-1.5">
                                                        <Hash className="w-3 h-3" /> {tag.replace('#', '')}
                                                    </span>
                                                    <Badge variant="outline" className="text-[9px]">{count} posts</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </aside>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* CENTER FEED — flexible, takes remaining space         */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <main className="flex-1 min-w-0 space-y-3">
                        {/* Search Bar */}
                        <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm">
                            <CardContent className="p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search the alumni network..."
                                        className="pl-9 bg-teal-50/30 border-teal-200/60 focus:ring-teal-500/20 focus:border-teal-400"
                                    />
                                </div>
                            </CardContent>
                        </Card>


                        {activeTab === 'feed' && (
                            <>
                                <CreatePostCard user={user} />
                                {feedLoading ? (
                                    <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
                                ) : feedError ? (
                                    <Card className="border-slate-200/80 bg-white/95">
                                        <CardContent className="p-10 text-center">
                                            <Zap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                            <p className="font-semibold text-slate-600 text-sm mb-1">Couldn't load your feed</p>
                                            <p className="text-xs text-slate-400 mb-3">Something went wrong. Please try again.</p>
                                            <Button size="sm" onClick={() => queryClient.invalidateQueries(['myPosts'])}>
                                                Retry
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : myPosts.length === 0 ? (
                                    <Card className="border-slate-200/80 bg-white/95">
                                        <CardContent className="p-12 text-center">
                                            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <BookOpen className="w-8 h-8 text-teal-300" />
                                            </div>
                                            <p className="font-semibold text-slate-700 text-sm mb-1">Your feed is empty</p>
                                            <p className="text-xs text-slate-400 max-w-xs mx-auto">Start sharing your experiences and connect with students and alumni.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {myPosts.map(post => (
                                            <PostItem key={post.id} post={post} user={user} />
                                        ))}
                                    </div>
                                )}

                            </>
                        )}


                        {/* ─── NOTIFICATIONS VIEW ──────────────────────────────── */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between px-1 mb-1">
                                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                        <Bell className="w-3.5 h-3.5 text-teal-600" /> Notifications
                                        {unreadCount > 0 && (
                                            <Badge variant="destructive" className="text-[9px] ml-1">{unreadCount} new</Badge>
                                        )}
                                    </p>
                                    <Button variant="ghost" size="icon" onClick={() => setActiveTab('feed')} className="h-7 w-7">
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                {notifications.length === 0 ? (
                                    <Card className="border-slate-200/80 bg-white/95">
                                        <CardContent className="p-10 text-center">
                                            <Bell className="w-9 h-9 text-slate-200 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-500">You're all caught up</p>
                                            <p className="text-xs text-slate-400 mt-1">No notifications at the moment.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <ScrollArea className="space-y-2">
                                        {notifications.map(n => (
                                            <Card
                                                key={n.id}
                                                onClick={() => markReadMutation.mutate(n.id)}
                                                className={`cursor-pointer transition-all mb-2 ${!n.is_read ? 'border-teal-200 bg-teal-50/30' : 'border-slate-200/80 bg-white/95'}`}
                                            >
                                                <CardContent className="p-4 flex items-start gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center ${n.type === 'like' ? 'bg-rose-50 text-rose-500' : 'bg-teal-50 text-teal-600'}`}>
                                                        {n.type === 'like' ? <Heart className="w-4 h-4 fill-current" /> : <MessageSquare className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[13px] text-slate-700 leading-snug">
                                                            <span className="font-semibold text-slate-900">{n.sender_name}</span> {n.content}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                            <Clock className="w-2.5 h-2.5" /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    {!n.is_read && <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </ScrollArea>
                                )}
                            </div>
                        )}

                        {/* ─── NETWORK VIEW ─────────────────────────────────────── */}
                        {activeTab === 'network' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-teal-600" /> Connections & Network
                                        </h2>
                                        <p className="text-[11px] text-slate-400 mt-0.5 ml-6">Manage your professional network</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setActiveTab('feed')} className="h-8 w-8">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Network Tabs */}
                                <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm p-1.5 flex gap-1">
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
                                                    ? 'bg-teal-600 text-white shadow-sm'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                            }`}
                                        >
                                            <tab.icon className="w-3.5 h-3.5" />
                                            {tab.label}
                                            {tab.count > 0 && (
                                                <Badge variant={networkTab === tab.id ? 'secondary' : 'outline'} className={`text-[9px] px-1.5 py-0 ${networkTab === tab.id ? 'bg-white/20 text-white border-0' : ''}`}>
                                                    {tab.count}
                                                </Badge>
                                            )}
                                        </button>
                                    ))}
                                </Card>

                                {/* Requests */}
                                {networkTab === 'requests' && (
                                    followRequests.length === 0 ? (
                                        <Card className="border-slate-200/80 bg-white/95">
                                            <CardContent className="p-10 text-center">
                                                <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <UserPlus className="w-7 h-7 text-teal-200" />
                                                </div>
                                                <p className="font-semibold text-slate-700 text-sm mb-1">No Pending Requests</p>
                                                <p className="text-xs text-slate-400">When someone requests to follow you, it will appear here.</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="space-y-2">
                                            {followRequests.map(req => (
                                                <SpotlightCard key={req.follower_id || req.id} className="bg-transparent" spotlightColor="rgba(20, 184, 166, 0.08)">
                                                    <Card className="border-slate-200/80 bg-white/95">
                                                        <CardContent className="p-4 flex items-center gap-3">
                                                            <AvatarShared src={req.profile_picture} name={req.follower_name || req.name} size={44} userId={req.follower_id || req.id} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-slate-900 text-sm truncate">{req.follower_name || req.name}</p>
                                                                <p className="text-[11px] text-slate-400 capitalize truncate mt-0.5">
                                                                    {req.follower_role || req.role || 'Student'}{req.follower_college ? ` • ${req.follower_college}` : ''}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-1.5 flex-shrink-0">
                                                                <Tooltip content="Decline">
                                                                    <Button variant="ghost" size="icon" onClick={() => updateFollowMutation.mutate({ followerId: req.follower_id || req.id, status: 'rejected' })} className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </Tooltip>
                                                                <Button size="sm" onClick={() => updateFollowMutation.mutate({ followerId: req.follower_id || req.id, status: 'accepted' })} className="bg-teal-600 hover:bg-teal-700 text-xs">
                                                                    <Check className="w-3.5 h-3.5 mr-1" /> Accept
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </SpotlightCard>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* Followers */}
                                {networkTab === 'followers' && (
                                    loadingFollowers ? (
                                        <Card className="border-slate-200/80 bg-white/95">
                                            <CardContent className="p-10 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-teal-500" /></CardContent>
                                        </Card>
                                    ) : networkFollowers.length === 0 ? (
                                        <Card className="border-slate-200/80 bg-white/95">
                                            <CardContent className="p-10 text-center">
                                                <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Users className="w-7 h-7 text-teal-200" />
                                                </div>
                                                <p className="font-semibold text-slate-700 text-sm mb-1">No Followers Yet</p>
                                                <p className="text-xs text-slate-400">People who follow you will appear here.</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Card className="border-slate-200/80 bg-white/95 overflow-hidden">
                                            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">All Followers ({networkFollowers.length})</p>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {networkFollowers.map(f => (
                                                    <div key={f.id} className="p-3.5 flex items-center gap-3 hover:bg-teal-50/30 transition-colors">
                                                        <AvatarShared src={f.avatar || f.profile_picture} name={f.name} size={40} userId={f.id} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 truncate">{f.name}</p>
                                                            <p className="text-[11px] text-slate-400 capitalize mt-0.5">{f.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    )
                                )}

                                {/* Following */}
                                {networkTab === 'following' && (
                                    loadingFollowing ? (
                                        <Card className="border-slate-200/80 bg-white/95">
                                            <CardContent className="p-10 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-teal-500" /></CardContent>
                                        </Card>
                                    ) : networkFollowing.length === 0 ? (
                                        <Card className="border-slate-200/80 bg-white/95">
                                            <CardContent className="p-10 text-center">
                                                <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <UserCheck className="w-7 h-7 text-teal-200" />
                                                </div>
                                                <p className="font-semibold text-slate-700 text-sm mb-1">Not Following Anyone</p>
                                                <p className="text-xs text-slate-400">People you follow will appear here.</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {networkFollowing.map(f => (
                                                <SpotlightCard key={f.id} className="bg-transparent" spotlightColor="rgba(20, 184, 166, 0.08)">
                                                    <Card className="border-slate-200/80 bg-white/95">
                                                        <CardContent className="p-4 text-center">
                                                            <AvatarShared src={f.avatar || f.profile_picture} name={f.name} size={48} userId={f.id} className="mx-auto mb-2" />
                                                            <p className="font-semibold text-slate-900 text-sm truncate">{f.name}</p>
                                                            <p className="text-[10px] text-slate-400 capitalize mt-0.5 mb-3">{f.role}</p>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="w-full text-[11px] bg-slate-900 hover:bg-rose-600"
                                                                onClick={() => updateFollowMutation.mutate({ followerId: f.id, status: 'rejected' })}
                                                            >
                                                                Unfollow
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
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

                            {/* Follow Requests */}
                            {followRequests.length > 0 && (
                                <SpotlightCard className="bg-transparent" spotlightColor="rgba(20, 184, 166, 0.12)">
                                <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                                <UserPlus className="w-3.5 h-3.5 text-teal-600" /> Requests
                                            </CardTitle>
                                            <Badge variant="warning" className="text-[9px]">{followRequests.length}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <ScrollArea className="space-y-3 max-h-[240px]">
                                            {followRequests.slice(0, 4).map(req => (
                                                <div key={req.id} className="flex items-center gap-2.5 mb-3">
                                                    <AvatarShared src={req.follower_avatar || req.profile_picture} name={req.follower_name || req.name} size={36} userId={req.follower_id || req.id} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[13px] font-semibold text-slate-900 truncate leading-none">{req.name}</p>
                                                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{req.job_role || 'Student'}</p>
                                                    </div>
                                                    <div className="flex gap-1 flex-shrink-0">
                                                        <Tooltip content="Accept">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => updateFollowMutation.mutate({ followerId: req.id, status: 'accepted' })}
                                                                className="h-7 w-7 bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </Tooltip>
                                                        <Tooltip content="Decline">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => updateFollowMutation.mutate({ followerId: req.id, status: 'rejected' })}
                                                                className="h-7 w-7 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                        {followRequests.length > 4 && (
                                            <>
                                                <Separator className="my-2" />
                                                <Link to="/network" className="block text-center text-[11px] font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                                                    View {followRequests.length - 4} more →
                                                </Link>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                                </SpotlightCard>
                            )}




                            {/* Quick Links */}
                            <SpotlightCard className="bg-transparent" spotlightColor="rgba(20, 184, 166, 0.12)">
                            <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick Links</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-0.5">
                                        {[
                                            { label: 'My Profile', path: '/profile', icon: Settings, desc: 'View your profile' },
                                            { label: 'Settings', path: '/settings', icon: Settings, desc: 'Manage preferences' },
                                            { label: 'Messages', path: '/chat', icon: MessageSquare, desc: 'Chat with connections' },
                                            { label: 'My Network', path: '/network', icon: Users, desc: 'View your connections' },
                                        ].map(l => (
                                            <Link key={l.path} to={l.path} className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-slate-50 transition-all group">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50 group-hover:border-teal-100 transition-all">
                                                    <l.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-medium text-slate-700 group-hover:text-teal-600 transition-colors">{l.label}</p>
                                                    <p className="text-[10px] text-slate-400">{l.desc}</p>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-400 transition-colors flex-shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            </SpotlightCard>

                            {/* Recent Posts */}
                            <SpotlightCard className="bg-transparent" spotlightColor="rgba(20, 184, 166, 0.12)">
                            <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recent Posts</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {myPosts.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-3">No recent activity.</p>
                                    ) : (
                                        <ScrollArea className="space-y-2.5 max-h-[200px]">
                                            {myPosts.slice(0, 4).map(p => (
                                                <div key={p.id} className="flex items-start gap-2.5 mb-2.5">
                                                    <AvatarShared src={p.author_profile_picture} name={p.author_name} size={28} userId={p.user_id} className="mt-0.5" />
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
                                        </ScrollArea>
                                    )}
                                </CardContent>
                            </Card>
                            </SpotlightCard>

                            {/* CTA - Mentorship */}
                            <SpotlightCard className="bg-transparent" spotlightColor="rgba(255, 255, 255, 0.1)">
                            <Card className="bg-gradient-to-br from-[#134e4a] via-[#115e59] to-[#0f766e] border-0 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                                <CardContent className="p-4 relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                            <GraduationCap className="w-4 h-4 text-teal-200" />
                                        </div>
                                        <p className="font-semibold text-sm">Mentor students</p>
                                    </div>
                                    <p className="text-teal-200 text-xs leading-relaxed mb-3">
                                        Your experience is invaluable. Enable mentoring to guide ambitious students.
                                    </p>
                                    <Link to="/profile" className="block text-center w-full px-3 py-2 bg-white text-teal-700 text-xs font-semibold rounded-lg hover:bg-teal-50 hover:text-teal-800 transition-all shadow-sm">
                                        Enable Mentorship →
                                    </Link>
                                </CardContent>
                            </Card>
                            </SpotlightCard>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ─── MOBILE BOTTOM NAV ──────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/80 z-50 lg:hidden">
                <div className="flex items-center justify-around py-1.5 px-2 max-w-lg mx-auto">
                    {[
                        { id: 'feed', icon: LayoutDashboard, label: 'Home', isTab: true },
                        { id: 'network', icon: Users, label: 'Network', isTab: true },
                        { id: 'notifications', icon: Bell, label: 'Alerts', isTab: true },
                        { id: 'chat', icon: MessageSquare, label: 'Chat', path: '/chat' },
                        { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
                    ].map(item => {
                        const isActive = item.id === 'feed' ? activeTab === 'feed' : item.id === activeTab;
                        const inner = (
                            <div className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                                <item.icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                                {item.id === 'notifications' && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                )}
                            </div>
                        );
                        if (item.path && !item.isTab) return <Link key={item.id} to={item.path}>{inner}</Link>;
                        return <button key={item.id} className="relative" onClick={() => setActiveTab(item.id)}>{inner}</button>;
                    })}
                </div>
            </div>

            <div className="h-14 lg:hidden" />

        </div>
    );
};

export default AlumniDashboard;

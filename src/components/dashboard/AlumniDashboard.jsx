import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bell, Settings, CheckCircle2, X,
    LayoutDashboard, MessageSquare,
    Send, Image as ImageIcon, Sparkles,
    Video, Heart, Search,
    TrendingUp, UserPlus,
    Trash2, Loader2, Edit2, Zap, Bookmark
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import PostItem from '../shared/PostItem';

const AlumniDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('feed');
    const [isPosting, setIsPosting] = useState(false);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [postData, setPostData] = useState({
        content: '',
        image_url: '',
        video_url: ''
    });

    // --- DATA SYNC ---
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['alumniDashboard'],
        queryFn: async () => {
            const [followRequestsRes, profileRes] = await Promise.all([
                axios.get('/api/connections/requests', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/auth/me', { headers: { 'Authorization': `Bearer ${user.token}` } })
            ]);
            return { requests: followRequestsRes.data, profile: profileRes.data };
        },
        refetchInterval: 5000
    });

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await axios.get('/api/notifications', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 3000
    });

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

    const { data: myPosts = [] } = useQuery({
        queryKey: ['myPosts'],
        queryFn: async () => {
            const { data } = await axios.get('/api/posts/feed', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 5000
    });

    // --- MUTATIONS ---
    const handleMediaUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await axios.post('/api/upload/media', formData, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (type === 'image') {
                setPostData(prev => ({ ...prev, image_url: data.url, video_url: '' }));
            } else {
                setPostData(prev => ({ ...prev, video_url: data.url, image_url: '' }));
            }
        } catch (err) {
            console.error('Upload Error:', err);
            alert('Upload failed. Please try again.');
        }
    };

    const createPostMutation = useMutation({
        mutationFn: async (data) => axios.post('/api/posts', data, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            setPostData({ content: '', image_url: '', video_url: '' });
            setIsPosting(false);
            queryClient.invalidateQueries(['myPosts']);
        }
    });

    const deletePostMutation = useMutation({
        mutationFn: async (postId) => axios.delete(`/api/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['myPosts']);
        }
    });

    const updateFollowMutation = useMutation({
        mutationFn: async ({ followerId, status }) => axios.put('/api/connections/follow/status', { followerId, status }, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['alumniDashboard']);
            queryClient.invalidateQueries(['socialStats']);
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const markReadMutation = useMutation({
        mutationFn: async (id) => axios.put(`/api/notifications/${id}/read`, {}, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => queryClient.invalidateQueries(['notifications'])
    });

    const likeMutation = useMutation({
        mutationFn: ({ postId, isDislike }) =>
            axios.post(`/api/posts/${postId}/like`, { isDislike }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            }),
        onSuccess: () => queryClient.invalidateQueries(['myPosts'])
    });

    const followRequests = dashboardData?.requests || [];
    const unreadNotifications = notifications.filter(n => !n.is_read);

    const navItems = [
        { id: 'feed', label: 'News Feed', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'network', label: 'Network', icon: UserPlus, badge: followRequests.length, path: '/network' },
        { id: 'chat', label: 'Messages', icon: MessageSquare, path: '/chat' },
        { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotifications.length, isTab: true },
        { id: 'analytics', label: 'Insights', icon: TrendingUp, path: '/analytics' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/profile' }
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
            <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                <span className="uppercase text-xs font-black text-violet-500 tracking-[0.3em] animate-pulse">Initializing Dashboard...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
            {/* Ambient Animated Background specifically tailored for Alumni (Violet & Pink hues) */}
            <div className="fixed inset-0 z-[0] pointer-events-none opacity-[0.4] md:opacity-[0.6]">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-violet-400/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-fuchsia-300/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-indigo-400/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 relative z-10 block pb-24 md:pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10">

                    {/* === LEFT SIDEBAR (Desktop) === */}
                    <div className="hidden lg:block lg:col-span-3 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Profile Card */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 relative">
                                <div className="h-28 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full"></div>
                                </div>
                                <div className="px-8 pb-8">
                                    <div className="relative -mt-12 mb-4 flex justify-center">
                                        <div className="w-24 h-24 bg-white/50 backdrop-blur-xl rounded-[28px] p-1.5 shadow-2xl relative">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-fuchsia-400 rounded-[28px] opacity-20 animate-pulse"></div>
                                            <div className="w-full h-full bg-slate-100 rounded-[22px] flex items-center justify-center text-3xl font-black text-violet-600 uppercase overflow-hidden bg-cover bg-center relative z-10" style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}>
                                                {!user.profile_picture && user.name.charAt(0)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                                        <p className="text-[11px] font-bold text-violet-600 uppercase tracking-widest mt-1 mb-6 inline-flex items-center gap-1 bg-violet-50 px-3 py-1 rounded-full"><Sparkles className="w-3 h-3" /> Alumni Pro</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100/50">
                                        <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-violet-200 transition-colors group cursor-pointer">
                                            <span className="block text-xl font-black text-slate-900 group-hover:text-violet-600 transition-colors">{stats.followers}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Followers</span>
                                        </div>
                                        <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:border-fuchsia-200 transition-colors group cursor-pointer">
                                            <span className="block text-xl font-black text-slate-900 group-hover:text-fuchsia-600 transition-colors">{myPosts.filter(p => p.user_id === user.id).length}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Posts</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Nav Mneu */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                                {navItems.map(item => item.isTab ? (
                                    <button onClick={() => setActiveTab(item.id)} key={item.id} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold text-sm mb-1 ${activeTab === item.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                        <div className="flex items-center gap-4">
                                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                                            {item.label}
                                        </div>
                                        {item.badge > 0 && <span className={`${activeTab === item.id ? 'bg-white text-violet-600' : 'bg-rose-500 text-white'} text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm`}>{item.badge}</span>}
                                    </button>
                                ) : (
                                    <Link key={item.id} to={item.path} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold text-sm mb-1 text-slate-500 hover:bg-slate-50 hover:text-slate-900`}>
                                        <div className="flex items-center gap-4">
                                            <item.icon className={`w-5 h-5 text-slate-400`} />
                                            {item.label}
                                        </div>
                                        {item.badge > 0 && <span className="bg-rose-500 text-white text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">{item.badge}</span>}
                                    </Link>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {/* === CENTRAL FEED AREA === */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* Mobile Header elements */}
                        <div className="lg:hidden flex flex-col gap-4 mb-2">
                            {/* Welcome Bar */}
                            <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-5 rounded-[28px] flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 p-[2px] rounded-[18px]">
                                        <div className="w-full h-full bg-slate-100 rounded-[16px] flex items-center justify-center font-black text-xl text-violet-600 overflow-hidden bg-cover bg-center" style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}>
                                            {!user.profile_picture && user.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Welcome back</p>
                                        <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">{user.name}</h2>
                                    </div>
                                </div>
                                <button onClick={() => setActiveTab('notifications')} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-violet-600 transition-colors relative">
                                    <Bell className="w-5 h-5" />
                                    {unreadNotifications.length > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>}
                                </button>
                            </div>

                            {/* Mobile Nav Scroller */}
                            <div className="flex gap-3 overflow-x-auto modern-scrollbar pb-2 snap-x px-1">
                                {navItems.map(item => item.isTab ? (
                                    <button onClick={() => setActiveTab(item.id)} key={item.id} className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider snap-start ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white/60 backdrop-blur-md border border-white/40 text-slate-500'}`}>
                                        <item.icon className="w-4 h-4" /> {item.label}
                                        {item.badge > 0 && <span className="ml-1 bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{item.badge}</span>}
                                    </button>
                                ) : (
                                    <Link key={item.id} to={item.path} className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider snap-start bg-white/60 backdrop-blur-md border border-white/40 text-slate-500`}>
                                        <item.icon className="w-4 h-4" /> {item.label}
                                        {item.badge > 0 && <span className="ml-1 bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{item.badge}</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Search Bar (Floating) */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl rounded-[28px] p-2 md:p-3 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative z-20">
                            <div className="relative flex-1 group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search the network globally..."
                                    className="w-full pl-12 pr-4 py-4 md:py-4 bg-transparent border-none rounded-2xl text-[13px] md:text-sm font-bold text-slate-900 focus:ring-0 outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </motion.div>

                        {/* Central Content Handling */}

                        {activeTab === 'feed' && (
                            <>
                                {/* Create Post Area */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-violet-500 to-indigo-500 p-[2px] shrink-0 hidden sm:block">
                                            <div className="w-full h-full bg-white rounded-[18px] flex items-center justify-center text-violet-600 font-black overflow-hidden bg-cover bg-center" style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}>
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
                                                        <Edit2 className="w-4 h-4" /> <span className="truncate">Share your expertise or news...</span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <textarea
                                                            autoFocus
                                                            value={postData.content}
                                                            onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                                                            className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 text-slate-900 text-sm md:text-base font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 outline-none min-h-[140px] resize-none transition-all"
                                                            placeholder="Inspire your network. What's happening?"
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
                                                    <label className="px-3 py-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 bg-slate-50 border border-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-2">
                                                        <ImageIcon className="w-4 h-4 md:w-5 md:h-5" /> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:block">Photo</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
                                                    </label>
                                                    <label className="px-3 py-2 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 bg-slate-50 border border-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-2">
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
                                                            className="px-6 md:px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-violet-200 disabled:opacity-50 flex items-center gap-2 shrink-0"
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

                                <div className="space-y-6 md:space-y-8">
                                    {myPosts.length === 0 && (
                                        <div className="bg-white/50 backdrop-blur-sm p-16 md:p-20 text-center border-2 border-dashed border-slate-200 rounded-[32px]">
                                            <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                                <MessageSquare className="w-8 h-8 text-violet-400" />
                                            </div>
                                            <p className="text-slate-600 font-black uppercase text-xs md:text-sm tracking-widest mb-2">No Posts Yet</p>
                                            <p className="text-slate-400 font-medium text-[13px] md:text-sm max-w-xs mx-auto">Start sharing your experiences and opportunities with the network.</p>
                                        </div>
                                    )}
                                    <AnimatePresence>
                                        {myPosts.map((post) => (
                                            <PostItem key={post.id} post={post} user={user} setExpandedPostId={setExpandedPostId} expandedPostId={expandedPostId} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                <div className="flex items-center justify-between px-2 mb-6">
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Bell className="w-4 h-4 text-violet-600" /> Notifications</h2>
                                    <button className="text-[10px] uppercase tracking-widest font-black text-violet-600 hover:text-violet-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">Mark All Read</button>
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="bg-white/50 backdrop-blur-sm p-16 md:p-20 text-center border-2 border-dashed border-slate-200 rounded-[32px]">
                                        <Bell className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">You're all caught up</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {notifications.map(n => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                key={n.id}
                                                onClick={() => markReadMutation.mutate(n.id)}
                                                className={`p-5 rounded-[24px] border transition-all flex items-start sm:items-center gap-4 cursor-pointer hover:shadow-md ${n.is_read ? 'bg-white/80 backdrop-blur-md border-slate-200/60' : 'bg-violet-50/80 backdrop-blur-md border-violet-200/60 shadow-sm'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-[18px] shrink-0 flex items-center justify-center ${n.type === 'like' ? 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600' : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600'}`}>
                                                    {n.type === 'like' ? <Heart className="w-6 h-6 fill-current" /> : <MessageSquare className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1 pr-4">
                                                    <p className="text-[13px] md:text-sm text-slate-700 leading-snug">
                                                        <span className="font-black text-slate-900">{n.sender_name}</span> {n.content}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                {!n.is_read && <div className="w-2.5 h-2.5 bg-violet-600 rounded-full shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* === RIGHT SIDEBAR === */}
                    <div className="hidden xl:block lg:col-span-3 space-y-6">
                        <div className="sticky top-24 space-y-6">

                            {/* Follow Requests Pending */}
                            {followRequests.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-[32px] shadow-xl shadow-slate-200/50">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            <UserPlus className="w-4 h-4 text-violet-500" /> Connect Requests
                                        </h3>
                                        <span className="bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{followRequests.length}</span>
                                    </div>
                                    <div className="space-y-4">
                                        {followRequests.slice(0, 3).map(req => (
                                            <div key={req.id} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-[14px] flex items-center justify-center font-black text-slate-400 overflow-hidden bg-cover bg-center shrink-0" style={{ backgroundImage: req.profile_picture ? `url(${req.profile_picture})` : 'none' }}>
                                                    {!req.profile_picture && req.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[12px] font-black text-slate-900 truncate">{req.name}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{req.job_role || 'Academic Peer'}</p>
                                                </div>
                                                <Link to="/network" className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white flex items-center justify-center transition-colors">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        ))}
                                        {followRequests.length > 3 && (
                                            <Link to="/network" className="block text-center pt-3 mt-3 border-t border-slate-100 text-[9px] uppercase tracking-widest font-black text-violet-600">
                                                View {followRequests.length - 3} More
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Promotional / Mentoring Info */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 blur-2xl rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-[12px] flex items-center justify-center mb-4">
                                        <Bookmark className="w-4 h-4 text-violet-300" />
                                    </div>
                                    <h4 className="font-black text-base lg:text-lg mb-1.5 leading-tight">Empower the next generation</h4>
                                    <p className="text-indigo-200 text-[11px] font-medium leading-relaxed mb-5">Your experience is invaluable. Open your inbox to mentoring requests from ambitious students.</p>
                                    <Link to="/profile" className="inline-block text-[10px] uppercase tracking-widest font-black bg-white text-indigo-950 px-5 py-2.5 rounded-[12px] hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20">Enable Mentorship</Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>

                {/* Mobile Extra Spacing */}
                <div className="h-10 lg:hidden"></div>
            </div>

            {/* Live Synchronizer Status */}
            <div className="fixed bottom-4 left-4 z-[100] hidden md:block">
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50 transition-all">
                    <div className="w-2 h-2 rounded-full bg-violet-500 relative">
                        <div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-75"></div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">Alumni Network Active</span>
                </div>
            </div>

        </div>
    );
};

export default AlumniDashboard;

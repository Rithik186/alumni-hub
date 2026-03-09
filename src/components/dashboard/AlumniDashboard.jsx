import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bell, Settings, Check, X,
    GraduationCap, LayoutDashboard,
    MessageSquare, ShieldCheck,
    Send, Image as ImageIcon, Sparkles,
    Video, Heart, Share2, Search,
    TrendingUp, Award, UserPlus,
    MoreHorizontal, Trash2, CornerDownRight,
    Loader2
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

    const { data: stats = { followers: 0, following: 120 } } = useQuery({
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
            return data; // Backend returns all feed posts mixed
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
            // Optimistic update or loading state could go here
            console.log('Uploading...');
            const { data } = await axios.post('/api/upload/media', formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    // Axios sets multipart automatically when data is FormData, but explicit is fine
                }
            });
            console.log('Uploaded:', data);

            if (type === 'image') {
                setPostData(prev => ({ ...prev, image_url: data.url, video_url: '' }));
            } else {
                setPostData(prev => ({ ...prev, video_url: data.url, image_url: '' }));
            }
        } catch (err) {
            console.error('Initial Upload Error:', err);
            // Fallback for simple error alert
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

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        </div>
    );

    const followRequests = dashboardData?.requests || [];
    const unreadNotifications = notifications.filter(n => !n.is_read);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">

            {/* Clean Modern Navbar */}
            <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">AlumniHub</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 bg-slate-100/50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all w-80">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search for alumni, jobs, or posts..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveTab('notifications')} className="relative p-2.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            {unreadNotifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                <p className="text-xs font-medium text-slate-500">Pro Member</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-violet-700 font-bold">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6 py-8">

                {/* LEFT SIDEBAR */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                        <div className="h-24 bg-gradient-to-r from-violet-600 to-indigo-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </div>
                        <div className="px-6 pb-6 text-center relative">
                            <div className="relative -mt-10 mb-4">
                                <div className="w-20 h-20 bg-white rounded-3xl p-1 shadow-xl">
                                    <div className="w-full h-full bg-slate-100 rounded-[20px] flex items-center justify-center text-2xl font-black text-violet-600 uppercase overflow-hidden bg-cover bg-center" style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}>
                                        {!user.profile_picture && user.name.charAt(0)}
                                    </div>
                                </div>
                                <Link to="/profile" className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-xl shadow-lg border border-white hover:bg-violet-600 transition-colors">
                                    <Settings className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                                <p className="text-sm text-slate-500 font-medium">{dashboardData?.profile?.profile?.job_role || 'Alumni Member'}</p>
                            </div>
                            <div className="mt-6 flex items-center justify-center gap-8 border-t border-slate-100 pt-6">
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{stats.followers}</p>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Followers</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{myPosts.filter(p => p.user_id === user.id).length}</p>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Posts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                        {[
                            { id: 'feed', label: 'News Feed', icon: LayoutDashboard },
                            { id: 'network', label: 'Network', icon: UserPlus, badge: followRequests.length, path: '/network' },
                            { id: 'chat', label: 'Messages', icon: MessageSquare, path: '/chat' },
                            { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications.length },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                            { id: 'settings', label: 'Settings', icon: Settings }
                        ].map(item => item.path ? (
                            <Link
                                key={item.id}
                                to={item.path}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5 text-slate-400" />
                                    {item.label}
                                </div>
                                {item.badge > 0 && (
                                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ) : (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 ${activeTab === item.id
                                    ? 'bg-violet-50 text-violet-700 font-bold'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-violet-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </div>
                                {item.badge > 0 && (
                                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MAIN FEED */}
                <div className="col-span-12 lg:col-span-9 space-y-6 max-w-4xl mx-auto w-full">

                    {/* Create Post */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-slate-500 font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div
                                    onClick={() => setIsPosting(true)}
                                    className={`bg-slate-50 rounded-xl transition-all cursor-text ${isPosting ? 'p-0 bg-transparent' : 'p-3 text-slate-500 text-sm hover:bg-slate-100'}`}
                                >
                                    {!isPosting ? "Start a post..." : (
                                        <div className="space-y-3">
                                            <textarea
                                                autoFocus
                                                value={postData.content}
                                                onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none min-h-[100px] resize-none"
                                                placeholder="What do you want to share?"
                                            />
                                            {(postData.image_url || postData.video_url) && (
                                                <div className="mt-4 relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                                                    {postData.image_url && <img src={postData.image_url} alt="Attached" className="w-full h-auto max-h-[300px] object-cover" />}
                                                    {postData.video_url && <video src={postData.video_url} controls className="w-full h-auto max-h-[300px] object-contain bg-slate-900" />}
                                                    <button onClick={() => setPostData({ ...postData, image_url: '', video_url: '' })} className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-lg shadow-sm backdrop-blur-md transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={`flex items-center justify-between mt-3 ${!isPosting && 'pt-0'}`}>
                                    <div className="flex gap-2">
                                        <label className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all cursor-pointer">
                                            <ImageIcon className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
                                        </label>
                                        <label className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all cursor-pointer">
                                            <Video className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleMediaUpload(e, 'video')} />
                                        </label>
                                    </div>
                                    {isPosting && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsPosting(false)}
                                                className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => createPostMutation.mutate(postData)}
                                                disabled={!postData.content || createPostMutation.isPending}
                                                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-violet-200 disabled:opacity-50 disabled:shadow-none"
                                            >
                                                {createPostMutation.isPending ? 'Posting...' : 'Post'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feed */}
                    {activeTab === 'feed' && (
                        <div className="space-y-6">
                            {myPosts.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700">No Posts Yet</h3>
                                    <p className="text-slate-500 text-sm mt-2">Start sharing your experiences and opportunities!</p>
                                </div>
                            )}
                            {myPosts.map((post) => (
                                <PostItem key={post.id} post={post} user={user} />
                            ))}
                        </div>
                    )}



                    {activeTab === 'notifications' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                                <button className="text-xs font-bold text-violet-600 hover:text-violet-700">Mark all as read</button>
                            </div>
                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => markReadMutation.mutate(n.id)}
                                    className={`p-4 rounded-xl border transition-all flex items-center gap-4 cursor-pointer ${n.is_read ? 'bg-white border-slate-200' : 'bg-violet-50/50 border-violet-100 shadow-sm'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.type === 'like' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                        {n.type === 'like' ? <Heart className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-900">{n.sender_name}</span> {n.content}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    {!n.is_read && <div className="w-2 h-2 bg-violet-600 rounded-full"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AlumniDashboard;

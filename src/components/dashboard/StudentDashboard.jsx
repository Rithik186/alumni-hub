import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, Users, Building, GraduationCap,
    ChevronRight, Sparkles, ArrowRight,
    X, Globe, Filter, Briefcase, MapPin,
    Zap, Bell, Bookmark, MessageCircle,
    ThumbsUp, ThumbsDown, MessageSquare, Share2,
    Plus, UserPlus, UserCheck, MoreHorizontal,
    Heart, Send, Image as ImageIcon, Smile,
    Calendar, Award, Hash, Link as LinkIcon
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import BulletinBoard from './BulletinBoard';

const StudentDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('feed'); // feed, network, connections
    const [filters, setFilters] = useState({
        name: '', company: '', college: '', department: '', batch: '',
        skills: '', job_role: '', experience_level: '', mentorship_available: ''
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [commentText, setCommentText] = useState({});

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

    // Fetch Stats
    const { data: stats = { followers: 0, following: 0, connections: 0 } } = useQuery({
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
        }
    });

    const connectMutation = useMutation({
        mutationFn: (receiverId) =>
            axios.post('/api/connections/request', { receiverId }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            }),
        onSuccess: () => queryClient.invalidateQueries(['suggestions'])
    });

    const commentMutation = useMutation({
        mutationFn: ({ postId, content }) =>
            axios.post(`/api/posts/${postId}/comment`, { content }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(['feed']);
        }
    });

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar - Profile & Stats */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="premium-card overflow-hidden">
                        <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                        <div className="px-6 pb-8">
                            <div className="relative -mt-10 mb-4">
                                <div className="w-20 h-20 bg-white rounded-3xl p-1 shadow-xl">
                                    <div className="w-full h-full bg-slate-100 rounded-[20px] flex items-center justify-center text-2xl font-black text-blue-600 uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 mb-6">{user.role} @ {user.college}</p>

                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-center group cursor-pointer">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Followers</span>
                                    <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">{stats.followers}</span>
                                </div>
                                <div className="flex justify-between items-center group cursor-pointer">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Following</span>
                                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">{stats.following}</span>
                                </div>
                                <div className="flex justify-between items-center group cursor-pointer">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Connections</span>
                                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">{stats.connections}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Discovery Pulse</h3>
                        <div className="space-y-2">
                            {['Events', 'Groups', 'Hashtags', 'Alumni Meetups'].map(item => (
                                <button key={item} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center justify-between group">
                                    {item}
                                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Central Feed */}
                <div className="lg:col-span-6 space-y-8">
                    {/* Filter Bar */}
                    <div className="premium-card p-6 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search the Alumni Network..."
                                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[28px] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-5 rounded-[24px] border transition-all ${isFilterOpen ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        >
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="premium-card p-10 grid grid-cols-2 md:grid-cols-3 gap-6 overflow-hidden"
                            >
                                {Object.keys(filters).map(key => (
                                    <div key={key}>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">{key.replace('_', ' ')}</label>
                                        <input
                                            type="text"
                                            value={filters[key]}
                                            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                            placeholder={`Filter by ${key}...`}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Feed Content */}
                    {feedLoading ? (
                        <div className="py-20 text-center uppercase text-[10px] font-black text-slate-300 tracking-[0.4em] animate-pulse">Syncing Network Feed...</div>
                    ) : (
                        <div className="space-y-8">
                            {feed.length === 0 && (
                                <div className="premium-card p-20 text-center border-dashed">
                                    <Zap className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Connect with alumni to see transmissions</p>
                                </div>
                            )}
                            {feed.map((post, idx) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="premium-card overflow-hidden"
                                >
                                    <div className="p-8">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl shadow-blue-100">
                                                    {post.author_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 tracking-tighter">{post.author_name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{post.author_role} • {post.author_college}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Mutual Signal</div>
                                                <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900" />
                                            </div>
                                        </div>

                                        <p className="text-slate-700 font-medium leading-[1.8] text-lg mb-8">
                                            {post.content}
                                        </p>

                                        {post.image_url && (
                                            <div className="rounded-[32px] overflow-hidden mb-8 border border-slate-100 shadow-2xl">
                                                <img src={post.image_url} alt="Post asset" className="w-full object-cover max-h-[400px]" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => likeMutation.mutate({ postId: post.id, isDislike: false })}
                                                    className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${post.has_liked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                                                >
                                                    <Heart className={`w-6 h-6 ${post.has_liked ? 'fill-blue-600' : ''}`} /> {post.likes_count}
                                                </button>
                                                <button
                                                    onClick={() => likeMutation.mutate({ postId: post.id, isDislike: true })}
                                                    className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all"
                                                >
                                                    <ThumbsDown className="w-6 h-6" /> {post.dislikes_count}
                                                </button>
                                                <button className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">
                                                    <MessageSquare className="w-6 h-6" /> {post.comments_count}
                                                </button>
                                            </div>
                                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Comment Section */}
                                        <div className="mt-8 pt-8 border-t border-slate-50 space-y-6">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Write a peer response..."
                                                        className="w-full pl-6 pr-16 py-3 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                        value={commentText[post.id] || ''}
                                                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && commentText[post.id]) {
                                                                commentMutation.mutate({ postId: post.id, content: commentText[post.id] });
                                                                setCommentText({ ...commentText, [post.id]: '' });
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (commentText[post.id]) {
                                                                commentMutation.mutate({ postId: post.id, content: commentText[post.id] });
                                                                setCommentText({ ...commentText, [post.id]: '' });
                                                            }
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:scale-110 transition-transform"
                                                    >
                                                        <Send className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Suggestions & Pulse */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="premium-card p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-lg font-black text-slate-900 tracking-tighter">Peer suggestions</h3>
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="space-y-10">
                            {suggestions.map(s => (
                                <div key={s.id} className="group relative">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-lg font-black text-slate-400 uppercase group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                            {s.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-4">{s.job_role || 'Academic Peer'} @ {s.company || s.college}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => followMutation.mutate(s.id)}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                                                >
                                                    Follow
                                                </button>
                                                <button
                                                    onClick={() => connectMutation.mutate(s.id)}
                                                    className="w-10 h-9 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition-all"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {suggestions.length === 0 && (
                                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-10">Expanding network...</p>
                            )}
                        </div>
                    </div>

                    <div className="premium-card p-10 bg-gradient-to-br from-indigo-900 to-black text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform duration-1000 rotate-12">
                            <Star className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Elite Membership</span>
                            </div>
                            <h4 className="text-2xl font-black tracking-tight mb-4 leading-tight">Sync Advanced Features</h4>
                            <p className="text-xs text-indigo-200/60 font-medium leading-relaxed mb-10">Access exclusive mentorship paths and direct HR channels from verified alumni.</p>
                            <button className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-400 hover:text-white transition-all active:scale-95">Upgrade Protocol</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Live Synchronizer Status */}
            <div className="fixed bottom-8 left-8 z-[100]">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 transition-all">
                    <div className="w-2 h-2 rounded-full bg-blue-500 relative">
                        <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping"></div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">LinkedIn Engine Syncing</span>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

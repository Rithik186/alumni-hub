import React, { useState } from 'react';
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
    Calendar, Award, Hash, Link as LinkIcon, Star, Clock, Video, Loader2
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';

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

    // Fetch Feed
    const { data: feed = [], isLoading: feedLoading } = useQuery({
        queryKey: ['feed'],
        queryFn: async () => {
            // Students see the same feed as Alumni? Assuming yes for now.
            // Or maybe '/api/student/feed'? postController has getFeed. 
            // Student likely uses same feed endpoint as it is generic.
            const { data } = await axios.get('/api/posts/feed', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 5000
    });

    // Fetch Search Results
    const { data: searchResults = [], isFetching: isSearching } = useQuery({
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
                                    <div className="w-full h-full bg-slate-100 rounded-[20px] flex items-center justify-center text-2xl font-black text-blue-600 uppercase overflow-hidden bg-cover bg-center" style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}>
                                        {!user.profile_picture && user.name.charAt(0)}
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
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (e.target.value && activeTab !== 'search') setActiveTab('search');
                                    if (!e.target.value && !Object.values(filters).some(v => !!v)) setActiveTab('feed');
                                }}
                                placeholder="Search the Alumni Network..."
                                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[28px] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setIsFilterOpen(!isFilterOpen);
                                if (!isFilterOpen) setActiveTab('search');
                            }}
                            className={`p-5 rounded-[24px] border transition-all ${isFilterOpen ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        >
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-[24px] border border-slate-100 w-fit">
                        {['feed', 'search'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
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
                                            onChange={(e) => {
                                                const newFilters = { ...filters, [key]: e.target.value };
                                                setFilters(newFilters);
                                                if (Object.values(newFilters).some(v => !!v)) setActiveTab('search');
                                            }}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                            placeholder={`Filter by ${key}...`}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Feed Content */}
                    {activeTab === 'search' ? (
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Network Discoveries ({searchResults.length})</h3>
                            {isSearching ? (
                                <div className="py-20 text-center uppercase text-[10px] font-black text-slate-300 tracking-[0.4em] animate-pulse">Scanning Transmission Frequencies...</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {searchResults.map(result => (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="premium-card p-8 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-slate-100 rounded-[24px] flex items-center justify-center text-2xl font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden bg-cover bg-center" style={{ backgroundImage: result.profile_picture ? `url(${result.profile_picture})` : 'none' }}>
                                                    {!result.profile_picture && result.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 tracking-tighter">{result.name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{result.job_role} @ {result.company}</p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-md">{result.batch} Batch</span>
                                                        <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md">{result.department}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => !myFollowStatuses[result.id] && followMutation.mutate(result.id)}
                                                    className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg ${myFollowStatuses[result.id] === 'pending'
                                                        ? 'bg-amber-100 text-amber-600 border border-amber-200 cursor-default'
                                                        : myFollowStatuses[result.id] === 'accepted'
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-900 text-white hover:bg-blue-600'
                                                        }`}
                                                >
                                                    {myFollowStatuses[result.id] === 'pending' ? 'Requested' : myFollowStatuses[result.id] === 'accepted' ? 'Following' : 'Follow'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <div className="premium-card p-20 text-center border-dashed">
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching alumni found</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : feedLoading ? (
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
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl shadow-blue-100 overflow-hidden bg-cover bg-center" style={{ backgroundImage: post.author_profile_picture ? `url(${post.author_profile_picture})` : 'none' }}>
                                                    {!post.author_profile_picture && post.author_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 tracking-tighter">{post.author_name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{post.author_role} • {post.author_college}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Verified Broadcast</div>
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

                                        {post.video_url && (
                                            <div className="rounded-[32px] overflow-hidden mb-8 border border-slate-100 bg-slate-900 aspect-video flex items-center justify-center relative group">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Video Stream Broadcast</p>
                                                </div>
                                                <Video className="w-12 h-12 text-blue-500/20" />
                                                <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10"></a>
                                            </div>
                                        )}

                                        {post.likes_count > 0 && post.liked_by_users?.length > 0 && (
                                            <div className="flex text-xs text-slate-500 mb-3 px-1">
                                                <span className="font-bold mr-1 text-slate-700">{post.liked_by_users[0].name}</span>
                                                {post.likes_count > 1 ? `and ${post.likes_count - 1} others liked this` : 'liked this'}
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
                                                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                                    className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${expandedPostId === post.id ? 'text-blue-600' : 'text-slate-400 hover:text-indigo-600'}`}
                                                >
                                                    <MessageSquare className="w-6 h-6" /> {post.comments_count}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Comment Section (Expandable) */}
                                        <AnimatePresence>
                                            {expandedPostId === post.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mt-8 pt-8 border-t border-slate-50"
                                                >
                                                    <CommentSection postId={post.id} user={user} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Suggestions */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="premium-card p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-lg font-black text-slate-900 tracking-tighter">Peer suggestions</h3>
                        </div>
                        <div className="space-y-10">
                            {suggestions.map(s => (
                                <div key={s.id} className="group relative">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-lg font-black text-slate-400 uppercase group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 overflow-hidden bg-cover bg-center" style={{ backgroundImage: s.profile_picture ? `url(${s.profile_picture})` : 'none' }}>
                                            {!s.profile_picture && s.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-4">{s.job_role || 'Academic Peer'}</p>
                                            <button
                                                onClick={() => followMutation.mutate(s.id)}
                                                className="w-full py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-100"
                                            >
                                                Follow
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Network Active</span>
                </div>
            </div>
        </div>
    );
};

const CommentSection = ({ postId, user }) => {
    const queryClient = useQueryClient();
    const [commentContent, setCommentContent] = useState('');

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/posts/${postId}/comments`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    const addCommentMutation = useMutation({
        mutationFn: async (content) => axios.post(`/api/posts/${postId}/comment`, { content }, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            setCommentContent('');
            queryClient.invalidateQueries(['comments', postId]);
            queryClient.invalidateQueries(['feed']);
        }
    });

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto modern-scrollbar pr-2">
                    {comments.length === 0 && (
                        <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-300 italic py-2">Start the conversation</p>
                    )}
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-4 group">
                            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-500 uppercase flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden bg-cover bg-center" style={{ backgroundImage: c.user_profile_picture ? `url(${c.user_profile_picture})` : 'none' }}>
                                {!c.user_profile_picture && (c.user_name ? c.user_name.charAt(0) : 'U')}
                            </div>
                            <div className="bg-slate-50 rounded-2xl rounded-tl-none px-5 py-3 text-sm flex-1 group-hover:bg-white group-hover:shadow-lg transition-all border border-transparent group-hover:border-blue-50">
                                <p className="font-bold text-slate-900 text-xs mb-1">{c.user_name}</p>
                                <p className="text-slate-600 leading-relaxed font-medium">{c.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2 mb-2">
                    {['👍', '❤️', '👏', '🔥'].map(emoji => (
                        <button key={emoji} onClick={() => setCommentContent(prev => prev + emoji)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-lg">
                            {emoji}
                        </button>
                    ))}
                    {['Congratulations!', 'Keep going!', 'Great job!', 'Amazing!'].map(text => (
                        <button key={text} onClick={() => setCommentContent(prev => prev + (prev ? ' ' : '') + text)} className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-full text-xs font-medium transition-colors">
                            {text}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && commentContent && addCommentMutation.mutate(commentContent)}
                        placeholder="Write a response..."
                        className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                        onClick={() => addCommentMutation.mutate(commentContent)}
                        disabled={!commentContent || addCommentMutation.isPending}
                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

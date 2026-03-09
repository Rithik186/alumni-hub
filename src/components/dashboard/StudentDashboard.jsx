import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, Zap, Flame, UserPlus, FileText, Bookmark, BookOpen, Send, CheckCircle2, ChevronRight, MessageSquare, Heart, Loader2, Link as LinkIcon, Image as ImageIcon, Video, X, Filter, LayoutDashboard, Settings, Bell } from 'lucide-react';
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
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [activeDomain, setActiveDomain] = useState('All Domains');
    const domains = ['All Domains', 'Software Developer', 'Backend', 'Frontend', 'Data Science', 'Product Manager', 'Design'];
    const [isPosting, setIsPosting] = useState(false);
    const [postData, setPostData] = useState({ content: '', image_url: '', video_url: '' });

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

                    <div className="premium-card p-4">
                        {[
                            { id: 'feed', label: 'News Feed', icon: LayoutDashboard, path: '/dashboard' },
                            { id: 'network', label: 'Network', icon: UserPlus, path: '/network' },
                            { id: 'chat', label: 'Messages', icon: MessageSquare, path: '/chat' },
                            { id: 'settings', label: 'Settings', icon: Settings, path: '/profile' }
                        ].map(item => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm mb-1 ${item.id === 'feed'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${item.id === 'feed' ? 'text-blue-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Central Feed */}
                <div className="lg:col-span-6 space-y-8">
                    {/* Filter Bar */}
                    <div className="premium-card p-6 flex items-center gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (e.target.value && activeTab !== 'search') setActiveTab('search');
                                    if (!e.target.value && !Object.values(filters).some(v => !!v)) setActiveTab('feed');
                                }}
                                placeholder="Search the Alumni Network..."
                                className="w-full pl-5 pr-14 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-white outline-none transition-all placeholder:text-slate-400"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400 border border-slate-100">
                                    <Search className="w-5 h-5 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        {searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl z-50 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Analyzing Alumni Database...
                            </div>
                        )}
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

                    {/* Create Post Area */}
                    <div className="premium-card p-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-600 font-black shadow-inner">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div
                                    onClick={() => setIsPosting(true)}
                                    className={`bg-slate-50 rounded-2xl transition-all cursor-text ${isPosting ? 'p-0 bg-transparent' : 'p-4 text-slate-400 text-sm font-bold hover:bg-slate-100'}`}
                                >
                                    {!isPosting ? "Share an update, opportunity, or question..." : (
                                        <div className="space-y-4">
                                            <textarea
                                                autoFocus
                                                value={postData.content}
                                                onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-900 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none min-h-[120px] resize-none transition-all"
                                                placeholder="What's on your mind?"
                                            />
                                            {(postData.image_url || postData.video_url) && (
                                                <div className="mt-4 relative rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 group">
                                                    {postData.image_url && <img src={postData.image_url} alt="Attached" className="w-full h-auto max-h-[400px] object-cover" />}
                                                    {postData.video_url && <video src={postData.video_url} controls className="w-full h-auto max-h-[400px] object-contain bg-slate-900" />}
                                                    <button onClick={() => setPostData({ ...postData, image_url: '', video_url: '' })} className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl shadow-xl backdrop-blur-md transition-all">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={`flex items-center justify-between mt-4 ${!isPosting && 'pt-0'}`}>
                                    <div className="flex gap-2">
                                        <label className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                                            <ImageIcon className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
                                        </label>
                                        <label className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                                            <Video className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleMediaUpload(e, 'video')} />
                                        </label>
                                    </div>
                                    {isPosting && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsPosting(false)}
                                                className="px-6 py-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => createPostMutation.mutate(postData)}
                                                disabled={!postData.content || createPostMutation.isPending}
                                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                                            >
                                                {createPostMutation.isPending ? 'Transmitting...' : 'Post Transmit'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Domain Filter Pills */}
                    <div className="flex flex-wrap gap-2 mb-8 items-center bg-white p-2 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 border-r border-slate-200">Domains</span>
                        {domains.map(d => (
                            <button
                                key={d}
                                onClick={() => setActiveDomain(d)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeDomain === d ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                {d}
                            </button>
                        ))}
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
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Network Discoveries ({searchResultsQuery.length})</h3>
                            {isSearchingQuery ? (
                                <div className="py-20 text-center uppercase text-[10px] font-black text-slate-300 tracking-[0.4em] animate-pulse">Scanning Transmission Frequencies...</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {searchResultsQuery.map(result => (
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
                                    {searchResultsQuery.length === 0 && (
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
                            {feed.filter(post => activeDomain === 'All Domains' ? true : post.author_role?.toLowerCase().includes(activeDomain.toLowerCase())).length === 0 && (
                                <div className="premium-card p-20 text-center border-dashed">
                                    <Zap className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Connect with alumni to see transmissions</p>
                                </div>
                            )}
                            {feed
                                .filter(post => activeDomain === 'All Domains' ? true : post.author_role?.toLowerCase().includes(activeDomain.toLowerCase()))
                                .map((post) => (
                                    <PostItem key={post.id} post={post} user={user} expandedPostId={expandedPostId} setExpandedPostId={setExpandedPostId} likeMutation={likeMutation} />
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

export default StudentDashboard;

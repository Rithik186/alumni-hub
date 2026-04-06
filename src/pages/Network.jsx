import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, UserCheck, Search, Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FadeContent from '../components/animations/FadeContent';
import SpotlightCard from '../components/animations/SpotlightCard';

const Network = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('requests');

    const { data: followRequests = [], isLoading: loadingRequests } = useQuery({
        queryKey: ['followRequests'],
        queryFn: async () => {
            const { data } = await axios.get('/api/connections/requests', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    const updateFollowMutation = useMutation({
        mutationFn: async ({ followerId, status }) => axios.put('/api/connections/follow/status', { followerId, status }, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['followRequests']);
            queryClient.invalidateQueries(['socialStats']);
            queryClient.invalidateQueries(['alumniDashboard']);
        }
    });

    const { data: followers = [], isLoading: loadingFollowers } = useQuery({
        queryKey: ['followers'],
        queryFn: async () => {
            const { data } = await axios.get('/api/connections/followers', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    const { data: following = [], isLoading: loadingFollowing } = useQuery({
        queryKey: ['following'],
        queryFn: async () => {
            const { data } = await axios.get('/api/connections/following', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    if (!user) return null;

    const tabs = [
        { id: 'requests', label: 'Pending Requests', icon: UserPlus, badge: followRequests.length },
        { id: 'followers', label: 'Followers', icon: Users, badge: followers.length },
        { id: 'following', label: 'Following', icon: UserCheck, badge: following.length }
    ];

    return (
        <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(135deg, #f4faf8 0%, #e2eeeb 60%, #dae8e4 100%)' }}>
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center gap-6">
                    <Link to="/dashboard" className="p-2 hover:bg-teal-50 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Connections & Network
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manage your professional network</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-8">
                {/* Tabs */}
                <FadeContent blur duration={600}>
                    <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/80 shadow-sm w-fit mb-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        activeTab === tab.id ? 'bg-white/20' : 'bg-teal-50 text-teal-600'
                                    }`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </FadeContent>

                <AnimatePresence mode="wait">
                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-4"
                        >
                            {loadingRequests ? (
                                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
                            ) : followRequests.length === 0 ? (
                                <FadeContent blur duration={600}>
                                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-20 text-center border border-dashed border-slate-300/60">
                                        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <UserPlus className="w-8 h-8 text-teal-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">No Pending Requests</h3>
                                        <p className="text-slate-500 font-medium text-sm">When someone requests to follow you, it will appear here.</p>
                                    </div>
                                </FadeContent>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {followRequests.map((req, i) => (
                                        <FadeContent key={req.follower_id} blur duration={500} delay={i * 80}>
                                            <SpotlightCard
                                                className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm group"
                                                spotlightColor="rgba(20, 184, 166, 0.08)"
                                            >
                                                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold text-xl border border-teal-100/60 group-hover:scale-105 transition-transform">
                                                        {req.follower_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900 tracking-tight mb-0.5">{req.follower_name}</h4>
                                                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{req.follower_role} • {req.follower_college}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2.5 w-full sm:w-auto">
                                                    <button
                                                        onClick={() => updateFollowMutation.mutate({ followerId: req.follower_id, status: 'rejected' })}
                                                        className="flex-1 sm:flex-none flex items-center justify-center p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateFollowMutation.mutate({ followerId: req.follower_id, status: 'accepted' })}
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                                                    >
                                                        <Check className="w-4 h-4" /> Accept
                                                    </button>
                                                </div>
                                            </SpotlightCard>
                                        </FadeContent>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Followers Tab */}
                    {activeTab === 'followers' && (
                        <motion.div
                            key="followers"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Followers ({followers.length})</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100/80">
                                {loadingFollowers ? <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div> : followers.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500">No followers yet</p>
                                    </div>
                                ) : followers.map((follower, i) => (
                                    <FadeContent key={follower.id} duration={400} delay={i * 60}>
                                        <div className="p-5 flex items-center justify-between hover:bg-teal-50/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100/60 rounded-xl flex items-center justify-center font-bold text-teal-600 text-base bg-cover bg-center" style={{ backgroundImage: follower.avatar ? `url(${follower.avatar})` : 'none' }}>
                                                    {!follower.avatar && follower.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-900">{follower.name}</h4>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{follower.role}</p>
                                                </div>
                                            </div>
                                            <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors">
                                                Remove
                                            </button>
                                        </div>
                                    </FadeContent>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Following Tab */}
                    {activeTab === 'following' && (
                        <motion.div
                            key="following"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Following ({following.length})</h3>
                            </div>
                            {loadingFollowing ? <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div> : following.length === 0 ? (
                                <div className="py-16 text-center">
                                    <UserCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500">You're not following anyone yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-5 gap-4">
                                    {following.map((followed, i) => (
                                        <FadeContent key={followed.id} blur duration={400} delay={i * 80}>
                                            <SpotlightCard
                                                className="border border-slate-200/80 rounded-2xl p-5 text-center hover:border-teal-200 transition-all bg-white/80"
                                                spotlightColor="rgba(20, 184, 166, 0.08)"
                                            >
                                                <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-3 border border-teal-100/60 bg-cover bg-center" style={{ backgroundImage: followed.avatar ? `url(${followed.avatar})` : 'none' }}>
                                                    {!followed.avatar && followed.name.charAt(0)}
                                                </div>
                                                <h4 className="font-semibold text-slate-900 text-sm tracking-tight">{followed.name}</h4>
                                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mt-1 mb-4 truncate capitalize">{followed.role}</p>
                                                <button
                                                    onClick={() => updateFollowMutation.mutate({ followerId: followed.id, status: 'rejected' })}
                                                    className="w-full py-2 bg-slate-900 text-white hover:bg-rose-600 rounded-xl text-xs font-semibold transition-colors"
                                                >
                                                    Unfollow
                                                </button>
                                            </SpotlightCard>
                                        </FadeContent>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Network;

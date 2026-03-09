import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, UserCheck, Search, Filter, Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Network = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('requests');

    // Fetch Follow Requests (from Alumni dashboard)
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
            // Also invalidate dashboard queries so it updates everywhere
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

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center gap-6">
                    <Link to="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">Connections & Network</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Manage your professional network</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-8">
                {/* Tabs */}
                <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit mb-8">
                    {[
                        { id: 'requests', label: 'Pending Requests', icon: UserPlus, badge: followRequests.length },
                        { id: 'followers', label: 'Followers', icon: Users, badge: followers.length },
                        { id: 'following', label: 'Following', icon: UserCheck, badge: following.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.badge > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

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
                                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                            ) : followRequests.length === 0 ? (
                                <div className="bg-white rounded-[24px] p-20 text-center border border-dashed border-slate-200">
                                    <UserPlus className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                    <h3 className="text-lg font-black text-slate-900 mb-2">No Pendings Requests</h3>
                                    <p className="text-slate-500 font-medium text-sm">When someone requests to follow you, it will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {followRequests.map(req => (
                                        <div key={req.follower_id} className="bg-white p-6 rounded-[24px] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full">
                                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center font-black text-2xl border border-slate-100 group-hover:scale-105 transition-transform">
                                                    {req.follower_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">{req.follower_name}</h4>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{req.follower_role} • {req.follower_college}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => updateFollowMutation.mutate({ followerId: req.follower_id, status: 'rejected' })}
                                                    className="flex-1 sm:flex-none flex items-center justify-center p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => updateFollowMutation.mutate({ followerId: req.follower_id, status: 'accepted' })}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-200"
                                                >
                                                    <Check className="w-4 h-4" /> Accept
                                                </button>
                                            </div>
                                        </div>
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
                            className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">All Followers ({followers.length})</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {loadingFollowers ? <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : followers.map(follower => (
                                    <div key={follower.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 rounded-[16px] flex items-center justify-center font-black text-slate-500 text-lg bg-cover bg-center" style={{ backgroundImage: follower.avatar ? `url(${follower.avatar})` : 'none' }}>
                                                {!follower.avatar && follower.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-slate-900">{follower.name}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">{follower.role}</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors cursor-not-allowed opacity-50">
                                            Remove
                                        </button>
                                    </div>
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
                            className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Following ({following.length})</h3>
                            </div>
                            {loadingFollowing ? <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6 gap-6">
                                    {following.map(followed => (
                                        <div key={followed.id} className="border border-slate-200 rounded-[20px] p-6 text-center hover:border-blue-200 hover:shadow-lg transition-all">
                                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center font-black text-2xl mx-auto mb-4 bg-cover bg-center" style={{ backgroundImage: followed.avatar ? `url(${followed.avatar})` : 'none' }}>
                                                {!followed.avatar && followed.name.charAt(0)}
                                            </div>
                                            <h4 className="font-bold text-slate-900 tracking-tight">{followed.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 mb-6 truncate">{followed.role}</p>
                                            <button
                                                onClick={() => updateFollowMutation.mutate({ followerId: followed.id, status: 'rejected' }) /* Simplified unfollow */}
                                                className="w-full py-2.5 bg-slate-900 text-white hover:bg-red-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Unfollow
                                            </button>
                                        </div>
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

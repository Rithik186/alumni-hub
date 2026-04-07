import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users, Clock, CheckCircle, XCircle,
    Search, Plus, Calendar, Trash2, X,
    Megaphone, UserCheck, Shield,
    GraduationCap, Briefcase, Filter,
    Activity, Edit2, UserPlus, Mail,
    Building2, MoreVertical, Check, AlertCircle,
    LayoutDashboard, UserCircle, Settings, LogOut
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview'); // overview, pending, students, alumni, events
    const [searchQuery, setSearchQuery] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    // Form States
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'student', college: '' });
    const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', type: 'general' });

    // Fetch All Admin Data
    const { data: adminData, isLoading, isError, refetch } = useQuery({
        queryKey: ['adminDashboardData'],
        queryFn: async () => {
            const [stats, pending, users, events] = await Promise.all([
                axios.get('/api/admin/stats', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/admin/pending-alumni', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/admin/users', { headers: { 'Authorization': `Bearer ${user.token}` } }),
                axios.get('/api/events', { headers: { 'Authorization': `Bearer ${user.token}` } })
            ]);
            return {
                stats: stats.data,
                pending: pending.data,
                users: users.data,
                events: events.data
            };
        },
        staleTime: 5000,
        refetchInterval: 10000 // Refresh every 10 seconds for real-time feel
    });

    // Mutations for immediate UI feedback
    const approveMutation = useMutation({
        mutationFn: async ({ userId, status }) => {
            return axios.post('/api/admin/update-approval', { userId, status }, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminDashboardData']);
            toast.success('Account approval status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async (userId) => {
            return axios.patch(`/api/admin/users/${userId}/toggle-status`, {}, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminDashboardData']);
            toast.success('User status changed successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            return axios.delete(`/api/admin/users/${userId}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminDashboardData']);
            toast.success('User account removed');
        }
    });

    const userActionMutation = useMutation({
        mutationFn: async (data) => {
            if (editingUser) {
                return axios.put(`/api/admin/users/${editingUser.id}`, data, { headers: { 'Authorization': `Bearer ${user.token}` } });
            } else {
                return axios.post('/api/admin/users', data, { headers: { 'Authorization': `Bearer ${user.token}` } });
            }
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries(['adminDashboardData']);
            setIsUserModalOpen(false);
            setEditingUser(null);
            setUserForm({ name: '', email: '', password: '', role: 'student', college: '' });
            toast.success(editingUser ? 'Profile updated successfully' : 'New user created successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Error saving user')
    });

    const eventMutation = useMutation({
        mutationFn: async (data) => {
            return axios.post('/api/events', data, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminDashboardData']);
            setIsEventModalOpen(false);
            setEventForm({ title: '', description: '', date: '', type: 'general' });
            toast.success('Event published successfully');
        }
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (id) => {
            return axios.delete(`/api/events/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminDashboardData']);
            toast.success('Event deleted');
        }
    });

    // Filtering logic
    const filteredContent = useMemo(() => {
        if (!adminData) return [];
        let source = [];
        if (activeTab === 'pending') source = adminData.pending;
        else if (activeTab === 'students') source = adminData.users.filter(u => u.role === 'student');
        else if (activeTab === 'alumni') source = adminData.users.filter(u => u.role === 'alumni');
        else if (activeTab === 'events') return adminData.events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
        else return [];

        return source.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [adminData, activeTab, searchQuery]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium text-sm">Loading admin dashboard...</p>
            </div>
        </div>
    );

    if (isError) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Connection Error</h2>
                <p className="text-slate-500 mb-6">We couldn't connect to the database. Please check your network or token.</p>
                <button onClick={() => refetch()} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Retry Connection</button>
            </div>
        </div>
    );

    const { stats, pending = [], users = [], events = [] } = adminData;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Simple Navigation Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                            <Shield className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Center</h2>
                    </div>
                    
                    <nav className="space-y-1">
                        {[
                            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
                            { id: 'pending', label: 'Pending Approvals', icon: Clock, count: pending.length },
                            { id: 'students', label: 'Manage Students', icon: GraduationCap },
                            { id: 'alumni', label: 'Manage Alumni', icon: Briefcase },
                            { id: 'events', label: 'Campus Events', icon: Calendar },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                    activeTab === item.id 
                                    ? 'bg-indigo-50 text-indigo-600 font-bold' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <div className="flex items-center gap-3 text-sm">
                                    <item.icon className={`w-4.5 h-4.5 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </div>
                                {item.count > 0 && <span className="bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold animate-pulse">{item.count}</span>}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-2xl">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">{user.name.charAt(0)}</div>
                        <div className="truncate">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1 capitalize">
                            {activeTab.replace('-', ' ')}
                        </h1>
                        <p className="text-slate-500 font-medium">Manage and monitor platform activity in real-time.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', password: '', role: 'student', college: '' }); setIsUserModalOpen(true); }}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all font-bold text-sm shadow-lg shadow-slate-200"
                        >
                            <Plus className="w-4 h-4" /> Add User
                        </button>
                        <button 
                            onClick={() => setIsEventModalOpen(true)}
                            className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all font-bold text-sm"
                        >
                            <Megaphone className="w-4 h-4" /> Post Event
                        </button>
                    </div>
                </header>

                {activeTab === 'overview' ? (
                    <div className="space-y-12">
                        {/* Statistics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Users', value: users.length, icon: Users, color: 'indigo' },
                                { label: 'Pending Approvals', value: pending.length, icon: Clock, color: 'amber' },
                                { label: 'Active Students', value: users.filter(u => u.role === 'student').length, icon: GraduationCap, color: 'blue' },
                                { label: 'Active Alumni', value: users.filter(u => u.role === 'alumni').length, icon: Briefcase, color: 'emerald' }
                            ].map((s, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center`}>
                                            <s.icon className="w-6 h-6" />
                                        </div>
                                        <div className="p-1 px-2.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live</div>
                                    </div>
                                    <p className="text-slate-500 text-sm font-semibold mb-1">{s.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity or Recent Users */}
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900">Recently Registered</h3>
                                <button onClick={() => setActiveTab('students')} className="text-indigo-600 text-xs font-bold hover:underline">View All Users</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-8 py-5">User</th>
                                            <th className="px-8 py-5">Role</th>
                                            <th className="px-8 py-5">Date Joined</th>
                                            <th className="px-8 py-5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.slice(0, 5).map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold text-sm">{u.name.charAt(0)}</div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                                            <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${u.role === 'alumni' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className={`flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider ${u.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                        {u.is_active ? 'Active' : 'Inactive'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                        {/* Tab Filter & Search */}
                        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-400">{filteredContent.length} Results Found</span>
                                <div className="w-px h-5 bg-slate-200 mx-2"></div>
                                <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List Content */}
                        <div className="overflow-x-auto min-h-[400px]">
                            {activeTab === 'events' ? (
                                <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredContent.map((event) => (
                                        <div key={event.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                            <div className="flex justify-between items-start mb-6">
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold uppercase rounded-lg">{event.type}</span>
                                                <button onClick={() => deleteEventMutation.mutate(event.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">{event.title}</h4>
                                            <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{event.description}</p>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredContent.length === 0 && (
                                        <div className="col-span-full py-20 text-center text-slate-400 font-medium">No events found matching your search.</div>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                                        <tr>
                                            <th className="px-8 py-5">Full Profile</th>
                                            <th className="px-8 py-5">Role & Details</th>
                                            <th className="px-8 py-5">Verified Status</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredContent.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50/20 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                                            <p className="text-[11px] text-slate-400 font-medium">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1.5">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${u.role === 'alumni' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {u.role}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                                            <Building2 className="w-3.5 h-3.5" /> {u.college || 'No University Data'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${u.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                Account {u.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${u.is_approved ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${u.is_approved ? 'text-blue-500' : 'text-amber-500'}`}>
                                                                {u.is_approved ? 'Verified' : 'Pending Approval'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {activeTab === 'pending' ? (
                                                            <>
                                                                <button onClick={() => approveMutation.mutate({ userId: u.id, status: 'rejected' })} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold hover:bg-red-100 transition-all">Reject</button>
                                                                <button onClick={() => approveMutation.mutate({ userId: u.id, status: 'approved' })} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-100">Approve User</button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleEditUser(u)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                                                <button onClick={() => toggleStatusMutation.mutate(u.id)} className={`p-2.5 rounded-xl transition-all ${u.is_active ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                                                                    {u.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                                </button>
                                                                <button onClick={() => { if(window.confirm(`Are you sure you want to delete ${u.name}?`)) deleteMutation.mutate(u.id) }} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredContent.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-32 text-center text-slate-400 font-medium">No results found for {activeTab}.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modals - Simplified & Understandable */}
            <AnimatePresence>
                {isUserModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUserModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{editingUser ? 'Edit User Profile' : 'Create New User Accountant'}</h3>
                                    <button onClick={() => setIsUserModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
                                </div>

                                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); userActionMutation.mutate(userForm); }}>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                                            <input type="text" className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
                                            <input type="email" className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                                        </div>
                                    </div>

                                    {!editingUser && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Account Password</label>
                                            <input type="password" placeholder="Create a secure password" className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">User Role</label>
                                            <select className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all appearance-none" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                                                <option value="student">Student</option>
                                                <option value="alumni">Alumni</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">College / Institution</label>
                                            <input type="text" className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" value={userForm.college} onChange={(e) => setUserForm({ ...userForm, college: e.target.value })} />
                                        </div>
                                    </div>

                                    {editingUser && (
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex gap-6">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-0" checked={userForm.is_active} onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })} />
                                                <span className="text-xs font-bold text-slate-700">Account Active</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-0" checked={userForm.is_approved} onChange={(e) => setUserForm({ ...userForm, is_approved: e.target.checked })} />
                                                <span className="text-xs font-bold text-slate-700">Verified & Approved</span>
                                            </label>
                                        </div>
                                    )}

                                    <button type="submit" disabled={userActionMutation.isPending} className="w-full bg-slate-900 py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 active:scale-[0.98] mt-4">
                                        {userActionMutation.isPending ? 'Saving changes...' : (editingUser ? 'Save Profile Changes' : 'Create Account')}
                                        <Check className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isEventModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEventModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Post New Event</h3>
                                    <button onClick={() => setIsEventModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
                                </div>
                                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); eventMutation.mutate(eventForm); }}>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 ml-1">Event Title</label>
                                        <input type="text" className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Event Date</label>
                                            <input type="datetime-local" className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" required value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Category</label>
                                            <select className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all appearance-none" value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}>
                                                <option value="general">General Broadcast</option>
                                                <option value="training">Technical Training</option>
                                                <option value="placement">Placement Drive</option>
                                                <option value="alumni_meet">Alumni Meetup</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 ml-1">Description</label>
                                        <textarea className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium min-h-[140px] focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" required value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
                                    </div>
                                    <button type="submit" disabled={eventMutation.isPending} className="w-full bg-slate-900 py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 active:scale-[0.98] mt-4">
                                        {eventMutation.isPending ? 'Posting event...' : 'Publish Event'}
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    function handleEditUser(userItem) {
        setEditingUser(userItem);
        setUserForm({
            name: userItem.name,
            email: userItem.email,
            role: userItem.role,
            college: userItem.college || '',
            is_active: userItem.is_active,
            is_approved: userItem.is_approved
        });
        setIsUserModalOpen(true);
    }
};

export default AdminDashboard;

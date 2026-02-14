import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, GraduationCap,
    Briefcase, FileText, Upload, CheckCircle,
    Calendar, Building, ArrowLeft, Loader2,
    ShieldCheck, Zap, Globe, Cpu, ArrowUpRight, X,
    Clock, Smartphone, MapPin, Award, Link as LinkIcon,
    Camera, Ghost, Star, Pocket
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Navbar from '../components/landing/Navbar';

const Profile = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setProfileData(data);
            else if (res.status === 401) navigate('/login');
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await fetch('/api/student/upload-resume', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: formData
            });
            const data = await res.json();
            if (data.resume_url) {
                setMessage('Resume uploaded successfully!');
                fetchProfile();
            } else {
                setMessage(data.message || 'Upload failed');
            }
        } catch (err) {
            setMessage('Error uploading resume');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    if (!profileData) return null;

    const isStudent = profileData.role === 'student';
    const profile = profileData.profile;

    return (
        <div className="min-h-screen bg-[#fcfdfe] pt-24 pb-20 selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
            {/* Dynamic Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <Navbar />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <header className="mb-16">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Link to="/dashboard" className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-50 transition-all mb-12">
                            <ArrowLeft className="w-4 h-4" /> Back to Core Node
                        </Link>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Account <span className="text-blue-600">Identity</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Personal Node Synchronization • v2.1.0</p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Identity Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 space-y-8"
                    >
                        <div className="premium-card p-10 text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                            <div className="relative mb-10 inline-block">
                                <div className="absolute inset-0 bg-blue-500 rounded-[40px] blur-2xl opacity-20 animate-pulse"></div>
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] flex items-center justify-center text-5xl font-black text-white relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    {profileData.name.charAt(0)}
                                </div>
                                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl border border-slate-100 z-20 hover:bg-slate-50 transition-colors">
                                    <Camera className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{profileData.name}</h2>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-8">{profileData.role} • {profileData.college}</p>

                            <div className="flex items-center justify-center gap-2 mb-10">
                                {profileData.is_approved ? (
                                    <div className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Verified Identity
                                    </div>
                                ) : (
                                    <div className="px-5 py-2.5 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Syncing Node
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-10 border-t border-slate-100 text-left">
                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Link</p>
                                        <p className="text-xs font-bold text-slate-800">{profileData.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cell Frequency</p>
                                        <p className="text-xs font-bold text-slate-800">{profileData.phone_number || 'Link not established'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000 rotate-12">
                                <Zap className="w-32 h-32" />
                            </div>
                            <h4 className="text-2xl font-black tracking-tighter mb-4">Signal Status</h4>
                            <p className="text-sm font-bold text-slate-400 leading-relaxed mb-10">Your professional visibility is currently active to the entire network.</p>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-5 py-2.5 rounded-full backdrop-blur-md">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Online & Peer-Visible
                            </div>
                        </div>
                    </motion.div>

                    {/* Data Configurator */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="premium-card p-12"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Professional Records</h3>
                                <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">Edit Node</button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                                    <div className="p-4 bg-white rounded-2xl w-fit mb-6 shadow-sm"><Briefcase className="w-6 h-6 text-blue-600" /></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Professional base</p>
                                    <p className="text-lg font-black text-slate-900 leading-tight">{profile?.company || 'Identity Pending'}</p>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                                    <div className="p-4 bg-white rounded-2xl w-fit mb-6 shadow-sm"><Award className="w-6 h-6 text-indigo-600" /></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Execution Role</p>
                                    <p className="text-lg font-black text-slate-900 leading-tight">{profile?.job_role || 'General Operator'}</p>
                                </div>
                            </div>

                            <div className="mt-12 p-10 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-[40px] border border-blue-100/30">
                                <div className="flex items-center gap-4 mb-8">
                                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                                    <h4 className="text-lg font-black text-slate-900 tracking-tighter">Academic Lifecycle</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
                                        <p className="text-sm font-black text-slate-800">{profile?.department || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Batch Sync</p>
                                        <p className="text-sm font-black text-slate-800">{profile?.batch || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Node Serial</p>
                                        <p className="text-sm font-black text-slate-800">{profile?.register_number || 'STD-XXXX'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {isStudent && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="premium-card p-12 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <FileText className="w-64 h-64" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-12">Professional Asset (Resume)</h3>

                                <div className="relative">
                                    {profile?.resume_url ? (
                                        <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-slate-50 rounded-[40px] border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all duration-500">
                                            <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <FileText className="w-10 h-10 text-blue-600" />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-xl font-black text-slate-900 mb-2">Resume Established</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 leading-relaxed">System scan: Document verified and ready for peer review.</p>
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                                    <a href={`/uploads/resumes/${profile.resume_url}`} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">View Node Asset</a>
                                                    <label className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 cursor-pointer transition-all">
                                                        {uploading ? 'Transmitting...' : 'Re-Establish'}
                                                        <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={uploading} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-16 border-4 border-dashed border-slate-100 rounded-[64px] flex flex-col items-center justify-center text-center group hover:border-blue-100 transition-colors">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[35px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                                <Upload className="w-10 h-10 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">Null Asset Detection</h4>
                                            <p className="text-slate-400 font-bold max-w-sm mb-10 leading-relaxed">Establish your professional footprint by uploading your PDF resume for alumni verification.</p>
                                            <label className="px-12 py-5 bg-blue-600 text-white rounded-[28px] text-xs font-black uppercase tracking-[0.25em] hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 cursor-pointer active:scale-95 transition-all flex items-center gap-4">
                                                {uploading ? 'Processing Signal...' : 'Establish Resume Link'} <Upload className="w-5 h-5" />
                                                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        )}
                    </div>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300]"
                    >
                        <div className="bg-slate-900 text-white px-10 py-5 rounded-[28px] shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-3xl">
                            <Zap className="w-5 h-5 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{message}</span>
                            <button onClick={() => setMessage('')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Profile;

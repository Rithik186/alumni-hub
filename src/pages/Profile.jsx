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
    const { user, login } = useUser();
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
            if (res.ok) {
                setProfileData(data);
                if (data.profile_picture && data.profile_picture !== user.profile_picture) {
                    login({ ...user, profile_picture: data.profile_picture });
                }
            }
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

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            const res = await fetch('/api/upload/profile-picture', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Profile picture updated!');
                fetchProfile();
            } else {
                setMessage(data.message || 'Upload failed');
            }
        } catch (err) {
            setMessage('Error uploading profile picture');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <span className="uppercase text-xs font-black text-blue-500 tracking-[0.3em] animate-pulse">Fetching Identity Node...</span>
            </div>
        </div>
    );

    if (!profileData) return null;

    const isStudent = profileData.role === 'student';
    const profile = profileData.profile;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
            {/* Dynamic Ambient Background consistent with the dashboard style */}
            <div className="fixed inset-0 pointer-events-none z-[0] opacity-[0.5]">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[130px] rounded-full animate-pulse"></div>
                <div className="absolute top-[30%] left-[-10%] w-[40%] h-[40%] bg-teal-400/20 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-[-10%] right-[10%] w-[60%] h-[60%] bg-indigo-400/20 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <Navbar />

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-6">
                <header className="mb-10 md:mb-16">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Link to="/dashboard" className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_4px_15px_rgb(0,0,0,0.03)] rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-white hover:border-blue-100 transition-all mb-8 md:mb-10 w-fit">
                            <ArrowLeft className="w-4 h-4" /> Back to Core Node
                        </Link>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-3">Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">Identity</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em]">Personal Node Synchronization • v2.1.0</p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* === LEFT COLUMN: Identity Card === */}
                    <div className="lg:col-span-4 space-y-6 md:space-y-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 relative group">
                            <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            <div className="px-8 pb-10 text-center relative">
                                <div className="relative -mt-16 mb-6 flex justify-center">
                                    <div className="relative group/avatar">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-[36px] blur-xl opacity-20 animate-pulse"></div>
                                        <div className="w-32 h-32 bg-white/50 backdrop-blur-xl rounded-[36px] p-2 shadow-2xl relative z-10">
                                            <div className="w-full h-full bg-slate-100 rounded-[30px] flex items-center justify-center text-5xl font-black text-blue-600 uppercase overflow-hidden bg-cover bg-center group-hover/avatar:scale-105 transition-transform duration-500 relative" style={{ backgroundImage: profileData.profile_picture ? `url(${profileData.profile_picture})` : 'none' }}>
                                                {!profileData.profile_picture && profileData.name.charAt(0)}
                                            </div>
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 w-11 h-11 bg-slate-900 border-[3px] border-white rounded-[16px] flex items-center justify-center shadow-xl z-20 hover:bg-blue-600 text-white transition-colors cursor-pointer active:scale-95">
                                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-1.5">{profileData.name}</h2>
                                <div className="inline-flex flex-wrap items-center justify-center gap-1.5 mb-8">
                                    <span className="text-[10px] md:text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-[10px] uppercase tracking-widest">{profileData.role}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-[10px] uppercase tracking-widest truncate max-w-[150px]">{profileData.college}</span>
                                </div>

                                <div className="flex items-center justify-center mb-10 w-full">
                                    {profileData.is_approved ? (
                                        <div className="w-full px-5 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border border-emerald-100 flex items-center justify-center gap-2.5">
                                            <ShieldCheck className="w-4 h-4 shrink-0" /> Verified Identity Node
                                        </div>
                                    ) : (
                                        <div className="w-full px-5 py-3.5 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border border-amber-100 flex items-center justify-center gap-2.5">
                                            <Clock className="w-4 h-4 shrink-0" /> Syncing Node Verification
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 pt-8 border-t border-slate-100/60 text-left">
                                    <div className="flex items-center gap-4 p-4 md:p-5 bg-white border border-slate-200/60 rounded-[20px] shadow-sm hover:border-blue-100 transition-colors group">
                                        <div className="w-10 h-10 rounded-[14px] bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0">
                                            <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Link</p>
                                            <p className="text-[11px] font-bold text-slate-700 truncate">{profileData.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 md:p-5 bg-white border border-slate-200/60 rounded-[20px] shadow-sm hover:border-blue-100 transition-colors group">
                                        <div className="w-10 h-10 rounded-[14px] bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0">
                                            <Phone className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cell Frequency</p>
                                            <p className="text-[11px] font-bold text-slate-700 truncate">{profileData.phone_number || 'Link not established'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl shadow-blue-900/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-1000 rotate-12 pointer-events-none">
                                <Zap className="w-32 h-32 text-blue-400" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-xl md:text-2xl font-black tracking-tighter mb-3">Signal Status</h4>
                                <p className="text-[13px] md:text-sm font-medium text-slate-400 leading-relaxed mb-8">Your professional visibility is actively broadcasting to the <span className="text-blue-400 font-bold">AlumniHub Global Network.</span></p>
                                <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-5 py-3 rounded-xl backdrop-blur-md border border-white/5">
                                    <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.6)]" /> Online & Peer-Visible
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* === RIGHT COLUMN: Data Configurator === */}
                    <div className="lg:col-span-8 space-y-6 md:space-y-8 pb-20 lg:pb-0">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Briefcase className="w-4 h-4" /></div>
                                    Professional Records
                                </h3>
                                <button className="self-start sm:self-auto text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-slate-200">Request Node Edit</button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 md:gap-8">
                                <div className="p-6 md:p-8 bg-slate-50/50 rounded-[24px] md:rounded-[28px] border border-slate-200/60 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700 pointer-events-none text-blue-600"><Building className="w-16 h-16" /></div>
                                    <div className="p-3 md:p-4 bg-white border border-slate-100 rounded-2xl w-fit mb-5 md:mb-6 shadow-sm relative z-10"><Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /></div>
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2 relative z-10">Professional base</p>
                                    <p className="text-base md:text-lg font-black text-slate-900 leading-tight relative z-10 break-words">{profile?.company || 'Identity Pending'}</p>
                                </div>
                                <div className="p-6 md:p-8 bg-slate-50/50 rounded-[24px] md:rounded-[28px] border border-slate-200/60 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700 pointer-events-none text-indigo-600"><Star className="w-16 h-16" /></div>
                                    <div className="p-3 md:p-4 bg-white border border-slate-100 rounded-2xl w-fit mb-5 md:mb-6 shadow-sm relative z-10"><Award className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" /></div>
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2 relative z-10">Execution Role</p>
                                    <p className="text-base md:text-lg font-black text-slate-900 leading-tight relative z-10 break-words">{profile?.job_role || 'General Operator'}</p>
                                </div>
                            </div>

                            <div className="mt-8 md:mt-12 p-6 sm:p-8 md:p-10 bg-gradient-to-br from-indigo-50/40 to-blue-50/40 rounded-[28px] md:rounded-[36px] border border-blue-100/50 w-full overflow-hidden">
                                <div className="flex items-center gap-4 mb-6 md:mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm"><GraduationCap className="w-5 h-5" /></div>
                                    <h4 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter">Academic Lifecycle</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                                    <div className="bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-white/60">
                                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Globe className="w-3 h-3" /> Department</p>
                                        <p className="text-[12px] md:text-sm font-black text-slate-800 truncate">{profile?.department || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-white/60">
                                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Batch Sync</p>
                                        <p className="text-[12px] md:text-sm font-black text-slate-800">{profile?.batch || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-1 bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-white/60">
                                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Node Serial</p>
                                        <p className="text-[12px] md:text-sm font-black text-slate-800 truncate">{profile?.register_number || 'STD-XXXX'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {isStudent && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative"
                            >
                                <div className="absolute -top-10 -right-10 p-12 opacity-[0.03] pointer-events-none text-blue-900 rotate-12">
                                    <FileText className="w-[300px] h-[300px]" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-8 md:mb-12 flex items-center gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4" /></div>
                                    Professional Asset <span className="text-sm text-slate-400 font-bold ml-1 hidden sm:block">(Resume)</span>
                                </h3>

                                <div className="relative z-10">
                                    {profile?.resume_url ? (
                                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-10 bg-slate-50/60 rounded-[28px] md:rounded-[40px] border border-slate-200/50 group hover:bg-white hover:border-blue-100 transition-all duration-500 shadow-sm">
                                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[24px] md:rounded-[32px] shadow-lg flex items-center justify-center group-hover:scale-105 group-hover:shadow-blue-100 transition-all duration-500 shrink-0 border border-slate-100">
                                                <FileText className="w-8 h-8 md:w-10 md:h-10 text-teal-500" />
                                            </div>
                                            <div className="flex-1 text-center md:text-left w-full">
                                                <h4 className="text-lg md:text-xl font-black text-slate-900 mb-2">Resume Established</h4>
                                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 leading-relaxed max-w-sm mx-auto md:mx-0">System scan: Document verified and ready for peer review.</p>
                                                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 w-full sm:w-auto">
                                                    <a href={`/uploads/resumes/${profile.resume_url}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-6 md:px-8 py-3.5 bg-slate-900 text-white rounded-[16px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2">
                                                        View Asset <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </a>
                                                    <label className="w-full sm:w-auto px-6 md:px-8 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-[16px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2">
                                                        {uploading ? <><Loader2 className="w-3 h-3 animate-spin" /> Transmitting...</> : <><Upload className="w-3 h-3" /> Re-Establish</>}
                                                        <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={uploading} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-10 md:p-16 border-[3px] border-dashed border-slate-200/80 bg-slate-50/20 rounded-[32px] md:rounded-[48px] flex flex-col items-center justify-center text-center group hover:border-blue-300 hover:bg-blue-50/10 transition-colors">
                                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[24px] md:rounded-[32px] flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-100 transition-all duration-500 border border-slate-100 shadow-sm">
                                                <Upload className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                            <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-2.5 md:mb-3 tracking-tighter">Null Asset Detection</h4>
                                            <p className="text-[13px] md:text-sm text-slate-500 font-medium max-w-sm mb-8 md:mb-10 leading-relaxed px-4">Establish your professional footprint by uploading your PDF resume for alumni verification.</p>
                                            <label className="px-8 md:px-10 py-4 bg-blue-600 text-white rounded-[20px] md:rounded-[24px] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-lg hover:shadow-2xl hover:shadow-blue-200/50 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-3 w-[260px] md:w-auto">
                                                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Transmitting...</> : <>Establish Link <Upload className="w-4 h-4" /></>}
                                                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        )}
                    </div>
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-[90%] md:w-auto"
                        >
                            <div className="bg-slate-900 text-white px-6 md:px-8 py-4 rounded-[20px] shadow-2xl flex items-center justify-center md:justify-start gap-4 border border-white/10 backdrop-blur-xl">
                                <Zap className="w-4 h-4 md:w-5 md:h-5 text-blue-400 shrink-0" />
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] leading-[1.4] text-center md:text-left">{message}</span>
                                <button onClick={() => setMessage('')} className="p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"><X className="w-3 h-3 md:w-4 md:h-4" /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Profile;

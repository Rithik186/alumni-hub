import React, { useState, useEffect } from 'react';
import {
    Mail, Phone, GraduationCap,
    Briefcase, FileText, Upload, CheckCircle2,
    Building, ArrowLeft, Loader2,
    ShieldCheck, Camera, X, AlertCircle,
    User, Download, Eye, RefreshCw,
    Calendar, MapPin, Award, Link as LinkIcon,
    Copy, Check, Edit3, Globe, Linkedin, Twitter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Navbar from '../components/landing/Navbar';
import FadeContent from '../components/animations/FadeContent';
import SpotlightCard from '../components/animations/SpotlightCard';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const Profile = () => {
    const { user, login } = useUser();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadTarget, setUploadTarget] = useState(null); // 'pic' | 'resume'
    const [message, setMessage] = useState({ text: '', type: '' });
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [profilePicError, setProfilePicError] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchProfile();
    }, [user]);

    useEffect(() => {
        setProfilePicError(false); // Reset error on new profile data
    }, [profileData?.profile_picture]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setProfileData(data);
            } else {
                setMessage({ text: data.message || 'Failed to load profile', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Error connecting to server', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadTarget('pic');
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
                setProfileData(prev => ({ ...prev, profile_picture: data.profile_picture }));
                // Update context too
                login({ ...user, profile_picture: data.profile_picture });
                setMessage({ text: 'Profile picture updated!', type: 'success' });
            } else {
                setMessage({ text: data.message || 'Upload failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Error uploading image', type: 'error' });
        } finally {
            setUploading(false);
            setUploadTarget(null);
        }
    };

    const copyEmail = () => {
        navigator.clipboard.writeText(profileData.email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading Identity...</p>
            </div>
        </div>
    );

    if (!profileData) return null;

    const profile = profileData.profile;
    const isStudent = profileData.role === 'student';

    const InfoRow = ({ icon: Icon, label, value, action }) => (
        <div className="flex items-center justify-between group py-2">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all">
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-slate-700">{value || 'Not provided'}</p>
                </div>
            </div>
            {action}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/30">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                
                {/* ─── Breadcrumb & Actions ─── */}
                <FadeContent blur duration={400}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-all group">
                            <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Back to Hub
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link to="/profile/edit" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                            </Link>
                        </div>
                    </div>
                </FadeContent>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Main Info (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* ─── Profile Hero ─── */}
                        <FadeContent blur duration={600}>
                            <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden" spotlightColor="rgba(79, 70, 229, 0.06)">
                                <div className="h-32 sm:h-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 transition-all capitalize px-3 py-1 text-[10px]">
                                            {profileData.role}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="px-6 sm:px-10 pb-8 relative">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Avatar Container */}
                                        <div className="-mt-12 sm:-mt-16 relative z-10">
                                            <div className="relative group">
                                                <div 
                                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white p-1.5 shadow-xl transition-transform hover:scale-[1.01]"
                                                >
                                                    <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400 overflow-hidden relative">
                                                        {profileData.profile_picture && !profilePicError ? (
                                                            <img 
                                                                src={profileData.profile_picture} 
                                                                alt={profileData.name}
                                                                className="w-full h-full object-cover"
                                                                onError={() => setProfilePicError(true)}
                                                            />
                                                        ) : (
                                                            <span>{profileData.name?.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <label className="absolute bottom-2 right-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 cursor-pointer transition-all border-4 border-white">
                                                    {uploading && uploadTarget === 'pic' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} disabled={uploading} />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Primary Header Info */}
                                        <div className="flex-1 pt-2 sm:pt-4">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{profileData.name}</h1>
                                                {profileData.is_approved ? (
                                                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm" title="Verified Professional">
                                                        <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-lg text-[10px] font-bold">Unverified</Badge>
                                                )}
                                            </div>
                                            <p className="text-base font-medium text-slate-500 mb-4 flex items-center gap-2">
                                                {profile?.job_role || (isStudent ? 'Aspiring Professional' : 'Alumni Member')}
                                                {profile?.company && <><span className="w-1 h-1 bg-slate-300 rounded-full"></span> <span>at {profile.company}</span></>}
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {profileData.college || 'Our Institution'}</span>
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> Member since {new Date(profileData.created_at).getFullYear()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </FadeContent>

                        {/* ─── Professional Summary / About ─── */}
                        <FadeContent blur duration={500} delay={100}>
                            <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8" spotlightColor="rgba(79, 70, 229, 0.06)">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-600" /> Professional Overview
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {profile?.bio || `A dedicated ${profileData.role} focused on professional excellence and community engagement within the ${profile?.department || 'academic'} sector. Committed to building meaningful connections and leveraging institutional resources for career growth.`}
                                </p>
                            </SpotlightCard>
                        </FadeContent>

                        {/* ─── Skills & Expertise ─── */}
                        {profile?.skills && (
                            <FadeContent blur duration={500} delay={200}>
                                <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8" spotlightColor="rgba(79, 70, 229, 0.06)">
                                    <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-indigo-600" /> Expertise & Skillset
                                    </h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {(Array.isArray(profile.skills) ? profile.skills : (profile.skills?.split(',') || [])).map((skill, i) => (
                                            <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-default">
                                                {typeof skill === 'string' ? skill.trim() : skill}
                                            </span>
                                        ))}
                                    </div>
                                </SpotlightCard>
                            </FadeContent>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* ─── Contact Information ─── */}
                        <FadeContent blur duration={500} delay={100}>
                            <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6" spotlightColor="rgba(79, 70, 229, 0.06)">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-indigo-600" /> Connected Channels
                                </h3>
                                <div className="space-y-4">
                                    <InfoRow 
                                        icon={Mail} 
                                        label="Corporate Email" 
                                        value={profileData.email} 
                                        action={
                                            <button onClick={copyEmail} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                                {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        }
                                    />
                                    <InfoRow icon={Phone} label="Direct Line" value={profileData.phone_number} />
                                    <hr className="my-2 border-slate-100" />
                                    <div className="flex items-center justify-between gap-2 pt-2">
                                        <button className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition-all text-slate-400 hover:text-indigo-600">
                                            <Linkedin className="w-5 h-5" />
                                        </button>
                                        <button className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition-all text-slate-400 hover:text-indigo-600">
                                            <Globe className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </FadeContent>

                        {/* ─── Institutional Info ─── */}
                        <FadeContent blur duration={500} delay={200}>
                            <SpotlightCard className="bg-slate-900 shadow-xl rounded-3xl p-6 text-white overflow-hidden relative" spotlightColor="rgba(255, 255, 255, 0.08)">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-5 opacity-60 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" /> Academic Record
                                </h3>
                                <div className="space-y-5 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                                        <p className="text-sm font-bold text-indigo-100">{profile?.department || 'General'}</p>
                                    </div>
                                    <div className="flex gap-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Batch</p>
                                            <p className="text-sm font-bold text-indigo-100">{profile?.batch || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-sm font-bold text-emerald-400">Verified</p>
                                        </div>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </FadeContent>
                    </div>
                </div>
            </main>

            {/* Notification Toast */}
            {message.text && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300]">
                    <FadeContent duration={400}>
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
                            message.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-white'
                        }`}>
                            {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                            <span className="text-sm font-bold">{message.text}</span>
                            <button onClick={() => setMessage({ text: '', type: '' })} className="ml-4 p-1 hover:bg-white/10 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </FadeContent>
                </div>
            )}
        </div>
    );
};

export default Profile;

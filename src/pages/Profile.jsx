import React, { useState, useEffect } from 'react';
import {
    Mail, Phone, GraduationCap,
    Briefcase, FileText, Upload, CheckCircle2,
    Building, ArrowLeft, Loader2,
    ShieldCheck, Camera, X, AlertCircle,
    User, Download, Eye, RefreshCw,
    Calendar, MapPin, Award, Link as LinkIcon,
    Copy, Check, Edit3, Globe, Linkedin, Twitter,
    Lock, UserPlus, UserCheck, MessageSquare
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Navbar from '../components/landing/Navbar';
import FadeContent from '../components/animations/FadeContent';
import SpotlightCard from '../components/animations/SpotlightCard';
import Avatar from '../components/dashboard/Avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const Profile = () => {
    const { user: currentUser, login } = useUser();
    const { id: profileId } = useParams();
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadTarget, setUploadTarget] = useState(null); // 'pic' | 'resume'
    const [message, setMessage] = useState({ text: '', type: '' });
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const isOwnProfile = !profileId || parseInt(profileId) === currentUser?.id;

    useEffect(() => {
        if (!currentUser) { navigate('/login'); return; }
        fetchProfile();
    }, [currentUser, profileId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const url = isOwnProfile ? '/api/auth/me' : `/api/auth/profile/${profileId}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
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

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            const res = await fetch(`/api/connections/follow/${profileId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: 'Follow request sent!', type: 'success' });
                fetchProfile(); // Refresh to update status
            } else {
                setMessage({ text: data.message || 'Failed to follow', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error', type: 'error' });
        } finally {
            setFollowLoading(false);
        }
    };

    const handleProfilePicUpload = async (e) => {
        if (!isOwnProfile) return;
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadTarget('pic');
        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            const res = await fetch('/api/upload/profile-picture', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentUser.token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setProfileData(prev => ({ ...prev, profile_picture: data.profile_picture }));
                login({ ...currentUser, profile_picture: data.profile_picture });
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
        if (profileData.isLimited) return;
        navigator.clipboard.writeText(profileData.email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 rotate-0 animate-pulse uppercase tracking-widest">Verifying Identity...</p>
            </div>
        </div>
    );

    if (!profileData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
            <p className="text-slate-500 text-sm mb-6 text-center">The profile you are looking for might have been moved or deactivated.</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100">Go Back</button>
        </div>
    );

    const profile = profileData.profile;
    const isStudent = profileData.role === 'student';
    const isLimited = profileData.isLimited;

    const InfoRow = ({ icon: Icon, label, value, action, blurred }) => (
        <div className="flex items-center justify-between group py-2">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all">
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className={`text-sm font-bold ${blurred ? 'blur-sm select-none text-slate-300' : 'text-slate-700'}`}>
                        {blurred ? '••••••••••••••' : (value || 'Not provided')}
                    </p>
                </div>
            </div>
            {!blurred && action}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/30">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                
                {/* ─── Breadcrumb & Actions ─── */}
                <FadeContent blur duration={400}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-all group">
                            <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Back
                        </button>
                        
                        {!isOwnProfile && (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading || profileData.connectionStatus?.status !== 'none'}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                                        profileData.connectionStatus?.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' :
                                        profileData.connectionStatus?.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default shadow-none' :
                                        'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100'
                                    }`}
                                >
                                    {followLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                                     profileData.connectionStatus?.status === 'accepted' ? <><UserCheck className="w-3.5 h-3.5" /> Connected</> :
                                     profileData.connectionStatus?.status === 'pending' ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pending Approval</> :
                                     <><UserPlus className="w-3.5 h-3.5" /> Send Connection Request</>}
                                </button>
                                {profileData.connectionStatus?.status === 'accepted' && (
                                    <button onClick={() => navigate('/chat')} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}

                        {isOwnProfile && (
                            <Link to="/profile/edit" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                                <Edit3 className="w-3.5 h-3.5" /> Edit My Profile
                            </Link>
                        )}
                    </div>
                </FadeContent>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Main Info (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* ─── Profile Hero ─── */}
                        <FadeContent blur duration={600}>
                            <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-[32px] overflow-hidden" spotlightColor="rgba(79, 70, 229, 0.06)">
                                <div className="h-40 sm:h-48 bg-slate-900 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 capitalize font-bold px-3 py-1">
                                            {profileData.role}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="px-6 sm:px-10 pb-8 relative">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="-mt-16 sm:-mt-20 relative z-10">
                                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white p-1.5 shadow-2xl">
                                                <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                                    <Avatar 
                                                        src={profileData.profile_picture} 
                                                        name={profileData.name} 
                                                        size={160} 
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                                {isOwnProfile && (
                                                    <label className="absolute bottom-1 right-1 w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-900 cursor-pointer transition-all border-4 border-white">
                                                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                                                        <input type="file" className="hidden" onChange={handleProfilePicUpload} disabled={uploading} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 pt-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                                    {profileData.name}
                                                    {profileData.is_approved && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                                                </h1>
                                            </div>
                                            <p className="text-sm sm:text-base font-bold text-slate-500 mb-4 flex items-center gap-2">
                                                {profile?.job_role || (isStudent ? 'Future Profession' : 'Industry Expert')}
                                                {profile?.company && <><span className="w-1 h-1 bg-slate-300 rounded-full" /> <span className="text-slate-900">@{profile.company}</span></>}
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400">
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg"><MapPin className="w-3 h-3 text-indigo-500" /> {profileData.college || 'Our Institution'}</span>
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg"><Calendar className="w-3 h-3 text-indigo-500" /> Batch {profile?.batch || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </FadeContent>

                        {/* ─── Private Content Barrier ─── */}
                        {isLimited && (
                            <FadeContent blur duration={500}>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[12px] z-20 rounded-[32px] flex flex-col items-center justify-center p-8 text-center border border-white">
                                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-slate-200">
                                            <Lock className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Professional Content Locked</h3>
                                        <p className="text-sm text-slate-500 font-medium max-w-sm mb-6">Connect with {profileData.name.split(' ')[0]} to unlock their full portfolio, skills, and contact information.</p>
                                        <button 
                                            onClick={handleFollow}
                                            disabled={profileData.connectionStatus?.status !== 'none'}
                                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-indigo-100"
                                        >
                                            {profileData.connectionStatus?.status === 'none' ? 'Request Full Access' : 'Request Pending...'}
                                        </button>
                                    </div>

                                    {/* Blurred Placeholder Experience */}
                                    <div className="space-y-4 opacity-50 select-none pointer-events-none">
                                        <div className="h-40 bg-white rounded-[32px] border border-slate-200 flex items-center justify-center">
                                            <div className="w-[80%] space-y-3">
                                                <div className="h-4 w-1/3 bg-slate-100 rounded-full" />
                                                <div className="h-10 bg-slate-50 rounded-2xl" />
                                            </div>
                                        </div>
                                        <div className="h-32 bg-white rounded-[32px] border border-slate-200" />
                                    </div>
                                </div>
                            </FadeContent>
                        )}

                        {/* ─── ABOUT & SKILLS (Hidden if Limited) ─── */}
                        {!isLimited && (
                            <>
                                <FadeContent blur duration={500}>
                                    <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-8" spotlightColor="rgba(79, 70, 229, 0.04)">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <User className="w-4 h-4 text-indigo-500" /> Journey & Vision
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                            {profile?.bio || 'Professional journey is being written... Check back soon for deeper insights into this member\'s vision.'}
                                        </p>
                                    </SpotlightCard>
                                </FadeContent>

                                <FadeContent blur duration={500} delay={100}>
                                    <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-8" spotlightColor="rgba(79, 70, 229, 0.04)">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-indigo-500" /> Core Skillset
                                        </h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {(Array.isArray(profile?.skills) ? profile.skills : (profile?.skills?.split(',') || [])).map((skill, i) => (
                                                <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-default">
                                                    {typeof skill === 'string' ? skill.trim() : skill}
                                                </span>
                                            ))}
                                            {(profile?.skills?.length === 0 || !profile?.skills) && (
                                                <p className="text-xs text-slate-400 font-medium italic">No specializations documented yet.</p>
                                            )}
                                        </div>
                                    </SpotlightCard>
                                </FadeContent>
                            </>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Contact & Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        <FadeContent blur duration={500}>
                            <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-6" spotlightColor="rgba(79, 70, 229, 0.04)">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> Direct Inbox
                                </h3>
                                <div className="space-y-3">
                                    <InfoRow 
                                        icon={Mail} 
                                        label="Official ID" 
                                        value={profileData.email} 
                                        blurred={isLimited}
                                        action={
                                            <button onClick={copyEmail} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all">
                                                {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        }
                                    />
                                    <InfoRow icon={Phone} label="Contact Number" value={profileData.phone_number} blurred={isLimited} />
                                    <Separator className="my-4 bg-slate-100" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all ${isLimited ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 hover:border-indigo-200 text-indigo-600'}`}>
                                            <Linkedin className="w-4 h-4" />
                                        </button>
                                        <button className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all ${isLimited ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-900 text-white'}`}>
                                            <Globe className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </FadeContent>

                        <FadeContent blur duration={500} delay={100}>
                            <SpotlightCard className="bg-slate-900 rounded-[32px] p-8 text-white overflow-hidden relative" spotlightColor="rgba(255, 255, 255, 0.1)">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-40 flex items-center gap-2 text-indigo-200">
                                    <Building className="w-3.5 h-3.5" /> Affiliations
                                </h3>
                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Department</p>
                                        <p className="text-sm font-bold text-indigo-100">{profile?.department || 'General Institution'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Professional Year</p>
                                            <p className="text-sm font-bold text-indigo-100">{profile?.batch ? `Class of ${profile.batch}` : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">ID Status</p>
                                            <div className="flex items-center gap-1.5 pt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                <span className="text-[11px] font-black text-emerald-400 uppercase italic">Active Member</span>
                                            </div>
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


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, GraduationCap,
    Briefcase, FileText, Upload, CheckCircle,
    Calendar, Building, ArrowLeft, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

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
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await res.json();

            if (res.ok) {
                setProfileData(data);
            } else {
                setMessage(data.message || 'Failed to load profile');
                // If token is invalid, maybe logout?
                if (res.status === 401) {
                    navigate('/login');
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setMessage('Connection error');
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
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.resume_url) {
                setMessage('Resume uploaded successfully!');
                fetchProfile(); // Refresh data
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
    );

    if (!profileData) return null;

    const isStudent = profileData.role === 'student';
    const profile = profileData.profile;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    {/* Header Banner */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute -bottom-16 left-10">
                            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg p-2">
                                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                                    <User className="w-16 h-16 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-20 px-10 pb-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-1">{profileData.name}</h1>
                                <p className="text-blue-600 font-semibold flex items-center gap-2">
                                    {isStudent ? (
                                        <><GraduationCap className="w-5 h-5" /> Student @ {profileData.college}</>
                                    ) : (
                                        <><Briefcase className="w-5 h-5" /> Alumni @ {profile?.company || 'N/A'}</>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${profileData.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {profileData.is_verified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Mail className="w-5 h-5 text-blue-500" />
                                        <span>{profileData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Phone className="w-5 h-5 text-blue-500" />
                                        <span>{profileData.phone_number}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Building className="w-5 h-5 text-blue-500" />
                                        <span>{profileData.college}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Academic/Professional Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    {isStudent ? 'Academic Details' : 'Professional Details'}
                                </h3>
                                <div className="space-y-3">
                                    {isStudent ? (
                                        <>
                                            <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <GraduationCap className="w-5 h-5 text-indigo-500" />
                                                <span>Department: <strong>{profile?.department || 'N/A'}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <FileText className="w-5 h-5 text-indigo-500" />
                                                <span>Reg No: <strong>{profile?.register_number || 'N/A'}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Calendar className="w-5 h-5 text-indigo-500" />
                                                <span>Batch: <strong>{profile?.batch || 'N/A'}</strong></span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Building className="w-5 h-5 text-indigo-500" />
                                                <span>Company: <strong>{profile?.company || 'N/A'}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Briefcase className="w-5 h-5 text-indigo-500" />
                                                <span>Role: <strong>{profile?.job_role || 'N/A'}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Calendar className="w-5 h-5 text-indigo-500" />
                                                <span>Graduated: <strong>{profile?.batch || 'N/A'}</strong></span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Resume Section for Students */}
                        {isStudent && (
                            <div className="mt-10 pt-10 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-blue-600" /> Resume / CV
                                </h3>

                                {message && (
                                    <div className={`mb-4 p-3 rounded-xl text-sm font-medium border flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        <CheckCircle className="w-4 h-4" /> {message}
                                    </div>
                                )}

                                <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-400 transition-all">
                                    {profile?.resume_url ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                                <FileText className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <p className="text-slate-800 font-semibold mb-1">Resume Uploaded</p>
                                            <a
                                                href={`/uploads/resumes/${profile.resume_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm font-medium mb-4"
                                            >
                                                View Current Resume
                                            </a>
                                            <label className="cursor-pointer bg-white px-6 py-2 rounded-full text-sm font-bold border border-slate-200 hover:border-blue-500 transition-all shadow-sm">
                                                {uploading ? 'Uploading...' : 'Replace Resume'}
                                                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-all">
                                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-all" />
                                            </div>
                                            <p className="text-slate-800 font-semibold mb-1">No resume uploaded</p>
                                            <p className="text-slate-500 text-sm mb-4">Upload your PDF resume to get noticed by Alumni</p>
                                            <label className="cursor-pointer bg-blue-600 px-8 py-3 rounded-full text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                                {uploading ? 'Uploading...' : 'Upload PDF'}
                                                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

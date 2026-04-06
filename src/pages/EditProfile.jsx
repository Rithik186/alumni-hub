import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Building, 
    GraduationCap, Calendar, Briefcase, 
    Award, ArrowLeft, Loader2, Save, 
    X, CheckCircle2, AlertCircle, Camera
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Navbar from '../components/landing/Navbar';
import FadeContent from '../components/animations/FadeContent';
import SpotlightCard from '../components/animations/SpotlightCard';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const EditProfile = () => {
    const { user, login } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        college: '',
        department: '',
        batch: '',
        company: '',
        job_role: '',
        bio: '',
        skills: ''
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone_number: data.phone_number || '',
                    college: data.college || '',
                    department: data.profile?.department || '',
                    batch: data.profile?.batch || '',
                    company: data.profile?.company || '',
                    job_role: data.profile?.job_role || '',
                    bio: data.profile?.bio || '',
                    skills: data.profile?.skills?.join(', ') || ''
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            // Update auth fields (name, email, phone)
            const authRes = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone_number: formData.phone_number,
                    college: formData.college
                })
            });

            // Update role-specific profile fields
            const profileRes = await fetch(`/api/${user.role}/profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({
                    department: formData.department,
                    batch: formData.batch,
                    company: formData.company,
                    job_role: formData.job_role,
                    bio: formData.bio,
                    skills: formData.skills
                })
            });

            if (authRes.ok && profileRes.ok) {
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
                // Update local context
                login({ ...user, name: formData.name });
                setTimeout(() => navigate('/profile'), 1500);
            } else {
                setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'An error occurred while saving.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <Navbar />
            
            <main className="max-w-4xl mx-auto px-4 pt-28">
                <FadeContent blur duration={400}>
                    <div className="flex items-center justify-between mb-8">
                        <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-all">
                            <ArrowLeft className="w-4 h-4" /> Back to Profile
                        </Link>
                        <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100">
                            Editing Profile
                        </Badge>
                    </div>

                    <SpotlightCard className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8" spotlightColor="rgba(79, 70, 229, 0.05)">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Personal Information Header */}
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                                    <p className="text-xs text-slate-500">Update your basic details and identification</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Full Name</label>
                                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Email Address</label>
                                    <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Phone Number</label>
                                    <Input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+1 234 567 890" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">College / University</label>
                                    <Input name="college" value={formData.college} onChange={handleChange} placeholder="Institution Name" />
                                </div>
                            </div>

                            {/* Academic & Professional Details */}
                            <div className="flex items-center gap-3 pt-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Professional Context</h2>
                                    <p className="text-xs text-slate-500">Share your academic background and career status</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Department</label>
                                    <Input name="department" value={formData.department} onChange={handleChange} placeholder="e.g. CSE" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Batch Year</label>
                                    <Input name="batch" value={formData.batch} onChange={handleChange} placeholder="e.g. 2024" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Current Company</label>
                                    <Input name="company" value={formData.company} onChange={handleChange} placeholder="Where do you work?" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Current Job Role</label>
                                <Input name="job_role" value={formData.job_role} onChange={handleChange} placeholder="Software Engineer, etc." />
                            </div>

                            {/* About & Skills */}
                            <div className="flex items-center gap-3 pt-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <Award className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Experience & Skills</h2>
                                    <p className="text-xs text-slate-500">Brief bio and technical skills (comma separated)</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Biographical Summary</label>
                                <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tell the community about yourself..." className="resize-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Core Skills</label>
                                <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python, Design Systems..." />
                                <p className="text-[10px] text-slate-400 pl-1 font-medium">Use commas to separate skills for optimal display on your profile.</p>
                            </div>

                            <div className="pt-8 flex flex-col sm:flex-row gap-4">
                                <Button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12 text-sm font-bold shadow-lg shadow-indigo-200">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Changes...</> : <><Save className="w-4 h-4 mr-2" /> Save & Update Profile</>}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => navigate('/profile')} className="flex-1 h-12 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </SpotlightCard>
                </FadeContent>
            </main>

            {/* Notification Toast */}
            {message.text && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300]">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
                        message.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-800 text-white'
                    }`}>
                        {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                        <span className="text-sm font-bold">{message.text}</span>
                        <button onClick={() => setMessage({ text: '', type: '' })} className="ml-4 p-1 hover:bg-white/10 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfile;

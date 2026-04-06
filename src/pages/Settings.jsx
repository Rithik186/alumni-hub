import React, { useState } from 'react';
import {
    Settings as SettingsIcon, Bell, Lock, Eye, UserCheck, Palette,
    Download, LogOut, ChevronRight, ToggleRight, Mail, Smartphone,
    Globe, Save, X, Check, Loader2, Shield, Trash2
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FadeContent from '../components/animations/FadeContent';
import ShinyText from '../components/animations/ShinyText';
import SpotlightCard from '../components/animations/SpotlightCard';

const Settings = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Account Settings State
    const [accountSettings, setAccountSettings] = useState({
        email: user?.email || '',
        displayName: user?.name || '',
        phoneNumber: user?.phone_number || '',
        bio: user?.bio || '',
    });

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        newPostNotifications: true,
        connectionRequests: true,
        messages: true,
        weeklyDigest: true,
    });

    // Privacy Settings State
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        allowMessages: 'everyone',
        showActivity: true,
        searchEngineIndex: true,
    });

    // Appearance Settings State
    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light',
        fontSize: 'medium',
        compactMode: false,
    });

    const handleAccountChange = (field, value) => {
        setAccountSettings(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleNotificationChange = (field) => {
        setNotificationSettings(prev => ({ ...prev, [field]: !prev[field] }));
        setSaved(false);
    };

    const handlePrivacyChange = (field, value) => {
        setPrivacySettings(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleAppearanceChange = (field, value) => {
        setAppearanceSettings(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const saveSettings = async () => {
        setLoading(true);
        setError('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Failed to save settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await logout();
            navigate('/login');
        }
    };

    const SettingToggle = ({ label, description, value, onChange }) => (
        <div className="flex items-center justify-between p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors rounded-lg">
            <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={onChange}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                    value ? 'bg-teal-500' : 'bg-slate-300'
                }`}
            >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                    value ? 'left-[22px]' : 'left-0.5'
                }`} />
            </button>
        </div>
    );

    const SettingSelect = ({ label, description, value, options, onChange }) => (
        <div className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors rounded-lg">
            <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
            {description && <p className="text-xs text-slate-500 mb-2.5">{description}</p>}
            <select
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    const SettingInput = ({ label, description, type = 'text', value, onChange }) => (
        <div className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors rounded-lg">
            <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
            {description && <p className="text-xs text-slate-500 mb-2.5">{description}</p>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
            />
        </div>
    );

    const tabItems = [
        { id: 'account', label: 'Account', icon: UserCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    const SaveButton = () => (
        <button
            onClick={saveSettings}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 shadow-sm text-sm"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
    );

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f4faf8 0%, #e2eeeb 60%, #dae8e4 100%)' }}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <FadeContent blur duration={600}>
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                                <SettingsIcon className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Settings
                                </h1>
                                <p className="text-sm text-slate-500">Manage your account, privacy, and preferences</p>
                            </div>
                        </div>
                    </div>
                </FadeContent>

                {/* Success Message */}
                {saved && (
                    <FadeContent duration={300}>
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 shadow-sm">
                            <Check className="w-5 h-5 text-emerald-600" />
                            <p className="text-sm font-medium text-emerald-700">Settings saved successfully!</p>
                        </div>
                    </FadeContent>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 shadow-sm">
                        <X className="w-5 h-5 text-rose-600" />
                        <p className="text-sm font-medium text-rose-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <FadeContent blur duration={600} delay={100}>
                        <aside className="lg:col-span-1">
                            <nav className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden sticky top-8 shadow-sm">
                                {tabItems.map((tab, i) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100/80 last:border-b-0 transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-teal-50 text-teal-700 border-l-[3px] border-l-teal-500 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <tab.icon className={`w-[18px] h-[18px] ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-400'}`} />
                                        <span className="text-sm">{tab.label}</span>
                                        <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${activeTab === tab.id ? 'text-teal-500 translate-x-0.5' : 'text-slate-300'}`} />
                                    </button>
                                ))}
                                <div className="border-t border-slate-200/80">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 text-rose-600 hover:bg-rose-50 transition-all font-medium text-sm"
                                    >
                                        <LogOut className="w-[18px] h-[18px]" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </nav>
                        </aside>
                    </FadeContent>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-6">
                        {/* Account Settings */}
                        {activeTab === 'account' && (
                            <FadeContent blur duration={500}>
                                <SpotlightCard className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-6 shadow-sm" spotlightColor="rgba(20, 184, 166, 0.08)">
                                    <div className="flex items-center gap-2.5 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                            <UserCheck className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900">Account Settings</h2>
                                    </div>
                                    <div className="space-y-1">
                                        <SettingInput label="Display Name" description="Your public profile name" value={accountSettings.displayName} onChange={e => handleAccountChange('displayName', e.target.value)} />
                                        <SettingInput label="Email Address" type="email" description="Your primary email address" value={accountSettings.email} onChange={e => handleAccountChange('email', e.target.value)} />
                                        <SettingInput label="Phone Number" type="tel" description="Optional phone number" value={accountSettings.phoneNumber} onChange={e => handleAccountChange('phoneNumber', e.target.value)} />
                                        <div className="p-4 hover:bg-slate-50/50 transition-colors rounded-lg">
                                            <p className="font-semibold text-slate-800 text-sm mb-1">Bio</p>
                                            <p className="text-xs text-slate-500 mb-2.5">Tell others about yourself</p>
                                            <textarea
                                                value={accountSettings.bio}
                                                onChange={e => handleAccountChange('bio', e.target.value)}
                                                rows={4}
                                                placeholder="Share your professional background, interests, or expertise..."
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                                        <SaveButton />
                                    </div>
                                </SpotlightCard>
                            </FadeContent>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <FadeContent blur duration={500}>
                                <SpotlightCard className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm" spotlightColor="rgba(20, 184, 166, 0.08)">
                                    <div className="p-6 border-b border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                                <Bell className="w-4 h-4 text-teal-600" />
                                            </div>
                                            <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <SettingToggle label="Email Notifications" description="Receive updates via email" value={notificationSettings.emailNotifications} onChange={() => handleNotificationChange('emailNotifications')} />
                                        <SettingToggle label="Push Notifications" description="Get browser and mobile push alerts" value={notificationSettings.pushNotifications} onChange={() => handleNotificationChange('pushNotifications')} />
                                        <SettingToggle label="New Post Notifications" description="Alerts when followed users post" value={notificationSettings.newPostNotifications} onChange={() => handleNotificationChange('newPostNotifications')} />
                                        <SettingToggle label="Connection Requests" description="Notify me about new connection requests" value={notificationSettings.connectionRequests} onChange={() => handleNotificationChange('connectionRequests')} />
                                        <SettingToggle label="Messages" description="Alerts for new messages" value={notificationSettings.messages} onChange={() => handleNotificationChange('messages')} />
                                        <SettingToggle label="Weekly Digest" description="Summary of network activity" value={notificationSettings.weeklyDigest} onChange={() => handleNotificationChange('weeklyDigest')} />
                                    </div>
                                    <div className="p-6 border-t border-slate-100 flex gap-3">
                                        <SaveButton />
                                    </div>
                                </SpotlightCard>
                            </FadeContent>
                        )}

                        {/* Privacy Settings */}
                        {activeTab === 'privacy' && (
                            <FadeContent blur duration={500}>
                                <SpotlightCard className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm" spotlightColor="rgba(20, 184, 166, 0.08)">
                                    <div className="p-6 border-b border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                                <Lock className="w-4 h-4 text-teal-600" />
                                            </div>
                                            <h2 className="text-lg font-bold text-slate-900">Privacy & Security</h2>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <SettingSelect label="Profile Visibility" description="Who can see your profile?" value={privacySettings.profileVisibility} options={[
                                            { value: 'public', label: 'Public - Everyone' },
                                            { value: 'connections', label: 'Connections Only' },
                                            { value: 'private', label: 'Private - No one' },
                                        ]} onChange={e => handlePrivacyChange('profileVisibility', e.target.value)} />
                                        <SettingSelect label="Allow Messages" description="Who can message you?" value={privacySettings.allowMessages} options={[
                                            { value: 'everyone', label: 'Everyone' },
                                            { value: 'connections', label: 'Connections Only' },
                                            { value: 'none', label: 'No one' },
                                        ]} onChange={e => handlePrivacyChange('allowMessages', e.target.value)} />
                                        <SettingToggle label="Show Activity Status" description="Let others see when you're online" value={privacySettings.showActivity} onChange={() => handlePrivacyChange('showActivity', !privacySettings.showActivity)} />
                                        <SettingToggle label="Search Engine Indexing" description="Allow search engines to index your profile" value={privacySettings.searchEngineIndex} onChange={() => handlePrivacyChange('searchEngineIndex', !privacySettings.searchEngineIndex)} />
                                    </div>
                                    <div className="p-6 border-t border-slate-100">
                                        <div className="mb-4 p-4 bg-teal-50/60 border border-teal-200/60 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Shield className="w-4 h-4 text-teal-600" />
                                                <p className="text-sm text-teal-900 font-semibold">Two-Factor Authentication</p>
                                            </div>
                                            <p className="text-xs text-teal-700 mb-3 pl-6">Add an extra layer of security to your account</p>
                                            <button className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all ml-6 shadow-sm">
                                                Enable 2FA
                                            </button>
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <SaveButton />
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </FadeContent>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === 'appearance' && (
                            <FadeContent blur duration={500}>
                                <SpotlightCard className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm" spotlightColor="rgba(20, 184, 166, 0.08)">
                                    <div className="p-6 border-b border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                                <Palette className="w-4 h-4 text-teal-600" />
                                            </div>
                                            <h2 className="text-lg font-bold text-slate-900">Appearance</h2>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <SettingSelect label="Theme" description="Choose your preferred theme" value={appearanceSettings.theme} options={[
                                            { value: 'light', label: 'Light' },
                                            { value: 'dark', label: 'Dark' },
                                            { value: 'auto', label: 'System Default' },
                                        ]} onChange={e => handleAppearanceChange('theme', e.target.value)} />
                                        <SettingSelect label="Font Size" description="Adjust text size throughout the app" value={appearanceSettings.fontSize} options={[
                                            { value: 'small', label: 'Small' },
                                            { value: 'medium', label: 'Medium (Default)' },
                                            { value: 'large', label: 'Large' },
                                        ]} onChange={e => handleAppearanceChange('fontSize', e.target.value)} />
                                        <SettingToggle label="Compact Mode" description="Reduce spacing and padding in the interface" value={appearanceSettings.compactMode} onChange={() => handleAppearanceChange('compactMode', !appearanceSettings.compactMode)} />
                                    </div>
                                    <div className="p-6 border-t border-slate-100 flex gap-3">
                                        <SaveButton />
                                    </div>
                                </SpotlightCard>
                            </FadeContent>
                        )}
                    </main>
                </div>

                {/* Additional Options */}
                <FadeContent blur duration={800} delay={200}>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SpotlightCard className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-6 shadow-sm" spotlightColor="rgba(20, 184, 166, 0.08)">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                    <Download className="w-4 h-4 text-teal-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Download Your Data</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 pl-[42px]">Request a copy of your personal data in a portable format</p>
                            <button className="ml-[42px] px-4 py-2 border border-teal-300 text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-all text-sm">
                                Request Export
                            </button>
                        </SpotlightCard>

                        <SpotlightCard className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-6 shadow-sm" spotlightColor="rgba(244, 63, 94, 0.08)">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Delete Account</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 pl-[42px]">Permanently delete your account and all associated data</p>
                            <button className="ml-[42px] px-4 py-2 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-all text-sm shadow-sm">
                                Delete Account
                            </button>
                        </SpotlightCard>
                    </div>
                </FadeContent>
            </div>
        </div>
    );
};

export default Settings;

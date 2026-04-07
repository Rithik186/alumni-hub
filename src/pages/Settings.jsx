import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Bell, Lock, Palette,
    LogOut, ChevronRight, Save, X, Check, Loader2,
    Shield, Trash2, Edit3, Eye, EyeOff, Moon, Sun,
    Monitor, ArrowLeft, User, MessageSquare, Users,
    Heart, Mail, Smartphone, Globe, Search, Zap
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, logout } = useUser();
    const { updateTheme, updateFontSize, updateCompact } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('notifications');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Settings state - synced with database
    const [settings, setSettings] = useState({
        notifications_email: true,
        notifications_push: true,
        notifications_posts: true,
        notifications_connections: true,
        notifications_messages: true,
        notifications_digest: true,
        privacy_visibility: 'public',
        privacy_messages: 'everyone',
        privacy_activity: true,
        privacy_search_index: true,
        appearance_theme: 'light',
        appearance_font_size: 'medium',
        appearance_compact: false,
    });

    // Load settings from database on mount
    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchSettings();
    }, [user]);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/api/settings', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSettings({
                notifications_email: data.notifications_email ?? true,
                notifications_push: data.notifications_push ?? true,
                notifications_posts: data.notifications_posts ?? true,
                notifications_connections: data.notifications_connections ?? true,
                notifications_messages: data.notifications_messages ?? true,
                notifications_digest: data.notifications_digest ?? true,
                privacy_visibility: data.privacy_visibility || 'public',
                privacy_messages: data.privacy_messages || 'everyone',
                privacy_activity: data.privacy_activity ?? true,
                privacy_search_index: data.privacy_search_index ?? true,
                appearance_theme: data.appearance_theme || 'light',
                appearance_font_size: data.appearance_font_size || 'medium',
                appearance_compact: data.appearance_compact ?? false,
            });
        } catch (err) {
            console.error('Failed to load settings:', err);
            if (err.response) {
                console.error('Server error data:', err.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await axios.put('/api/settings', settings, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setHasChanges(false);
            toast.success('Settings saved successfully');
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Auto-save when toggling any setting (instant feedback)
    const toggleAndSave = async (key) => {
        const newValue = !settings[key];
        const newSettings = { ...settings, [key]: newValue };
        setSettings(newSettings);
        // Apply visual changes immediately for appearance settings
        if (key === 'appearance_compact') updateCompact(newValue);
        try {
            await axios.put('/api/settings', newSettings, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Updated', { duration: 1500 });
        } catch {
            toast.error('Failed to update');
            setSettings(prev => ({ ...prev, [key]: !newValue })); // revert
            if (key === 'appearance_compact') updateCompact(!newValue);
        }
    };

    const selectAndSave = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        // Apply visual changes immediately for appearance settings
        if (key === 'appearance_theme') updateTheme(value);
        if (key === 'appearance_font_size') updateFontSize(value);
        try {
            await axios.put('/api/settings', newSettings, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Updated', { duration: 1500 });
        } catch {
            toast.error('Failed to update');
        }
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await logout();
            navigate('/login');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to PERMANENTLY delete your account? This cannot be undone.'
        );
        if (!confirmed) return;
        const doubleConfirm = window.confirm(
            'This will delete ALL your data including posts, connections, and messages. Continue?'
        );
        if (!doubleConfirm) return;

        try {
            await axios.delete('/api/settings/account', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Account deleted');
            await logout();
            navigate('/');
        } catch {
            toast.error('Failed to delete account');
        }
    };

    // Reusable Toggle Component
    const Toggle = ({ label, description, value, onToggle, icon: Icon }) => (
        <div className="flex items-center justify-between py-4 px-1 group">
            <div className="flex items-start gap-3 flex-1 mr-4">
                {Icon && (
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                )}
                <div>
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    {description && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>}
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                    value ? 'bg-indigo-500' : 'bg-slate-200'
                }`}
            >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                    value ? 'left-[26px]' : 'left-1'
                }`} />
            </button>
        </div>
    );

    // Reusable Select Component
    const SelectOption = ({ label, description, value, options, onChange, icon: Icon }) => (
        <div className="py-4 px-1 group">
            <div className="flex items-start gap-3 mb-3">
                {Icon && (
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                )}
                <div>
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
                </div>
            </div>
            <div className={`grid grid-cols-${options.length} gap-2 ${Icon ? 'ml-12' : ''}`}>
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                            value === opt.value
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                    >
                        {opt.icon && <opt.icon className="w-3.5 h-3.5 mx-auto mb-1" />}
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    const tabItems = [
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email, push & alerts' },
        { id: 'privacy', label: 'Privacy & Security', icon: Lock, desc: 'Visibility & messaging' },
        { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & display' },
    ];

    if (loading) return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex items-center justify-center pt-40">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50">

            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
                            <p className="text-sm text-slate-400 mt-0.5">Manage your preferences and privacy</p>
                        </div>
                    </div>
                    <Link
                        to="/profile/edit"
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                    >
                        <Edit3 className="w-4 h-4" /> Edit Profile
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm sticky top-24">
                            <nav className="p-2">
                                {tabItems.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-0.5 ${
                                            activeTab === tab.id
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                        }`}
                                    >
                                        <tab.icon className={`w-[18px] h-[18px] flex-shrink-0 ${
                                            activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'
                                        }`} />
                                        <div className="text-left flex-1 min-w-0">
                                            <p className={`text-sm truncate ${activeTab === tab.id ? 'font-bold' : 'font-medium'}`}>{tab.label}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{tab.desc}</p>
                                        </div>
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                                            activeTab === tab.id ? 'text-indigo-500 translate-x-0.5' : 'text-slate-300'
                                        }`} />
                                    </button>
                                ))}
                            </nav>

                            <div className="border-t border-slate-100 p-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-sm font-medium"
                                >
                                    <LogOut className="w-[18px] h-[18px]" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-6">

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Bell className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                                            <p className="text-xs text-slate-400">Choose what alerts you want to receive</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 divide-y divide-slate-100">
                                    <Toggle
                                        icon={Mail}
                                        label="Email Notifications"
                                        description="Receive updates and alerts via your email address"
                                        value={settings.notifications_email}
                                        onToggle={() => toggleAndSave('notifications_email')}
                                    />
                                    <Toggle
                                        icon={Smartphone}
                                        label="Push Notifications"
                                        description="Get browser and mobile push alerts"
                                        value={settings.notifications_push}
                                        onToggle={() => toggleAndSave('notifications_push')}
                                    />
                                    <Toggle
                                        icon={Heart}
                                        label="Post Activity"
                                        description="Get notified when someone likes or comments on your posts"
                                        value={settings.notifications_posts}
                                        onToggle={() => toggleAndSave('notifications_posts')}
                                    />
                                    <Toggle
                                        icon={Users}
                                        label="Connection Requests"
                                        description="Get notified about new connection requests"
                                        value={settings.notifications_connections}
                                        onToggle={() => toggleAndSave('notifications_connections')}
                                    />
                                    <Toggle
                                        icon={MessageSquare}
                                        label="Messages"
                                        description="Receive alerts when you get new messages"
                                        value={settings.notifications_messages}
                                        onToggle={() => toggleAndSave('notifications_messages')}
                                    />
                                    <Toggle
                                        icon={Zap}
                                        label="Weekly Digest"
                                        description="Get a weekly summary of your network activity"
                                        value={settings.notifications_digest}
                                        onToggle={() => toggleAndSave('notifications_digest')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                <Lock className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-900">Privacy & Security</h2>
                                                <p className="text-xs text-slate-400">Control who can see your profile and send you messages</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 divide-y divide-slate-100">
                                        <SelectOption
                                            icon={Eye}
                                            label="Profile Visibility"
                                            description="Who can view your profile?"
                                            value={settings.privacy_visibility}
                                            options={[
                                                { value: 'public', label: 'Everyone' },
                                                { value: 'connections', label: 'Connections Only' },
                                                { value: 'private', label: 'Private' },
                                            ]}
                                            onChange={(val) => selectAndSave('privacy_visibility', val)}
                                        />
                                        <SelectOption
                                            icon={MessageSquare}
                                            label="Allow Messages From"
                                            description="Who can send you direct messages?"
                                            value={settings.privacy_messages}
                                            options={[
                                                { value: 'everyone', label: 'Everyone' },
                                                { value: 'connections', label: 'Connections Only' },
                                                { value: 'none', label: 'No one' },
                                            ]}
                                            onChange={(val) => selectAndSave('privacy_messages', val)}
                                        />
                                        <Toggle
                                            icon={Globe}
                                            label="Show Activity Status"
                                            description="Let others see when you're online"
                                            value={settings.privacy_activity}
                                            onToggle={() => toggleAndSave('privacy_activity')}
                                        />
                                        <Toggle
                                            icon={Search}
                                            label="Search Engine Indexing"
                                            description="Allow search engines to find your profile"
                                            value={settings.privacy_search_index}
                                            onToggle={() => toggleAndSave('privacy_search_index')}
                                        />
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-rose-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                                <Trash2 className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-rose-700">Danger Zone</h2>
                                                <p className="text-xs text-rose-400">Irreversible actions</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm text-slate-600 mb-4">
                                            Deleting your account will permanently remove all your data, posts, connections, and messages. This action <strong>cannot be undone</strong>.
                                        </p>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="px-5 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-all shadow-sm"
                                        >
                                            Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Palette className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Appearance</h2>
                                            <p className="text-xs text-slate-400">Customize how the app looks for you</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 divide-y divide-slate-100">
                                    {/* Theme Selection */}
                                    <div className="py-6">
                                        <p className="text-sm font-semibold text-slate-800 mb-1">Theme</p>
                                        <p className="text-xs text-slate-400 mb-4">Choose your preferred color scheme</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { value: 'light', label: 'Light', icon: Sun, bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-900' },
                                                { value: 'dark', label: 'Dark', icon: Moon, bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-white' },
                                                { value: 'auto', label: 'System', icon: Monitor, bg: 'bg-gradient-to-r from-white to-slate-900', border: 'border-slate-300', text: 'text-slate-600' },
                                            ].map(theme => (
                                                <button
                                                    key={theme.value}
                                                    onClick={() => selectAndSave('appearance_theme', theme.value)}
                                                    className={`rounded-2xl border-2 p-4 transition-all text-center ${
                                                        settings.appearance_theme === theme.value
                                                            ? 'border-indigo-500 shadow-md shadow-indigo-100'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className={`w-12 h-8 ${theme.bg} ${theme.border} border rounded-lg mx-auto mb-3`} />
                                                    <theme.icon className={`w-4 h-4 mx-auto mb-1.5 ${
                                                        settings.appearance_theme === theme.value ? 'text-indigo-600' : 'text-slate-400'
                                                    }`} />
                                                    <p className={`text-xs font-semibold ${
                                                        settings.appearance_theme === theme.value ? 'text-indigo-600' : 'text-slate-500'
                                                    }`}>{theme.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Font Size */}
                                    <div className="py-6">
                                        <p className="text-sm font-semibold text-slate-800 mb-1">Font Size</p>
                                        <p className="text-xs text-slate-400 mb-4">Adjust text size throughout the app</p>
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-2 border border-slate-100">
                                            {[
                                                { value: 'small', label: 'Small', size: 'text-xs' },
                                                { value: 'medium', label: 'Medium', size: 'text-sm' },
                                                { value: 'large', label: 'Large', size: 'text-base' },
                                            ].map(fs => (
                                                <button
                                                    key={fs.value}
                                                    onClick={() => selectAndSave('appearance_font_size', fs.value)}
                                                    className={`flex-1 py-2.5 rounded-xl ${fs.size} font-semibold transition-all ${
                                                        settings.appearance_font_size === fs.value
                                                            ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                                                            : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                                >
                                                    {fs.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Compact Mode */}
                                    <Toggle
                                        label="Compact Mode"
                                        description="Reduce spacing and padding for a denser interface"
                                        value={settings.appearance_compact}
                                        onToggle={() => toggleAndSave('appearance_compact')}
                                    />
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </main>
        </div>
    );
};

export default Settings;

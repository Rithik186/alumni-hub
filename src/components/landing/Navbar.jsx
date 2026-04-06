import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    User, LogOut, LayoutDashboard,
    Settings, Bell, Zap, ChevronDown,
    Activity, Menu, X
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

export const Navbar = () => {
    const { user, logout } = useUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        if (isProfileOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isProfileOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Directory', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[150] h-14 bg-white border-b border-slate-200 shadow-sm">
                <div className="w-full h-full px-4 lg:px-5 flex items-center justify-between">
                    {/* Logo — icon only, no text */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors shadow-sm">
                            <Zap className="w-4.5 h-4.5 fill-current" />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Nav Links */}
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                                        location.pathname === link.path
                                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <link.icon className={`w-3.5 h-3.5 ${location.pathname === link.path ? 'text-indigo-500' : ''}`} />
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(p => !p)}
                                    className="flex items-center gap-2.5 py-1 pl-1 pr-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all group"
                                >
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-800 text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden bg-cover bg-center"
                                        style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}
                                    >
                                        {!user.profile_picture && user.name?.charAt(0)}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-[11px] font-semibold text-slate-900 leading-none">{user.name?.split(' ')[0]}</p>
                                        <p className="text-[9px] font-medium text-slate-400 capitalize mt-0.5">{user.role}</p>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown — no animation, instant show/hide */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-slate-100 mb-1">
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Signed in as</p>
                                            <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{user.email}</p>
                                        </div>
                                        <div className="px-1.5 space-y-0.5">
                                            <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                                                <User className="w-4 h-4 text-slate-400" /> My Profile
                                            </button>
                                            <button onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                                                <Activity className="w-4 h-4 text-slate-400" /> Dashboard
                                            </button>
                                            <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                                                <Settings className="w-4 h-4 text-slate-400" /> Settings
                                            </button>
                                        </div>
                                        <div className="mt-1 pt-1 border-t border-slate-100 px-1.5">
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                                                <LogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
                                Launch Hub <Zap className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(v => !v)}
                        className="md:hidden p-2 bg-slate-100 rounded-lg text-slate-700"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu — instant, no animation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 shadow-sm">
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    <link.icon className="w-4 h-4 text-slate-400" />
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-2 mt-2 border-t border-slate-100">
                                {user ? (
                                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-all w-full">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                ) : (
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-all">
                                        <Zap className="w-4 h-4" /> Launch Hub
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer so content isn't hidden behind fixed navbar */}
            <div className="h-14" />
        </>
    );
};

export default Navbar;

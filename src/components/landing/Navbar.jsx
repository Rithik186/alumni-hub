import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, User, LogOut, LayoutDashboard,
    Settings, Bell, Zap, ChevronDown,
    ShieldCheck, Star, Activity
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

export const Navbar = () => {
    const { user, logout } = useUser();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Directory', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[150] transition-all duration-700 ${isScrolled
            ? 'py-4 bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border-b border-slate-100'
            : 'py-8 bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="group flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-[18px] flex items-center justify-center text-white group-hover:bg-blue-600 transition-all duration-500 shadow-xl shadow-slate-200 group-hover:shadow-blue-100 group-hover:rotate-12">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-[900] tracking-tighter text-slate-900 leading-none">ALUMNI</span>
                            <span className="text-[10px] font-black tracking-[0.3em] text-blue-600 leading-none mt-1">HUB</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${location.pathname === link.path
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    <link.icon className={`w-3.5 h-3.5 ${location.pathname === link.path ? 'text-blue-600' : ''}`} />
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 p-1.5 pr-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-300 group shadow-sm active:scale-95"
                                >
                                    <div className="w-10 h-10 bg-slate-100 rounded-[14px] flex items-center justify-center text-slate-900 font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{user.name.split(' ')[0]}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-0"
                                                onClick={() => setIsProfileOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                                className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 py-4 z-10 overflow-hidden"
                                            >
                                                <div className="px-8 py-6 border-b border-slate-50 mb-4 bg-slate-50/50">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
                                                    <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                                                </div>
                                                <div className="px-4 space-y-1">
                                                    <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                                                        <User className="w-4 h-4 text-slate-400 group-hover:text-blue-600" /> My Profile
                                                    </button>
                                                    <button onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                                                        <Activity className="w-4 h-4 text-slate-400 group-hover:text-blue-600" /> Realtime Feed
                                                    </button>
                                                    <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                                                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-blue-600" /> Account Nodes
                                                    </button>
                                                </div>
                                                <div className="mt-4 px-4 pt-4 border-t border-slate-50">
                                                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-5 rounded-[22px] text-xs font-black text-red-500 hover:bg-red-50 transition-all">
                                                        <LogOut className="w-4 h-4" /> Terminate Session
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/login" className="btn-accent px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-blue-100">
                                Launch Hub <Activity className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-3 bg-slate-100 rounded-2xl text-slate-900"
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 py-10 space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-6 text-lg font-black text-slate-900 uppercase tracking-tighter"
                                >
                                    <link.icon className="w-6 h-6 text-blue-600" />
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-6 border-t border-slate-100">
                                {user ? (
                                    <button onClick={handleLogout} className="flex items-center gap-6 text-lg font-black text-red-500 uppercase tracking-tighter">
                                        <LogOut className="w-6 h-6" /> Terminate Session
                                    </button>
                                ) : (
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-6 text-lg font-black text-blue-600 uppercase tracking-tighter">
                                        <Zap className="w-6 h-6" /> Launch Hub
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

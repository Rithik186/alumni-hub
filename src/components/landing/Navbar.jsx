import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket, GraduationCap, Briefcase, ChevronRight, User, LogOut, LayoutDashboard } from "lucide-react";
import { useUser } from "../../context/UserContext";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileCard, setShowProfileCard] = useState(false);
    const { user, logout } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
                ? "bg-white/80 backdrop-blur-md shadow-md py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link
                    to="/"
                    className="text-2xl font-black flex items-center gap-2 text-slate-900 group"
                >
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary-200">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">AlumniHub</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    {['Mentorship', 'Jobs', 'Events'].map((item, index) => (
                        <Link
                            key={item}
                            to={`/#${item.toLowerCase().replace(' ', '-')}`}
                            className="text-slate-600 hover:text-primary-600 font-medium transition-colors"
                        >
                            {item}
                        </Link>
                    ))}

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileCard(!showProfileCard)}
                                className="flex items-center gap-3 text-slate-700 hover:text-primary-600 font-black px-4 py-2 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-100 transition-all focus:ring-4 focus:ring-primary-500/10"
                            >
                                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-[10px] uppercase tracking-widest hidden sm:block">{user.name.split(' ')[0]}</span>
                            </button>

                            {/* Profile Dropdown/Card */}
                            <AnimatePresence>
                                {showProfileCard && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                                    >
                                        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center text-xl font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{user.name}</h4>
                                                    <p className="text-blue-100 text-xs capitalize">{user.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all group">
                                                <User className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                                                <span className="font-medium">My Profile</span>
                                            </Link>
                                            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all group">
                                                <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                                                <span className="font-medium">Dashboard</span>
                                            </Link>
                                            <div className="h-px bg-slate-100 my-2 mx-4" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                                            >
                                                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
                                                <span className="font-medium">Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-6 py-2 bg-primary-600 text-white rounded-full font-semibold shadow-lg hover:shadow-primary-500/50 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5"
                        >
                            Login / Join
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-700 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100 py-4 px-6 flex flex-col space-y-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {user ? (
                            <>
                                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{user.name}</h4>
                                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-slate-600 font-medium px-2 py-1">
                                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                                </Link>
                                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-slate-600 font-medium px-2 py-1">
                                    <User className="w-5 h-5" /> My Profile
                                </Link>
                                <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 font-medium px-2 py-1">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold text-center shadow-lg"
                            >
                                Login / Join
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

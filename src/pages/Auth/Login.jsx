import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Chrome, CheckCircle2, ShieldCheck, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { login as loginService } from '../../services/authService';
import { useUser } from '../../context/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useUser();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await loginService(formData);
            if (data.token) {
                login(data);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white overflow-hidden">
            {/* Left Side: Visual/Branding */}
            <div className="hidden lg:flex relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -ml-48 -mb-48"></div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <Link to="/" className="inline-flex items-center gap-2 text-white mb-8 group">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">AlumniHub</span>
                        </Link>
                        <h1 className="text-5xl font-black text-white leading-tight mb-6">
                            Reconnect with your <span className="text-primary-500">Legacy.</span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Join thousands of alumni and students in the most active campus network.
                            Unlock mentorship, job referrals, and life-long connections.
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {[
                            { icon: CheckCircle2, text: "Verified Professional Network", color: "text-emerald-400" },
                            { icon: ShieldCheck, text: "Secure Campus Credentials", color: "text-blue-400" },
                            { icon: ArrowRight, text: "Exclusive Alumni Benefits", color: "text-primary-400" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="flex items-center gap-4 text-slate-300"
                            >
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="font-medium text-slate-200">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-16 pt-12 border-t border-slate-800/50 flex items-center gap-6"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800"></div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Joined by over 12k+ alumni this month
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex items-center justify-center p-8 lg:p-24 bg-white">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center lg:text-left mb-10"
                    >
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Login to your account</h2>
                        <p className="text-slate-500 font-medium">Welcome back! Please enter your details.</p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-semibold border border-red-100 flex items-center gap-3"
                        >
                            <div className="w-1.5 h-8 bg-red-500 rounded-full"></div>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5 focus-within:text-primary-600 transition-colors">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="name@college.edu"
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-primary-600 transition-colors">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-bold text-slate-700">Password</label>
                                    <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500" />
                            <label htmlFor="remember" className="text-sm font-semibold text-slate-600">Keep me logged in</label>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 hover:shadow-slate-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>



                    <p className="mt-12 text-center text-slate-500 font-medium">
                        New to the platform? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold underline underline-offset-4 decoration-2">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

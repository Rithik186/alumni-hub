import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Lock, School,
    Briefcase, GraduationCap, ArrowRight,
    CheckCircle2, Smartphone, ShieldCheck,
    Building, BookOpen, Fingerprint, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { register, verifyOtp as verifyOtpService } from '../../services/authService';
import { useUser } from '../../context/UserContext';
import { tamilNaduColleges, engineeringDepartments, collegeSpecificDepartments } from '../../data/colleges';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useUser();
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        name: '', email: '', phone_number: '', password: '', college: '',
        department: '', register_number: '', batch: '', // student specific
        company: '', job_role: '' // alumni specific
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'bg-slate-200' });
    const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
    const [showDeptSuggestions, setShowDeptSuggestions] = useState(false);

    const collegeSuggestions = React.useMemo(() => {
        if (!formData.college) return [];
        return tamilNaduColleges.filter(c => 
            c.toLowerCase().includes(formData.college.toLowerCase())
        ).slice(0, 8);
    }, [formData.college]);

    const deptSuggestions = React.useMemo(() => {
        if (!formData.department) return [];
        const collegeName = (formData.college || '').trim().toLowerCase();
        const specificListKey = Object.keys(collegeSpecificDepartments).find(k => k.toLowerCase() === collegeName);
        const baseList = specificListKey ? collegeSpecificDepartments[specificListKey] : engineeringDepartments;
        return baseList.filter(d => 
            d.toLowerCase().includes(formData.department.toLowerCase())
        ).slice(0, 8);
    }, [formData.department, formData.college]);

    const checkStrength = (pass) => {
        let score = 0;
        if (pass.length > 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        const levels = [
            { label: 'Very Weak', color: 'bg-red-500' },
            { label: 'Weak', color: 'bg-orange-500' },
            { label: 'Medium', color: 'bg-yellow-500' },
            { label: 'Strong', color: 'bg-emerald-500' },
            { label: 'Exceptional', color: 'bg-primary-500' }
        ];
        setStrength({ score, ...levels[score] });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') checkStrength(value);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        setLoading(true);
        setError('');
        try {
            const data = await register({ ...formData, role });
            if (data.otp_sent) {
                setStep(2);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await verifyOtpService({ email: formData.email, otp_code: otp });
            if (data.token) {
                login(data);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-sm";

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white overflow-hidden">
            {/* Left Side: Branding */}
            <div className="hidden lg:flex relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -ml-48 -mb-48"></div>
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
                            <span className="text-2xl font-bold tracking-tight">Alumned In</span>
                        </Link>
                        <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                            Build your <span className="text-primary-500">Future</span> with the best.
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Join the most exclusive network of professionals and students.
                            Verified identities, serious connections, real growth.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: ShieldCheck, title: "Verified", desc: "Identity security" },
                            { icon: Fingerprint, title: "Secure", desc: "Data privacy" },
                            { icon: Building, title: "Industry", desc: "Top companies" },
                            { icon: BookOpen, title: "Academic", desc: "Core network" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35 + (i * 0.1) }}
                                className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md"
                            >
                                <item.icon className="w-6 h-6 text-primary-400 mb-3" />
                                <h4 className="text-white font-bold text-sm tracking-tight">{item.title}</h4>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 bg-white overflow-y-auto">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">
                            {step === 1 ? 'Create Account' : 'Security Check'}
                        </h2>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                            {step === 1 ? 'Start your professional journey today' : 'Please verify your email address'}
                        </p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-3"
                        >
                            <div className="w-1.5 h-8 bg-red-500 rounded-full"></div>
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-6 shadow-inner border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setRole('student')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'student' ? 'bg-white text-primary-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('alumni')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'alumni' ? 'bg-white text-primary-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Alumni
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                        <input name="name" placeholder="Full Name" onChange={handleChange} required className={inputClasses} />
                                    </div>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                        <input name="email" type="email" placeholder="Email" onChange={handleChange} required className={inputClasses} />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input name="phone_number" placeholder="10-digit Mobile" onChange={handleChange} required className={inputClasses} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create Password"
                                                onChange={handleChange}
                                                required
                                                className={inputClasses + " pr-12"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                onChange={handleChange}
                                                required
                                                className={inputClasses + " pr-12"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password Strength Card */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${strength.color.replace('bg-', 'text-').replace('500', '600')} ${strength.color.replace('bg-', 'bg-')}/10`}>
                                                {strength.label}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                                            {[1, 2, 3, 4].map((step) => (
                                                <div
                                                    key={step}
                                                    className={`h-full flex-1 transition-all duration-500 ${step <= strength.score ? strength.color : 'bg-slate-200'}`}
                                                ></div>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-slate-400 mt-3 font-medium leading-tight">
                                            Use 8+ characters with a mix of letters, numbers & symbols for elite security.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional / Academic Profile</h4>

                                    {role === 'student' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 relative">
                                                <input 
                                                    name="college" 
                                                    placeholder="College Name" 
                                                    value={formData.college}
                                                    onChange={handleChange} 
                                                    onFocus={() => setShowCollegeSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowCollegeSuggestions(false), 200)}
                                                    required 
                                                    className={inputClasses} 
                                                />
                                                <AnimatePresence>
                                                    {showCollegeSuggestions && collegeSuggestions.length > 0 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute z-[300] top-full mt-1.5 w-[150%] sm:w-[180%] left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                                                        >
                                                            <div className="p-2 px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested Institutions</span>
                                                                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                                            </div>
                                                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                                {collegeSuggestions.map((college, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, college });
                                                                            setShowCollegeSuggestions(false);
                                                                        }}
                                                                        className="w-full text-left px-5 py-3 text-[12px] text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-3 font-medium"
                                                                    >
                                                                        <GraduationCap className="w-4 h-4 text-slate-300" />
                                                                        <span className="truncate flex-1">{college}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <div className="relative group">
                                                <input 
                                                    name="department" 
                                                    placeholder="Department" 
                                                    value={formData.department}
                                                    onChange={handleChange} 
                                                    onFocus={() => setShowDeptSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowDeptSuggestions(false), 200)}
                                                    required 
                                                    className={inputClasses} 
                                                />
                                                <AnimatePresence>
                                                    {showDeptSuggestions && deptSuggestions.length > 0 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute z-[300] top-full mt-1.5 w-[150%] sm:w-[180%] left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                                                        >
                                                            <div className="p-2 px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested Departments</span>
                                                                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                                            </div>
                                                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                                {deptSuggestions.map((dept, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, department: dept });
                                                                            setShowDeptSuggestions(false);
                                                                        }}
                                                                        className="w-full text-left px-5 py-3 text-[12px] text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-3 font-medium"
                                                                    >
                                                                        <BookOpen className="w-4 h-4 text-slate-300" />
                                                                        <span className="truncate flex-1">{dept}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <input name="batch" placeholder="Batch Year" onChange={handleChange} required className={inputClasses} />
                                            <div className="col-span-2">
                                                <input name="register_number" placeholder="Register Number" onChange={handleChange} required className={inputClasses} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 relative">
                                                <input 
                                                    name="college" 
                                                    placeholder="College Name" 
                                                    value={formData.college}
                                                    onChange={handleChange} 
                                                    onFocus={() => setShowCollegeSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowCollegeSuggestions(false), 200)}
                                                    required 
                                                    className={inputClasses} 
                                                />
                                                <AnimatePresence>
                                                    {showCollegeSuggestions && collegeSuggestions.length > 0 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute z-[300] top-full mt-1.5 w-[150%] sm:w-[180%] left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                                                        >
                                                            <div className="p-2 px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested Institutions</span>
                                                                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                                            </div>
                                                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                                {collegeSuggestions.map((college, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, college });
                                                                            setShowCollegeSuggestions(false);
                                                                        }}
                                                                        className="w-full text-left px-5 py-3 text-[12px] text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-3 font-medium"
                                                                    >
                                                                        <GraduationCap className="w-4 h-4 text-slate-300" />
                                                                        <span className="truncate flex-1">{college}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <input name="company" placeholder="Current Company" onChange={handleChange} required className={inputClasses} />
                                            <input name="job_role" placeholder="Designation" onChange={handleChange} required className={inputClasses} />
                                            <div className="relative group">
                                                <input 
                                                    name="department" 
                                                    placeholder="Branch / Department" 
                                                    value={formData.department}
                                                    onChange={handleChange} 
                                                    onFocus={() => setShowDeptSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowDeptSuggestions(false), 200)}
                                                    required 
                                                    className={inputClasses} 
                                                />
                                                <AnimatePresence>
                                                    {showDeptSuggestions && deptSuggestions.length > 0 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute z-[300] top-full mt-1.5 w-[150%] sm:w-[180%] left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                                                        >
                                                            <div className="p-2 px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested Departments</span>
                                                                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                                            </div>
                                                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                                                {deptSuggestions.map((dept, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, department: dept });
                                                                            setShowDeptSuggestions(false);
                                                                        }}
                                                                        className="w-full text-left px-5 py-3 text-[12px] text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-3 font-medium"
                                                                    >
                                                                        <BookOpen className="w-4 h-4 text-slate-300" />
                                                                        <span className="truncate flex-1">{dept}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <input name="batch" placeholder="Alumni Batch" onChange={handleChange} required className={inputClasses} />
                                        </div>
                                    )}
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                >
                                    {loading ? 'Initializing...' : 'Verify Identity'} <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handleVerify}
                                className="space-y-8 py-4"
                            >
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <p className="text-slate-500 font-bold">Verification code sent to email</p>
                                    <p className="text-lg font-black text-slate-800">{formData.email}</p>
                                </div>

                                <input
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full p-6 text-center text-4xl tracking-[0.5em] font-black border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-inner bg-slate-50"
                                />

                                <div className="space-y-3 pt-4">
                                    <button
                                        disabled={loading}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 px-4 rounded-[2rem] transition-all shadow-xl shadow-primary-200 active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                                    >
                                        {loading ? 'Authenticating...' : 'Confirm & Join'}
                                    </button>
                                    <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-primary-600 transition-colors">Wrong details? Fix it</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-12 text-center">
                        <p className="text-slate-500 font-bold text-sm">
                            Already part of the network? <Link to="/login" className="text-primary-600 hover:underline decoration-2 ml-1">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

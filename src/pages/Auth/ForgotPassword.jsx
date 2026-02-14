import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, ArrowRight, KeyRound, CheckCircle2, ShieldCheck, Smartphone, Eye, EyeOff } from 'lucide-react';
import { forgotPassword, resetPassword } from '../../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Choice, 3: Reset Form (Old Pwd / OTP)
    const [method, setMethod] = useState(''); // 'old' or 'otp'
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({ oldPassword: '', otp: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleMethodSelect = async (m) => {
        setMethod(m);
        setError('');
        if (m === 'otp') {
            setLoading(true);
            try {
                const data = await forgotPassword(email);
                if (data.email) {
                    setStep(3);
                } else {
                    setError(data.message || 'Error sending OTP');
                }
            } catch (err) {
                setError('Failed to send OTP. Try again.');
            } finally {
                setLoading(false);
            }
        } else {
            setStep(3);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        setLoading(true);
        setError('');
        try {
            const resetData = {
                email,
                newPassword: formData.newPassword,
                ...(method === 'old' ? { oldPassword: formData.oldPassword } : { otp: formData.otp })
            };
            const data = await resetPassword(resetData);
            if (data.message.includes('successfully')) {
                setSuccess(data.message);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Reset failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 border border-slate-100"
            >
                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                        <KeyRound className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                        {step === 1 && "Forgot Password?"}
                        {step === 2 && "Reset Method"}
                        {step === 3 && (method === 'old' ? "Old Password Reset" : "OTP Reset")}
                        {success && "All Set!"}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {step === 1 && "No worries, it happens. Well get you back into your account."}
                        {step === 2 && "Choose how you would like to reset your credentials."}
                        {step === 3 && (method === 'otp' ? "Enter the 6-digit code sent to your email." : "Enter your last remembered password.")}
                        {success && "Your password has been updated. Redirecting to login..."}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-sm font-semibold border border-red-100 flex items-center gap-3"
                    >
                        <div className="w-1.5 h-8 bg-red-500 rounded-full"></div>
                        {error}
                    </motion.div>
                )}

                <AnimatePresence mode='wait'>
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                            </div>
                            <Link to="/login" className="text-primary-600 font-bold hover:underline">Click here to login now</Link>
                        </motion.div>
                    ) : (
                        <>
                            {step === 1 && (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleEmailSubmit}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Registered Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="name@college.edu"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        Continue <ArrowRight className="w-5 h-5" />
                                    </button>
                                </motion.form>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <button
                                        onClick={() => handleMethodSelect('old')}
                                        className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-primary-500 hover:bg-primary-50 group transition-all text-left flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                                            <ShieldCheck className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Remember Old Password?</h4>
                                            <p className="text-sm text-slate-500">Fastest way if you still recall your last password.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleMethodSelect('otp')}
                                        disabled={loading}
                                        className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-primary-500 hover:bg-primary-50 group transition-all text-left flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                                            <Smartphone className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Send OTP to Email</h4>
                                            <p className="text-sm text-slate-500">We will send a 6-digit verification code to {email}</p>
                                        </div>
                                        {loading && <div className="ml-auto w-5 h-5 border-2 border-primary-600 border-t-transparent animate-spin rounded-full"></div>}
                                    </button>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.form
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onSubmit={handleResetSubmit}
                                    className="space-y-6"
                                >
                                    {method === 'otp' ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Verification Code</label>
                                            <div className="relative group">
                                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength="6"
                                                    placeholder="123456"
                                                    value={formData.otp}
                                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Old Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                                <input
                                                    type={showOldPassword ? "text" : "password"}
                                                    required
                                                    placeholder="••••••••"
                                                    value={formData.oldPassword}
                                                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                                    className={inputClasses + " pr-12"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                                >
                                                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    required
                                                    placeholder="••••••••"
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                    className={inputClasses + " pr-12"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                                            <div className="relative group">
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    required
                                                    placeholder="••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className={inputClasses + " pr-12"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        {loading ? "Updating..." : "Reset Password"} <ArrowRight className="w-5 h-5" />
                                    </button>
                                </motion.form>
                            )}
                        </>
                    )}
                </AnimatePresence>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
                        className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2 mx-auto transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {step === 1 ? "Back to Login" : "Go back"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;

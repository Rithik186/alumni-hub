import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, verifyOtp } from '../../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        name: '', email: '', phone_number: '', password: '', college: 'SJC Institute',
        department: '', register_number: '', batch: '', // student specific
        company: '', job_role: '' // alumni specific
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
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
            const data = await verifyOtp({ phone_number: formData.phone_number, otp_code: otp });
            if (data.token) {
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/');
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
                {step === 1 ? 'Create Account' : 'Verify Mobile'}
            </h2>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100">{error}</div>}

            {step === 1 ? (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('alumni')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${role === 'alumni' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Alumni
                        </button>
                    </div>

                    <div className="space-y-2">
                        <input name="name" placeholder="Full Name" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        <input name="phone_number" placeholder="Phone Number" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        <input name="password" type="password" placeholder="Create Password" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        <input name="college" placeholder="College Name" value={formData.college} onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>

                    {role === 'student' ? (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <input name="department" placeholder="Department (e.g. CSE)" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            <input name="register_number" placeholder="Register Number" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            <input name="batch" placeholder="Batch Year (e.g. 2024)" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                    ) : (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <input name="company" placeholder="Current Company" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            <input name="job_role" placeholder="Designation" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            <input name="department" placeholder="Department during College" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            <input name="batch" placeholder="Passed Out Batch Year" onChange={handleChange} required className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Register & Get OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerify} className="space-y-6">
                    <p className="text-slate-600 text-center">We've sent a 6-digit code to <br /><strong>{formData.phone_number}</strong></p>
                    <input
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full p-4 text-center text-2xl tracking-widest font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify & Log In'}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="w-full text-slate-500 text-sm hover:underline">Change details</button>
                </form>
            )}
        </div>
    );
};

export default Register;

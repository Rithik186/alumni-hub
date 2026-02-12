import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await login(formData);
            if (data.token) {
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Welcome Back
            </h2>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        placeholder="name@college.edu"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <p className="mt-8 text-center text-slate-500 text-sm">
                Don't have an account? {' '}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                    Create one here
                </Link>
            </p>
        </div>
    );
};

export default Login;

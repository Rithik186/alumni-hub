
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserCheck, Briefcase, GraduationCap, Video, Users, CheckCircle } from 'lucide-react';

export const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden pt-20">
            <div className="absolute inset-0 z-0">
                {/* Animated Background Elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-200 rounded-full blur-3xl opacity-50 animate-pulse-slow delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-100/50 rounded-full blur-3xl -z-10"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Official Alumni Network
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Bridge the Gap. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-sky-500 to-indigo-600">
                            Future Connect.
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Your gateway to mentorship, career growth, and lifelong networking. Connect with alumni who have walked the path you are on.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <button className="px-8 py-4 bg-primary-600 text-white rounded-full font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-600/50 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 group">
                            Join as Student <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 hover:border-slate-300">
                            Alumni Login
                        </button>
                    </motion.div>

                    <motion.div
                        className="mt-12 flex items-center gap-4 text-sm text-slate-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                                    {/* Placeholder for user avatars */}
                                    <Users className="w-5 h-5 opacity-50" />
                                </div>
                            ))}
                        </div>
                        <p>Trusted by <span className="font-bold text-slate-800">5000+</span> Alumni & Students</p>
                    </motion.div>
                </motion.div>

                {/* Hero Image/Animation */}
                <motion.div
                    className="relative hidden md:block"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    {/* Abstract Floating Cards */}
                    <div className="relative w-full h-[600px] flex items-center justify-center">
                        {/* Circle Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-50 to-sky-100 rounded-full animate-pulse-slow -z-10 blur-xl opacity-60"></div>

                        {/* Main Image Container */}
                        <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                            <div className="w-80 h-96 bg-gradient-to-br from-slate-100 to-white rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-slate-100 shadow-inner">
                                <GraduationCap className="w-20 h-20 text-primary-500 mb-6 drop-shadow-lg" />
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Build Your Future</h3>
                                <p className="text-slate-500 mb-6">Connect with industry leaders and accelerate your career path.</p>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="w-3/4 h-full bg-primary-500 rounded-full"></div>
                                </div>
                                <div className="mt-2 text-xs text-slate-400 w-full flex justify-between">
                                    <span>Profile Strength</span>
                                    <span>75%</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Feature Cards */}
                        <FloatingCard
                            icon={<Briefcase className="w-5 h-5 text-white" />}
                            title="Job Referrals"
                            subtitle="Get referred by alumni"
                            className="absolute top-20 -left-10 bg-indigo-600 text-white"
                            delay={1.2}
                        />

                        <FloatingCard
                            icon={<Video className="w-5 h-5 text-white" />}
                            title="Mock Interviews"
                            subtitle="Practice with experts"
                            className="absolute bottom-32 -right-5 bg-sky-500 text-white"
                            delay={1.5}
                        />

                        <FloatingCard
                            icon={<UserCheck className="w-5 h-5 text-amber-500" />}
                            title="Mentorship"
                            subtitle="1-on-1 Guidance"
                            className="absolute bottom-10 left-10 bg-white text-slate-800 border-l-4 border-amber-500"
                            delay={1.8}
                        />

                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const FloatingCard = ({ icon, title, subtitle, className, delay }) => {
    return (
        <motion.div
            className={`p-4 rounded-xl shadow-xl flex items-center gap-4 w-64 backdrop-blur-md ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
        >
            <div className={`p-2 rounded-lg bg-white/20`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-sm">{title}</h4>
                <p className="text-xs opacity-80">{subtitle}</p>
            </div>
        </motion.div>
    )
}

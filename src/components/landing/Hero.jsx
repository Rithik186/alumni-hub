import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserCheck, Briefcase, GraduationCap, Video, Users, CheckCircle, Sparkles, Zap, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import ShinyText from '../animations/ShinyText';
import RotatingText from '../animations/RotatingText';
import FadeContent from '../animations/FadeContent';
import SpotlightCard from '../animations/SpotlightCard';

const FloatingCard = ({ icon, title, subtitle, position, delay }) => (
    <motion.div
        className={`absolute ${position} bg-white/40 backdrop-blur-2xl p-3.5 rounded-[1.75rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white/40 flex items-center gap-3.5 z-20 group hover:bg-white/60 transition-colors`}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:rotate-12 transition-transform">
            {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        <div>
            <h4 className="text-[13px] font-black text-slate-800 leading-tight tracking-tight uppercase">{title}</h4>
            <p className="text-[10px] text-slate-500 font-bold">{subtitle}</p>
        </div>
    </motion.div>
);

export const Hero = () => {
    const { user } = useUser();

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center bg-white overflow-hidden pt-20 pb-8">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-sky-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Left Content */}
                    <div className="flex-[1.2] text-center lg:text-left">
                        {user ? (
                            <FadeContent blur duration={600}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-10 p-5 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-[2rem] border border-primary-50 inline-flex items-center gap-4"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Welcome Back, {user.name}!</h2>
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
                                            <ShinyText text="Ready to level up?" speed={3} className="text-primary-600" />
                                        </p>
                                    </div>
                                </motion.div>
                            </FadeContent>
                        ) : (
                            <FadeContent blur duration={600}>
                                <motion.div
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-full shadow-2xl mb-8 group cursor-default"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse"></span>
                                    <span className="text-xs font-black text-white uppercase tracking-[0.2em]">
                                        <ShinyText text="Verified Alumni Network" speed={4} />
                                    </span>
                                </motion.div>
                            </FadeContent>
                        )}

                        <FadeContent blur duration={800} delay={200}>
                            <motion.h1
                                className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] mb-6 tracking-tighter"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                Connect. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                                    <RotatingText
                                        texts={['Mentor.', 'Inspire.', 'Grow.', 'Lead.']}
                                        rotationInterval={2500}
                                        splitBy="characters"
                                        staggerDuration={0.04}
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600"
                                    />
                                </span> <br />
                                Succeed.
                            </motion.h1>
                        </FadeContent>

                        <FadeContent blur duration={800} delay={400}>
                            <motion.p
                                className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                The premium ecosystem for college networks. Join the elite community of alumni and students to bridge the gap between campus and corporate.
                            </motion.p>
                        </FadeContent>

                        <FadeContent blur duration={800} delay={600}>
                            <motion.div
                                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                {user ? (
                                    <Link to="/dashboard" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3 group">
                                        Go to Dashboard <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-[1.5rem] font-black text-base shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_50px_rgba(37,99,235,0.4)] hover:bg-primary-700 transition-all flex items-center justify-center gap-3 group">
                                            Join Network <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                        </Link>
                                        <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-[1.5rem] font-black text-base hover:border-primary-600 transition-all flex items-center justify-center gap-3">
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </motion.div>
                        </FadeContent>

                    </div>

                    {/* Right Visual Element */}
                    <motion.div
                        className="flex-1 relative hidden lg:block h-[600px]"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Main Visual Circle */}
                            <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-primary-50 to-indigo-100 rounded-full animate-pulse-slow border border-white opacity-40"></div>

                            {/* Inner Glass Card — Wrapped in SpotlightCard */}
                            <SpotlightCard
                                className="relative z-10 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.08)] p-6 rounded-[2.5rem] border border-white overflow-hidden group"
                                spotlightColor="rgba(14, 165, 233, 0.12)"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-72 h-[400px] relative z-10 flex flex-col items-center justify-center text-center">
                                    <div className="w-28 h-28 bg-primary-100 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                        <Network className="w-14 h-14 text-primary-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight">Elite Mentorship</h3>
                                    <p className="text-slate-500 font-medium px-4 mb-10 leading-relaxed">
                                        Exclusive access to mock interviews and career pivots shared by established alumni.
                                    </p>

                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-600 w-2/3 rounded-full animate-shimmer"></div>
                                    </div>
                                    <div className="mt-6 flex gap-3">
                                        <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                    </div>
                                </div>
                            </SpotlightCard>

                            {/* Floating Elements */}
                            <FloatingCard
                                icon={<Briefcase className="w-6 h-6" />}
                                title="Job Placements"
                                subtitle="Top-tier Referrals"
                                position="top-0 -left-10"
                                delay={1}
                            />

                            <FloatingCard
                                icon={<Video className="w-6 h-6" />}
                                title="Live AMA Sessions"
                                subtitle="Weekly expert meets"
                                position="bottom-12 -right-4"
                                delay={1.4}
                            />

                            <FloatingCard
                                icon={<Zap className="w-6 h-6" />}
                                title="Real-time Alerts"
                                subtitle="Instant notifications"
                                position="top-1/4 -right-8"
                                delay={1.8}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

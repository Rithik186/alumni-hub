import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Award, Zap, Building, Calendar, ArrowRight, ShieldCheck, Target, Globe } from 'lucide-react';

const icons = {
    Users,
    Briefcase,
    Award,
    Zap,
    Building,
    Calendar,
    Target,
    Globe
};

export const Features = () => {
    const features = [
        {
            title: "Smart Directory",
            description: "Advanced AI-powered filtering for the global alumni network. Connect with industry leaders instantly.",
            icon: "Users",
            color: "from-blue-600 to-indigo-600",
            lightColor: "bg-blue-50"
        },
        {
            title: "Direct Job Access",
            description: "Exclusive referral system where alumni post internal openings not available on public job boards.",
            icon: "Briefcase",
            color: "from-amber-500 to-orange-600",
            lightColor: "bg-amber-50"
        },
        {
            title: "Elite Mentorship",
            description: "1:1 mock interviews and career roadmap development with professionals from Fortune 500 companies.",
            icon: "Zap",
            color: "from-indigo-600 to-violet-700",
            lightColor: "bg-indigo-50"
        },
        {
            title: "Global Events",
            description: "Automated event scheduling for webinars, hackathons, and campus reunions across all major tech hubs.",
            icon: "Calendar",
            color: "from-pink-500 to-rose-600",
            lightColor: "bg-pink-50"
        },
        {
            title: "Impact Stories",
            description: "Explore longitudinal career paths of successful alumni and gain insights into their transition phases.",
            icon: "Target",
            color: "from-emerald-500 to-teal-600",
            lightColor: "bg-emerald-50"
        },
        {
            title: "Campus Ecosystem",
            description: "A secure, verified bridge between student aspirations and industrial reality through live interactions.",
            icon: "Building",
            color: "from-slate-700 to-slate-900",
            lightColor: "bg-slate-50"
        }
    ];

    return (
        <section className="py-32 bg-white relative overflow-hidden" id="features">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
                    <div className="max-w-2xl text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 mb-6 justify-center lg:justify-start"
                        >
                            <ShieldCheck className="w-5 h-5 text-primary-600" />
                            <span className="text-sm font-black tracking-[0.2em] text-primary-600 uppercase">Premium Features</span>
                        </motion.div>
                        <motion.h3
                            className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Elevate your <span className="text-primary-600">Professional</span> standard.
                        </motion.h3>
                        <motion.p
                            className="text-slate-500 text-lg md:text-xl font-medium max-w-xl"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Powerful tools designed to foster meaningful growth and create a seamless transition from campus to corporate.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="hidden lg:block pb-4"
                    >
                        <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-primary-600 transition-all group">
                            Explore all modules <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, index) => {
                        const Icon = icons[feature.icon];
                        return (
                            <motion.div
                                key={index}
                                className="group relative p-10 bg-white rounded-[3rem] border border-slate-100 hover:border-primary-100 hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col items-start"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${feature.color} flex items-center justify-center mb-10 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{feature.title}</h4>
                                <p className="text-slate-500 font-bold leading-relaxed mb-8 flex-grow">
                                    {feature.description}
                                </p>
                                <div className="pt-6 border-t border-slate-50 w-full">
                                    <button className="flex items-center gap-2 text-slate-400 group-hover:text-primary-600 font-black text-sm uppercase tracking-widest transition-colors">
                                        Learn More <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>

                                {/* Decorative Corner Gradient */}
                                <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity rounded-br-[3rem]`}></div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-1/2 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_center,#f1f5f9,transparent_70%)]"></div>
        </section>
    );
};

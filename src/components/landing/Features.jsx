
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Award, Zap, Building, Calendar } from 'lucide-react';

const icons = {
    Users,
    Briefcase,
    Award,
    Zap,
    Building,
    Calendar
};

export const Features = () => {
    const features = [
        {
            title: "Alumni Directory",
            description: "Explore a vast network of alumni from various industries and companies. Filter by role, batch, and skills.",
            icon: "Users",
            color: "bg-blue-100 text-blue-600"
        },
        {
            title: "Job Portal",
            description: "Exclusive job openings and internships shared directly by alumni working in top-tier companies.",
            icon: "Briefcase",
            color: "bg-amber-100 text-amber-600"
        },
        {
            title: "Mentorship",
            description: "Get guidance from experienced professionals. Request resume reviews, mock interviews, and career advice.",
            icon: "Zap",
            color: "bg-indigo-100 text-indigo-600"
        },
        {
            title: "Events & Reunions",
            description: "Stay updated with upcoming alumni meets, webinars, and networking events organized by the institute.",
            icon: "Calendar",
            color: "bg-pink-100 text-pink-600"
        },
        {
            title: "Success Stories",
            description: "Read inspiring journeys of alumni who have made a mark in their respective fields.",
            icon: "Award",
            color: "bg-green-100 text-green-600"
        },
        {
            title: "Campus Connect",
            description: "Bridge the gap between campus life and the corporate world through regular interactions.",
            icon: "Building",
            color: "bg-purple-100 text-purple-600"
        }
    ];

    return (
        <section className="py-20 bg-white" id="features">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Why Join Us?
                    </motion.h2>
                    <motion.h3
                        className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Empower Your Career with the Alumni Network
                    </motion.h3>
                    <motion.p
                        className="text-slate-600 leading-relaxed"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        Unlock exclusive opportunities and resources designed to help students and alumni grow together.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = icons[feature.icon];
                        return (
                            <motion.div
                                key={index}
                                className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-slate-100 group"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Zap, ExternalLink, Megaphone, ArrowUpRight, Clock, MapPin, Target } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const BulletinBoard = () => {
    const { user } = useUser();

    // High frequency sync for Bulletin
    const { data: events = [], isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const { data } = await axios.get('/api/events', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 5000 // Realtime 5s
    });

    if (isLoading) return (
        <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Signals...</p>
        </div>
    );

    if (events.length === 0) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[64px] group hover:border-blue-100 transition-colors"
        >
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <Megaphone className="w-10 h-10 text-slate-200 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Quiet Airwaves</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">No active transmissions detected</p>
        </motion.div>
    );

    return (
        <section className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="live-dot"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Active Broadcasts</span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Campus <span className="text-blue-600">Bulletin</span></h3>
                </div>
                <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Transmission Node: Alpha-7
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                    {events.map((event, i) => (
                        <motion.div
                            key={event.id}
                            layout
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.1 }}
                            className="premium-card p-10 flex flex-col group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-150 transition-transform duration-1000 rotate-12 pointer-events-none">
                                <Megaphone className="w-32 h-32" />
                            </div>

                            <div className="flex justify-between items-start mb-10">
                                <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm transition-all duration-500 ${event.type === 'placement' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    event.type === 'training' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                        'bg-slate-50 text-slate-600 border-slate-100'
                                    }`}>
                                    {event.type.replace('_', ' ')}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Just Synced
                                </div>
                            </div>

                            <div className="flex-1">
                                <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                                    {event.title}
                                </h4>
                                <p className="text-slate-500 font-medium leading-relaxed mb-10 line-clamp-3">
                                    {event.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-slate-100 group-hover:shadow-blue-100">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default BulletinBoard;

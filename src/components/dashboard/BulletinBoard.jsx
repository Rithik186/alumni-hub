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
        staleTime: 60000,
        refetchInterval: 60000 
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
        <section className="space-y-12 max-w-[1240px] mx-auto pb-24 relative z-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className="live-dot"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Neural Network Active</span>
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Global <span className="text-indigo-600">Bulletin</span></h2>
                </div>
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/50 shadow-sm transition-all hover:shadow-xl group">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-indigo-600 transition-colors">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Transmission State</p>
                        <p className="text-sm font-bold text-slate-900 leading-none">Sync: Alpha-7-Node</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                    {events.map((event, i) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.1 }}
                            className="workspace-card p-10 flex flex-col group relative"
                        >
                            <div className="absolute -top-12 -right-12 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700 rotate-[15deg] pointer-events-none scale-150">
                                <Megaphone className="w-48 h-48" />
                            </div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm transition-all duration-500 ${
                                    event.type === 'placement' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    event.type === 'training' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    'bg-slate-50 text-slate-600 border-slate-100'
                                }`}>
                                    {event.type.replace('_', ' ')}
                                </div>
                                <div className="p-2 bg-slate-50 text-slate-300 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="flex-1 relative z-10">
                                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors uppercase">
                                    {event.title}
                                </h3>
                                <p className="text-slate-500 font-medium leading-relaxed mb-10 line-clamp-3 text-sm">
                                    {event.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-100/60 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                        <Calendar className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Event Cycle</p>
                                        <p className="text-[11px] font-black text-slate-800 tracking-tight leading-none">
                                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <button className="px-6 py-3 bg-slate-900 border border-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-600 hover:border-indigo-600 transition-all shadow-xl shadow-slate-100 group-hover:shadow-indigo-100">
                                    Detail Sync
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

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Zap, ExternalLink, Megaphone } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const BulletinBoard = () => {
    const { user } = useUser();

    const { data: events = [], isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const { data } = await axios.get('/api/events', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        refetchInterval: 60000 // Refresh every minute
    });

    if (isLoading) return null;
    if (events.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <Megaphone className="w-6 h-6 text-primary-600 animate-bounce" /> Live Bulletin Board
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, i) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary-200 transition-all overflow-hidden relative"
                    >
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-600/5 rounded-full blur-2xl group-hover:bg-primary-600/10 transition-colors"></div>

                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${event.type === 'placement' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    event.type === 'training' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                {event.type.replace('_', ' ')}
                            </span>
                            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}
                            </div>
                        </div>

                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-primary-600 transition-colors">
                            {event.title}
                        </h4>
                        <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">
                            {event.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                <Zap className="w-3 h-3 text-yellow-500" /> Major Event
                            </div>
                            <button className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary-600 tracking-widest hover:translate-x-1 transition-transform">
                                Details <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default BulletinBoard;

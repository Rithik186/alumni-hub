import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Building2, ArrowLeft, Users, Briefcase, 
    MapPin, UserPlus, Search, Filter,
    LayoutGrid, List, Sparkles, ChevronRight,
    CheckCircle2, Loader2, MessageSquare, UserCheck
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import Navbar from '../components/landing/Navbar';
import FadeContent from '../components/animations/FadeContent';
import Avatar from '../components/dashboard/Avatar';
import SpotlightCard from '../components/animations/SpotlightCard';
import { Badge } from '../components/ui/badge';

const CompanyAlumni = () => {
    const { name: companyName } = useParams();
    const { user: currentUser } = useUser();
    const navigate = useNavigate();

    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [followStatus, setFollowStatus] = useState({}); // { userId: 'none' | 'pending' | 'accepted' }

    useEffect(() => {
        fetchAlumni();
    }, [companyName]);

    const fetchAlumni = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/alumni/company/${companyName}`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAlumni(data);
                // Initialize follow statuses (In a real app, you'd fetch these from backend)
                // For now, let's assume 'none' and let handleFollow update it.
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId) => {
        setFollowStatus(prev => ({ ...prev, [userId]: 'pending' }));
        try {
            const res = await fetch(`/api/connections/follow/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (res.ok) {
                setFollowStatus(prev => ({ ...prev, [userId]: 'pending' }));
            }
        } catch (err) {
            setFollowStatus(prev => ({ ...prev, [userId]: 'none' }));
        }
    };

    const filteredAlumni = alumni.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.job_role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                {/* Header Section */}
                <FadeContent blur duration={400}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="space-y-4">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest">
                                <ArrowLeft className="w-4 h-4" /> Back to Discover
                            </button>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{companyName}</h1>
                                    <p className="text-slate-500 font-bold flex items-center gap-2 text-sm italic">
                                        <Sparkles className="w-4 h-4 text-amber-500" /> Professional Community on Platform
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Alumni</p>
                                <p className="text-xl font-black text-indigo-600">{alumni.length}</p>
                            </div>
                        </div>
                    </div>
                </FadeContent>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={`Search alumni working at ${companyName}...`} 
                        className="w-full h-16 pl-14 pr-6 bg-white border border-slate-200 rounded-[24px] text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Mapping Connections...</p>
                    </div>
                ) : filteredAlumni.length === 0 ? (
                    <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-[40px]">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No matches found</h3>
                        <p className="text-sm text-slate-400 font-medium">Try broadening your search or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAlumni.map((person) => (
                            <FadeContent key={person.id} blur duration={500}>
                                <SpotlightCard className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group" spotlightColor="rgba(79, 70, 229, 0.04)">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="relative">
                                            <Avatar src={person.profile_picture} name={person.name} size={64} className="rounded-2xl ring-4 ring-slate-50" />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
                                        </div>
                                        <Link 
                                            to={`/profile/${person.id}`}
                                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                        >
                                            < ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5 leading-tight">
                                            {person.name}
                                            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tight">
                                            <Briefcase className="w-3.5 h-3.5" /> {person.job_role || 'Professional'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                                        <button 
                                            onClick={() => handleFollow(person.id)}
                                            disabled={followStatus[person.id] === 'pending' || followStatus[person.id] === 'accepted'}
                                            className={`flex-1 h-12 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                                                followStatus[person.id] === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                                                followStatus[person.id] === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                                            }`}
                                        >
                                            {followStatus[person.id] === 'accepted' ? <><UserCheck className="w-4 h-4" /> Connected</> :
                                             followStatus[person.id] === 'pending' ? <><RefreshCw className="w-4 h-4 animate-spin" /> Pending</> :
                                             <><UserPlus className="w-4 h-4" /> Connect</>}
                                        </button>
                                        <button onClick={() => navigate('/chat')} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl flex items-center justify-center transition-all">
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                </SpotlightCard>
                            </FadeContent>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CompanyAlumni;

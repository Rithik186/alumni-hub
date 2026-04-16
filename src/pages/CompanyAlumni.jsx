import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Building2, ArrowLeft, Users, Briefcase, 
    MapPin, UserPlus, Search, Filter,
    LayoutGrid, List, Sparkles, ChevronRight,
    CheckCircle2, Loader2, MessageSquare, UserCheck,
    School, GraduationCap, RefreshCw, X
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import Navbar from '../components/landing/Navbar';
import FadeContent from '../components/animations/FadeContent';
import Avatar from '../components/dashboard/Avatar';
import SpotlightCard from '../components/animations/SpotlightCard';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-hot-toast';
import { tamilNaduColleges, engineeringDepartments, collegeSpecificDepartments } from '../data/colleges';

const CompanyAlumni = () => {
    const { name: companyName } = useParams();
    const { user: currentUser } = useUser();
    const navigate = useNavigate();

    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        college: '',
        department: '',
        batch: '',
        skills: '',
        jobRole: '',
        company: companyName // Pre-fill with the current company
    });
    const [showFilters, setShowFilters] = useState(true);
    const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
    const [showDeptSuggestions, setShowDeptSuggestions] = useState(false);
    const [followStatus, setFollowStatus] = useState({}); // { userId: 'none' | 'pending' | 'accepted' }

    const collegeSuggestions = React.useMemo(() => {
        if (!filters.college) return [];
        return tamilNaduColleges.filter(c => 
            c.toLowerCase().includes(filters.college.toLowerCase())
        ).slice(0, 8);
    }, [filters.college]);

    const deptSuggestions = React.useMemo(() => {
        if (!filters.department) return [];
        const collegeName = (filters.college || '').trim();
        // Exact match or contains for Sri Shakthi check
        const isSriShakthi = collegeName.includes('Sri Shakthi Institute of Engineering and Technology');
        const baseList = isSriShakthi ? collegeSpecificDepartments["Sri Shakthi Institute of Engineering and Technology (Autonomous)"] : engineeringDepartments;
        
        return baseList.filter(d => 
            d.toLowerCase().includes(filters.department.toLowerCase())
        ).slice(0, 8);
    }, [filters.department, filters.college]);

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
        const currentStatus = followStatus[userId];
        
        if (currentStatus === 'pending') {
            // Cancel the pending request
            setFollowStatus(prev => ({ ...prev, [userId]: 'none' }));
            try {
                await fetch(`/api/connections/follow/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                toast.success('Request cancelled');
            } catch (err) {
                setFollowStatus(prev => ({ ...prev, [userId]: 'pending' }));
                toast.error('Failed to cancel request');
            }
            return;
        }

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

    const filteredAlumni = alumni.filter(a => {
        const query = searchQuery?.toLowerCase().trim();
        const matchesSearch = !query || 
            (a.name?.toLowerCase().includes(query)) || 
            (a.job_role?.toLowerCase().includes(query));
        
        const fCollege = filters.college?.toLowerCase().trim();
        const matchesCollege = !fCollege || (a.college?.toLowerCase().includes(fCollege));
        
        const fDept = filters.department?.toLowerCase().trim();
        const matchesDept = !fDept || (a.department?.toLowerCase().includes(fDept));
        
        const fBatch = filters.batch?.trim();
        const matchesBatch = !fBatch || (a.batch?.toString().includes(fBatch));
        
        const fRole = filters.jobRole?.toLowerCase().trim();
        const matchesRole = !fRole || (a.job_role?.toLowerCase().includes(fRole));
        
        const fCompany = filters.company?.toLowerCase().trim();
        const matchesCompany = !fCompany || (a.company?.toLowerCase().includes(fCompany));
        
        const fSkills = filters.skills?.toLowerCase().trim();
        let matchesSkills = true;
        if (fSkills) {
            matchesSkills = a.skills && Array.isArray(a.skills) && a.skills.some(s => s.toLowerCase().includes(fSkills));
        }

        return matchesSearch && matchesCollege && matchesDept && matchesBatch && matchesRole && matchesCompany && matchesSkills;
    });

    const handleMessageClick = (personId) => {
        if (followStatus[personId] !== 'accepted') {
            toast.error("Please follow this alumni first to start a conversation!");
            return;
        }
        navigate('/chat');
    };

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

                {/* Search & Filters */}
                <div className="bg-white rounded-[32px] border border-slate-200/60 p-6 shadow-sm mb-8">
                    <div className="relative mb-6">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder={`Search alumni by name or role...`} 
                            className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                            <input 
                                type="text" 
                                placeholder="Filter company..." 
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                value={filters.company}
                                onChange={(e) => setFilters({...filters, company: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">College Name</label>
                            <input 
                                type="text" 
                                placeholder="Search college..." 
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                value={filters.college}
                                onChange={(e) => setFilters({...filters, college: e.target.value})}
                                onFocus={() => setShowCollegeSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowCollegeSuggestions(false), 200)}
                            />
                            {showCollegeSuggestions && collegeSuggestions.length > 0 && (
                                <div className="absolute z-[100] top-full mt-2 w-[120%] left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2">
                                    {collegeSuggestions.map((college, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setFilters({ ...filters, college });
                                                setShowCollegeSuggestions(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-[11px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-3 font-bold"
                                        >
                                            <GraduationCap className="w-3.5 h-3.5 text-slate-300" />
                                            {college}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch / Dept</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Computer Science..." 
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                value={filters.department}
                                onChange={(e) => setFilters({...filters, department: e.target.value})}
                                onFocus={() => setShowDeptSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowDeptSuggestions(false), 200)}
                            />
                            {showDeptSuggestions && deptSuggestions.length > 0 && (
                                <div className="absolute z-[100] top-full mt-2 w-[120%] left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2">
                                    {deptSuggestions.map((dept, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setFilters({ ...filters, department: dept });
                                                setShowDeptSuggestions(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-[11px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-3 font-bold"
                                        >
                                            <Building2 className="w-3.5 h-3.5 text-slate-300" />
                                            {dept}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch</label>
                            <input 
                                type="text" 
                                placeholder="Year (e.g. 2022)..." 
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                value={filters.batch}
                                onChange={(e) => setFilters({...filters, batch: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Skills</label>
                            <input 
                                type="text" 
                                placeholder="e.g. React, Node.js..." 
                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                value={filters.skills}
                                onChange={(e) => setFilters({...filters, skills: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Role</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    placeholder="e.g. SDE..." 
                                    className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                    value={filters.jobRole}
                                    onChange={(e) => setFilters({...filters, jobRole: e.target.value})}
                                />
                                <button 
                                    onClick={() => setFilters({ college: '', department: '', batch: '', skills: '', jobRole: '', company: '' })}
                                    className="h-11 px-4 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {filteredAlumni.map((person) => (
                            <FadeContent key={person.id} blur duration={500}>
                                <SpotlightCard className="bg-white border border-slate-200/60 shadow-sm rounded-[28px] p-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group" spotlightColor="rgba(79, 70, 229, 0.04)">
                                    <div className="flex items-start justify-between mb-4">
                                        <Link to={`/profile/${person.id}`} className="relative block group/avatar">
                                            <Avatar src={person.profile_picture} name={person.name} size={52} className="rounded-xl ring-2 ring-slate-100 group-hover/avatar:ring-indigo-200 transition-all" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                                        </Link>
                                        <Link 
                                            to={`/profile/${person.id}`}
                                            className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>

                                    <div className="space-y-0.5 mb-5">
                                        <h3 className="text-sm font-black text-slate-900 truncate leading-tight flex items-center gap-1">
                                            {person.name}
                                            <CheckCircle2 className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate flex items-center gap-1.5">
                                            <Briefcase className="w-3 h-3 text-slate-400" /> {person.job_role || 'Professional'}
                                        </p>
                                        <p className="text-[9px] font-semibold text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                                            <Building2 className="w-3 h-3 text-indigo-400" /> {person.department || 'General Branch'}
                                        </p>
                                        <p className="text-[9px] font-semibold text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                            <School className="w-3 h-3 text-slate-300" /> {person.college || 'Platform Alumni'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100/60">
                                        <button 
                                            onClick={() => handleFollow(person.id)}
                                            disabled={followStatus[person.id] === 'accepted'}
                                            className={`flex-1 h-10 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 ${
                                                followStatus[person.id] === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                                                followStatus[person.id] === 'pending' ? 'bg-amber-50 text-amber-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer' :
                                                'bg-slate-900 text-white hover:bg-slate-800'
                                            }`}
                                        >
                                            {followStatus[person.id] === 'accepted' ? <><UserCheck className="w-3.5 h-3.5" /> Connected</> :
                                             followStatus[person.id] === 'pending' ? <><X className="w-3.5 h-3.5" /> Cancel Request</> :
                                             <><UserPlus className="w-3.5 h-3.5" /> Connect</>}
                                        </button>
                                        <button 
                                            onClick={() => handleMessageClick(person.id)}
                                            className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-all"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
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

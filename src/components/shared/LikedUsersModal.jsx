import { X, ShieldCheck, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from '../dashboard/Avatar';


const LikedUsersModal = ({ postId, user, onClose }) => {
    const navigate = useNavigate();

    const { data: likes, isLoading } = useQuery({
        queryKey: ['postLikes', postId],
        queryFn: async () => {
            const res = await axios.get(`/api/posts/${postId}/likes`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return res.data;
        }
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Likes</h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex flex-col gap-2 p-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-slate-100" />
                                    <div className="space-y-2">
                                        <div className="w-24 h-3 bg-slate-100 rounded" />
                                        <div className="w-16 h-2 bg-slate-50 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : likes?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <User className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm font-medium">No likes yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                             {likes?.map(u => (
                                <div 
                                    key={u.id} 
                                    onClick={() => { navigate(`/profile/${u.id}`); onClose(); }}
                                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer"
                                >
                                    <Avatar src={u.profile_picture} name={u.name} size={40} userId={u.id} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-slate-900 text-[14px] truncate group-hover:text-indigo-600 transition-colors">{u.name}</span>
                                            {u.role === 'alumni' && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate capitalize">{u.role} • {u.college}</p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </div>
            {/* Click outside to close */}
            <div className="fixed inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default LikedUsersModal;

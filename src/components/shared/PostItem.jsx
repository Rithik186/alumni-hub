import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, MoreVertical, Edit2, Trash2, X, Send, Image as ImageIcon, Video } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import CommentSection from './CommentSection';

const PostItem = ({ post, user }) => {
    const queryClient = useQueryClient();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showLikes, setShowLikes] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [editData, setEditData] = useState({ content: post.content, image_url: post.image_url, video_url: post.video_url });

    const likeMutation = useMutation({
        mutationFn: async ({ postId, isDislike }) => axios.post(`/api/posts/${postId}/like`, { isDislike }, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => queryClient.invalidateQueries(['feed'])
    });

    const editMutation = useMutation({
        mutationFn: async (data) => axios.put(`/api/posts/${post.id}`, data, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            setIsEditing(false);
            queryClient.invalidateQueries(['feed']);
            setShowOptions(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => axios.delete(`/api/posts/${post.id}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => queryClient.invalidateQueries(['feed'])
    });

    const handleMediaUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await axios.post('/api/upload/media', formData, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (type === 'image') setEditData({ ...editData, image_url: data.url, video_url: '' });
            else setEditData({ ...editData, video_url: data.url, image_url: '' });
        } catch (err) {
            console.error('Upload Error', err);
        }
    };

    const shareText = encodeURIComponent(`Check out this post on Alumni Hub: ${post.content.substring(0, 50)}...`);
    const shareUrl = encodeURIComponent(window.location.origin);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card overflow-hidden"
        >
            <div className="p-8">
                <div className="flex items-start justify-between mb-8 relative">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl shadow-blue-100 overflow-hidden bg-cover bg-center" style={{ backgroundImage: post.author_profile_picture ? `url(${post.author_profile_picture})` : 'none' }}>
                            {!post.author_profile_picture && post.author_name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tighter">{post.author_name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{post.author_role} • {post.author_college}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 hidden sm:block">Verified Broadcast</div>

                        {post.user_id === user.id && (
                            <div className="relative">
                                <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                <AnimatePresence>
                                    {showOptions && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2"
                                        >
                                            <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                                <Edit2 className="w-4 h-4" /> Edit Post
                                            </button>
                                            <button onClick={() => { if (window.confirm('Are you sure?')) deleteMutation.mutate(); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3">
                                                <Trash2 className="w-4 h-4" /> Delete Post
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="mb-8 space-y-4 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <textarea
                            value={editData.content}
                            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                            className="w-full bg-transparent border-none text-slate-900 font-bold focus:ring-0 outline-none min-h-[100px] resize-none"
                            placeholder="Edit your content..."
                        />
                        {(editData.image_url || editData.video_url) && (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                                {editData.image_url && <img src={editData.image_url} alt="Attached" className="w-full max-h-[300px] object-cover" />}
                                {editData.video_url && <video src={editData.video_url} controls className="w-full max-h-[300px] bg-slate-900" />}
                                <button onClick={() => setEditData({ ...editData, image_url: '', video_url: '' })} className="absolute top-4 right-4 p-2 bg-white/90 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-4">
                            <div className="flex gap-2">
                                <label className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer">
                                    <ImageIcon className="w-5 h-5" />
                                    <input type="file" hidden accept="image/*" onChange={e => handleMediaUpload(e, 'image')} />
                                </label>
                                <label className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer">
                                    <Video className="w-5 h-5" />
                                    <input type="file" hidden accept="video/*" onChange={e => handleMediaUpload(e, 'video')} />
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setIsEditing(false); setEditData({ content: post.content, image_url: post.image_url, video_url: post.video_url }); }} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button onClick={() => editMutation.mutate(editData)} disabled={editMutation.isPending} className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg">Save</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-700 font-medium leading-[1.8] text-lg mb-8 whitespace-pre-wrap">{post.content}</p>

                        {post.image_url && (
                            <div className="rounded-[32px] overflow-hidden mb-8 border border-slate-100 shadow-2xl">
                                <img src={post.image_url} alt="Post asset" className="w-full object-cover max-h-[400px]" />
                            </div>
                        )}

                        {post.video_url && (
                            <div className="rounded-[32px] overflow-hidden mb-8 border border-slate-100 bg-slate-900 flex items-center justify-center">
                                <video src={post.video_url} controls className="w-full h-auto max-h-[400px] object-contain outline-none" />
                            </div>
                        )}
                    </>
                )}

                {post.likes_count > 0 && post.liked_by_users?.length > 0 && (
                    <div className="flex text-xs text-slate-500 mb-3 px-1 relative">
                        <button onClick={() => setShowLikes(!showLikes)} className="hover:underline flex items-center gap-1">
                            <span className="font-bold text-slate-700">{post.liked_by_users[0].name}</span>
                            {post.likes_count > 1 ? `and ${post.likes_count - 1} others liked this` : 'liked this'}
                        </button>

                        {/* Liked Users Modal/Tooltip */}
                        <AnimatePresence>
                            {showLikes && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-6 left-0 w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 z-30"
                                >
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                                        <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400">Liked by</h4>
                                        <button onClick={() => setShowLikes(false)} className="text-slate-400 hover:text-slate-800"><X className="w-3 h-3" /></button>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-3">
                                        {post.liked_by_users.map((u, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 text-[8px] flex items-center justify-center font-black text-slate-500 flex-shrink-0">{u.name.charAt(0)}</div>
                                                <span className="text-xs font-bold text-slate-700 truncate">{u.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className="flex items-center justify-between pt-8 border-t border-slate-50 relative">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => likeMutation.mutate({ postId: post.id, isDislike: false })}
                            className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${post.has_liked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                        >
                            <Heart className={`w-6 h-6 ${post.has_liked ? 'fill-blue-600' : ''}`} /> {post.likes_count}
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${isExpanded ? 'text-blue-600' : 'text-slate-400 hover:text-indigo-600'}`}
                        >
                            <MessageSquare className="w-6 h-6" /> {post.comments_count}
                        </button>
                    </div>

                    <button onClick={() => setShowShare(!showShare)} className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                        <Share2 className="w-5 h-5" /> Share
                    </button>

                    {/* Share Modal */}
                    <AnimatePresence>
                        {showShare && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 bottom-16 bg-white border border-slate-200 shadow-2xl rounded-[24px] p-6 w-72 z-30"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Share Broadcast</h4>
                                    <button onClick={() => setShowShare(false)} className="text-slate-400 hover:text-slate-800"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <a href={`https://wa.me/?text=${shareText} ${shareUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest">WhatsApp</a>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest">Facebook</a>
                                    <a href={`mailto:?subject=Alumni Hub Post&body=${shareText} ${shareUrl}`} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest">Email</a>
                                    <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest">X (Twitter)</a>
                                </div>
                                <div className="border-t border-slate-100 pt-4 mt-2 text-center">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Copy Link to Chat</p>
                                    <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/chat'); alert('Link copied, paste in chat!'); setShowShare(false); }} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-bold text-xs">
                                        <Send className="w-4 h-4" /> Forward to Connection
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-8 pt-8 border-t border-slate-50"
                        >
                            <CommentSection postId={post.id} postOwnerId={post.user_id} user={user} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PostItem;

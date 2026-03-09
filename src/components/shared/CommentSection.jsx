import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Heart, Pin, Reply, MoreVertical } from 'lucide-react';
import axios from 'axios';

const CommentSection = ({ postId, postOwnerId, user }) => {
    const queryClient = useQueryClient();
    const [commentContent, setCommentContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [sortBy, setSortBy] = useState('recent'); // recent, relevant

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/posts/${postId}/comments`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    const addCommentMutation = useMutation({
        mutationFn: async (contentData) => axios.post(`/api/posts/${postId}/comment`, contentData, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            setCommentContent('');
            setReplyingTo(null);
            queryClient.invalidateQueries(['comments', postId]);
            queryClient.invalidateQueries(['feed']);
        }
    });

    const likeCommentMutation = useMutation({
        mutationFn: async (commentId) => axios.post(`/api/posts/comment/${commentId}/like`, {}, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => queryClient.invalidateQueries(['comments', postId])
    });

    const pinCommentMutation = useMutation({
        mutationFn: async (commentId) => axios.post(`/api/posts/comment/${commentId}/pin`, {}, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => queryClient.invalidateQueries(['comments', postId])
    });

    const handleSubmit = () => {
        if (!commentContent.trim()) return;
        addCommentMutation.mutate({ content: commentContent, parentId: replyingTo?.id || null });
    };

    let displayComments = [...comments];
    if (sortBy === 'recent') {
        displayComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'relevant') {
        displayComments.sort((a, b) => b.likes_count - a.likes_count);
    }
    // Always keep pinned at top
    displayComments.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

    // Group replies
    const topLevelComments = displayComments.filter(c => !c.parent_id);
    const replies = displayComments.filter(c => c.parent_id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comments</span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-transparent outline-none cursor-pointer"
                >
                    <option value="recent">Most Recent</option>
                    <option value="relevant">Most Relevant</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto modern-scrollbar pr-2">
                    {topLevelComments.length === 0 && (
                        <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-300 italic py-2">Start the conversation</p>
                    )}
                    {topLevelComments.map(c => (
                        <div key={c.id} className="group">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-500 uppercase flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: c.user_profile_picture ? `url(${c.user_profile_picture})` : 'none' }}>
                                    {!c.user_profile_picture && (c.user_name ? c.user_name.charAt(0) : 'U')}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-slate-50 rounded-2xl rounded-tl-none px-5 py-3 text-sm flex-1 group-hover:bg-white group-hover:shadow-lg transition-all border border-transparent group-hover:border-blue-50 relative">
                                        {c.is_pinned && <div className="absolute top-2 right-2 text-blue-600"><Pin className="w-3 h-3" /></div>}
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-slate-900 text-xs">{c.user_name}</p>
                                            {c.user_role && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 rounded">{c.user_role}</span>}
                                        </div>
                                        <p className="text-slate-600 leading-relaxed font-medium">{c.content}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 px-2 text-[10px] font-bold text-slate-400">
                                        <button onClick={() => likeCommentMutation.mutate(c.id)} className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${c.has_liked ? 'text-blue-600' : ''}`}>
                                            <Heart className={`w-3 h-3 ${c.has_liked ? 'fill-blue-600' : ''}`} /> {c.likes_count || 0}
                                        </button>
                                        <button onClick={() => setReplyingTo({ id: c.id, name: c.user_name })} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                                            <Reply className="w-3 h-3" /> Reply
                                        </button>
                                        {user.id === postOwnerId && (
                                            <button onClick={() => pinCommentMutation.mutate(c.id)} className="hover:text-amber-500 transition-colors">
                                                {c.is_pinned ? 'Unpin' : 'Pin'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            {replies.filter(r => r.parent_id === c.id).map(r => (
                                <div key={r.id} className="flex gap-4 mt-3 ml-12">
                                    <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[8px] font-black text-slate-500 uppercase flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: r.user_profile_picture ? `url(${r.user_profile_picture})` : 'none' }}>
                                        {!r.user_profile_picture && (r.user_name ? r.user_name.charAt(0) : 'U')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-slate-50/50 rounded-xl rounded-tl-none px-4 py-2 text-xs border border-transparent">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-slate-900 text-[10px]">{r.user_name}</p>
                                            </div>
                                            <p className="text-slate-600 font-medium">{r.content}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 px-2 text-[9px] font-bold text-slate-400">
                                            <button onClick={() => likeCommentMutation.mutate(r.id)} className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${r.has_liked ? 'text-blue-600' : ''}`}>
                                                <Heart className={`w-3 h-3 ${r.has_liked ? 'fill-blue-600' : ''}`} /> {r.likes_count || 0}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div >
            )}

            <div className="flex flex-col gap-3">
                {replyingTo && (
                    <div className="flex items-center justify-between px-3 py-2 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-xl">
                        <span>Replying to {replyingTo.name}</span>
                        <button onClick={() => setReplyingTo(null)} className="hover:text-blue-900">Cancel</button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder={replyingTo ? 'Write a reply...' : 'Add to the discussion...'}
                        className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!commentContent.trim() || addCommentMutation.isPending}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div >
    );
};

export default CommentSection;

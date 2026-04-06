import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Heart, Pin, Reply, Send, X, Smile } from 'lucide-react';
import axios from 'axios';

const QUICK_REPLIES = [
    'Congratulations! 🎉',
    'Great job! 👏',
    'Good work! 💪',
    'Well done! 🌟',
    'Amazing! 🔥',
    'Thanks for sharing! 🙌',
];

const CommentSection = ({ postId, postOwnerId, user }) => {
    const queryClient = useQueryClient();
    const [text, setText] = useState('');
    const [replyTo, setReplyTo] = useState(null);

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/posts/${postId}/comments`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return Array.isArray(data) ? data : [];
        },
        staleTime: 30000,
    });

    const addMutation = useMutation({
        mutationFn: (content) => axios.post(`/api/posts/${postId}/comment`,
            { content, parentId: replyTo?.id || null },
            { headers: { Authorization: `Bearer ${user.token}` } }
        ),
        onSuccess: () => {
            setText('');
            setReplyTo(null);
            queryClient.invalidateQueries(['comments', postId]);
            queryClient.invalidateQueries(['feed']);
        }
    });

    const likeMutation = useMutation({
        mutationFn: (cId) => axios.post(`/api/posts/comment/${cId}/like`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
        }),
        onSuccess: () => queryClient.invalidateQueries(['comments', postId])
    });

    const pinMutation = useMutation({
        mutationFn: (cId) => axios.post(`/api/posts/comment/${cId}/pin`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
        }),
        onSuccess: () => queryClient.invalidateQueries(['comments', postId])
    });

    const handleSubmit = () => {
        if (!text.trim() || addMutation.isPending) return;
        addMutation.mutate(text.trim());
    };

    const handleQuickReply = (msg) => {
        if (addMutation.isPending) return;
        addMutation.mutate(msg);
    };

    const topLevel = [...comments]
        .filter(c => !c.parent_id)
        .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    const replies = comments.filter(c => c.parent_id);

    if (isLoading) return (
        <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span className="text-xs text-slate-400 font-medium">Loading comments...</span>
        </div>
    );

    return (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            {/* Quick Reply Chips */}
            <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <Smile className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Quick Reply</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.map(msg => (
                        <button
                            key={msg}
                            onClick={() => handleQuickReply(msg)}
                            disabled={addMutation.isPending}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-full text-xs font-medium text-slate-600 hover:text-indigo-700 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            {msg}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment Input */}
            <div className="space-y-2">
                {replyTo && (
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl px-3 py-2">
                        <span className="flex items-center gap-1.5">
                            <Reply className="w-3 h-3" /> Replying to {replyTo.name}
                        </span>
                        <button onClick={() => setReplyTo(null)} className="hover:bg-indigo-100 rounded p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                <div className="flex gap-2 items-end">
                    <div
                        className="w-8 h-8 rounded-xl flex-shrink-0 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden bg-cover bg-center border border-slate-200/60"
                        style={{ backgroundImage: user.profile_picture ? `url(${user.profile_picture})` : 'none' }}
                    >
                        {!user.profile_picture && user.name?.charAt(0)}
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-300 focus:bg-white transition-all"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim() || addMutation.isPending}
                            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            {topLevel.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">No comments yet. Be the first to share your thoughts!</p>
            ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto modern-scrollbar pr-1">
                    {topLevel.map(c => (
                        <div key={c.id}>
                            <div className="flex gap-2.5">
                                <div
                                    className="w-8 h-8 rounded-xl flex-shrink-0 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden bg-cover bg-center border border-slate-200/60"
                                    style={{ backgroundImage: c.user_profile_picture ? `url(${c.user_profile_picture})` : 'none' }}
                                >
                                    {!c.user_profile_picture && c.user_name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3.5 py-2.5 relative group">
                                        {c.is_pinned && (
                                            <div className="absolute top-2 right-2 bg-amber-50 rounded-md p-0.5">
                                                <Pin className="w-2.5 h-2.5 text-amber-500" />
                                            </div>
                                        )}
                                        <p className="text-xs font-semibold text-slate-900 mb-0.5">
                                            {c.user_name}
                                            {c.user_role && <span className="font-normal text-slate-400 ml-1.5 text-[10px] capitalize">{c.user_role}</span>}
                                        </p>
                                        <p className="text-[13px] text-slate-700 leading-relaxed">{c.content}</p>
                                    </div>
                                    <div className="flex items-center gap-3.5 mt-1 px-1">
                                        <button
                                            onClick={() => likeMutation.mutate(c.id)}
                                            className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${c.has_liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                                        >
                                            <Heart className={`w-3 h-3 ${c.has_liked ? 'fill-rose-500' : ''}`} />
                                            {c.likes_count || 0}
                                        </button>
                                        <button
                                            onClick={() => setReplyTo({ id: c.id, name: c.user_name })}
                                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Reply className="w-3 h-3" /> Reply
                                        </button>
                                        {user.id === postOwnerId && (
                                            <button
                                                onClick={() => pinMutation.mutate(c.id)}
                                                className={`text-[11px] font-semibold transition-colors ${c.is_pinned ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                                            >
                                                {c.is_pinned ? 'Unpin' : 'Pin'}
                                            </button>
                                        )}
                                    </div>
                                    {/* Nested Replies */}
                                    {replies.filter(r => r.parent_id === c.id).map(r => (
                                        <div key={r.id} className="flex gap-2 mt-2 ml-2">
                                            <div
                                                className="w-6 h-6 rounded-lg flex-shrink-0 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden bg-cover bg-center"
                                                style={{ backgroundImage: r.user_profile_picture ? `url(${r.user_profile_picture})` : 'none' }}
                                            >
                                                {!r.user_profile_picture && r.user_name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 bg-slate-50/80 rounded-xl rounded-tl-sm px-3 py-2">
                                                <p className="text-[11px] font-semibold text-slate-900 mb-0.5">{r.user_name}</p>
                                                <p className="text-xs text-slate-600 leading-relaxed">{r.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;

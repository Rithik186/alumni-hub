import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreVertical, Edit, Trash2, X, ShieldCheck, Clock, Loader2, Bookmark } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import CommentSection from './CommentSection';
import SpotlightCard from '../animations/SpotlightCard';

const formatDate = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const PostItem = ({ post, user }) => {
    const queryClient = useQueryClient();
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);

    // Optimistic like
    const [liked, setLiked] = useState(post.has_liked);
    const [likeCount, setLikeCount] = useState(post.likes_count || 0);

    const likeMutation = useMutation({
        mutationFn: () => axios.post(`/api/posts/${post.id}/like`, { isDislike: false }, {
            headers: { Authorization: `Bearer ${user.token}` }
        }),
        onMutate: () => {
            const was = liked;
            setLiked(!was);
            setLikeCount(c => was ? c - 1 : c + 1);
        },
        onError: () => {
            setLiked(post.has_liked);
            setLikeCount(post.likes_count || 0);
        },
    });

    const editMutation = useMutation({
        mutationFn: () => axios.put(`/api/posts/${post.id}`, { ...post, content: editContent }, {
            headers: { Authorization: `Bearer ${user.token}` }
        }),
        onSuccess: () => { setIsEditing(false); queryClient.invalidateQueries(['feed']); }
    });

    const deleteMutation = useMutation({
        mutationFn: () => axios.delete(`/api/posts/${post.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        }),
        onSuccess: () => queryClient.invalidateQueries(['feed'])
    });

    const isOwner = post.user_id === user.id;

    return (
        <SpotlightCard className="bg-transparent" spotlightColor="rgba(79, 70, 229, 0.1)">
            <article className="post-card">
            <div className="p-4 sm:p-5">
                {/* Author Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-indigo-100 to-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm overflow-hidden bg-cover bg-center flex-shrink-0 border-2 border-white shadow-sm"
                        style={{ backgroundImage: post.author_profile_picture ? `url(${post.author_profile_picture})` : 'none' }}
                    >
                        {!post.author_profile_picture && post.author_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-900 text-sm leading-none">{post.author_name}</span>
                            {post.author_role === 'alumni' && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <span className="capitalize">{post.author_role}</span>
                            <span className="text-slate-300">·</span>
                            {formatDate(post.created_at)}
                        </p>
                    </div>
                    {isOwner && (
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setShowOptions(o => !o)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            {showOptions && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
                                    <div className="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                                        <button
                                            onClick={() => { setIsEditing(true); setShowOptions(false); }}
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit Post
                                        </button>
                                        <button
                                            onClick={() => { if (window.confirm('Delete this post?')) deleteMutation.mutate(); setShowOptions(false); }}
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="mb-3 space-y-2">
                        <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-300 outline-none resize-none min-h-[100px] transition-all"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setIsEditing(false); setEditContent(post.content); }} className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">Cancel</button>
                            <button onClick={() => editMutation.mutate()} disabled={editMutation.isPending} className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5">
                                {editMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />} Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-800 text-[14px] leading-[1.7] mb-3 whitespace-pre-wrap">{post.content}</p>
                )}

                {/* Media */}
                {post.image_url && (
                    <div className="rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-50">
                        <img src={post.image_url} alt="Post" className="w-full max-h-[420px] object-cover" loading="lazy" />
                    </div>
                )}
                {post.video_url && (
                    <div className="rounded-xl overflow-hidden mb-3 bg-slate-950">
                        <video src={post.video_url} controls className="w-full max-h-[420px] object-contain" />
                    </div>
                )}

                {/* Engagement Stats */}
                {(likeCount > 0 || (post.comments_count || 0) > 0) && (
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-3 px-1">
                        {likeCount > 0 && (
                            <span className="flex items-center gap-1">
                                <span className="w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                                    <Heart className="w-2.5 h-2.5 text-white fill-white" />
                                </span>
                                {likeCount}
                            </span>
                        )}
                        {(post.comments_count || 0) > 0 && (
                            <button onClick={() => setShowComments(s => !s)} className="hover:text-slate-600 hover:underline transition-colors">
                                {post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center border-t border-slate-100 pt-2 gap-1">
                    <button
                        onClick={() => likeMutation.mutate()}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-95 ${
                            liked ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <Heart className={`w-[18px] h-[18px] ${liked ? 'fill-rose-600' : ''}`} />
                        <span className="hidden sm:inline">Like</span>
                    </button>
                    <button
                        onClick={() => setShowComments(s => !s)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-95 ${
                            showComments ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <MessageSquare className="w-[18px] h-[18px]" />
                        <span className="hidden sm:inline">Comment</span>
                    </button>
                    <button
                        onClick={() => navigator.clipboard.writeText(window.location.origin)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Share2 className="w-[18px] h-[18px]" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>

                {/* Comments */}
                {showComments && (
                    <CommentSection postId={post.id} postOwnerId={post.user_id} user={user} />
                )}
            </div>
            </article>
        </SpotlightCard>
    );
};

export default PostItem;

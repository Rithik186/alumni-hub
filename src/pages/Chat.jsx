import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, FileText, Paperclip, Check, CheckCheck, User, Circle, ArrowLeft, Search, X, Smile, MoreVertical, Download, Edit, Trash2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const Chat = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState("");
    const [attachment, setAttachment] = useState({ image_url: '', video_url: '' });
    const [selectedContact, setSelectedContact] = useState(null);
    const [search, setSearch] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [viewImage, setViewImage] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editValue, setEditValue] = useState("");

    const { data: contacts = [], isLoading: contactsLoading } = useQuery({
        queryKey: ['chatContacts'],
        queryFn: async () => {
            const { data } = await axios.get('/api/chat/contacts', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    // Auto select first contact
    useEffect(() => {
        if (contacts.length > 0 && !selectedContact) setSelectedContact(contacts[0]);
    }, [contacts]);

    const { data: messages = [], isLoading: messagesLoading } = useQuery({
        queryKey: ['chatMessages', selectedContact?.id],
        queryFn: async () => {
            if (!selectedContact) return [];
            const { data } = await axios.get(`/api/chat/messages/${selectedContact.id}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        },
        enabled: !!selectedContact,
        refetchInterval: 3000 // Real-time polling
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (msgData) => axios.post('/api/chat/messages', msgData, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['chatMessages', selectedContact?.id]);
            setNewMessage('');
        }
    });

    const editMessageMutation = useMutation({
        mutationFn: async ({ id, text }) => axios.put(`/api/chat/messages/${id}`, { text }, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['chatMessages', selectedContact?.id]);
            setEditingMessage(null);
        }
    });

    const deleteMessageMutation = useMutation({
        mutationFn: async (id) => axios.delete(`/api/chat/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['chatMessages', selectedContact?.id]);
        }
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
            if (type === 'image') setAttachment(prev => ({ ...prev, image_url: data.url, video_url: '' }));
            else setAttachment(prev => ({ ...prev, video_url: data.url, image_url: '' }));
        } catch (err) {
            console.error('Upload Error:', err);
            alert('Upload failed');
        }
    };

    const handleSend = () => {
        if ((!newMessage.trim() && !attachment.image_url && !attachment.video_url) || !selectedContact) return;
        if (editingMessage) {
            editMessageMutation.mutate({ id: editingMessage.id, text: newMessage });
        } else {
            sendMessageMutation.mutate({
                receiverId: selectedContact.id,
                text: newMessage,
                image_url: attachment.image_url,
                video_url: attachment.video_url
            });
        }
        setAttachment({ image_url: '', video_url: '' });
        setShowEmojiPicker(false);
    };

    const handleDownload = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <h2 className="text-xl font-black tracking-tight text-slate-800">Messages</h2>
                </div>

                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto w-full">
                    {contactsLoading ? (
                        <div className="p-8 flex justify-center text-slate-400">Loading contacts...</div>
                    ) : contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${selectedContact?.id === contact.id ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-slate-50'}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg bg-cover bg-center" style={{ backgroundImage: contact.avatar ? `url(${contact.avatar})` : 'none' }}>
                                    {!contact.avatar && contact.name.charAt(0)}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{contact.name}</h4>
                                <p className="text-xs text-slate-500 truncate">{contact.role}</p>
                            </div>
                        </div>
                    ))}
                    {contacts.length === 0 && !contactsLoading && (
                        <div className="p-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">No connections yet</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm justify-between z-10 w-full">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 bg-cover bg-center" style={{ backgroundImage: selectedContact.avatar ? `url(${selectedContact.avatar})` : 'none' }}>
                                    {!selectedContact.avatar && selectedContact.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 tracking-tight">{selectedContact.name}</h3>
                                    <p className="text-xs font-semibold text-emerald-600">{selectedContact.status === 'online' ? 'Online' : 'Offline'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Panel */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col w-full">
                            {messagesLoading ? (
                                <div className="h-full flex items-center justify-center text-slate-400">Syncing chat logs...</div>
                            ) : messages.map((msg, i) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-slate-200 ${isMe ? 'ml-3' : 'mr-3'} flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 mt-auto bg-cover bg-center`} style={{ backgroundImage: (isMe ? user.profile_picture : selectedContact.avatar) ? `url(${isMe ? user.profile_picture : selectedContact.avatar})` : 'none' }}>
                                            {!(isMe ? user.profile_picture : selectedContact.avatar) && (isMe ? user.name : selectedContact.name).charAt(0)}
                                        </div>

                                        <div className="relative max-w-[70%] flex flex-col group">
                                            <div className={`rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'}`}>
                                                {msg.image_url && (
                                                    <div className="relative group/img mb-2 cursor-pointer" onClick={() => setViewImage(msg.image_url)}>
                                                        <img src={msg.image_url} alt="Attached" className="w-full max-w-[250px] rounded-xl object-cover hover:opacity-90 transition-opacity" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(msg.image_url, `image-${msg.id}.jpg`); }}
                                                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                                {msg.video_url && <video src={msg.video_url} controls className="w-full max-w-[250px] rounded-xl mb-2 bg-slate-900" />}
                                                {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                                                <div className={`text-[10px] mt-2 flex items-center gap-1.5 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <CheckCheck className="w-3 h-3" />}
                                                </div>
                                            </div>

                                            {/* Options Menu */}
                                            {isMe && (
                                                <div className="absolute top-1/2 -left-12 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-white shadow-xl rounded-lg p-1 border border-slate-100 z-10">
                                                    <button onClick={() => { setEditingMessage(msg); setNewMessage(msg.text); }} className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-md">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => deleteMessageMutation.mutate(msg.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-slate-200 w-full relative">
                            {/* Attachment Preview Box */}
                            {(attachment.image_url || attachment.video_url) && (
                                <div className="absolute bottom-[80px] left-6 right-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-xl flex items-start gap-4 z-20">
                                    {attachment.image_url && <img src={attachment.image_url} alt="Attached" className="w-20 h-20 object-cover rounded-xl" />}
                                    {attachment.video_url && <video src={attachment.video_url} className="w-20 h-20 object-cover rounded-xl bg-slate-900" />}
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">Attachment Preview</p>
                                        <p className="text-xs text-slate-500">Ready to send</p>
                                    </div>
                                    <button onClick={() => setAttachment({ image_url: '', video_url: '' })} className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <label className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">
                                    <ImageIcon className="w-5 h-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'image')} />
                                </label>
                                <label className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">
                                    <Paperclip className="w-5 h-5" />
                                    <input type="file" className="hidden" accept="video/*" onChange={e => handleMediaUpload(e, 'video')} />
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2 rounded-xl transition-colors ${showEmojiPicker ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-full mb-4 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden scale-90 origin-bottom-left">
                                            <EmojiPicker onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)} />
                                        </div>
                                    )}
                                </div>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent px-3 text-sm font-medium outline-none text-slate-800"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={(!newMessage.trim() && !attachment.image_url && !attachment.video_url) || sendMessageMutation.isPending || editMessageMutation.isPending}
                                    className={`p-3 rounded-xl shadow-lg transition-colors ${editingMessage ? 'bg-emerald-600' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
                                >
                                    {editingMessage ? <Check className="w-5 h-5 text-white" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                            {editingMessage && (
                                <div className="mt-3 flex items-center justify-between px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-2">
                                        <Edit className="w-3 h-3 text-emerald-600" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Editing Message Mode</p>
                                    </div>
                                    <button onClick={() => { setEditingMessage(null); setNewMessage(""); }} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase">Cancel</button>
                                </div>
                            )}
                        </div>

                        {/* Image Lightbox Modal */}
                        <AnimatePresence>
                            {viewImage && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-10"
                                    onClick={() => setViewImage(null)}
                                >
                                    <button onClick={() => setViewImage(null)} className="absolute top-8 right-8 p-3 text-white/50 hover:text-white transition-colors">
                                        <X className="w-8 h-8" />
                                    </button>
                                    <motion.img
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        src={viewImage}
                                        alt="Full size"
                                        className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                                        <button
                                            onClick={() => handleDownload(viewImage, 'download.jpg')}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md flex items-center gap-2 font-bold text-sm transition-all"
                                        >
                                            <Download className="w-4 h-4" /> Download Original
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Send className="w-10 h-10 text-slate-300 ml-2" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-slate-800 mb-2">Your Messages</h3>
                        <p className="text-sm font-medium">Select a connected network node to start sharing frequencies.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;

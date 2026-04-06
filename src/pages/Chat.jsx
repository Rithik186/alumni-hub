import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Image as ImageIcon, FileText, Paperclip, 
    Check, CheckCheck, User, Circle, ArrowLeft, 
    Search, X, Smile, MoreVertical, Download, 
    Edit, Trash2, Info, Phone, Video, Loader2
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// UI Components
import FadeContent from '../components/animations/FadeContent';
import SpotlightCard from '../components/animations/SpotlightCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from '../components/ui/tooltip';

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
    const scrollRef = useRef(null);

    // Fetch contacts (connections)
    const { data: contacts = [], isLoading: contactsLoading } = useQuery({
        queryKey: ['chatContacts'],
        queryFn: async () => {
            const { data } = await axios.get('/api/chat/contacts', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            return data;
        }
    });

    // Auto select first contact if none selected
    useEffect(() => {
        if (contacts.length > 0 && !selectedContact) {
            setSelectedContact(contacts[0]);
        }
    }, [contacts]);

    // Fetch messages for selected contact
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
        refetchInterval: 3000 // Real-time polling substitute
    });

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessageMutation = useMutation({
        mutationFn: async (msgData) => axios.post('/api/chat/messages', msgData, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['chatMessages', selectedContact?.id]);
            setNewMessage('');
            setAttachment({ image_url: '', video_url: '' });
            setShowEmojiPicker(false);
        }
    });

    const editMessageMutation = useMutation({
        mutationFn: async ({ id, text }) => axios.put(`/api/chat/messages/${id}`, { text }, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['chatMessages', selectedContact?.id]);
            setEditingMessage(null);
            setNewMessage('');
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
    };

    const handleDownload = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!user) return null;

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            
            {/* Sidebar - Contacts List */}
            <div className="w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20">
                <div className="p-6 pb-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <ArrowLeft className="w-5 h-5 text-slate-500" />
                            </Link>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">Chats</h2>
                        </div>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold">
                            {contacts.length} Connections
                        </Badge>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search in messages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-slate-50 border-none rounded-xl text-sm font-medium focus-visible:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-2 py-2">
                        {contactsLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                        <div className="h-3 bg-slate-50 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))
                        ) : filteredContacts.map(contact => (
                            <SpotlightCard
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                spotlightColor="rgba(79, 70, 229, 0.05)"
                                className={`p-3 flex items-center gap-4 cursor-pointer transition-all rounded-2xl group border ${
                                    selectedContact?.id === contact.id 
                                    ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' 
                                    : 'bg-transparent border-transparent hover:bg-slate-50'
                                }`}
                            >
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={contact.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                            {contact.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                            {contact.name}
                                        </h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">12:45 PM</span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 truncate">{contact.role}</p>
                                </div>
                            </SpotlightCard>
                        ))}
                        {filteredContacts.length === 0 && !contactsLoading && (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    No matches found for "{search}"
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <FadeContent blur duration={400}>
                            <div className="h-20 border-b border-slate-100 flex items-center px-8 justify-between z-10 bg-white/80 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-11 w-11 shadow-sm ring-2 ring-slate-100 ring-offset-2">
                                        <AvatarImage src={selectedContact.avatar} />
                                        <AvatarFallback className="bg-slate-900 text-white">
                                            {selectedContact.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                                            {selectedContact.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 pt-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedContact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                {selectedContact.status === 'online' ? 'Available now' : 'Seen recently'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                                    <Phone className="w-5 h-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white font-bold text-[10px]">Start Voice Call</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                                    <Video className="w-5 h-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white font-bold text-[10px]">Start Video Session</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Separator orientation="vertical" className="h-6 mx-2" />
                                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-900">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </FadeContent>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col bg-slate-50/50"
                        >
                            {messagesLoading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                    <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Establishing secure link...</p>
                                </div>
                            ) : messages.map((msg, i) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <FadeContent key={msg.id} blur duration={400} delay={i % 5 * 50}>
                                        <div className={`flex group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <Avatar className={`h-8 w-8 mt-auto shadow-sm ${isMe ? 'ml-3' : 'mr-3'}`}>
                                                <AvatarImage src={isMe ? user.profile_picture : selectedContact.avatar} />
                                                <AvatarFallback className="bg-slate-200 text-[10px] font-bold">
                                                    {(isMe ? user.name : selectedContact.name).charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="relative max-w-[70%] flex flex-col group">
                                                <div className={`rounded-2xl px-5 py-3 shadow-sm transition-all ${
                                                    isMe 
                                                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-100 hover:bg-indigo-700' 
                                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm hover:border-slate-300'
                                                }`}>
                                                    {msg.image_url && (
                                                        <div className="relative group/img mb-2 cursor-pointer overflow-hidden rounded-xl" onClick={() => setViewImage(msg.image_url)}>
                                                            <img src={msg.image_url} alt="Shared" className="w-full max-w-[300px] object-cover transition-transform group-hover/img:scale-105" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); handleDownload(msg.image_url); }}>
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {msg.video_url && (
                                                        <div className="relative mb-2 rounded-xl overflow-hidden bg-slate-900">
                                                            <video src={msg.video_url} controls className="w-full max-w-[300px]" />
                                                        </div>
                                                    )}
                                                    {msg.text && <p className="text-[13px] font-medium leading-relaxed break-words">{msg.text}</p>}
                                                    
                                                    <div className={`text-[9px] mt-2 flex items-center gap-1.5 font-bold uppercase tracking-wider ${isMe ? 'text-indigo-200/80' : 'text-slate-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMe && <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-blue-300' : 'text-indigo-300/40'}`} />}
                                                    </div>
                                                </div>

                                                {/* Message Actions (Quick Menu) */}
                                                {isMe && (
                                                    <div className="absolute top-1/2 -left-14 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                        <div className="bg-white shadow-xl rounded-xl p-1 border border-slate-100 flex gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => { setEditingMessage(msg); setNewMessage(msg.text); }}>
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteMessageMutation.mutate(msg.id)}>
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </FadeContent>
                                );
                            })}
                        </div>

                        {/* Input Hub */}
                        <div className="px-8 py-6 bg-white border-t border-slate-100 w-full relative z-30">
                            
                            {/* Attachment Preview Overlay */}
                            <AnimatePresence>
                                {(attachment.image_url || attachment.video_url) && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-8 right-8 mb-4 p-4 bg-white border border-slate-200 rounded-3xl shadow-2xl flex items-center gap-4"
                                    >
                                        <div className="h-16 w-16 bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                                            {attachment.image_url && <img src={attachment.image_url} alt="Preview" className="h-full w-full object-cover" />}
                                            {attachment.video_url && <video src={attachment.video_url} className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">Attachment Ready</p>
                                            <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">{attachment.image_url ? 'Imaging Node' : 'Video Data'}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-rose-500 hover:bg-rose-50" onClick={() => setAttachment({ image_url: '', video_url: '' })}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-[24px] border border-slate-200 shadow-inner group focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300">
                                <div className="flex items-center pl-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <label className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all cursor-pointer">
                                                    <ImageIcon className="w-5 h-5" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'image')} />
                                                </label>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white font-bold text-[10px] mb-2">Share Captured Visual</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <label className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all cursor-pointer">
                                                    <Paperclip className="w-5 h-5" />
                                                    <input type="file" className="hidden" accept="video/*" onChange={e => handleMediaUpload(e, 'video')} />
                                                </label>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white font-bold text-[10px] mb-2">Attached Secure Files</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <div className="relative group/emoji">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2.5 h-10 w-10 rounded-2xl transition-all ${showEmojiPicker ? 'bg-indigo-100 text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Smile className="w-5 h-5" />
                                    </Button>
                                    <AnimatePresence>
                                        {showEmojiPicker && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                                animate={{ opacity: 1, scale: 1, y: -410 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                                className="absolute left-0 z-50 shadow-[0_20px_50px_rgba(79,70,229,0.3)] rounded-3xl overflow-hidden border border-slate-100"
                                            >
                                                <EmojiPicker 
                                                    onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <input
                                    autoFocus
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={editingMessage ? "Edit your thought..." : "Synchronize your thoughts..."}
                                    className="flex-1 bg-transparent px-2 text-sm font-bold outline-none text-slate-800 placeholder:text-slate-400 placeholder:font-semibold"
                                />

                                <Button
                                    onClick={handleSend}
                                    disabled={(!newMessage.trim() && !attachment.image_url && !attachment.video_url) || sendMessageMutation.isPending || editMessageMutation.isPending}
                                    className={`h-11 px-6 rounded-2xl shadow-xl transition-all active:scale-95 ${
                                        editingMessage 
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                    }`}
                                >
                                    {editingMessage ? (
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-xs uppercase tracking-widest">Update</span>
                                            <Check className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-xs uppercase tracking-widest">Send</span>
                                            <Send className="w-4 h-4" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                            
                            {editingMessage && (
                                <div className="mt-3 flex items-center justify-between px-6 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-2.5">
                                        <Edit className="w-3.5 h-3.5 text-emerald-600" />
                                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700 italic">Editing Secure Transmission Mode</p>
                                    </div>
                                    <Button variant="ghost" className="h-6 text-[10px] font-black text-slate-400 hover:text-rose-600 hover:bg-transparent uppercase tracking-wider" onClick={() => { setEditingMessage(null); setNewMessage(""); }}>
                                        Cancel Edit
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Lightbox Modal */}
                        <AnimatePresence>
                            {viewImage && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[1000] bg-slate-950/95 flex items-center justify-center p-6 backdrop-blur-xl"
                                    onClick={() => setViewImage(null)}
                                >
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-8 right-8 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl h-12 w-12"
                                        onClick={() => setViewImage(null)}
                                    >
                                        <X className="w-8 h-8" />
                                    </Button>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="relative group p-4 bg-white/5 rounded-3xl border border-white/10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <img
                                            src={viewImage}
                                            alt="Fullscreen"
                                            className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_0_100px_rgba(79,70,229,0.2)] object-contain transition-transform"
                                        />
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                            <Button
                                                onClick={() => handleDownload(viewImage)}
                                                className="h-12 px-8 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/10 font-bold text-sm shadow-2xl"
                                            >
                                                <Download className="w-4 h-4 mr-2" /> Download Original Node
                                            </Button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                        <SpotlightCard className="p-12 bg-white border border-slate-200 rounded-[40px] shadow-2xl max-w-sm flex flex-col items-center gap-6" spotlightColor="rgba(79, 70, 229, 0.08)">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-xl shadow-indigo-100 rotate-3">
                                <Send className="w-10 h-10 text-white ml-1 -mt-1 -rotate-12 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Neural Link Feed</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Select a node from your connection matrix to start a secure data stream.
                                </p>
                            </div>
                            <Button variant="outline" className="rounded-2xl border-slate-200 py-6 px-8 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-500">
                                Discovery Mode
                            </Button>
                        </SpotlightCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Image as ImageIcon, FileText, Paperclip, 
    Check, CheckCheck, User, Circle, ArrowLeft, 
    Search, X, Smile, MoreVertical, Download, 
    Edit, Trash2, Info, Phone, Video, Loader2, MessageSquare
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
    const emojiPickerRef = useRef(null);

    // Date grouping utility
    const groupMessagesByDate = (messages) => {
        if (!Array.isArray(messages)) return {};
        const groups = {};
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const formatHeaderDate = (dateStr) => {
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        
        if (dateStr === today) return 'Today';
        if (dateStr === yesterday) return 'Yesterday';
        return dateStr;
    };

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
        if (!contactsLoading && contacts.length > 0 && !selectedContact) {
            setSelectedContact(contacts[0]);
        }
    }, [contacts, contactsLoading, selectedContact]);

    // Handle clicking outside emoji picker
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

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
        
        const msgText = newMessage;
        const msgAttachment = { ...attachment };

        // Clear immediately for faster feel
        setNewMessage('');
        setAttachment({ image_url: '', video_url: '' });
        setShowEmojiPicker(false);

        if (editingMessage) {
            editMessageMutation.mutate({ id: editingMessage.id, text: msgText });
        } else {
            sendMessageMutation.mutate({
                receiverId: selectedContact.id,
                text: msgText,
                image_url: msgAttachment.image_url,
                video_url: msgAttachment.video_url
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
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
            
            {/* Sidebar - Contacts List */}
            <div className={`
                ${selectedContact ? 'hidden md:flex' : 'flex'} 
                w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20
            `}>
                <div className="p-4 md:p-6 pb-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <ArrowLeft className="w-5 h-5 text-slate-500" />
                            </Link>
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Chats</h2>
                        </div>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-[10px]">
                            {contacts.length} Connections
                        </Badge>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search messages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10 bg-white border border-slate-200 rounded-lg text-sm font-medium focus-visible:ring-indigo-100 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-3 md:px-4">
                    <div className="space-y-1.5 py-2">
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
                                className={`p-3 flex items-center gap-4 cursor-pointer transition-all rounded-xl group border ${
                                    selectedContact?.id === contact.id 
                                    ? 'bg-indigo-50 border-indigo-100 shadow-sm' 
                                    : 'bg-transparent border-transparent hover:bg-slate-50'
                                }`}
                            >
                                <div className="relative">
                                    <Avatar className="h-11 w-11 md:h-12 md:w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={contact.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                            {contact.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                            {contact.name}
                                        </h4>
                                        <span className="text-[9px] font-medium text-slate-400 uppercase">12:45 PM</span>
                                    </div>
                                    <p className="text-[11px] font-semibold text-slate-500 truncate">{contact.role}</p>
                                </div>
                            </SpotlightCard>
                        ))}
                        {filteredContacts.length === 0 && !contactsLoading && (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    No matches found
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className={`
                ${selectedContact ? 'flex' : 'hidden md:flex'} 
                flex-1 flex flex-col bg-white overflow-hidden h-full
            `}>
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <FadeContent blur duration={400}>
                            <div className="h-16 md:h-20 border-b border-slate-100 flex items-center px-4 md:px-8 justify-between z-10 bg-white/80 backdrop-blur-md">
                                <div className="flex items-center gap-3 md:gap-4">
                                    {/* Mobile Back Button */}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setSelectedContact(null)}
                                        className="md:hidden rounded-xl text-slate-500 hover:bg-slate-50"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>

                                    <Avatar className="h-9 w-9 md:h-11 md:w-11 shadow-sm ring-2 ring-slate-100 ring-offset-2">
                                        <AvatarImage src={selectedContact.avatar} />
                                        <AvatarFallback className="bg-slate-900 text-white">
                                            {selectedContact.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <h3 className="text-sm md:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
                                            {selectedContact.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 pt-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedContact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                            <p className="text-[9px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                {selectedContact.status === 'online' ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2">
                                    <div className="hidden sm:flex items-center gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                                        <Phone className="w-4 h-4 md:w-5 md:h-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 text-white font-bold text-[10px]">Start Voice Call</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                                        <Video className="w-4 h-4 md:w-5 md:h-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 text-white font-bold text-[10px]">Start Video Session</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Separator orientation="vertical" className="h-6 mx-2" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-900">
                                        <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </div>
                            </div>
                        </FadeContent>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col bg-slate-50/50"
                        >
                            {messagesLoading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                    <p className="text-xs font-semibold uppercase tracking-widest">Loading messages...</p>
                                </div>
                            ) : (
                                Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages], groupIndex) => (
                                    <div key={date} className="space-y-6">
                                        <div className="flex justify-center my-6 md:my-8">
                                            <div className="px-3 md:px-4 py-1.5 bg-slate-200/50 backdrop-blur-sm rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm border border-slate-100/50">
                                                {formatHeaderDate(date)}
                                            </div>
                                        </div>
                                        {dateMessages.map((msg, i) => {
                                            const isMe = msg.senderId === user.id;
                                            return (
                                                <FadeContent key={msg.id} blur duration={400} delay={i % 5 * 50}>
                                                    <div className={`flex group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <Avatar className={`h-6 w-6 md:h-8 md:w-8 mt-auto shadow-sm ${isMe ? 'ml-2 md:ml-3' : 'mr-2 md:mr-3'}`}>
                                                            <AvatarImage src={isMe ? user.profile_picture : selectedContact.avatar} />
                                                            <AvatarFallback className="bg-slate-200 text-[10px] font-bold">
                                                                {(isMe ? user.name : selectedContact.name).charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="relative max-w-[85%] md:max-w-[70%] flex flex-col group">
                                                            <div className={`rounded-2xl px-4 md:px-5 py-2.5 md:py-3 shadow-sm transition-all ${
                                                                isMe 
                                                                ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-100 hover:bg-indigo-700' 
                                                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm hover:border-slate-300'
                                                            }`}>
                                                                {msg.image_url && (
                                                                    <div className="relative group/img mb-2 cursor-pointer overflow-hidden rounded-xl" onClick={() => setViewImage(msg.image_url)}>
                                                                        <img src={msg.image_url} alt="Shared" className="w-full max-w-full md:max-w-[300px] object-cover transition-transform group-hover/img:scale-105" />
                                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); handleDownload(msg.image_url); }}>
                                                                                <Download className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {msg.video_url && (
                                                                    <div className="relative mb-2 rounded-xl overflow-hidden bg-slate-900">
                                                                        <video src={msg.video_url} controls className="w-full max-w-full md:max-w-[300px]" />
                                                                    </div>
                                                                )}
                                                                {msg.text && <p className="text-[12px] md:text-[13px] font-medium leading-relaxed break-words">{msg.text}</p>}
                                                                
                                                                <div className={`text-[8px] md:text-[9px] mt-2 flex items-center justify-between gap-1.5 font-bold uppercase tracking-wider ${isMe ? 'text-indigo-200/80' : 'text-slate-400'}`}>
                                                                    <div className="flex items-center gap-1.5 italic opacity-70">
                                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                    {isMe && <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-blue-300' : 'text-indigo-300/40'}`} />}
                                                                </div>
                                                            </div>

                                                            {/* Message Actions (Quick Menu) */}
                                                            {isMe && (
                                                                <div className={`absolute top-1/2 ${isMe ? '-left-12' : '-right-12'} -translate-y-1/2 hidden md:flex items-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100`}>
                                                                    <div className="bg-white shadow-xl rounded-xl p-1 border border-slate-100 flex gap-1">
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => { setEditingMessage(msg); setNewMessage(msg.text); }}>
                                                                            <Edit className="w-3 h-3" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteMessageMutation.mutate(msg.id)}>
                                                                            <Trash2 className="w-3 h-3" />
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
                                ))
                            )}
                        </div>

                        {/* Input Hub */}
                        <div className="px-4 md:px-8 py-4 md:py-6 bg-white border-t border-slate-100 w-full relative z-30">
                            
                             {/* Attachment Preview Overlay (WhatsApp Style) */}
                            <AnimatePresence>
                                {(attachment.image_url || attachment.video_url) && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-[100%] left-4 right-4 md:left-8 md:right-8 mb-4 md:mb-6 bg-white p-4 md:p-6 border border-slate-200 rounded-[24px] md:rounded-[32px] shadow-2xl z-[50] flex flex-col gap-4 md:gap-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Media Preview</h4>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all" onClick={() => setAttachment({ image_url: '', video_url: '' })}>
                                                <X className="w-4 h-4 md:w-5 md:h-5" />
                                            </Button>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <div className="w-full max-h-[250px] md:max-h-[300px] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-slate-900">
                                                {attachment.image_url && <img src={attachment.image_url} alt="Preview" className="max-h-[250px] md:max-h-[300px] w-auto object-contain" />}
                                                {attachment.video_url && <video src={attachment.video_url} controls className="max-h-[250px] md:max-h-[300px] w-auto" />}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 md:gap-3 bg-slate-50 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-slate-200 shadow-inner group focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300">
                                            <div className="p-2 md:p-3 text-slate-400">
                                                <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                placeholder="Add a caption..."
                                                className="flex-1 bg-transparent px-1 text-xs md:text-sm font-bold outline-none text-slate-800 placeholder:text-slate-400"
                                            />
                                            <Button
                                                onClick={handleSend}
                                                disabled={sendMessageMutation.isPending}
                                                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-90"
                                            >
                                                <Send className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-xl border border-slate-200 shadow-sm group focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                <div className="flex items-center gap-1 md:gap-3">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <label className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-all cursor-pointer">
                                                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, 'image')} />
                                                </label>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white font-bold text-[10px] mb-2">Share Captured Visual</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <label className="hidden sm:block p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-all cursor-pointer">
                                                    <Paperclip className="w-5 h-5" />
                                                    <input type="file" className="hidden" accept="video/*" onChange={e => handleMediaUpload(e, 'video')} />
                                                </label>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white font-bold text-[10px] mb-2">Attached Secure Files</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <div className="relative" ref={emojiPickerRef}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`h-7 w-7 md:h-8 md:w-8 rounded-lg transition-all ${showEmojiPicker ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Smile className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                    <AnimatePresence>
                                        {showEmojiPicker && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                                animate={{ opacity: 1, scale: 1, y: -410 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                                className="absolute left-0 z-50 shadow-[0_20px_50px_rgba(79,70,229,0.3)] rounded-2xl overflow-hidden border border-slate-100 scale-75 origin-bottom-left md:scale-100"
                                            >
                                                <EmojiPicker 
                                                    onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                                    className="flex-1 bg-transparent px-1 text-xs md:text-sm font-medium outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
                                />

                                <Button
                                    onClick={handleSend}
                                    disabled={(!newMessage.trim() && !attachment.image_url && !attachment.video_url) || sendMessageMutation.isPending || editMessageMutation.isPending}
                                    className={`h-9 w-9 md:h-11 md:w-11 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center shrink-0 ${
                                        editingMessage 
                                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                    } text-white border-none`}
                                    title={editingMessage ? 'Update' : 'Send'}
                                >
                                    {editingMessage ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Send className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />}
                                </Button>
                            </div>
                            
                            {editingMessage && (
                                <div className="mt-2 text-center">
                                    <button className="text-[9px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest" onClick={() => { setEditingMessage(null); setNewMessage(""); }}>
                                        Cancel Editing
                                    </button>
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
                                    className="fixed inset-0 z-[1000] bg-slate-950/95 flex items-center justify-center p-4 md:p-6 backdrop-blur-xl"
                                    onClick={() => setViewImage(null)}
                                >
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white hover:bg-white/10 rounded-xl h-10 w-10 md:h-12 md:w-12"
                                        onClick={() => setViewImage(null)}
                                    >
                                        <X className="w-6 h-6 md:w-8 md:h-8" />
                                    </Button>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="relative group p-2 md:p-4 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <img
                                            src={viewImage}
                                            alt="Fullscreen"
                                            className="max-w-full max-h-[80vh] rounded-xl md:rounded-2xl shadow-[0_0_100px_rgba(79,70,229,0.2)] object-contain transition-transform"
                                        />
                                        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2">
                                            <Button
                                                onClick={() => handleDownload(viewImage)}
                                                className="h-10 md:h-12 px-6 md:px-8 bg-white/10 hover:bg-white/20 text-white rounded-xl md:rounded-2xl backdrop-blur-xl border border-white/10 font-bold text-xs md:text-sm shadow-2xl"
                                            >
                                                <Download className="w-4 h-4 mr-2" /> Download
                                            </Button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-2">Your Messages</h3>
                        <p className="text-xs md:text-sm font-medium text-slate-400 max-w-xs leading-relaxed">
                            Select a connection from the left to start a conversation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;

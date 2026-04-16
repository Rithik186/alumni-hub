import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Image as ImageIcon, FileText, Paperclip, 
    Check, CheckCheck, User, Circle, ArrowLeft, 
    Search, X, Smile, MoreVertical, Download, 
    Edit, Trash2, Info, Phone, Video, Loader2, MessageSquare,
    Mic, Square, Play, Pause
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import MediaCall from '../components/chat/MediaCall';
import { initiateSocket, disconnectSocket, getSocket } from '../services/socket';
import toast from 'react-hot-toast';

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

// ─── Voice Recorder Hook ──────────────────────────────────────────────────────
const useVoiceRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
            toast.error('Microphone access denied');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        clearInterval(timerRef.current);
    }, []);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setAudioBlob(null);
        setRecordingTime(0);
        clearInterval(timerRef.current);
    }, []);

    const clearAudio = useCallback(() => {
        setAudioBlob(null);
        setRecordingTime(0);
    }, []);

    return { isRecording, recordingTime, audioBlob, startRecording, stopRecording, cancelRecording, clearAudio };
};

// ─── Audio Player Component ───────────────────────────────────────────────────
const AudioPlayer = ({ src, isMe }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 min-w-[180px] md:min-w-[220px]">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={() => {
                    if (audioRef.current) {
                        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
                    }
                }}
                onLoadedMetadata={() => {
                    if (audioRef.current) setDuration(audioRef.current.duration);
                }}
                onEnded={() => { setIsPlaying(false); setProgress(0); }}
            />
            <button
                onClick={togglePlay}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isMe 
                        ? 'bg-white/20 hover:bg-white/30 text-white' 
                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
                }`}
            >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
                <div className={`h-1.5 rounded-full overflow-hidden ${isMe ? 'bg-white/20' : 'bg-slate-200'}`}>
                    <div
                        className={`h-full rounded-full transition-all ${isMe ? 'bg-white/70' : 'bg-indigo-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className={`text-[9px] mt-1 font-bold ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {duration ? formatTime(duration) : '0:00'}
                </p>
            </div>
        </div>
    );
};

// ─── Tick Component ────────────────────────────────────────────────────────────
const MessageTick = ({ status }) => {
    if (status === 'read') {
        return <CheckCheck className="w-3.5 h-3.5 text-sky-300" />;
    }
    if (status === 'delivered') {
        return <CheckCheck className="w-3.5 h-3.5 text-indigo-300/60" />;
    }
    // 'sent' or default
    return <Check className="w-3.5 h-3.5 text-indigo-300/50" />;
};


const Chat = () => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState("");
    const [attachment, setAttachment] = useState({ image_url: '', video_url: '', preview_url: '' });
    const [selectedContact, setSelectedContact] = useState(null);
    const [search, setSearch] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [viewImage, setViewImage] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const scrollRef = useRef(null);
    const emojiPickerRef = useRef(null);

    const voiceRecorder = useVoiceRecorder();

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
        staleTime: 60 * 1000, // Socket.IO handles real-time — only refetch on mount
    });

    const socketRef = useRef(null);

    // Initialize Socket + Online presence
    useEffect(() => {
        if (user && user.id && !socketRef.current) {
            const socket = initiateSocket(user.id);
            socketRef.current = socket;

            const handleRegistration = () => {
                socket.emit('register', user.id);
            };

            if (socket.connected) handleRegistration();
            socket.on('connect', handleRegistration);

            // Online presence
            socket.on('online-users', (ids) => {
                setOnlineUsers(ids.map(id => id.toString()));
            });

            // Real-time incoming messages
            socket.on('receive-message', (message) => {
                queryClient.setQueryData(['chatMessages', message.senderId], (old) => {
                    if (!Array.isArray(old)) return [message];
                    return [...old, message];
                });
                // Mark as delivered immediately
                axios.put(`/api/chat/messages/deliver/${message.senderId}`, {}, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }).then(() => {
                    socket.emit('message-delivered', { to: message.senderId.toString(), senderId: user.id });
                }).catch(() => {});
            });

            // When our sent messages get delivered
            socket.on('messages-delivered', ({ by }) => {
                queryClient.setQueryData(['chatMessages', parseInt(by)], (old) => {
                    if (!Array.isArray(old)) return old;
                    return old.map(m => m.senderId === user.id && m.status === 'sent' ? { ...m, status: 'delivered' } : m);
                });
            });

            // When our sent messages get read
            socket.on('messages-read', ({ by }) => {
                queryClient.setQueryData(['chatMessages', parseInt(by)], (old) => {
                    if (!Array.isArray(old)) return old;
                    return old.map(m => m.senderId === user.id ? { ...m, status: 'read' } : m);
                });
            });

            socket.on('incoming-call', (data) => {
                setActiveCall(prev => {
                    if (prev) return prev;
                    return { type: 'video', contact: contacts?.find(c => c.id.toString() === data.from.toString()) || null, incomingData: data };
                });
            });

            socket.on('call-ended', () => {
                setActiveCall(null);
            });
        }

        return () => {};
    }, [user?.id, contacts]);

    // Mark as read when viewing messages from a contact
    useEffect(() => {
        if (selectedContact && messages.length > 0 && user) {
            const hasUnread = messages.some(m => m.senderId === selectedContact.id && m.status !== 'read');
            if (hasUnread) {
                axios.put(`/api/chat/messages/read/${selectedContact.id}`, {}, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }).then(() => {
                    const socket = getSocket();
                    if (socket) {
                        socket.emit('message-read', { to: selectedContact.id.toString(), senderId: user.id });
                    }
                    // Update local cache
                    queryClient.setQueryData(['chatMessages', selectedContact.id], (old) => {
                        if (!Array.isArray(old)) return old;
                        return old.map(m => m.senderId === selectedContact.id ? { ...m, status: 'read' } : m);
                    });
                }).catch(() => {});
            }
        }
    }, [selectedContact?.id, messages]);

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
        onMutate: async (newMsg) => {
            await queryClient.cancelQueries(['chatMessages', selectedContact?.id]);
            const previousMessages = queryClient.getQueryData(['chatMessages', selectedContact?.id]);
            
            const optimisticMsg = {
                id: Date.now(),
                senderId: user.id,
                receiverId: selectedContact.id,
                text: newMsg.text,
                image_url: newMsg.image_url,
                video_url: newMsg.video_url,
                audio_url: newMsg.audio_url,
                timestamp: new Date().toISOString(),
                status: 'sent',
                is_optimistic: true
            };

            queryClient.setQueryData(['chatMessages', selectedContact?.id], old => [...(old || []), optimisticMsg]);
            return { previousMessages };
        },
        onError: (err, newMsg, context) => {
            queryClient.setQueryData(['chatMessages', selectedContact?.id], context.previousMessages);
        },
        onSuccess: (data) => {
            const serverMsg = data.data;
            queryClient.setQueryData(['chatMessages', selectedContact?.id], (old) => {
                if (!Array.isArray(old)) return [serverMsg];
                return old.filter(m => !m.is_optimistic).concat(serverMsg);
            });
            // Emit via socket for real-time delivery
            const socket = getSocket();
            if (socket) {
                socket.emit('new-message', { to: selectedContact.id.toString(), message: serverMsg });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedContact?.id], refetchType: 'none' });
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

        const localUrl = URL.createObjectURL(file);
        // Set PREVIEW URL for UI, but keep image_url empty until upload finishes
        if (type === 'image') setAttachment(prev => ({ ...prev, preview_url: localUrl, image_url: '', video_url: '' }));
        else setAttachment(prev => ({ ...prev, preview_url: localUrl, video_url: '', image_url: '' }));

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await axios.post('/api/upload/media', formData, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });


            
            // Set the REAL Cloudinary URL
            setAttachment(prev => {
                const updated = { ...prev };
                if (type === 'image') {
                    updated.image_url = data.url;
                } else {
                    updated.video_url = data.url;
                }
                return updated;
            });
        } catch (err) {
            console.error('Upload Error:', err);
            toast.error('Failed to upload file');
            setAttachment({ image_url: '', video_url: '', preview_url: '' });
        } finally {
            setIsUploading(false);
        }
    };


    const handleSendVoice = async () => {
        if (!voiceRecorder.audioBlob || !selectedContact) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', voiceRecorder.audioBlob, 'voice_message.webm');
            const { data } = await axios.post('/api/upload/media', formData, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            sendMessageMutation.mutate({
                receiverId: selectedContact.id,
                text: '',
                audio_url: data.url,
            });
            voiceRecorder.clearAudio();
        } catch (err) {
            console.error('Voice upload error:', err);
            toast.error('Failed to send voice message');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSend = async () => {
        if (!selectedContact) return;
        if (isUploading) return toast.error('Wait for upload to finish');

        const msgText = newMessage.trim();
        const msgImage = attachment.image_url;
        const msgVideo = attachment.video_url;

        // Final Safety Check: Never send a blob URL to the database
        if (msgImage?.startsWith('blob:') || msgVideo?.startsWith('blob:')) {
            return toast.error('Upload still in progress...');
        }

        if (!msgText && !msgImage && !msgVideo) return;

        setNewMessage('');
        setAttachment({ image_url: '', video_url: '', preview_url: '' });
        setShowEmojiPicker(false);

        if (editingMessage) {
            editMessageMutation.mutate({ id: editingMessage.id, text: msgText });
        } else {
            sendMessageMutation.mutate({
                receiverId: selectedContact.id,
                text: msgText,
                image_url: msgImage,
                video_url: msgVideo
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

    // Enrich contacts with online status
    const enrichedContacts = filteredContacts.map(c => ({
        ...c,
        status: onlineUsers.includes(c.id.toString()) ? 'online' : 'offline'
    }));

    const selectedContactOnline = selectedContact ? onlineUsers.includes(selectedContact.id.toString()) : false;

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
                        ) : enrichedContacts.map(contact => (
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
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white transition-colors ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                            {contact.name}
                                        </h4>
                                        {contact.status === 'online' && (
                                            <span className="text-[9px] font-bold text-emerald-500 uppercase">Online</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] font-semibold text-slate-500 truncate">{contact.role}</p>
                                </div>
                            </SpotlightCard>
                        ))}
                        {enrichedContacts.length === 0 && !contactsLoading && (
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
                                            <div className={`w-2 h-2 rounded-full transition-colors ${selectedContactOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                            <p className={`text-[9px] md:text-[11px] font-bold uppercase tracking-wider ${selectedContactOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {selectedContactOnline ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2">
                                    <div className="hidden sm:flex items-center gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                        onClick={() => setActiveCall({ type: 'voice', contact: selectedContact })}
                                                    >
                                                        <Phone className="w-4 h-4 md:w-5 md:h-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 text-white font-bold text-[10px]">Start Voice Call</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                        onClick={() => setActiveCall({ type: 'video', contact: selectedContact })}
                                                    >
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
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading messages...</p>
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
                                                                {msg.is_optimistic && (
                                                                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                                                                        <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                                                                    </div>
                                                                )}
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
                                                                {msg.audio_url && (
                                                                    <div className="mb-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <Mic className={`w-3.5 h-3.5 ${isMe ? 'text-indigo-200' : 'text-indigo-400'}`} />
                                                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>Voice Message</span>
                                                                        </div>
                                                                        <AudioPlayer src={msg.audio_url} isMe={isMe} />
                                                                    </div>
                                                                )}
                                                                {msg.text && <p className="text-[12px] md:text-[13px] font-medium leading-relaxed break-words">{msg.text}</p>}
                                                                
                                                                <div className={`text-[8px] md:text-[9px] mt-2 flex items-center justify-between gap-1.5 font-bold uppercase tracking-wider ${isMe ? 'text-indigo-200/80' : 'text-slate-400'}`}>
                                                                    <div className="flex items-center gap-1.5 italic opacity-70">
                                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                    {isMe && <MessageTick status={msg.status || 'sent'} />}
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
                        <div className="px-4 md:px-8 py-4 bg-white border-t border-slate-100 w-full relative z-30">
                            {/* Attachment Preview Overlay */}
                            <AnimatePresence>
                                {attachment.preview_url && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-[100%] left-4 right-4 md:left-8 md:right-8 mb-4 bg-white p-3 border border-slate-200 rounded-2xl shadow-2xl z-[50]"
                                    >
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                {isUploading ? 'Uploading to Server...' : 'Media Preview'}
                                            </span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-rose-50 hover:text-rose-500 rounded-full" onClick={() => setAttachment({ image_url: '', video_url: '', preview_url: '' })}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 max-h-[180px] flex justify-center">
                                            {attachment.preview_url && <img src={attachment.preview_url} alt="To send" className={`max-h-[180px] object-contain transition-opacity ${isUploading ? 'opacity-40' : 'opacity-100'}`} />}
                                            {isUploading && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Voice Recording Preview */}
                            <AnimatePresence>
                                {voiceRecorder.audioBlob && !voiceRecorder.isRecording && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-[100%] left-4 right-4 md:left-8 md:right-8 mb-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-2xl z-[50]"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <Mic className="w-3.5 h-3.5 text-indigo-500" /> Voice Message Preview
                                            </span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-rose-50 hover:text-rose-500 rounded-full" onClick={voiceRecorder.clearAudio}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <AudioPlayer src={URL.createObjectURL(voiceRecorder.audioBlob)} isMe={false} />
                                            <Button
                                                onClick={handleSendVoice}
                                                disabled={isUploading}
                                                className="h-11 w-11 !p-0 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-90 shrink-0"
                                            >
                                                {isUploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Send className="w-7 h-7" />}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Voice Recording Active Bar */}
                            <AnimatePresence>
                                {voiceRecorder.isRecording && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex items-center gap-3 bg-rose-50 p-3 rounded-2xl border border-rose-200 mb-3"
                                    >
                                        <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                                        <span className="text-sm font-bold text-rose-600 flex-1">
                                            Recording... {Math.floor(voiceRecorder.recordingTime / 60)}:{(voiceRecorder.recordingTime % 60).toString().padStart(2, '0')}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={voiceRecorder.cancelRecording}
                                            className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={voiceRecorder.stopRecording}
                                            className="h-9 w-9 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition-all flex items-center justify-center active:scale-90"
                                        >
                                            <Square className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!voiceRecorder.isRecording && (
                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 group focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center">
                                                        <label className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer">
                                                            <Paperclip className="w-5 h-5" />
                                                            <input type="file" className="hidden" accept="image/*,video/*" onChange={e => {
                                                                const file = e.target.files[0];
                                                                if (file?.type.startsWith('image/')) handleMediaUpload(e, 'image');
                                                                else handleMediaUpload(e, 'video');
                                                            }} />
                                                        </label>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 text-white font-bold text-[10px] mb-2">Attach Media</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={`h-9 w-9 rounded-xl transition-all ${showEmojiPicker ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                        >
                                            <Smile className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isUploading && handleSend()}
                                        placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                                        className="flex-1 bg-transparent px-1 text-sm font-medium outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
                                    />

                                    {/* Voice record button (only show when input is empty) */}
                                    {!newMessage.trim() && !editingMessage && !attachment.preview_url ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        onClick={voiceRecorder.startRecording}
                                                        className="h-11 w-11 !p-0 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center shrink-0"
                                                    >
                                                        <Mic className="w-7 h-7" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 text-white font-bold text-[10px] mb-2">Record Voice Message</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        <Button
                                            onClick={handleSend}
                                            disabled={(!newMessage.trim() && !attachment.image_url && !attachment.video_url) || sendMessageMutation.isPending || isUploading}
                                            className={`h-11 w-11 !p-0 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center shrink-0 ${
                                                editingMessage 
                                                ? 'bg-emerald-600 hover:bg-emerald-700' 
                                                : 'bg-indigo-600 hover:bg-indigo-700'
                                            } text-white border-none`}
                                        >
                                            {isUploading || sendMessageMutation.isPending ? (
                                                <Loader2 className="w-7 h-7 animate-spin" />
                                            ) : (
                                                editingMessage ? <Check className="w-7 h-7" /> : <Send className="w-7 h-7" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )}

                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-[100%] left-4 z-50 mb-4" ref={emojiPickerRef}>
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="shadow-2xl rounded-2xl overflow-hidden border border-slate-100"
                                        >
                                            <EmojiPicker 
                                                onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)}
                                                width={320}
                                                height={400}
                                            />
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                            
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

            {/* Media Call Interface Overlay */}
            <AnimatePresence>
                {activeCall && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <MediaCall 
                            user={user} 
                            selectedContact={activeCall.contact} 
                            incomingCallData={activeCall.incomingData}
                            onEndCall={(callDetails) => {
                                setActiveCall(null);
                                if (callDetails && callDetails.duration > 0 && selectedContact) {
                                    const minutes = Math.floor(callDetails.duration / 60);
                                    const seconds = callDetails.duration % 60;
                                    const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                                    
                                    sendMessageMutation.mutate({
                                        text: `📞 Video Call ended - Duration: ${durationStr}`,
                                    });
                                }
                            }} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chat;

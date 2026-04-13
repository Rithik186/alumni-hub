import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { getSocket } from '../../services/socket';
import { 
    Phone, PhoneOff, Video, VideoOff, 
    Mic, MicOff, Maximize2, Minimize2, 
    X, User, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

const MediaCall = ({ user, selectedContact, incomingCallData, onEndCall }) => {
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(!!incomingCallData);
    const [caller, setCaller] = useState(incomingCallData?.from || "");
    const [callerSignal, setCallerSignal] = useState(incomingCallData?.signal || null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState(incomingCallData?.name || "");
    const [isCalling, setIsCalling] = useState(!incomingCallData);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isMicEnabled, setIsMicEnabled] = useState(true);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const socket = useRef(getSocket());

    useEffect(() => {
        if (!socket.current) return;

        const handleCallEnded = () => {
            setCallEnded(true);
            if (connectionRef.current) connectionRef.current.destroy();
            onEndCall();
        };

        const handleIncomingCall = (data) => {
            if (!receivingCall && !callAccepted) {
                setReceivingCall(true);
                setCaller(data.from);
                setName(data.name);
                setCallerSignal(data.signal);
            }
        };

        socket.current.on('incoming-call', handleIncomingCall);
        socket.current.on('call-ended', handleCallEnded);

        return () => {
            socket.current.off('incoming-call', handleIncomingCall);
            socket.current.off('call-ended', handleCallEnded);
        };
    }, [receivingCall, callAccepted]);

    const startStream = async (video = true) => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: video,
                audio: true
            });
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (err) {
            console.error("Failed to get stream:", err);
            return null;
        }
    };

    const callUser = async (id) => {
        if (!id) return;
        console.log("--- CALL DEBUG: Initiating call to UID:", id);
        setIsCalling(true);
        const currentStream = await startStream();
        if (!currentStream) {
            console.error("--- CALL DEBUG: Could not get media stream");
            return;
        }

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: currentStream,
            config: STUN_SERVERS
        });

        peer.on('signal', (data) => {
            console.log("--- CALL DEBUG: Signal generated, sending to server for UID:", id);
            socket.current.emit('call-user', {
                userToCall: id,
                signalData: data,
                from: user.id,
                name: user.name
            });
        });

        peer.on('stream', (userStream) => {
            console.log("--- CALL DEBUG: Remote stream received");
            if (userVideo.current) {
                userVideo.current.srcObject = userStream;
            }
        });

        socket.current.on('call-accepted', (signal) => {
            console.log("--- CALL DEBUG: Call accepted by recipient");
            setCallAccepted(true);
            setIsCalling(false);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = async () => {
        setCallAccepted(true);
        setReceivingCall(false);
        const currentStream = await startStream();
        if (!currentStream) return;

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: currentStream,
            config: STUN_SERVERS
        });

        peer.on('signal', (data) => {
            socket.current.emit('answer-call', { signal: data, to: caller });
        });

        peer.on('stream', (userStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = userStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        socket.current.emit('end-call', { to: callAccepted ? (caller || selectedContact?.id) : (caller || selectedContact?.id) });
        if (connectionRef.current) connectionRef.current.destroy();
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onEndCall();
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicEnabled(audioTrack.enabled);
            }
        }
    };

    // Auto-call if selectedContact is provided and we are not receiving/answering
    useEffect(() => {
        if (selectedContact && !incomingCallData && !receivingCall && !callAccepted && !isCalling) {
            callUser(selectedContact.id);
        }
    }, [selectedContact, incomingCallData]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl">
            <div className="relative w-full max-w-4xl aspect-video bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-slate-900/50 to-transparent">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white/20">
                            <AvatarImage src={selectedContact?.avatar} />
                            <AvatarFallback className="bg-indigo-600 text-white font-bold">
                                {selectedContact?.name?.charAt(0) || name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-white font-bold text-lg">{selectedContact?.name || name}</h3>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest leading-none mt-1">
                                {callAccepted ? 'In Call' : isCalling ? 'Calling...' : receivingCall ? 'Incoming Call' : 'Connecting...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 relative flex items-center justify-center bg-slate-950">
                    {/* User Video (Large) */}
                    {callAccepted && !callEnded ? (
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-6">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }} 
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-32 h-32 rounded-full bg-indigo-600/20 flex items-center justify-center border-4 border-indigo-600/30"
                            >
                                <User className="w-16 h-16 text-indigo-400" />
                            </motion.div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">{selectedContact?.name || name}</h2>
                                <p className="text-slate-400 font-medium">
                                    {isCalling ? 'Waiting for answer...' : 'Waiting for connection...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* My Video (Small Overlay) */}
                    {stream && (
                        <div className="absolute bottom-6 right-6 w-48 md:w-64 aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 z-20">
                            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover mirror" />
                            {!isVideoEnabled && (
                                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                    <VideoOff className="w-8 h-8 text-slate-600" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-8 flex items-center justify-center gap-4 md:gap-8 bg-slate-900/50">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleMic}
                        className={`h-14 w-14 rounded-full transition-all ${isMicEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                    >
                        {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleVideo}
                        className={`h-14 w-14 rounded-full transition-all ${isVideoEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                    >
                        {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={leaveCall}
                        className="h-16 w-16 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-900/20 active:scale-90 transition-all"
                    >
                        <PhoneOff className="w-8 h-8" />
                    </Button>

                    {receivingCall && !callAccepted && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={answerCall}
                            className="h-16 w-16 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 animate-bounce transition-all"
                        >
                            <Phone className="w-8 h-8" />
                        </Button>
                    )}
                </div>
            </div>

            <style>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
};

export default MediaCall;

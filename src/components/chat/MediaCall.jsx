import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { getSocket } from '../../services/socket';
import { 
    Phone, PhoneOff, Video, VideoOff, 
    Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2, 
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
    const [isSwapped, setIsSwapped] = useState(false);
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(!!incomingCallData);
    const [caller, setCaller] = useState(incomingCallData?.from || "");
    const [callerSignal, setCallerSignal] = useState(incomingCallData?.signal || null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState(incomingCallData?.name || "");
    const [isCalling, setIsCalling] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const socket = useRef(getSocket());

    useEffect(() => {
        const liveSocket = getSocket();
        if (!liveSocket) return;

        const handleCallEnded = () => {
            console.warn("!!! CALL SYSTEM: REMOTE PEER ENDED CALL.");
            setCallEnded(true);
            if (connectionRef.current) connectionRef.current.destroy();
            onEndCall();
        };

        const handleIncomingCall = (data) => {
            console.warn("!!! CALL SYSTEM: ADDITIONAL SIGNAL RECEIVED.");
            if (!receivingCall && !callAccepted) {
                setReceivingCall(true);
                setCaller(data.from);
                setName(data.name);
                setCallerSignal(data.signal);
            } else if (connectionRef.current) {
                // If call is already active/ringing, pass subsequent trickle signals to the peer
                connectionRef.current.signal(data.signal);
            }
        };

        const handleCallAccepted = (signal) => {
            console.warn("!!! CALL SYSTEM: RECIPIENT ACCEPTED/UPDATED SIGNAL.");
            if (!callAccepted) {
                setCallAccepted(true);
                setIsCalling(false);
            }
            if (connectionRef.current) {
                connectionRef.current.signal(signal);
            }
        };

        liveSocket.on('incoming-call', handleIncomingCall);
        liveSocket.on('call-accepted', handleCallAccepted);
        liveSocket.on('call-ended', handleCallEnded);

        return () => {
            liveSocket.off('incoming-call', handleIncomingCall);
            liveSocket.off('call-accepted', handleCallAccepted);
            liveSocket.off('call-ended', handleCallEnded);
        };
    }, [receivingCall, callAccepted]);

    const startStream = async (video = true) => {
        try {
            console.warn("!!! CALL SYSTEM: REQUESTING MEDIA PERMISSIONS...");
            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: video,
                audio: true
            });
            console.warn("!!! CALL SYSTEM: MEDIA STREAM ACQUIRED.");
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (err) {
            console.error("!!! CALL SYSTEM: FAILED TO GET MEDIA STREAM:", err);
            alert("CAMERA/MIC ERROR: " + err.message + "\nPlease allow permissions.");
            return null;
        }
    };

    const callUser = async (id) => {
        if (!id) return;
        const liveSocket = getSocket();
        if (!liveSocket) {
            alert("SOCKET ERROR: Not connected to server!");
            return;
        }

        console.warn("!!! CALL SYSTEM: INITIATING CALL TO UID:", id);
        setIsCalling(true);
        const currentStream = await startStream();
        if (!currentStream) return;

        const peer = new Peer({
            initiator: true,
            trickle: true,
            stream: currentStream,
            config: STUN_SERVERS
        });

        console.warn("!!! CALL SYSTEM: PEER OBJECT CREATED. WAITING FOR SIGNAL...");

        peer.on('signal', (data) => {
            console.warn("!!! CALL SYSTEM: WEB-RTC SIGNAL GENERATED. EMITTING TO SERVER...");
            liveSocket.emit('call-user', {
                userToCall: id,
                signalData: data,
                from: user.id,
                name: user.name
            });
        });

        peer.on('error', (err) => {
            console.error("!!! CALL SYSTEM: PEER ERROR (INITIATOR):", err);
            alert("WebRTC Connection Error: " + err.code);
            leaveCall();
        });

        peer.on('stream', (userStream) => {
            console.warn("!!! CALL SYSTEM: REMOTE STREAM ATTACHED.");
            if (userVideo.current) {
                userVideo.current.srcObject = userStream;
            }
        });

        connectionRef.current = peer;
    };

    const answerCall = async () => {
        const liveSocket = getSocket();
        console.warn("!!! CALL SYSTEM: ANSWERING CALL...");
        setCallAccepted(true);
        setReceivingCall(false);
        const currentStream = await startStream();
        if (!currentStream) return;

        const peer = new Peer({
            initiator: false,
            trickle: true,
            stream: currentStream,
            config: STUN_SERVERS
        });

        peer.on('signal', (data) => {
            console.warn("!!! CALL SYSTEM: ANSWER SIGNAL GENERATED. SENDING TO CALLER...");
            liveSocket.emit('answer-call', { signal: data, to: caller });
        });

        peer.on('error', (err) => {
            console.error("!!! CALL SYSTEM: PEER ERROR (RECIPIENT):", err);
            alert("Call Connection Failed: " + err.code);
            leaveCall();
        });

        peer.on('stream', (userStream) => {
            console.warn("!!! CALL SYSTEM: REMOTE STREAM ATTACHED (RECIPIENT).");
            if (userVideo.current) {
                userVideo.current.srcObject = userStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        const liveSocket = getSocket();
        console.warn("!!! CALL SYSTEM: ENDING CALL.");
        setCallEnded(true);
        if (liveSocket) {
            liveSocket.emit('end-call', { to: callAccepted ? (caller || selectedContact?.id) : (caller || selectedContact?.id) });
        }
        if (connectionRef.current) connectionRef.current.destroy();
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onEndCall({ duration: callDuration, timestamp: new Date().toISOString() });
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

    const hasCalledRef = useRef(false);

    const toggleSpeaker = () => {
        if (userVideo.current) {
            userVideo.current.muted = !userVideo.current.muted;
            setIsSpeakerOn(!userVideo.current.muted);
        }
    };

    // Timer effect
    useEffect(() => {
        let timer;
        if (callAccepted && !callEnded) {
            timer = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [callAccepted, callEnded]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl sm:p-6">
            <div className="relative w-full h-full sm:max-w-md md:max-w-4xl md:h-[85vh] bg-slate-950 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header Overlay */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-slate-900/60 backdrop-blur-md rounded-full shadow-lg z-30">
                    <Avatar className="h-10 w-10 border border-white/20">
                        <AvatarImage src={selectedContact?.avatar} />
                        <AvatarFallback className="bg-indigo-600 text-white font-bold text-sm">
                            {selectedContact?.name?.charAt(0) || name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-[100px]">
                        <h3 className="text-white font-semibold text-sm truncate max-w-[150px]">{selectedContact?.name || name}</h3>
                        <p className="text-emerald-400 text-[11px] font-bold tracking-widest">
                            {callAccepted ? formatTime(callDuration) : isCalling ? 'CALLING...' : receivingCall ? 'INCOMING CALL' : 'READY'}
                        </p>
                    </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 relative flex items-center justify-center bg-slate-950">
                    {/* Primary Video Container (Large Background) */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                        {callAccepted && !callEnded ? (
                            <video 
                                playsInline 
                                ref={isSwapped ? myVideo : userVideo} 
                                autoPlay 
                                className={`w-full h-full object-cover transition-all duration-500 ${isSwapped ? 'mirror' : ''}`} 
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-6 mt-12">
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1] }} 
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 shadow-2xl"
                                >
                                    <Avatar className="h-28 w-28">
                                        <AvatarImage src={selectedContact?.avatar} />
                                        <AvatarFallback className="bg-transparent text-slate-400">
                                            <User className="w-16 h-16" />
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                                <div className="text-center px-6">
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedContact?.name || name}</h2>
                                    {receivingCall && !callAccepted ? (
                                        <p className="text-emerald-400 animate-pulse font-bold tracking-widest uppercase mb-4">Incoming Call...</p>
                                    ) : (
                                        <>
                                            <p className="text-slate-400 font-medium mb-8">
                                                {isCalling ? 'Waiting for answer...' : 'End-to-end encrypted call'}
                                            </p>
                                            {!isCalling && !receivingCall && !callAccepted && (
                                                <Button 
                                                    onClick={() => callUser(selectedContact?.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform hover:scale-105 active:scale-95"
                                                >
                                                    Start Call
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Secondary Video Container (Small Overlay PIP) */}
                    {stream && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setIsSwapped(!isSwapped)}
                            className="absolute top-24 right-6 w-28 h-40 md:w-40 md:h-56 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-20 cursor-pointer group"
                        >
                            <video 
                                playsInline 
                                muted={!isSwapped} 
                                ref={isSwapped ? userVideo : myVideo} 
                                autoPlay 
                                className={`w-full h-full object-cover ${!isSwapped ? 'mirror' : ''}`} 
                            />
                            
                            {/* Overlay Indicators */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-8 h-8 text-white/70" />
                            </div>

                            {/* Camera Off Placeholder */}
                            {((!isSwapped && !isVideoEnabled) || (isSwapped && false)) && (
                                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                    <VideoOff className="w-8 h-8 text-slate-600" />
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Controls (WhatsApp Style Floating Bar at Bottom) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 px-8 py-4 bg-slate-900/80 backdrop-blur-xl rounded-full shadow-2xl z-30">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleSpeaker}
                        className={`h-12 w-12 rounded-full transition-all ${isSpeakerOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                        title="Speaker"
                    >
                        {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleMic}
                        className={`h-12 w-12 rounded-full transition-all ${isMicEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
                        title="Mute"
                    >
                        {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleVideo}
                        className={`h-12 w-12 rounded-full transition-all ${isVideoEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
                        title="Video"
                    >
                        {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={leaveCall}
                        className="h-14 w-14 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30 active:scale-90 transition-transform ml-2"
                        title="End Call"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </Button>

                    {receivingCall && !callAccepted && (
                        <div className="absolute -top-20 hidden md:block">
                            <Button 
                                variant="ghost" 
                                size="lg" 
                                onClick={answerCall}
                                className="px-8 py-6 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 animate-pulse text-lg font-bold"
                            >
                                <Phone className="w-6 h-6 mr-2" /> ACCEPT
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Accept Button Overlay */}
                {receivingCall && !callAccepted && (
                    <div className="md:hidden absolute bottom-28 left-1/2 -translate-x-1/2 z-30">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={answerCall}
                            className="h-16 w-16 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 animate-bounce"
                        >
                            <Phone className="w-8 h-8" />
                        </Button>
                    </div>
                )}
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

import { io } from 'socket.io-client';

let socket;

export const initiateSocket = (userId) => {
    if (socket && socket.connected) return socket;

    socket = io('/', {
        path: '/socket.io',
        reconnection: true,
        reconnectionAttempts: 5
    });
    
    if (userId) {
        socket.emit('register', userId.toString());
    }
    
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) socket.disconnect();
};

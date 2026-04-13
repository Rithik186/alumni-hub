import express from 'express';
import app from './backend/app.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const port = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io for WebRTC signaling
const users = new Map(); // userId -> Set of socketIds

io.on('connection', (socket) => {
  console.log('--- Socket Connected:', socket.id);

  socket.on('register', (userId) => {
    if (!userId) return;
    const uid = userId.toString();
    
    if (!users.has(uid)) {
      users.set(uid, new Set());
    }
    users.get(uid).add(socket.id);
    
    console.log(`--- User Registered: UID=${uid} | Sockets=${users.get(uid).size} | GlobalUsers=${users.size}`);
  });

  socket.on('call-user', ({ userToCall, signalData, from, name }) => {
    const targetUid = userToCall?.toString();
    
    const attemptCall = (retryCount = 0) => {
      const targetSockets = users.get(targetUid);
      console.log(`--- Call Attempt: From=${from} | To=${targetUid} | SocketsFound=${targetSockets ? targetSockets.size : 0} | Retry=${retryCount}`);
      
      if (targetSockets && targetSockets.size > 0) {
        targetSockets.forEach(socketId => {
          io.to(socketId).emit('incoming-call', { signal: signalData, from, name });
        });
      } else if (retryCount < 2) {
        // Wait 1 second and try again (handles user refreshes/reconnects)
        console.log(`--- Target offline, retrying call in 1s...`);
        setTimeout(() => attemptCall(retryCount + 1), 1000);
      } else {
        console.log(`--- Call Failed: User ${targetUid} is definitely offline.`);
      }
    };

    attemptCall();
  });

  socket.on('answer-call', (data) => {
    const targetUid = data.to?.toString();
    const targetSockets = users.get(targetUid);
    if (targetSockets) {
      targetSockets.forEach(socketId => {
        io.to(socketId).emit('call-accepted', data.signal);
      });
    }
  });

  socket.on('end-call', ({ to }) => {
    const targetUid = to?.toString();
    const targetSockets = users.get(targetUid);
    if (targetSockets) {
      targetSockets.forEach(socketId => {
        io.to(socketId).emit('call-ended');
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketIds] of users.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          users.delete(userId);
        }
        console.log(`--- Socket Disconnected: User ${userId} | Remaining=${socketIds.size}`);
        break;
      }
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/dist')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
} else {
  app.get('/', (req, res) => res.send('API is running...'));
}

httpServer.listen(port, () => console.log('Server is running on port ' + port));

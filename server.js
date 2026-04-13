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
const users = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('--- Socket Connected:', socket.id);

  socket.on('register', (userId) => {
    if (!userId) return;
    const uid = userId.toString();
    users.set(uid, socket.id);
    console.log(`--- User Registered: UID=${uid} | Socket=${socket.id} | Total=${users.size}`);
  });

  socket.on('call-user', ({ userToCall, signalData, from, name }) => {
    const targetUid = userToCall?.toString();
    const targetSocket = users.get(targetUid);
    
    console.log(`--- Call Attempt: From=${from} | To=${targetUid} | TargetSocket=${targetSocket || 'NOT FOUND'}`);
    
    if (targetSocket) {
      io.to(targetSocket).emit('incoming-call', { 
        signal: signalData, 
        from, 
        name 
      });
    } else {
      console.log(`--- Call Failed: User ${targetUid} is not online or not registered.`);
    }
  });

  socket.on('answer-call', (data) => {
    const targetUid = data.to?.toString();
    const targetSocket = users.get(targetUid);
    console.log(`--- Answer Call: From=${socket.id} | ToUID=${targetUid} | TargetSocket=${targetSocket}`);
    if (targetSocket) {
      io.to(targetSocket).emit('call-accepted', data.signal);
    }
  });

  socket.on('end-call', ({ to }) => {
    const targetUid = to?.toString();
    const targetSocket = users.get(targetUid);
    console.log(`--- End Call: ToUID=${targetUid}`);
    if (targetSocket) {
      io.to(targetSocket).emit('call-ended');
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        console.log(`--- User Registered Offline: UID=${userId}`);
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

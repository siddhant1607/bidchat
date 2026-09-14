const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/api/socketio'
  });

  // Track online users
  const onlineUsers = new Map(); // socketId -> { userId, username }

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // User identifies themselves
    socket.on('identify', (userData) => {
      onlineUsers.set(socket.id, userData);
      console.log(`[Socket.io] User identified: ${userData.username}`);
    });

    // Join a chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`[Socket.io] ${socket.id} joined chat:${chatId}`);
    });

    // Leave a chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // Join a team dugout whisper room
    socket.on('join_dugout', ({ chatId, teamShortName }) => {
      socket.join(`dugout:${chatId}:${teamShortName}`);
      console.log(`[Socket.io] ${socket.id} joined dugout:${chatId}:${teamShortName}`);
    });

    // Send a message to a chat
    socket.on('send_message', (message) => {
      if (message.isWhisper && message.whisperTeamId) {
        // Whisper: only emit to the team's dugout room
        io.to(`dugout:${message.chatId}:${message.whisperTeamId}`).emit('receive_message', message);
      } else {
        // Public: emit to the whole chat room
        io.to(`chat:${message.chatId}`).emit('receive_message', message);
      }
    });

    // Auction events
    socket.on('join_auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
    });

    socket.on('place_bid', (bidData) => {
      // TODO: Validate bid server-side
      io.to(`auction:${bidData.auctionId}`).emit('auction_update', bidData);
    });

    socket.on('start_auction', (data) => {
      io.to(`chat:${data.chatId}`).emit('auction_started', data);
    });

    // Typing indicators
    socket.on('typing_start', ({ chatId, username }) => {
      socket.to(`chat:${chatId}`).emit('user_typing', { username, isTyping: true });
    });

    socket.on('typing_stop', ({ chatId, username }) => {
      socket.to(`chat:${chatId}`).emit('user_typing', { username, isTyping: false });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> BidChat ready on http://${hostname}:${port}`);
  });
});

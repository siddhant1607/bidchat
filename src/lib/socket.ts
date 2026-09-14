import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/api/socketio',
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(userData: { userId: string; username: string }) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('identify', userData);
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

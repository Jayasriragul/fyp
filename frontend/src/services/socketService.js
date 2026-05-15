import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const joinEventRoom = (eventId) => {
  if (socket) {
    socket.emit('join_event', { event_id: eventId });
  }
};

export const leaveEventRoom = (eventId) => {
  if (socket) {
    socket.emit('leave_event', { event_id: eventId });
  }
};

export const emitScanUpdate = (data) => {
  if (socket) {
    socket.emit('scan_update', data);
  }
};

export const emitFraudAlert = (data) => {
  if (socket) {
    socket.emit('fraud_alert', data);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

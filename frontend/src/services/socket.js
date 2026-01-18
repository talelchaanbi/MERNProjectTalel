import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    const url = import.meta.env.VITE_SOCKET_URL || 'https://localhost:4500';
    socketInstance = io(url, {
      withCredentials: true,
      transports: ['websocket'],
    });
  }
  return socketInstance;
};

export default { getSocket };
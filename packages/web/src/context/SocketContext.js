import { createContext } from 'react';
import { io } from 'socket.io-client';

export const socket = io('http://localhost:8080', {
    reconnect: true,
    transport: ['websocket'],
    upgrade: false,
});

export default createContext({});

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext } from 'react';

import SocketContext from './context/SocketContext';
import AppContext from './context/AppContext';

import { FETCH_ROOMS } from './constants';

export default function App(props) {
    const { socket } = useContext(SocketContext);
    const { getAllRooms } = useContext(AppContext);

    useEffect(() => {
        // # listen to client
        socket.on('connect', () => {
            console.log('client connected!');
            console.log(socket.id);
        });

        return () => {
            // socket.emit('disconnect');
            socket.close();
        };
    }, [socket]);

    return <div className="h-full w-full bg-gray-900">{props.children}</div>;
}

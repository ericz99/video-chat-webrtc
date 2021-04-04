/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import App from './App';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';

import AppContext from './context/AppContext';
import SocketContext from './context/SocketContext';
import { FETCH_ROOMS } from './constants';

export default function Routes() {
    const { socket } = useContext(SocketContext);
    const { getAllRooms } = useContext(AppContext);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        socket.emit(FETCH_ROOMS);
        socket.on(FETCH_ROOMS, ({ rooms }) => {
            if (isLoading) {
                // # dispatch action
                getAllRooms(rooms);
                // # set the loading state to true
                setLoading(false);
            } else {
                // # dispatch action
                getAllRooms(rooms);
            }
        });
    }, [isLoading]);

    return (
        <App>
            <Switch>
                <Route exact path="/" component={HomePage} />
                <Route
                    exact
                    path="/room/:roomID"
                    render={(props) => (
                        <RoomPage {...props} isLoading={isLoading} />
                    )}
                />
            </Switch>
        </App>
    );
}

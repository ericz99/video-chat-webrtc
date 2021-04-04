import io from 'socket.io';
import jwt from 'jsonwebtoken';

import {
    USER_JOINED_ROOM,
    ROOM_CREATED,
    ERROR_ROOM,
    USER_MESSAGED,
    UPDATED_MESSAGES,
    CHECK_VALID_ROOM,
    INVALID_ROOM,
    INVALID_CODE,
    FETCH_ROOMS,
    CHECK_TOKEN,
    INVALID_TOKEN,
    RECENTLY_JOINED,
    RECENTLY_LEAVE,
} from '../constants';

import config from '../config';

const users = {};
const rooms = {};

export default (server) => {
    const socket = io(server, {
        cors: true,
        origin: ['http://127.0.0.1:3000'],
    });

    socket.on('connection', (socket) => {
        console.log('a user connected' + socket.id);

        socket.on(FETCH_ROOMS, () => {
            console.log('fetching');
            socket.emit(FETCH_ROOMS, {
                rooms,
            });
        });

        socket.on('sending signal', (payload) => {
            socket.broadcast.to(payload.roomID).emit('signal back to others', {
                signal: payload.signal,
                callerID: payload.callerID,
                userToSignal: payload.userToSignal,
                callerName: payload.callerName,
            });
        });

        socket.on('returning signal', (payload) => {
            socket.broadcast
                .to(payload.roomID)
                .emit('receiving returned signal', {
                    signal: payload.signal,
                    callerID: payload.callerID,

                    id: payload.id,
                });
        });

        socket.on(CHECK_TOKEN, async ({ access_token }) => {
            try {
                let decoded = await jwt.verify(access_token, config.ACCESS_KEY);

                // # check if room
                if (rooms[decoded.roomID]) {
                    const userExist = rooms[decoded.roomID].users
                        .map((user) => user.id)
                        .indexOf(decoded.user.id);

                    // # if user doens't exist meeaning hes not in the room
                    if (userExist === -1) {
                        const stateRoom = rooms;
                        const stateUser = users;
                        stateRoom[decoded.roomID] = {
                            ...rooms[decoded.roomID],
                            users: [
                                ...rooms[decoded.roomID].users,
                                decoded.user,
                            ],
                        };

                        stateUser[decoded.user.id] = decoded.user;

                        // # join room socket
                        socket.join(decoded.roomID);

                        // # emit every client update
                        socket.broadcast.to(decoded.roomID).emit(FETCH_ROOMS, {
                            rooms,
                        });

                        // # emit every client update
                        socket.broadcast
                            .to(decoded.roomID)
                            .emit(RECENTLY_JOINED, {
                                user: decoded.user,
                            });
                    }

                    if (!socket.token) {
                        // # add token to object
                        socket.token = access_token;
                    }
                }
            } catch (e) {
                if (e) {
                    console.log(e);
                }
            }
        });

        socket.on(USER_JOINED_ROOM, ({ inviteCode, user }) => {
            let id = null;
            let isFound = false;

            for (const room in rooms) {
                if (rooms[room].inviteCode === inviteCode) {
                    const stateRoom = rooms;
                    const stateUser = users;

                    // # add user to room
                    stateRoom[room] = {
                        ...rooms[room],
                        users: [...rooms[room].users, user],
                    };

                    // # add user
                    stateUser[user.id] = user;

                    id = room;
                    isFound = true;

                    break;
                }
            }

            if (!isFound) {
                socket.emit(INVALID_CODE, {
                    reason: INVALID_CODE,
                });
            } else {
                // # join room socket
                socket.join(id);

                // # broadcast to only room
                socket.broadcast.to(id).emit(FETCH_ROOMS, {
                    rooms,
                });

                // # broadcast to only room
                socket.broadcast.to(id).emit(RECENTLY_JOINED, {
                    user,
                });

                // # emit only for the client iteself
                socket.emit(USER_JOINED_ROOM, {
                    id,
                    access_token: jwt.sign(
                        {
                            user,
                            roomID: id,
                        },
                        config.ACCESS_KEY,
                        {
                            expiresIn: '24hr',
                        }
                    ),
                });
            }
        });

        socket.on(ROOM_CREATED, ({ room, user }) => {
            // # add the user and room data in the rooms object
            // # not persistent after restarting server
            if (!rooms[room.id]) {
                // # create new room
                rooms[room.id] = { ...room, users: [user], messages: [] };
                // # create new user
                users[user.id] = user;
                // # join room socket
                socket.join(room.id);

                socket.emit(ROOM_CREATED, {
                    id: room.id,
                    access_token: jwt.sign(
                        {
                            user,
                            roomID: room.id,
                        },
                        config.ACCESS_KEY,
                        {
                            expiresIn: '24hr',
                        }
                    ),
                });
            }
        });

        socket.on(USER_MESSAGED, async ({ roomID, access_token, message }) => {
            let decoded = null;

            try {
                decoded = await jwt.verify(access_token, config.ACCESS_KEY);
            } catch (e) {}

            if (decoded && rooms[roomID]) {
                const state = rooms;
                state[roomID] = {
                    ...rooms[roomID],
                    messages: [
                        ...rooms[roomID].messages,
                        {
                            ...message,
                            user: decoded.user,
                        },
                    ],
                };

                socket.emit(UPDATED_MESSAGES, {
                    roomID,
                    message: {
                        ...message,
                        user: decoded.user,
                    },
                });

                // # emit every client update
                socket.broadcast.to(roomID).emit(FETCH_ROOMS, {
                    rooms,
                });
            }
        });

        socket.on(CHECK_VALID_ROOM, ({ roomID }) => {
            if (!rooms[roomID]) {
                socket.emit(INVALID_ROOM, {
                    reason: INVALID_ROOM,
                });
            }
        });

        socket.on('disconnect', async () => {
            console.log('a user disconnected' + ' ' + socket.id);

            let decoded = null;
            const token = socket.token;
            socket.token = null;

            try {
                decoded = await jwt.verify(token, config.ACCESS_KEY);
            } catch (e) {}

            console.log(decoded);
            console.log(users);
            console.log(rooms);

            if (decoded) {
                // # delete user object
                delete users[decoded.user.id];
                // # remove user from room as well
                const stateRoom = rooms;
                stateRoom[decoded.roomID] = {
                    ...rooms[decoded.roomID],
                    users: rooms[decoded.roomID].users.filter(
                        (user) => user.id !== decoded.user.id
                    ),
                };

                // # leave the room
                socket.leave(decoded.roomID);

                // # broadcast to all client
                socket.broadcast.to(decoded.roomID).emit(RECENTLY_LEAVE, {
                    user: decoded.user,
                });

                // # emit every client update
                socket.broadcast.to(decoded.roomID).emit(FETCH_ROOMS, {
                    rooms,
                });
            }
        });
    });
};

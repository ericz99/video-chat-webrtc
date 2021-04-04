/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useContext } from 'react';
import Rodal from 'rodal';
import cryptoRandomString from 'crypto-random-string';

import AppContext from '../context/AppContext';
import SocketContext from '../context/SocketContext';
import { ROOM_CREATED, USER_JOINED_ROOM, FETCH_ROOMS } from '../constants';

export default function HomePage(props) {
    const { socket } = useContext(SocketContext);
    const { generateRoom, joinRoom, getAllRooms } = useContext(AppContext);
    const $inputRef = useRef(null);
    const [hasInvite, setHasInvite] = useState(false);
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isVisible, setVisible] = useState(true);

    // useEffect(() => {
    //     socket.emit(FETCH_ROOMS);
    //     socket.on(FETCH_ROOMS, ({ rooms }) => {
    //         // # dispatch action
    //         getAllRooms(rooms);
    //     });
    // }, []);

    useEffect(() => {
        const listener = ({ id, access_token }) => {
            // # TODO: State not persisting because opening multiple window cause new redux state
            // # dispatch user joined action
            joinRoom({
                room: {
                    id,
                    inviteCode,
                },
                user: {
                    id: socket.id,
                    name,
                },
            });

            // # redirect user to room
            props.history.push(`/room/${id}?token=${access_token}`);
        };

        // # if user join room, push something, call from socket..
        socket.on(USER_JOINED_ROOM, listener);

        return () => {
            socket.off(USER_JOINED_ROOM, listener);
        };
    }, [socket, inviteCode, joinRoom, name, props]);

    return (
        <div className="container bg-gray-900">
            <Rodal
                visible={isVisible}
                onClose={() => setVisible(true)}
                height={280}
            >
                <div className="container h-full flex flex-col items-center justify-center">
                    <div className="mb-2 w-full text-left">
                        <p className="text-md">Powered by WebRTC</p>
                    </div>

                    {!hasInvite ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();

                                if (!name || name.length === 0) {
                                    $inputRef.current.classList.add(
                                        'error-alert'
                                    );
                                } else {
                                    $inputRef.current.classList.remove(
                                        'error-alert'
                                    );
                                }

                                const data = {
                                    room: {
                                        id: cryptoRandomString({
                                            length: 18,
                                            type: 'alphanumeric',
                                        }),
                                        inviteCode: cryptoRandomString({
                                            length: 6,
                                            type: 'alphanumeric',
                                        }),
                                    },
                                    user: {
                                        id: socket.id,
                                        name: name,
                                    },
                                };

                                // # send emit of ROOM_CREATED
                                socket.emit(ROOM_CREATED, data);
                                // # dispatch our reducer
                                generateRoom(data);
                                // # go to room after creating new room
                                socket.on(
                                    ROOM_CREATED,
                                    ({ id, access_token }) => {
                                        props.history.push(
                                            `/room/${id}?token=${access_token}`
                                        );
                                    }
                                );
                            }}
                            className="w-full"
                        >
                            <input
                                type="text"
                                className="border border-gray-400 p-3 rounded w-full"
                                placeholder="Enter your name"
                                name="name"
                                ref={$inputRef}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <input
                                type="submit"
                                className="mt-2 rounded p-3 w-full bg-green-300 text-white cursor-pointer"
                                value="Create new room"
                            />
                        </form>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();

                                if (!name || name.length === 0) {
                                    $inputRef.current.classList.add(
                                        'error-alert'
                                    );
                                } else {
                                    $inputRef.current.classList.remove(
                                        'error-alert'
                                    );
                                }

                                const data = {
                                    inviteCode,
                                    user: {
                                        id: socket.id,
                                        name: name,
                                    },
                                };

                                // # send to socket
                                socket.emit(USER_JOINED_ROOM, data);
                            }}
                            className="w-full"
                        >
                            <input
                                type="text"
                                className="border border-gray-400 p-3 rounded w-full"
                                placeholder="Enter your name"
                                name="name"
                                value={name}
                                ref={$inputRef}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <input
                                type="text"
                                className="border border-gray-400 p-3 rounded w-full mt-2"
                                placeholder="Invite code"
                                name="inviteCode"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                            />
                            <input
                                type="submit"
                                className="mt-2 rounded p-3 w-full bg-green-300 text-white cursor-pointer"
                                value="Join Room"
                            />
                        </form>
                    )}

                    <div className="w-full flex justify-start">
                        <label className="inline-flex items-center mt-3">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-gray-600"
                                onClick={() => setHasInvite((prev) => !prev)}
                            />
                            <span className="ml-2 text-gray-700">
                                Have an invite code?
                            </span>
                        </label>
                    </div>
                </div>
            </Rodal>
        </div>
    );
}

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from 'react';
import decoded from 'jwt-decode';
import SimplePeer from 'simple-peer';
import { useToasts } from 'react-toast-notifications';
import qs from 'query-string';
import Rodal from 'rodal';
import {
    faVideo,
    faMicrophone,
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

import {
    CHECK_VALID_ROOM,
    INVALID_ROOM,
    CHECK_TOKEN,
    INVALID_TOKEN,
    RECENTLY_JOINED,
    RECENTLY_LEAVE,
} from '../constants';

import AppContext from '../context/AppContext';
import SocketContext from '../context/SocketContext';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import UserPanel from '../components/UserPanel';
import Video from '../components/Video';

export default function RoomPage(props) {
    const { socket } = useContext(SocketContext);
    const { rooms, currentUser, setCurrentUser } = useContext(AppContext);
    const { addToast } = useToasts();
    const $userVideoRef = useRef();
    const $peersRef = useRef([]);
    const $streamRef = useRef();
    const [isMounted, setMount] = useState(false);
    const [isToggle, setToggle] = useState(false);
    const [isVisible, setVisible] = useState(true);
    const [isVideoDisabled, setVideoDisable] = useState(true);
    const [isAudioDisabled, setAudioDisable] = useState(true);
    const [peers, setPeers] = useState([]);

    useEffect(() => {
        // # set current user into context
        const decodePayload = decoded(qs.parse(props.location.search).token);
        setCurrentUser(decodePayload);
    }, []);

    useEffect(() => {
        if (!isMounted) {
            console.log('not mounted');

            navigator.mediaDevices
                .getUserMedia({
                    video: true,
                    audio: true,
                })
                .then((stream) => {
                    $streamRef.current = stream;
                    $userVideoRef.current.srcObject = stream;

                    rooms[props.match.params.roomID].users.forEach((user) => {
                        if (user.id !== currentUser.user.id) {
                            console.log(user);

                            const peer = createPeer(
                                user.id,
                                currentUser.user.name,
                                currentUser.user.id,
                                props.match.params.roomID,
                                stream
                            );

                            $peersRef.current.push({
                                peerID: user.id,
                                name: user.name,
                                peer,
                            });

                            setPeers((prev) => [
                                ...prev,
                                {
                                    peerID: user.id,
                                    name: user.name,
                                    peer,
                                },
                            ]);
                        }
                    });

                    socket.on(
                        'signal back to others',
                        ({ signal, callerID, userToSignal, callerName }) => {
                            console.log('caller ' + callerID);
                            console.log('user signal' + userToSignal);
                            console.log('callerName' + callerName);

                            if (userToSignal === currentUser.user.id) {
                                const peer = addPeer(
                                    signal,
                                    callerID,
                                    props.match.params.roomID,
                                    stream
                                );

                                $peersRef.current.push({
                                    peerID: callerID,
                                    name: callerName,
                                    peer,
                                });

                                setPeers((prev) => [
                                    ...prev,
                                    {
                                        peerID: callerID,
                                        name: callerName,
                                        peer,
                                    },
                                ]);
                            }
                        }
                    );

                    socket.on('receiving returned signal', (payload) => {
                        console.log('user id' + payload.id);
                        console.log('callerid ' + payload.callerID);

                        console.log($peersRef.current);

                        if (payload.callerID === currentUser.user.id) {
                            const item = $peersRef.current.find(
                                (p) => p.peerID === payload.id
                            );

                            item.peer.signal(payload.signal);
                        }
                    });

                    setMount(true);

                    // if user just joined, they must create peer for themselve,

                    // if user already existed and joned, they must add those recently joined users
                })
                .catch(console.log);
        }
    }, [rooms, currentUser, isMounted]);

    useEffect(() => {
        // # get recently joined user
        socket.on(RECENTLY_JOINED, ({ user }) => {
            addToast(`${user.name} just joined!`, {
                appearance: 'success',
                autoDismiss: true,
            });

            console.log('user ' + user.name + ' joineed!');
        });

        // # get recently leave user
        socket.on(RECENTLY_LEAVE, ({ user }) => {
            addToast(`${user.name} just left!`, {
                appearance: 'info',
                autoDismiss: true,
            });

            // # destroy peer connection
            destroyPeer(user);

            console.log('user ' + user.name + ' left!');
        });
    }, []);

    useEffect(() => {
        // # just redirect if its invalid
        socket.on(INVALID_ROOM, ({ reason }) => {
            if (reason === INVALID_ROOM) {
                props.history.push('/');
            }
        });

        // # check if the room is valid
        socket.emit(CHECK_VALID_ROOM, {
            roomID: props.match.params.roomID,
        });
    }, [socket, props]);

    useEffect(() => {
        socket.emit(CHECK_TOKEN, {
            access_token: qs.parse(props.location.search).token,
        });

        socket.on(INVALID_TOKEN, ({ reason }) => {
            if (reason === INVALID_TOKEN) {
                props.history.push('/');
            }
        });
    }, [socket]);

    const createPeer = (userToSignal, callerName, callerID, roomID, stream) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', (signal) => {
            socket.emit('sending signal', {
                userToSignal,
                callerName,
                callerID,
                roomID,
                signal,
            });
        });

        return peer;
    };

    const addPeer = (incomingSignal, callerID, roomID, stream) => {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', (signal) => {
            socket.emit('returning signal', {
                signal,
                callerID,
                roomID,
                id: currentUser.user.id,
            });
        });

        peer.signal(incomingSignal);

        return peer;
    };

    const destroyPeer = (user) => {
        const peerObj = $peersRef.current.find((p) => p.peerID === user.id);

        if (peerObj) {
            peerObj.peer.destroy();
        }

        $peersRef.current.find((p) => p.peerID === user.id);
        const peers = $peersRef.current.filter((p) => p.peerID !== user.id);
        $peersRef.current = peers;
        setPeers(peers);
    };

    console.log(peers);

    return (
        <div className="relative h-full w-full">
            {!props.isLoading && (
                <>
                    <Rodal
                        height={110}
                        visible={isVisible}
                        onClose={() => setVisible(false)}
                    >
                        <div className="h-full flex flex-col justify-end">
                            <div className="mb-2">Here's your invite code!</div>

                            <div className="relative">
                                <input
                                    type="text"
                                    className="border border-gray-400 p-3 rounded w-full"
                                    placeholder="Invite Code"
                                    name="inviteCode"
                                    defaultValue={
                                        rooms[props.match.params.roomID]
                                            .inviteCode
                                    }
                                />
                                <button
                                    className="absolute top-1 right-2 border rounded px-6 py-2 bg-blue-300 text-white"
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            rooms[props.match.params.roomID]
                                                .inviteCode
                                        )
                                    }
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </Rodal>

                    <div
                        className={
                            isToggle
                                ? 'slide-transition h-full w-full flex flex-col pr-96'
                                : 'slide-transition h-full w-full flex flex-col'
                        }
                    >
                        <div
                            id="video-container"
                            className="h-full flex-1 border-gray-800 p-4"
                        >
                            <div
                                id="video-grid"
                                className="grid grid-cols-3 gap-4"
                            >
                                {peers.map(({ peerID, peer, name }) => (
                                    <Video
                                        key={peerID}
                                        peer={peer}
                                        name={name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div
                            id="controls"
                            className="flex justify-center relative"
                        >
                            <div className="absolute left-0 -bottom-2.5">
                                <video
                                    className="h-24 w-24"
                                    muted={isAudioDisabled ? true : false}
                                    ref={$userVideoRef}
                                    autoPlay
                                    playsInline
                                />
                            </div>

                            <div className="flex p-3">
                                <div
                                    className={`tooltip border-2 rounded-full px-3.5 py-2 mx-2 bg-black cursor-pointer ${
                                        isAudioDisabled
                                            ? 'border-red-800'
                                            : 'border-green-800'
                                    }`}
                                    onClick={() =>
                                        setAudioDisable((prev) => !prev)
                                    }
                                >
                                    <Icon
                                        icon={faMicrophone}
                                        className="text-white text-lg"
                                    />
                                    <span className="tooltiptext">
                                        Share Audio
                                    </span>
                                </div>
                                <div
                                    className={`tooltip border-2 rounded-full px-2.5 py-2 mx-2 bg-black cursor-pointer ${
                                        isVideoDisabled
                                            ? 'border-red-800'
                                            : 'border-green-800'
                                    }`}
                                    onClick={() =>
                                        setVideoDisable((prev) => !prev)
                                    }
                                >
                                    <Icon
                                        icon={faVideo}
                                        className="text-white text-lg"
                                    />
                                    <span className="tooltiptext">
                                        Share Video
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-0 z-50">
                        <button
                            className="rounded-tl-full rounded-bl-full pr-2 py-4 w-14 bg-red-400 focus:outline-none"
                            onClick={() => setToggle((prev) => !prev)}
                        >
                            {isToggle ? (
                                <Icon
                                    icon={faChevronRight}
                                    className="text-white text-xl"
                                />
                            ) : (
                                <Icon
                                    icon={faChevronLeft}
                                    className="text-white text-xl"
                                />
                            )}
                        </button>
                    </div>

                    <Sidebar isToggle={isToggle} {...props} />
                </>
            )}
        </div>
    );
}

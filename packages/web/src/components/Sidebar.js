/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext, useRef } from 'react';
import qs from 'query-string';
import { faUsers, faCommentAlt } from '@fortawesome/free-solid-svg-icons';

import SocketContext from '../context/SocketContext';
import AppContext from '../context/AppContext';

import { USER_MESSAGED, UPDATED_MESSAGES } from '../constants';
import Icon from './Icon';
import avatar_pic from '../assets/avatar_pic.png';

export default function Sidebar({ isToggle, ...props }) {
    const $chatContainerRef = useRef();
    const { socket } = useContext(SocketContext);
    const { updateMessageRoom, rooms } = useContext(AppContext);
    const [message, setMessage] = useState('');
    const [tab, setTab] = useState('user');

    useEffect(() => {
        $chatContainerRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }, [rooms]);

    useEffect(() => {
        // # listen to incoming messages
        socket.on(UPDATED_MESSAGES, (data) => {
            updateMessageRoom(data);
        });
    }, []);

    const getTime = () => {
        return `${new Date().getMonth()}/${new Date().getDay()}/${new Date().getFullYear()}`;
    };

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            // # to submit message
            socket.emit(USER_MESSAGED, {
                roomID: props.match.params.roomID,
                access_token: qs.parse(props.location.search).token,
                message: {
                    content: message,
                },
            });

            // # dispatch action
            setMessage('');
        }
    };

    return (
        <div
            className={
                isToggle
                    ? 'slide-transition h-full w-96 flex flex-col bg-white absolute top-0 right-0'
                    : 'slide-transition h-full w-96 flex flex-col bg-white absolute top-0 -right-96'
            }
        >
            <div className="h-full container flex flex-col">
                {tab === 'user' ? (
                    <div id="user-container" className="flex-1 border">
                        <div className="px-4 py-4 border-b-2">
                            <h1 className="text-2xl">
                                {rooms[props.match.params.roomID].users.length}{' '}
                                Attendees
                            </h1>
                        </div>
                        <div className="p-4 flex flex-col">
                            <h1 className="text-lg pb-2 border-b-2 border-black">
                                Participant (
                                {rooms[props.match.params.roomID].users.length})
                            </h1>

                            {rooms[props.match.params.roomID].users.map(
                                (user) => (
                                    <div
                                        key={user.id}
                                        className="mt-2 px-2 flex items-center bg-gray-100"
                                    >
                                        <span className="mr-2">
                                            <img
                                                src={avatar_pic}
                                                alt="avatar_pic"
                                                className="h-4 rounded-full my-2 mr-2 object-cover object-center object-right"
                                            />
                                        </span>

                                        <span className="text-xs font-medium">
                                            {user.name}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ) : (
                    <div
                        id="chat-container"
                        className="flex flex-col flex-1 border"
                        style={{ height: '100px' }}
                    >
                        <div className="px-4 py-4 border-b-2">
                            <h1 className="text-2xl">Chat</h1>
                        </div>
                        <div
                            id="chat-box"
                            className="flex-1 flex-grow overflow-y-auto"
                        >
                            {rooms[props.match.params.roomID].messages.map(
                                (message, key) => (
                                    <div
                                        className="flex flex-col mb-3"
                                        key={key}
                                    >
                                        <div className="flex px-4">
                                            <div className="mr-4">
                                                <img
                                                    src={avatar_pic}
                                                    alt="avatar_pic"
                                                    className="h-10 rounded-full my-2 mr-2 object-cover object-center object-right"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between mt-2">
                                                    <span className="text-gray-900 font-light text-sm">
                                                        {message.user.name}
                                                    </span>
                                                    <span className="text-gray-900 font-light text-sm">
                                                        {getTime()}
                                                    </span>
                                                </div>

                                                <div className="mt-2">
                                                    {message.content}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            <div id="end-message" ref={$chatContainerRef} />
                        </div>

                        <div id="message-box" className="m-2">
                            <input
                                type="text"
                                className="border border-gray-400 p-3 w-full"
                                placeholder="Say something"
                                name="message"
                                value={message}
                                onKeyPress={onKeyPress}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div
                    id="controllers"
                    className="flex justify-around border-t-2 py-2 pr-16"
                >
                    <div
                        className="w-full rounded-full px-2.5 py-2 mx-2 cursor-pointer text-center"
                        onClick={() => setTab('chat')}
                    >
                        <Icon
                            icon={faCommentAlt}
                            className={`text-gray-500 text-3xl ${
                                tab === 'chat' && 'text-red-600'
                            }`}
                        />
                    </div>
                    <div
                        className="w-full rounded px-2.5 py-2 mx-2 cursor-pointer text-center"
                        onClick={() => setTab('user')}
                    >
                        <Icon
                            icon={faUsers}
                            className={`text-gray-500 text-3xl ${
                                tab === 'user' && 'text-red-600'
                            }`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

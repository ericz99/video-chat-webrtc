/* eslint-disable import/no-anonymous-default-export */
import {
    USER_JOINED,
    GENERATE_NEW_ROOM,
    GET_ALL_ROOMS,
    UPDATED_MESSAGES,
    SET_CURRENT_USER,
} from './types';

export default (state, action) => {
    switch (action.type) {
        case SET_CURRENT_USER:
            return {
                ...state,
                currentUser: action.payload,
            };
        case USER_JOINED:
            return {
                ...state,
                rooms: {
                    ...state.rooms,
                    [action.payload.room.id]: {
                        ...state.rooms[action.payload.room.id],
                        users: [
                            ...state.rooms[action.payload.room.id].users,
                            action.payload.user,
                        ],
                    },
                },
            };
        case GENERATE_NEW_ROOM:
            return {
                ...state,
                rooms: {
                    ...state.rooms,
                    [action.payload.room.id]: {
                        ...action.payload.room,
                        users: [action.payload.user],
                        messages: [],
                    },
                },
            };
        case UPDATED_MESSAGES:
            return {
                ...state,
                rooms: {
                    ...state.rooms,
                    [action.payload.roomID]: {
                        ...state.rooms[action.payload.roomID],
                        messages: [
                            ...state.rooms[action.payload.roomID].messages,
                            action.payload.message,
                        ],
                    },
                },
            };
        case GET_ALL_ROOMS:
            return {
                ...state,
                rooms: action.payload,
            };
        default:
            return state;
    }
};

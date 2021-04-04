import React, { useReducer } from 'react';

import {
    UPDATED_MESSAGES,
    USER_JOINED,
    GENERATE_NEW_ROOM,
    GET_ALL_ROOMS,
    SET_CURRENT_USER,
} from './types';
import Reducer from './Reducer';
import AppContext from './AppContext';

export default function GlobalState(props) {
    const [state, dispatch] = useReducer(Reducer, {
        rooms: {},
        currentUser: {},
    });

    /**
     *
     * @param {*} data
     * @description join room
     */
    const joinRoom = (data) => {
        dispatch({
            type: USER_JOINED,
            payload: data,
        });
    };

    /**
     *
     * @param {*} data
     * @description generate new room after user creation
     */
    const generateRoom = (data) => {
        dispatch({
            type: GENERATE_NEW_ROOM,
            payload: data,
        });
    };

    /**
     *
     * @param {*} data
     * @description generate new room after user creation
     */
    const updateMessageRoom = (data) => {
        dispatch({
            type: UPDATED_MESSAGES,
            payload: data,
        });
    };

    /**
     *
     * @param {*} data
     * @description get all rooms
     */
    const getAllRooms = (data) => {
        dispatch({
            type: GET_ALL_ROOMS,
            payload: data,
        });
    };

    /**
     *
     * @param {*} data
     * @description set current user
     */
    const setCurrentUser = (data) => {
        dispatch({
            type: SET_CURRENT_USER,
            payload: data,
        });
    };

    return (
        <AppContext.Provider
            value={{
                rooms: state.rooms,
                currentUser: state.currentUser,
                joinRoom,
                generateRoom,
                updateMessageRoom,
                getAllRooms,
                setCurrentUser,
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
}

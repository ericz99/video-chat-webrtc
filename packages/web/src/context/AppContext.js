import { createContext } from 'react';

/**
 * if room is inactive, room will be deleted
 * if user is inactive, then user will deleted
 */

// users['userID...'] etc rooms['roomID...']

export default createContext({
    rooms: {},
    currentUser: {},
    // will have room / user object data
    joinRoom: (data) => {},
    generateRoom: (data) => {},
    updateMessageRoom: (data) => {},
    getAllRooms: (data) => {},
    setCurrentUser: (data) => {},
});

import React from 'react';

export default function UserPanel(props) {
    const getInitial = (name) =>
        name
            .match(/(\b\S)?/g)
            .join('')
            .match(/(^\S|\S$)?/g)
            .join('')
            .toUpperCase();

    return (
        <div className="flex justify-center items-center h-96 p-4 bg-gray-800">
            <div className="text-white text-5xl">{getInitial(props.name)}</div>
        </div>
    );
}

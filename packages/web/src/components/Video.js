/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';

export default function Video(props) {
    const $videoRef = useRef();

    useEffect(() => {
        console.log(props);

        props.peer.on('stream', (stream) => {
            $videoRef.current.srcObject = stream;
        });
    }, []);

    return (
        <div className="w-full relative">
            <video
                className="h-auto w-full"
                autoPlay
                playsInline
                ref={$videoRef}
            />
            <div className="absolute bottom-4 left-4 text-white font-bold">
                {props.name}
            </div>
        </div>
    );
}

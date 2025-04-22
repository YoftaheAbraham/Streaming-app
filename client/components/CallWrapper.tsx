"use client";
import { useSocket } from '@/context/SocketContext';
import React, { useEffect } from 'react'

const CallWrapper = () => {
    const socket = useSocket();

    useEffect(() => {
        
        if(socket) {
            console.log("Socket available", socket);
            socket?.on("ID", (ID: string) => {
                console.log("My ID:", ID)
            })
            socket?.emit("test", "Test");
        }
    }, [socket])
    return (
        <div className='flex gap-3 flex-wrap p-5'>
            {/* <video width="640" height="360" autoPlay muted>
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video> */},
        </div>
    )
}

export default CallWrapper

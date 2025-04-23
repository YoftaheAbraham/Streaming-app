"use client";

import { useUsername } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface RoomData {
    title: string;
    maxMembers: number;
    currentMembers: number;
    type: "Private" | "Public";
    tags: string[];
    Description: string;
}

const RoomLayout = () => {
    const { roomID } = useParams();
    const router = useRouter();
    const socket = useSocket();
    const user = useUsername();
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [copied, setCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [Activities, setActivities] = useState<string[]>([])
    const pathname = usePathname();
    const prevPathRef = useRef(pathname);

    const copyInviteLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/room/${roomID}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Invite link copied to clipboard!');
    };

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
        console.log("User left");
        
      socket?.emit("leave_room", user?.username)
      prevPathRef.current = pathname;
    }
  }, [pathname]);
    useEffect(() => {
        if (!socket) return;
        socket.emit("join_room", roomID, user?.username,
            (errMessage: string) => toast.error(errMessage),
            (data: RoomData, activities: string[]) => {
                console.log("Activities:", activities);
                setRoomData(data);
                setActivities(activities)
                toast.success(`Welcome to ${data.title}`);
            }
        );
    
        const handleJoin = (activities: any) => {
            setActivities(activities)
        };
    
        socket.on("someone_joined", handleJoin);
       
        return () => {
            socket.off("someone_joined", handleJoin);
        };
        
    }, [socket]);

    if (!roomData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="animate-pulse">Joining room...</div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-black text-white relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full px-6 py-4 flex items-center justify-between z-50 bg-black bg-opacity-70">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold">{roomData.title}</h1>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${roomData.type === 'Public' ? 'bg-green-600' : 'bg-purple-600'}`}>
                        {roomData.type}
                    </span>
                </div>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h.01M12 12h.01M18 12h.01" />
                        </svg>
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50">
                            <button
                                onClick={copyInviteLink}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                {copied ? 'Link Copied!' : 'Copy Invite Link'}
                            </button>
                            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                Report Room
                            </button>
                            <button className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                                Leave Room
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Layout */}
            <div className="pt-20 px-4 h-full flex flex-col md:flex-row gap-4">
                {/* Video Area */}
                <div className="flex-1 flex flex-col pb-3 gap-4 overflow-hidden">
                    {/* Featured Video */}

                    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-black rounded-lg overflow-hidden min-h-[60vh]">
                        <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            className="w-full h-[30vh] sm:h-[35vh] md:h-[40vh] object-cover rounded"
                            autoPlay
                            muted
                            loop
                        />
                        <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            className="w-full h-[30vh] sm:h-[35vh] md:h-[40vh] object-cover rounded"
                            autoPlay
                            muted
                            loop
                        />
                        <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            className="w-full h-[30vh] sm:h-[35vh] md:h-[40vh] object-cover rounded"
                            autoPlay
                            muted
                            loop
                        />
                        <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            className="w-full h-[30vh] sm:h-[35vh] md:h-[40vh] object-cover rounded"
                            autoPlay
                            muted
                            loop
                        />
                        <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            className="w-full h-[30vh] sm:h-[35vh] md:h-[40vh] object-cover rounded"
                            autoPlay
                            muted
                            loop
                        />
                        <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            className="w-full h-[30vh] sm:h-[35vh] md:h-[40vh] object-cover rounded"
                            autoPlay
                            muted
                            loop
                        />
                        {/* Add more <video> elements as needed */}
                    </div>



                    {/* Grid of other videos */}
                    {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-video rounded-lg overflow-hidden bg-gray-700 relative">
                                <video
                                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                />
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                                    User {i + 1}
                                </div>
                            </div>
                        ))}
                    </div> */}
                </div>

                {/* Sidebar */}
                <div className="space-y-2">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Activities
                    </h2>
                    <ul className="text-sm space-y-1.5 px-4 text-gray-300">
                        {Activities.map((activity, index) => {
                            return <li key={index} className="flex items-center gap-2">
                            <span className="text-green-400">👤</span>
                            <span>{activity}</span>
                        </li>
                        })}
                        
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default RoomLayout;

"use client";

import { useUsername } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface RoomData {
    RoomTitle: string;
    maxMembers: number;
    currentMembers: number;
    Type: "Private" | "Public";
    Tags: string[];
    Description: string;
}

const RoomLayout = () => {
    const { streamID } = useParams();
    const username = useUsername()
    const socket = useSocket();
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [copied, setCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<string[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [viewers, setViewers] = useState(0)
    const likeCount = 198;
    const isLiked = true

    const copyInviteLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/room/${streamID}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Invite link copied to clipboard!');
    };

    const sendMessage = () => {
        if (chatInput.trim()) {
            setChatMessages(prev => [...prev, `You: ${chatInput}`]);
            setChatInput("");
        }
    };

    useEffect(() => {
        socket?.emit("join_stream", streamID, localStorage.getItem("username"),
            (errMessage: string) => toast.error(errMessage),
            (success: RoomData, viewers: any) => {
                setViewers(viewers)
                setRoomData(success);
                toast.success(`Welcome to ${success.RoomTitle}`);
            }
        );
    }, [socket, streamID]);

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
                    <h1 className="text-xl font-semibold">{roomData.RoomTitle}</h1>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${roomData.Type === 'Public' ? 'bg-green-600' : 'bg-purple-600'}`}>
                        {roomData.Type}
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
                    <div className="flex items-center gap-4">
                        {/* Viewers Count */}
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span>{viewers}</span>
                        </div>

                        {/* Like Button */}
                        <button className="flex items-center gap-1 text-sm">
                            {isLiked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                            <span className={isLiked ? "text-red-500" : "text-gray-400"}>{likeCount}</span>
                        </button>
                        <div className='flex flex-wrap gap-3'>
                            {roomData.Tags.map((item, index) => {
                                return <span key={index} className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full">
                                {item}
                            </span>
                            })}
                        
                        </div>
                    </div>
                    {/* Featured Video */}

                    <div className="relativem aspect-video rounded-lg overflow-hidden bg-gray-800">
                        <video
                            src="https://www.w3schools.com/html/mov_bbb.mp4"
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 text-xs rounded">
                            Main Streamer
                        </div>
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
                <div className="w-full md:w-80 flex flex-col justify-between overflow-hidden relative">
                    <div className="p-4 space-y-4 flex-1 flex flex-col">
                        {/* Activities Section */}
                        <div className="space-y-2">
                            <h2 className="text-white font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Activities
                            </h2>
                            <ul className="text-sm space-y-1.5 px-4 text-gray-300">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">👤</span>
                                    <span>User1 joined the room</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">📣</span>
                                    <span>Host started streaming</span>
                                </li>
                            </ul>
                        </div>

                        {/* Chat Section */}
                        <div className="flex-1 flex flex-col space-y-2">
                            <h2 className="text-white font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                Live Chat
                            </h2>

                            {/* Messages Container */}
                            <div className="flex-1 p-3 no-scroll max-h-[60vh] overflow-auto">
                                <div className="space-y-2 overflow-auto">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className="text-sm text-white">
                                            <span className="font-medium text-blue-300">User{i + 1}:</span> {msg}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="flex gap-2 items-end justify-end absolute bottom-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    className="flex-1 px-3 py-2 text-white text-sm outline-none border-b"
                                    placeholder="Type a message..."
                                />
                                <button
                                    onClick={sendMessage}
                                    className=" cursor-pointer px-3 py-2 rounded-lg text-sm text-white transition-colors flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomLayout;

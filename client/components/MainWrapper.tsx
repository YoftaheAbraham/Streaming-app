"use client";

import { useRouter } from "next/navigation";
import { v4 } from "uuid";
import React, { FormEvent, useEffect, useState } from "react";
import Popup from "reactjs-popup";
import toast from "react-hot-toast";
import { useSocket } from "@/context/SocketContext";

interface RoomData {
  RoomTitle: string;
  maxMembers: number;
  Type: "Private" | "Public";
  Tags: string[];
}

const ToRoomNavigator = () => {
  const socket = useSocket();
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [roomType, setRoomType] = useState<"Private" | "Public">("Public");
  const [roomTags, setRoomTags] = useState<string[]>([]);
  const [roomMaxMembers, setRoomMaxMembers] = useState<number>(4);
  const [roomTitle, setRoomTitle] = useState<string>("");
  const [roomDescription, setRoomDescription] = useState("");
  const [stream, setStream] = useState<{title: string, tag: string[]; description: string; members: number}[]>([])

  const submitRoomData = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!roomTitle.trim()) {
      toast.error("Room title is required");
      return;
    }

    if (roomMaxMembers < 2 || roomMaxMembers > 50) {
      toast.error("Members must be between 2-50");
      return;
    }

    if (roomDescription.length > 200) {
      toast.error("Description must be under 200 characters.");
      return;
    }

    if (roomTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    toast.success("Stream created successfully!");

    socket?.emit(
      "createStream",
      {
        title: roomTitle,
        maxMembers: roomMaxMembers,
        type: roomType,
        tags: roomTags,
        description: roomDescription,
      },
      (StreamID: string) => {
        router.push(`/stream/${StreamID}`);
      }
    );

    setIsPopupOpen(false);
  };
  useEffect(() => {
    if (socket) {
      socket?.emit("getStreams", (streamsData: any) => {
        setStream(streamsData)
      });
    }
  }, [socket])

  const handleTagChange = (tag: string) => {
    setRoomTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Active Rooms <span className="text-green-500">🟢</span></h1>
        <button
          onClick={() => setIsPopupOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-md transition duration-150"
        >
          + Create Stream
        </button>
      </div>

      <div className="space-y-4">
        {/* Sample Room Cards */}
        {stream.map((stream, i) => (
          <div
            key={i}
            className="p-5 bg-gray-100 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{stream.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {stream.tag}
                  </span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">{stream.description}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span>{stream.members} members</span>
                </div>
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-md transition">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>

      <Popup
        modal
        open={isPopupOpen}
        contentStyle={{ width: "30rem", borderRadius: "0.75rem" }}
        overlayStyle={{ background: "rgba(0, 0, 0, 0.4)" }}
        onClose={() => setIsPopupOpen(false)}
      >
        <form
          onSubmit={submitRoomData}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
            Create New Stream
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Headline
            </label>
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="e.g. Study Hub"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring focus:ring-blue-300"
              rows={3}
              placeholder="Brief description (max 100 characters)"
            />
          </div>

          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700">
              Privacy
            </span>
            <div className="flex gap-4 mt-2">
              {["Public", "Private"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="roomType"
                    checked={roomType === type}
                    onChange={() => setRoomType(type as "Private" | "Public")}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-600">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {["Gaming", "Music", "Chat", "Study", "Art"].map((tag) => (
                <label key={tag} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={roomTags.includes(tag)}
                    onChange={() => handleTagChange(tag)}
                    className="accent-purple-500"
                  />
                  <span className="text-sm text-gray-600">{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Participants
            </label>
            <input
              type="number"
              value={roomMaxMembers}
              onChange={(e) => setRoomMaxMembers(Number(e.target.value))}
              min={2}
              max={50}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            <p className="text-xs text-gray-400 mt-1">Between 2 and 50</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-md transition duration-150"
          >
            Create Room
          </button>
        </form>
      </Popup>
    </div>
  );
};

export default ToRoomNavigator;

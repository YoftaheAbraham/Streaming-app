import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const PORT = process.env.PORT || 3001;
const app: Application = express();
const httpServer = createServer(app);


function setupSocketIO(server: typeof httpServer) {
    const io = new SocketIOServer(server, {
        cors: { origin: "*" },
    });

    const rooms: Record<string, any> = {};
    const roomActivities: any = {

    }
    const addRoomActivity = (roomID: string, text: string) => {
      if(roomActivities[roomID][roomActivities.length - 1] == text) return;
      roomActivities[roomID].push(text)
    }
    io.on("connection", (socket: Socket) => {
        socket.on("createRoom", (data, callback) => {
            const newRoomID = uuidv4();
            const roomData = { uid: newRoomID, ...data };
            rooms[newRoomID] = roomData;
            roomActivities[newRoomID] = ["Room Created!"]
            socket.broadcast.emit("newRoomCreated", Object.values(rooms));
            callback(newRoomID);
        });

        socket.on("getRooms", (callback) => {
            const streamsData = Object.values(rooms);
            callback(streamsData);
        });

        socket.on(
            "join_room",
            (
              roomID: string,
              username: string,
              errCallback: (msg: string) => void,
              callback: (roomData: any, Activities: any) => void
            ) => {
              const roomData = rooms[roomID];
          
              if (!roomData) {
                errCallback("Room doesn't exist");
                return;
              }
          
              socket.join(roomID); // Join the room
              socket.data.roomID = roomID;
              socket.data.username = username;
              addRoomActivity(roomID, `${username}, joined the room.`)
              // Notify others in the room (except the one who just joined)
              socket.to(roomID).emit("someone_joined", 
                roomActivities[roomID]
              );
          
              // Send room data back to the new user
              callback(roomData, roomActivities[roomID]);
            }
          );
          

        socket.on("disconnect", () => {
            const roomID = socket.data?.roomID;
            socket.to(roomID).emit("User-Left-Room", socket.id)
        });
    });
}

// Initialize everything
(function main() {
    setupSocketIO(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
})();

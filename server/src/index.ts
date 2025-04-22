import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const PORT = process.env.PORT || 3001;
const app: Application = express();
const httpServer = createServer(app);

// Redis clients
const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

async function initializeRedis() {
    try {
        await pubClient.connect();
        await subClient.connect();
        console.log("✅ Redis connected.");
    } catch (error: any) {
        console.error("❌ Redis connection error:", error.message);
        process.exit(1);
    }
}

function setupSocketIO(server: typeof httpServer) {
    const io = new SocketIOServer(server, {
        cors: { origin: "*" },
    });

    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket: Socket) => {
        console.log("🔌 Socket connected:", socket.id);

        socket.on("createStream", async (data, callback) => {
            const newStreamID = uuidv4();
            await pubClient.set(newStreamID, JSON.stringify(data));
            await pubClient.sAdd(`streams`, newStreamID)
            io.emit("newStreamoomCreated")
            callback(newStreamID);
        });

        socket.on("getStreams", async callback => {
            const streamIDs = await pubClient.sMembers("streams");
            const streamsData = await Promise.all(
                streamIDs.map(async (streamID) => {
                    const streamDataRaw = await pubClient.get(streamID);  // Fetch the stream data
                    return streamDataRaw ? JSON.parse(streamDataRaw) : null;  // Parse and return data
                })
            );
            callback(streamsData)
        })

        socket.on(
            "join_stream",
            async (streamID: string, username: string, errCallback: Function, callback: Function) => {
                const streamDataRaw = await pubClient.get(streamID);
                if (!streamDataRaw) {
                    errCallback("Stream doesn't exist");
                    return;
                }

                const viewerData = JSON.stringify({ sockID: socket.id, username });
                await pubClient.sAdd(`stream:${streamID}:viewers`, viewerData);

                // Ensure view count starts at 1 if not present
                const viewerCountKey = `view-count-${streamID}`;
                const currentCount = await pubClient.get(viewerCountKey);
                const updatedCount = currentCount ? parseInt(currentCount) + 1 : 1;
                await pubClient.set(viewerCountKey, updatedCount.toString());

                const streamData = JSON.parse(streamDataRaw);
                socket.join(streamID);
                socket.to(streamID).emit("someone_joined", socket.id);
                callback(streamData, updatedCount);

                socket.data.streamID = streamID; // Save stream ID for disconnect handling
            }
        );

        socket.on("disconnect", async () => {
            const streamID = socket.data?.streamID;
            if (streamID) {
                console.log(`👋 Socket ${socket.id} disconnected from stream ${streamID}`);
                // Remove viewer data
                const viewers = await pubClient.sMembers(`stream:${streamID}:viewers`);
                const updatedViewers = viewers.filter((viewer) => {
                    try {
                        const parsed = JSON.parse(viewer);
                        return parsed.sockID !== socket.id;
                    } catch {
                        return true;
                    }
                });

                // Replace with updated viewers set
                await pubClient.del(`stream:${streamID}:viewers`);
                if (updatedViewers.length) {
                    await pubClient.sAdd(`stream:${streamID}:viewers`, updatedViewers);
                }

                // Decrement viewer count
                const countKey = `view-count-${streamID}`;
                const count = await pubClient.get(countKey);
                if (count) {
                    const newCount = Math.max(0, parseInt(count) - 1);
                    await pubClient.set(countKey, newCount.toString());
                }
            }
        });
    });
}

// Initialize everything
(async function main() {
    await initializeRedis();
    setupSocketIO(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
})();

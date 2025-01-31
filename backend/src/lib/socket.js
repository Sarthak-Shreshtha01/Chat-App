// Import Socket.IO, HTTP and Express packages needed for WebSocket server
import { Server } from "socket.io";
import http from "http";
import express from "express";

// Set up Express and wrap it in HTTP server (required for Socket.IO)
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings to allow React frontend connections
const io = new Server(server , {
    cors: {
        origin: ["http://localhost:5173"], // Frontend dev server URL
    }
});


// Track online users by storing their userId -> socketId mapping
const userSocketMap = {};

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
    
}

// Listen for client socket connections
io.on("connection" , (socket) => {
    console.log("a user connected" , socket.id);
    console.log(socket.handshake.query);
    // console.log(socket.id)
    // Extract userId that was passed when client connected
    const userId = socket.handshake.query.userId;
    console.log(userSocketMap)
    // console.log(userId)
    if(userId){
        // Save this user's socket connection
        userSocketMap[userId] = socket.id;
    }

    // Let all clients know who is currently online
    io.emit("getOnlineUsers" , Object.keys(userSocketMap));

    // Clean up when a socket disconnects
    socket.on("disconnect" , () => {
        console.log("a user disconnected" , socket.id);
        // Remove disconnected user from our tracking
        delete userSocketMap[userId];
        // Update all clients with new online users list
        io.emit("getOnlineUsers" , Object.keys(userSocketMap));
    })
})

// Make these available to the rest of the application
export {io ,app,server } ;

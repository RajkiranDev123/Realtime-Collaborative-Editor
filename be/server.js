import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";
import dotenv from "dotenv";
dotenv.config();

// Express is built only for HTTP request–response
// WebSockets need connection upgrade, which Express doesn’t handle
// Upgrade is needed to switch from one-time HTTP (request–response) to a
// persistent WebSocket connection (real-time, bidirectional communication).

// Express handles HTTP request–response only, but WebSocket needs an
// “upgrade” — and only the raw HTTP server can handle that.

const app = express();

// HTTP server receives request & Passes it to Express : httpServer.listen(port,cb)
const httpServer = createServer(app);

// now , Socket.IO is listening on SAME server
// http://localhost:3000  → Express
// ws://localhost:3000    → Socket.IO

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const ySocketIO = new YSocketIO(io); // “Connect Yjs collaboration system to my Socket.IO server”
ySocketIO.initialize(); // Starts syncing documents , Handles: updates , merging (CRDT)

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello",
    success: true,
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);
});

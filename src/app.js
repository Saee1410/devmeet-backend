import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/usersroutes.js";
import compileRoutes from "./routes/compileroutes.js";
import questionRoutes from "./routes/questionroutes.js";
import contestRoutes from "./routes/contestroutes.js";
import submitRoutes from "./routes/submitRoutes.js";

import connectToSocket from "./sockets/socketManager.js";
import "./workers/codeWorker.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Allowed Frontend Origins
const allowedOrigins = [
    "http://localhost:5173",
    "https://devmeetown-nu.vercel.app"
];

// Socket.IO
const ioInstance = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
    transports: ["websocket", "polling"],
    allowEIO3: true
});

global.io = ioInstance;

connectToSocket();

// Express CORS
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
);

// // Socket.IO
// // Allowed Frontend Origins
// const allowedOrigins = [
//     "http://localhost:5173",
//     "https://devmeetown-nu.vercel.app"
// ];

// // Socket.IO
// const ioInstance = new Server(server, {
//     cors: {
//         origin: allowedOrigins,
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         credentials: true
//     },
//     transports: ["websocket", "polling"],
//     allowEIO3: true
// });

// global.io = ioInstance;

// connectToSocket();

// // ======================
// // CORS
// // ======================
// const allowedOrigins = [
//     "http://localhost:5173",
//     "https://devmeetown-nu.vercel.app"
// ];

// app.use(
//     cors({
//         origin: allowedOrigins,
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     })
// );

// ======================
// Middlewares
// ======================
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

// ======================
// Routes
// ======================
app.use("/api/v1/users", userRoutes);
app.use("/api/compile", compileRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/contest", contestRoutes);
app.use("/api/v1/contest/submit", submitRoutes);

// ======================
// Database + Server
// ======================
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    try {
      await mongoose.connection.db.collection("users").dropIndexes();
      console.log("Old indexes cleared!");
    } catch (err) {
      console.log("Indexes already cleared.");
    }

    const PORT = process.env.PORT || 8000;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

start();
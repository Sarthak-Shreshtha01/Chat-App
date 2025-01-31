import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { connectDB } from "./lib/db.js";
import cors from "cors"

import messageRoutes from "./routes/message.route.js"
import authRoutes from "./routes/auth.route.js"
import {app,server} from "./lib/socket.js"

dotenv.config();



const PORT = process.env.PORT || 5001;

app.use(express.json())
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser())

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use("/api/auth" , authRoutes)
app.use("/api/messages" , messageRoutes)

server.listen(PORT , ()=> {
    console.log(`server started on port ${PORT}`);
    connectDB()
})
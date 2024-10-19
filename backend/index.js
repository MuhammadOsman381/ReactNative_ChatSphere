import { config } from "dotenv";
import dbconnection from "./src/config/dbconnection.js";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { app, server } from "./app.js";
config({ path: "./.env" });

dbconnection();


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

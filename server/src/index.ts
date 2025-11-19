import "dotenv/config";
import express from "express";
import websiteRouter from "./modules/websites/websites.router";
import { connectMongo } from "./core/database";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use("/api", websiteRouter);

async function startServer() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();

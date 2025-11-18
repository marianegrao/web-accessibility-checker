import "dotenv/config";
import express from "express";
import websiteRouter from "./modules/websites/websites.router";
import { connectMongo } from "./core/database";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
//cors
app.use("/api", websiteRouter);

async function startServer() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();

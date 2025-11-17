import express, { Request, Response } from "express";
import websiteRouter from "./modules/web/websites.router";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
//cors
app.use("/api", websiteRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

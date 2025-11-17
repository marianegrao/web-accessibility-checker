import express from "express";
import websiteRouter from "./modules/websites/websites.router";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
//cors
app.use("/api", websiteRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

import { Router } from "express";
import { WebsiteController } from "./websites.controller";

const router = Router();
const websiteController = new WebsiteController();

router.post("/analyze", websiteController.analyze);
router.get("/history", websiteController.listAnalyses);

export default router;

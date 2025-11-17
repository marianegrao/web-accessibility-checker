import { Router } from "express";
import { WebsiteController } from "./websites.controller";

const router = Router();
const websiteController = new WebsiteController();

router.post("/analyze", websiteController.analyze);

export default router;

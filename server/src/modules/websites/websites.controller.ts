import { Request, Response } from "express";
import { WebsiteService } from "./websites.service";

const websiteService = new WebsiteService();

export class WebsiteController {
  async analyze(req: Request, res: Response) {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      const analysisResult = await websiteService.analyzeUrl(url);
      // await websiteService.createAnalysisRecord({
      //   url,
      //   score: analysisResult.total.score,
      // });
      return res.status(200).json(analysisResult);
    } catch (error: any) {
      return res.status(500).json({ message: "Error analyzing URL" });
    }
  }

  async listAnalyses(req: Request, res: Response) {
    try {
      const analyses = await websiteService.listAllAnalyses();
      return res.status(200).json(analyses);
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching analyses" });
    }
  }
}

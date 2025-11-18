import { WebsiteModel, IWebsite } from "./websites.model";

export class WebsiteRepository {
  async saveWebsiteScore(data: {
    url: string;
    score: number;
  }): Promise<IWebsite> {
    const doc = new WebsiteModel(data);
    return doc.save();
  }

  async list(limit = 50): Promise<IWebsite[]> {
    return WebsiteModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }
}

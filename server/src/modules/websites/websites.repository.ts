import { WebsiteModel, IWebsite } from "./websites.model";

export class WebsiteRepository {
  async savePageScore(data: { url: string; score: number }): Promise<IWebsite> {
    const doc = new WebsiteModel(data);
    return doc.save();
  }

  async findByUrl(url: string): Promise<IWebsite | null> {
    return WebsiteModel.findOne({ url }).exec();
  }

  async list(limit = 50): Promise<IWebsite[]> {
    return WebsiteModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }
}

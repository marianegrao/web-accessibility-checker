import { WebsitesRepository } from "./websites.repository";

const websitesRepository = new WebsitesRepository();

export class WebsiteService {
  async analyzeUrl(url: string) {
    console.log(url);
    return {
      titleScore: { score: "2", maxScore: 3 },
      imageAltScore: {
        score: Math.round(2 * 10) / 10,
        maxScore: 4,
      },
      inputLabelScore: {
        score: Math.round(2 * 10) / 10,
        maxScore: 3,
      },
      totalScore: { score: 2, maxScore: 10 },
      friendlyScore: `${2}/10`,
    };
  }
}

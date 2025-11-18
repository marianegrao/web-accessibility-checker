import { PageAnalysisData, ScoreResult } from "./website.types";
import { WebsiteRepository } from "./websites.repository";

const websiteRepository = new WebsiteRepository();

class WebsiteResources {
  protected async calculateSeoAccessibilityScore(
    data: PageAnalysisData
  ): Promise<ScoreResult> {
    const titleScore = data.titleExistsAndIsNotEmpty ? 3 : 0;
    let imageAltScore = 4;
    if (data.totalImgTags > 0) {
      const failureRatio = data.imgTagsWithoutAlt / data.totalImgTags;
      imageAltScore = 4 * (1 - failureRatio);
    }
    let inputLabelScore = 3;
    if (data.totalInputTags > 0) {
      const failureRatio = data.inputsWithoutLabel / data.totalInputTags;
      inputLabelScore = 3 * (1 - failureRatio);
    }
    const totalScore = titleScore + imageAltScore + inputLabelScore;
    const roundedTotal = Math.round(totalScore * 10) / 10;

    return {
      titleScore: { score: titleScore, maxScore: 3 },
      imageAltScore: {
        score: Math.round(imageAltScore * 10) / 10,
        maxScore: 4,
      },
      inputLabelScore: {
        score: Math.round(inputLabelScore * 10) / 10,
        maxScore: 3,
      },
      totalScore: { score: roundedTotal, maxScore: 10 },
      friendlyScore: `${roundedTotal}/10`,
    };
  }
}

export class WebsiteService extends WebsiteResources {
  async analyzeUrl(url: string) {
    const websiteHtml = await fetch(url).then((res) => res.text());
    if (!websiteHtml) {
      throw new Error("Unable to fetch website HTML");
    }
    console.log(websiteHtml);
    const regex = /<title>(.*?)<\/title>/;
    const titleExistsAndIsNotEmpty = regex.test(websiteHtml);
    const totalImgTags = websiteHtml.match(/<img[^>]*>/g)?.length || 0;
    const imgTagsWithoutAlt =
      websiteHtml.match(/<img[^>]*alt=""/g)?.length || 0;
    const totalInputTags = websiteHtml.match(/<input[^>]*>/g)?.length || 0;
    const inputsWithoutLabel =
      websiteHtml.match(/<input[^>]*label=""/g)?.length || 0;
    const data: PageAnalysisData = {
      titleExistsAndIsNotEmpty,
      totalImgTags,
      imgTagsWithoutAlt,
      totalInputTags,
      inputsWithoutLabel,
    };
    const scoreResult = await this.calculateSeoAccessibilityScore(data);
    return {
      titleScore: { score: scoreResult.titleScore.score, maxScore: 3 },
      imageAltScore: {
        score: Math.round(scoreResult.imageAltScore.score * 10) / 10,
        maxScore: 4,
      },
      inputLabelScore: {
        score: Math.round(scoreResult.inputLabelScore.score * 10) / 10,
        maxScore: 3,
      },
      total: { score: scoreResult.totalScore.score, maxScore: 10 },
    };
  }
  async listAllAnalyses() {
    return websiteRepository.list();
  }
  async createAnalysisRecord(data: { url: string; score: number }) {
    return websiteRepository.savePageScore(data);
  }
}

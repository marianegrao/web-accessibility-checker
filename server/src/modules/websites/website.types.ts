export interface PageAnalysisData {
  titleExistsAndIsNotEmpty: boolean;
  totalImgTags: number;
  imgTagsWithoutAlt: number;
  totalInputTags: number;
  inputsWithoutLabel: number;
}

export interface ScoreResult {
  titleScore: {
    score: number;
    maxScore: 3;
  };
  imageAltScore: {
    score: number;
    maxScore: 4;
  };
  inputLabelScore: {
    score: number;
    maxScore: 3;
  };
  totalScore: {
    score: number;
    maxScore: 10;
  };
  friendlyScore: string;
}

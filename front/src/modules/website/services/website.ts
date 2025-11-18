import api from "@/services/api";

export interface AnalysisResult {
  titleScore: {
    score: number;
    maxScore: number;
  };
  imageAltScore: {
    score: number;
    maxScore: number;
  };
  inputLabelScore: {
    score: number;
    maxScore: number;
  };
  total: {
    score: number;
    maxScore: number;
  };
}

export const checkWebsiteAccessibility = async (
  url: string
): Promise<AnalysisResult> => {
  try {
    const response = await api.post("/api/analyze", { url });
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
        "Erro ao analisar o site. Verifique a URL e tente novamente."
    );
  }
};

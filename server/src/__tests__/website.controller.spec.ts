import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebsiteController } from "../modules/websites/websites.controller";
import { WebsiteService } from "../modules/websites/websites.service";

describe("WebsiteController - Unit Tests (com persistência)", () => {
  let controller: WebsiteController;
  let mockRequest: any;
  let mockResponse: any;

  let mockAnalyzeUrl: any;
  let mockCreateAnalysisRecord: any;
  let mockListAllAnalyses: any;

  beforeEach(() => {
    controller = new WebsiteController();

    mockRequest = { body: {} };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    vi.clearAllMocks();

    mockAnalyzeUrl = vi.spyOn(WebsiteService.prototype, "analyzeUrl");
    mockCreateAnalysisRecord = vi.spyOn(
      WebsiteService.prototype,
      "createAnalysisRecord"
    );
    mockListAllAnalyses = vi.spyOn(WebsiteService.prototype, "listAllAnalyses");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("analyze - validation", () => {
    it("must return 400 if URL is not provided", async () => {
      mockRequest.body = {};

      await controller.analyze(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "URL is required",
      });
      expect(mockAnalyzeUrl).not.toHaveBeenCalled();
      expect(mockCreateAnalysisRecord).not.toHaveBeenCalled();
    });

    it("must return 400 if URL is an empty string", async () => {
      mockRequest.body = { url: "" };

      await controller.analyze(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "URL is required",
      });
      expect(mockAnalyzeUrl).not.toHaveBeenCalled();
    });
  });

  describe("analyze - happy path", () => {
    it("must return 200, call analyzeUrl and createAnalysisRecord with correct score", async () => {
      const mockAnalysisResult = {
        titleScore: { score: 3, maxScore: 3 },
        imageAltScore: { score: 4, maxScore: 4 },
        inputLabelScore: { score: 3, maxScore: 3 },
        total: { score: 10, maxScore: 10 },
      };

      mockRequest.body = { url: "https://example.com" };

      mockAnalyzeUrl.mockResolvedValueOnce(mockAnalysisResult);
      mockCreateAnalysisRecord.mockResolvedValueOnce({
        url: "https://example.com",
        score: 10,
      });

      await controller.analyze(mockRequest, mockResponse);

      expect(mockAnalyzeUrl).toHaveBeenCalledWith("https://example.com");
      expect(mockCreateAnalysisRecord).toHaveBeenCalledWith({
        url: "https://example.com",
        score: 10,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAnalysisResult);
    });
  });

  describe("analyze - error", () => {
    it("must return 500 if analyzeUrl throws error", async () => {
      mockRequest.body = { url: "https://example.com" };

      mockAnalyzeUrl.mockRejectedValueOnce(new Error("Internal error"));

      await controller.analyze(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error analyzing URL",
      });
    });
  });

  describe("listAnalyses", () => {
    it("must return 200 with list of analyses", async () => {
      const mockAnalyses = [
        { url: "https://a.com", score: 8.5 },
        { url: "https://b.com", score: 7.2 },
      ];

      mockListAllAnalyses.mockResolvedValueOnce(mockAnalyses);

      await controller.listAnalyses(mockRequest, mockResponse);

      expect(mockListAllAnalyses).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAnalyses);
    });

    it("must return 500 if listAllAnalyses throws error", async () => {
      mockListAllAnalyses.mockRejectedValueOnce(new Error("Database error"));

      await controller.listAnalyses(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error fetching analyses",
      });
    });
  });
});

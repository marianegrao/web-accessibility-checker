import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebsiteService } from "../modules/websites/websites.service";
import { WebsiteRepository } from "../modules/websites/websites.repository";

global.fetch = vi.fn();

describe("WebsiteService - Unit Tests (real implementation)", () => {
  let websiteService: WebsiteService;

  beforeEach(() => {
    websiteService = new WebsiteService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("analyzeUrl - basic behavior", () => {
    it("must call fetch and return correct result", async () => {
      const mockHtml = `
        <html>
          <head><title>Test Page</title></head>
          <body>
            <img src="a.jpg" alt="ok">
            <img src="b.jpg" alt="">
            <input type="text" label="">
            <input type="email" label="">
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const url = "https://example.com/test";
      const result = await websiteService.analyzeUrl(url);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(url);

      expect(result).toEqual({
        titleScore: { score: 3, maxScore: 3 },
        imageAltScore: { score: 2, maxScore: 4 },
        inputLabelScore: { score: 0, maxScore: 3 },
        total: { score: 5, maxScore: 10 },
      });
    });

    it("must throw error if fetch returns empty string", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        text: vi.fn().mockResolvedValueOnce(""),
      });

      await expect(
        websiteService.analyzeUrl("https://example.com/empty")
      ).rejects.toThrow("Unable to fetch website HTML");
    });

    it("must throw error if fetch rejects (e.g., network error)", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      await expect(
        websiteService.analyzeUrl("https://example.com/error")
      ).rejects.toThrow("Network error");
    });
  });

  describe("analyzeUrl - accessibility rules (regex)", () => {
    it("must give maximum score if there are no <img> or <input> and title exists", async () => {
      const mockHtml = `
        <html>
          <head><title>Minimal Page</title></head>
          <body>
            <p>Just text</p>
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await websiteService.analyzeUrl("https://example.com");

      expect(result.titleScore.score).toBe(3);
      expect(result.imageAltScore.score).toBe(4);
      expect(result.inputLabelScore.score).toBe(3);
      expect(result.total.score).toBe(10);
    });

    it("must zero title score if <title> does not exist", async () => {
      const mockHtml = `
        <html>
          <head></head>
          <body>
            <p>No title</p>
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await websiteService.analyzeUrl("https://no-title.com");

      expect(result.titleScore.score).toBe(0);
      expect(result.total.score).toBeLessThan(10);
    });

    it("must partially calculate score for images with missing alt", async () => {
      const mockHtml = `
        <html>
          <head><title>Images</title></head>
          <body>
            <img src="1.jpg" alt="ok">
            <img src="2.jpg" alt="">
            <img src="3.jpg" alt="">
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await websiteService.analyzeUrl("https://example.com/img");

      expect(result.imageAltScore.score).toBeCloseTo(1.3, 1);
      expect(
        result.imageAltScore.score.toString().split(".")[1]?.length ?? 0
      ).toBeLessThanOrEqual(1);
    });

    it("must partially calculate score for inputs with label=''", async () => {
      const mockHtml = `
        <html>
          <head><title>Inputs</title></head>
          <body>
            <input type="text" label="">
            <input type="email" label="">
            <input type="password" label="">
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: vi.fn().mockResolvedValueOnce(mockHtml),
      });

      const result = await websiteService.analyzeUrl(
        "https://example.com/inputs"
      );

      expect(result.inputLabelScore.score).toBe(0);
      expect(result.total.score).toBeLessThan(10);
    });
  });

  describe("listAllAnalyses & createAnalysisRecord - integration with WebsiteRepository (mock)", () => {
    it("listAllAnalyses must delegate to WebsiteRepository.list", async () => {
      const mockList = vi
        .spyOn(WebsiteRepository.prototype, "list")
        .mockResolvedValueOnce([
          { url: "https://a.com", score: 9, html: "<html></html>" } as any,
        ]);

      const result = await websiteService.listAllAnalyses();

      expect(mockList).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        { url: "https://a.com", score: 9, html: "<html></html>" },
      ]);
    });

    it("createAnalysisRecord must delegate to WebsiteRepository.saveWebsiteScore", async () => {
      const mockSave = vi
        .spyOn(WebsiteRepository.prototype, "saveWebsiteScore")
        .mockResolvedValueOnce({
          url: "https://a.com",
          score: 8.5,
          html: "<html></html>",
        } as any);

      const payload = { url: "https://a.com", score: 8.5 };
      const result = await websiteService.createAnalysisRecord(payload);

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith(payload);
      expect(result).toEqual({
        url: "https://a.com",
        score: 8.5,
        html: "<html></html>",
      });
    });
  });
});

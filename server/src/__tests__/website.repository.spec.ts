import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WebsiteRepository } from "../modules/websites/websites.repository";
import { WebsiteModel } from "../modules/websites/websites.model";

describe("WebsiteRepository - Unit Tests", () => {
  let repository: WebsiteRepository;

  beforeEach(() => {
    repository = new WebsiteRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saveWebsiteScore must init WebsiteModel and save", async () => {
    const mockSave = vi.fn().mockResolvedValueOnce({
      url: "https://a.com",
      score: 9,
      html: "<html></html>",
    });

    const mockWebsiteModel = vi
      .spyOn(WebsiteModel.prototype, "save")
      .mockImplementation(mockSave);

    const result = await repository.saveWebsiteScore({
      url: "https://a.com",
      score: 9,
    });

    expect(mockWebsiteModel).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      url: "https://a.com",
      score: 9,
      html: "<html></html>",
    });
  });

  //   it("list must return all websites", async () => {
  //     const mockFind = vi
  //       .fn()
  //       .mockResolvedValueOnce([
  //         { url: "https://a.com", score: 9, html: "<html></html>" } as any,
  //       ]);

  //     const mockWebsiteModel = vi
  //       .spyOn(WebsiteModel, "find")
  //       .mockImplementation(mockFind);

  //     const result = await repository.list();

  //     expect(mockWebsiteModel).toHaveBeenCalledTimes(1);
  //     expect(mockFind).toHaveBeenCalledTimes(1);
  //     expect(result).toEqual([
  //       { url: "https://a.com", score: 9, html: "<html></html>" },
  //     ]);
  //   });
});

import { render, fireEvent, screen } from "@testing-library/vue";
import { vi } from "vitest";
import { describe, expect, beforeEach, test } from "vitest";
import WebAccessibilityPage from "@/modules/website/views/WebsiteAccessibilityPage.vue";

import { checkWebsiteAccessibility } from "@/modules/website/services/website";

vi.mock("@/modules/website/services/website", () => {
  return {
    checkWebsiteAccessibility: vi.fn(),
  };
});

describe("WebAccessibilityPage (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("does not call API when URL is empty", async () => {
    render(WebAccessibilityPage);

    const button = screen.getByTestId("submit-button");
    await fireEvent.click(button);

    expect(checkWebsiteAccessibility).not.toHaveBeenCalled();
  });

  test("calls API when URL is valid and shows results", async () => {
    (checkWebsiteAccessibility as any).mockResolvedValueOnce({
      titleScore: { score: 8, maxScore: 3 },
      imageAltScore: { score: 7, maxScore: 4 },
      inputLabelScore: { score: 9, maxScore: 3 },
      total: { score: 8.5, maxScore: 10 },
    });

    render(WebAccessibilityPage);

    const input = screen.getByTestId("url-input");
    const button = screen.getByTestId("submit-button");

    await fireEvent.update(input, "https://google.com");
    await fireEvent.click(button);

    expect(checkWebsiteAccessibility).toHaveBeenCalledWith(
      "https://google.com"
    );

    expect(await screen.findByTestId("result-modal")).toBeInTheDocument();

    expect(screen.getByTestId("total-score")).toHaveTextContent("8.5");
    expect(screen.getByTestId("rating-label")).toHaveTextContent("Excelente");
    expect(screen.getByTestId("rating-description")).toBeInTheDocument();
    expect(screen.getByTestId("score-badge-0")).toHaveTextContent("8.0/3");
    expect(screen.getByTestId("score-badge-1")).toHaveTextContent("7.0/4");
    expect(screen.getByTestId("score-badge-2")).toHaveTextContent("9.0/3");
  });

  test("must handle API error and show error message", async () => {
    const errorMessage = "API error";
    (checkWebsiteAccessibility as any).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    render(WebAccessibilityPage);

    const input = screen.getByTestId("url-input");
    const button = screen.getByTestId("submit-button");

    await fireEvent.update(input, "https://invalid-url.com");
    await fireEvent.click(button);

    expect(checkWebsiteAccessibility).toHaveBeenCalledWith(
      "https://invalid-url.com"
    );

    expect(await screen.findByTestId("error-alert")).toBeInTheDocument();

    expect(screen.getByTestId("error-alert")).toHaveTextContent(errorMessage);
    expect(screen.queryByTestId("result-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("form-container")).toBeInTheDocument();
  });
});

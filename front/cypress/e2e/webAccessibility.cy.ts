describe("Web Accessibility Flow", () => {
  it("must call API when URL is valid and shows results", () => {
    cy.intercept("POST", "/api/analyze", {
      titleScore: { score: 8, maxScore: 3 },
      imageAltScore: { score: 7, maxScore: 4 },
      inputLabelScore: { score: 9, maxScore: 3 },
      total: { score: 8.5, maxScore: 10 },
    }).as("analyzeRequest");
    cy.visit("/");
    cy.get("input[data-testid='url-input']").type("https://exemplo.com");
    cy.contains("button", /analisar/i).click();
    cy.wait("@analyzeRequest");
    cy.get('[data-testid="result-modal"]').should("be.visible");
    cy.contains(/excelente/i).should("be.visible");
  });

  it("must show error alert when API fails", () => {
    cy.intercept("POST", "/api/analyze", {
      statusCode: 500,
      body: { message: "Erro interno" },
    }).as("analyzeRequest");

    cy.visit("/");
    cy.get("input[data-testid='url-input']").type("https://exemplo.com");
    cy.contains("button", /analisar/i).click();
    cy.wait("@analyzeRequest");
    cy.get('[data-testid="loading-spinner"]').should("not.exist");
    cy.get('[role="alert"], [data-testid="error-alert"]').should("be.visible");
    cy.get('[data-testid="result-modal"]').should("not.exist");
  });
});

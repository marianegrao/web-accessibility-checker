# Web Accessibility Checker

A full-stack application for real-time web accessibility analysis. The project allows users to submit URLs for basic compliance analysis with WCAG guidelines, storing and displaying analysis history.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [Communication Flow Diagram](#communication-flow-diagram)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Setup & Installation](#setup--installation)
- [How to Use](#how-to-use)
- [Improvements & Refactoring](#improvements--refactoring)
  - [Short Term](#short-term)
  - [Medium Term](#medium-term)
  - [Long Term](#long-term)
- [Scalability](#scalability)
- [Technologies](#technologies)

---

## 🎯 Overview

The application enables web accessibility analysis focusing on three main criteria:

1. **Page Titles** - Validates presence and quality of `<title>`
2. **Image Descriptions** - Checks `alt` attributes in `<img>` tags
3. **Form Labels** - Validates association of `<label>` with `<input>`

**Total Score:** 0-10 points with classification (Critical | Needs Improvement | Good | Excellent)

---

## 🏗️ Architecture

### Communication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / BROWSER                           │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │     Frontend (Vue 3 + Vite)     │
                    │    Port: 8080 (nginx proxy)     │
                    └────────────┬─────────────────────┘
                                 │
                    1️⃣ POST /api/analyze
                                 │ (URL for analysis)
                    ┌────────────▼─────────────────┐
                    │   Backend (Express + Node)   │
                    │   Port: 3000 (REST API)      │
                    └────────────┬──────────────────┘
                                 │
            2️⃣ Fetch website HTML (fetch API)
                                 │ (Target URL)
            ┌────────────────────▼──────────────────────┐
            │    External Website (analysis target)     │
            └────────────────────────────────────────────┘
                                 │
            3️⃣ Returns HTML content
                                 │
                    ┌────────────▼─────────────────┐
                    │   Analysis with Regex/Parser │
                    │   (titles, images, forms)    │
                    └────────────┬──────────────────┘
                                 │
            4️⃣ Calculate Score (0-10 points)
                                 │
                    ┌────────────▼──────────────────┐
                    │   MongoDB (Persistence)      │
                    │   Saves: url, score, timestamp│
                    └───────────────────────────────┘
                                 │
            5️⃣ Returns Score + Details (JSON)
                                 │
                    ┌────────────▼─────────────────┐
                    │  Frontend renders result     │
                    │  (cards with score, description) │
                    └───────────────────────────────┘
```

### Frontend

**Stack:** Vue 3 + TypeScript + Vite + TailwindCSS + Shadcn-vue

#### Folder Structure:

Rationale for architecture and patterns chosen in the frontend:

- **Module Based Architecture**
  - Encapsulation by domain brings API integration logic closer to the context that uses it (instead of a generic giant `services/` folder).
  - Files related to website analysis are kept together and separated from the rest of the application, allowing extraction and deletion with minimal impact.
- **UI Library**
  - The use of a UI library encourages reusability, visual consistency, and avoids code duplication.
  - Additionally, it enables separation of concerns (this layer is not tied to business domain).

Overall, this combination of Design System/UI Library, feature-based architecture, and shared infrastructure layer provides a healthy foundation for scalability.
As the project grows, we might need upgrades:

- Introduce composables per module to centralize business rules and module data flow in use-case composables, as the project matures.
- Introduce a state management library for local and global state. For example, in the future we might need to handle user login, requiring user data to be stored across the entire application, or a larger module that needs to share variables between components, avoiding _prop drilling_.

```
src/
├── components/
│   └── ui/
│       ├── accordion/    # Reusable accordion components
│       ├── alert/        # Alerts with states (error, success)
│       ├── badge/        # Status badges
│       ├── button/       # Styled buttons
│       ├── card/         # Composite cards (header, content, etc)
│       ├── input/        # Custom input
│       └── spinner/      # Loading spinner
├── modules/
│   └── website/
│       ├── views/
│       │   ├── WebsiteAccessibilityPage.vue   # Main page (analysis)
│       │   └── WebsiteHistoryPage.vue         # History page
│       ├── components/
│       │   └── AnalysisResultModal.vue        # Modal with results
│       └── services/
│           └── website.ts                      # API integration service
├── router/
│   └── index.ts          # Vue Router configuration
├── services/
│   └── api.ts            # Configured Axios client
```

#### Data Flow - Frontend:

1. **Input:** User types URL and clicks "Analyze"
2. **Validation:** Checks if URL is valid
3. **Request:** `checkWebsiteAccessibility(url)` → POST `/api/analyze`
4. **State:** Changes to "loading" with spinner
5. **Response:** Receives `{ titleScore, imageAltScore, inputLabelScore, total }`
6. **Transformation:** Calculates percentages and descriptive messages
7. **Rendering:** Displays cards with colored scores (green/blue/yellow/red)
8. **History:** Loads list of previous analyses

#### Main Components:

- **WebsiteAccessibilityPage:** Analysis state manager (form → loading → result)
- **AnalysisResultModal:** Displays scores with descriptive feedback
- **UI Components:** Reusable design system based on Reka UI

---

### Backend

**Stack:** Express + TypeScript + Mongoose + Node.js

#### Folder Structure:

Rationale for architecture and patterns chosen in the backend:

- **Layered Separation (Controller → Service → Repository → Model)**

  - This approach reduces coupling between layers, facilitates testing (Mocks), and makes it simpler to replace infrastructure details (e.g., switching from MongoDB to DynamoDB) without rewriting business logic.
    - Controller handles HTTP (request/response).
    - Service concentrates business rules (analysis + score calculation).
    - Repository implements the Data Access Layer isolating database access.
    - Model defines the schema and data representation in MongoDB.

- **Domain Module Pattern**

  - This follows the module-based architecture pattern, where all parts related to a domain are in the same module (high cohesion). It also allows module isolation, facilitating evolution, extraction, or removal with minimal impact on the rest of the code (low coupling).

- **Centralized Infrastructure Layer**
  - Centralizing MongoDB connection in one file instead of spreading connection logic across multiple modules.
  - This follows the Separation of Concerns principle, keeping the domain module focused on business rules, not connection details.

Overall, this combination of layered architecture, domain modules, and centralized infrastructure creates a clean, organized, and healthy foundation for a scalable backend, facilitating unit testing, maintenance, and feature addition.

As the project grows, we might need some upgrades:

- Consolidate the infrastructure layer and prevent cross-cutting logic from spreading across controllers and services (e.g., global middlewares like Error Handling).
- Introduce a more explicit input/output validation pattern and DTOs. This reinforces the **DTOs** pattern and facilitates API versioning and documentation. Additionally, it enables implementing a hexagonal architecture (ports and adapters) to facilitate tool migrations (e.g., database change, payment gateway change).

```
src/
├── index.ts              # Entry point, initializes Express server
├── core/
│   └── database.ts       # MongoDB connection
└── modules/
    └── websites/
        ├── website.types.ts         # TypeScript interfaces (PageAnalysisData, ScoreResult)
        ├── websites.model.ts        # MongoDB schema (IWebsite)
        ├── websites.repository.ts   # Data Access Layer
        ├── websites.service.ts      # Business Logic (analysis + score calculation)
        ├── websites.controller.ts   # HTTP handlers (endpoints)
        └── websites.router.ts       # Route definition
```

#### Architecture Pattern - MVC/Clean:

```
Request → Controller → Service → Repository → Database
          (HTTP)    (Logic)  (Persistence)
```

#### Endpoints:

| Method | Route          | Description                   |
| ------ | -------------- | ----------------------------- |
| POST   | `/api/analyze` | Analyzes URL and saves result |
| GET    | `/api/list`    | Returns analysis history      |

---

## 📦 Setup & Installation

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development)
- npm (for local development)

### Local Development

**1. Clone the repository:**

```bash
git clone git@github.com:marianegrao/web-accessibility-checker.git
cd web-accessibility-checker
```

**2. Configure environment variables:**

For running the API environment locally, configure env following the example below:
`server/.env` :

```
NODE_ENV=
MONGODB_URI=mongodb://username:password@mongodb:port/mongodb?authSource=
```

For running the DOCKER environment, ignore the env above and configure env following the example below:

```env
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
NODE_ENV=
MONGODB_URI=mongodb://username:password@mongodb:port/mongodb?authSource=
```

**3. Start with Docker Compose:**

```bash
docker compose up --build
```

**4. Install dependencies (for local development)**

```bash
cd front && npm install
cd ../server && npm install
```

Access:

- Frontend: `http://localhost:8080`
- API: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

### Development without Docker

**Terminal 1 - Frontend:**

```bash
cd front
npm run dev  # Vite server at http://localhost:5173
```

**Terminal 2 - Backend:**

```bash
cd server
npm run dev  # Express server at http://localhost:3000
```

**Terminal 3 - MongoDB:**

```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass mongo:6
```

---

## 🚀 How to Use

1. **Open the application:** `http://localhost:8080`
2. **Enter a URL:** E.g.: `https://example.com`
3. **Click "Analyze"**
4. **View results:**
   - Overall score (0-10)
   - Details by criteria (titles, images, forms)
   - Descriptive feedback for each area

---

## 💡 Improvements & Refactoring

For this project, I focused on meeting the functional and non-functional requirements of the application. Given the reduced time for construction, I would divide the next improvements as follows:

---

### Short Term

#### 1. Separation of Concerns

**Service**  
Before: `analyzeUrl` does everything (fetch + regex + calculation).  
After: split into:

- `UrlFetcher` (responsible for fetching HTML);
- `HtmlParser` (extracts data with regex or other technique);
- `ScoringEngine` (calculates scores).

**Benefit:** improved testability, reusability, and maintenance.

#### 2. WebSocket Communication

With the service layer well separated, it's possible to render on the frontend as each substep is completed, using WebSocket to send real-time updates (e.g.: "fetching HTML", "analyzing images", "calculating final score").

#### 3. Analysis History Functionality

The endpoint already exists, but it can be improved:

- Create additional indexes (`url`, `score`, `details`, `createdAt`) for better details and query performance;
- Use pagination in listings (avoid very large queries).

On the frontend, provide a **datatable** where each row opens a modal with analysis details.

#### 4. Input Validation

Use a library like **zod** or **joi**:

```ts
const urlSchema = z.string().url();
const analyzeSchema = z.object({
  url: urlSchema,
});
```

---

### Medium Term

#### 1. Robust Error Handling

- Create a custom `AppError` class (standardized codes and messages);
- Use `try/catch` with error type handling;
- URL validation beyond just "valid string" (domain rules, protocol, etc.);
- Set timeouts for `fetch`/HTTP requests (avoid freezing);
- Configure CORS properly, aligned with domains that will consume the API.

#### 2. Results Caching

Implement analysis results caching:

- Example: **Redis**;
- If the same URL was analyzed less than X days ago (e.g.: 7 days), reuse the cached result;
- Reduces server load and improves response time.

#### 3. Testing

- Include a staging database in the integration/complete test flow, allowing validation of application behavior in an environment closer to production.
- Separate integration tests into a specific repository, facilitating maintenance by a dedicated team and contributing to clearer organization between unit tests (in the main repository) and integration/end-to-end tests (in the QA/integration repository).
- Cover test scenarios to verify the element counting system. E.g.: count total images and images without `alt` and verify if the returned numbers are correct.

#### 4. Design Refinement

Maintain a continuous design refinement process, ensuring visual and usability evolution without compromising accessibility level.

---

### Long Term

#### 1. Analysis Refinement

Nowadays, the analysis does not cover well scenarios of applications with dynamic content pages. The solution would be to integrate **Puppeteer/Playwright/Selenium**, which would also allow:

- Capture **screenshot** of the analyzed page;
- Separate this analysis into a **microservice** (for example, in Lambda) isolated from the API core.

It's also possible to add new accessibility criteria (WCAG):

- Color contrast (WCAG AA/AAA);
- Heading hierarchy (`<h1>`...`<h6>`);
- Links without descriptive anchor ("click here" vs adequate description);
- Semantic structure (`<main>`, `<nav>`, `<article>`, etc.);
- ARIA attributes (`role`, `aria-label`, `aria-describedby`);
- Loading speed;
- Performance metrics (e.g.: Lighthouse score).

---

## 📈 Scalability

### Current Problems and Possible Solutions

- **Synchronous Analysis (blocks request)**

  - Problem: if the analyzed site is slow, the request may timeout.
  - Possible solution: transform the analysis into an asynchronous process that only signals (via email, for example) when the analysis is complete.
    - In this scenario, we could use **SQS queues** (FIFO if a same client needs different analyses in a specific processing order), which would trigger an analysis system in **AWS Lambda**.
    - This way, the API wouldn't be blocked waiting for analysis completion; its responsibility would basically be to **add the message to the queue** and return immediately.

- **No Results Caching**

  - Problem: multiple analyses of the same site result in multiple complete requests, increasing cost and latency.
  - Possible solution: introduce a **caching** system for recent responses, using for example **Redis** or **Amazon ElastiCache**, reducing unnecessary processing and speeding up responses for already analyzed URLs.

- **No Request Limiting (DoS Risk)**

  - Problem: there's no request rate control, opening a gap for abuse or possible denial of service attacks.
  - Possible solution: add a **rate limiting middleware**, which restricts the number of requests per IP/client in a time interval.
    - This can be done at the application layer (rate limit libraries) or in a proxy/reverse like **Nginx** or API Gateway, which also offer throttling mechanisms.

- **Risk of Serving on a Single Machine (EC2)**
  - Problem: if the API runs on only one instance (EC2), there's risk of unavailability in scenarios of multiple simultaneous requests or machine failure.
  - Possible solution: use a **load balancer** in front of multiple application instances, allowing **horizontal scaling** according to access peaks and increasing resilience in case of failure of one of the instances. For the frontend we could serve on CloudFront (Vue static build and its assets) for latency reduction. The database could be migrated to DynamoDB so that our entire application would be distributed on AWS.
    > PS: With this approach we would have a certain AWS infrastructure lock-in disadvantage which could complicate cloud migration, but could facilitate the service centralization process

### Monitoring & Observability

When we talk about scalable infrastructures, we're talking about multiple instances. That is, in the architecture we move to having more access points and more modifications occurring in parallel, which need to be monitored for:

- spending analysis,
- tracking usage peaks,
- error tracking and diagnosis.
  A good monitoring and observability plan makes it possible to understand system behavior in production, react quickly to incidents, and plan infrastructure evolution more efficiently.

## 📝 Testing

### Frontend

```bash
# Unit tests (Vitest)
npm run test:unit

# Unit tests (watch mode)
npm run test:unit:watch

# E2E tests (Cypress)
npm run test:e2e
```

### Backend

```bash
# Unit tests (Vitest)
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### CI/CD

```bash
# GitHub Actions run on:
# - Push to master
# - Pull requests

# Stages:
1. Frontend: Install → Vitest → Cypress
2. Backend: Install → Vitest
```

---

## 🛠️ Technologies

### Frontend

- **Vue 3** - Reactive framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Vitest** - Testing framework
- **Cypress** - E2E testing
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client
- **Vue Router** - SPA routing
- **Reka UI** - Component library

### Backend

- **Express 5** - Web framework
- **Node.js** - Runtime
- **TypeScript** - Type safety
- **Mongoose 8** - MongoDB ODM
- **Vitest** - Testing framework
- **ESLint** - Linting

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **MongoDB 6** - Database
- **Nginx** - Reverse proxy (frontend)
- **GitHub Actions** - CI/CD

---

## 👤 Author

Developed by Maria C. Negrão

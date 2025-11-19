# Web Accessibility Checker

Uma aplicação full-stack para análise de acessibilidade web em tempo real. O projeto permite que usuários submetam URLs para análise básica de conformidade com diretrizes WCAG, armazenando e exibindo histórico de resultados.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
  - [Fluxograma de Comunicação](#fluxograma-de-comunicação)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Configuração & Instalação](#configuração--instalação)
- [Como Usar](#como-usar)
- [Melhorias & Refatorações](#melhorias--refatorações)
  - [Curto Prazo](#curto-prazo)
  - [Médio Prazo](#médio-prazo)
  - [Longo Prazo](#longo-prazo)
- [Escalabilidade](#escalabilidade)
- [Tecnologias](#tecnologias)

---

## 🎯 Visão Geral

A aplicação permite análise de acessibilidade web focando em três critérios principais:

1. **Títulos da Página** - Valida presença e qualidade do `<title>`
2. **Descrição de Imagens** - Verifica atributos `alt` em tags `<img>`
3. **Etiquetas de Formulários** - Valida associação de `<label>` com `<input>`

**Pontuação Total:** 0-10 pontos com classificação (Crítico | Necessita Melhorias | Bom | Excelente)

---

## 🏗️ Arquitetura

### Fluxograma de Comunicação

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIO / NAVEGADOR                      │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │     Frontend (Vue 3 + Vite)     │
                    │    Port: 8080 (nginx proxy)     │
                    └────────────┬─────────────────────┘
                                 │
                    1️⃣ POST /api/websites/analyze
                                 │ (URL para análise)
                    ┌────────────▼─────────────────┐
                    │   Backend (Express + Node)   │
                    │   Port: 3000 (API REST)      │
                    └────────────┬──────────────────┘
                                 │
            2️⃣ Fetch website HTML (fetch API)
                                 │ (Target URL)
            ┌────────────────────▼──────────────────────┐
            │    Website Externo (alvo da análise)      │
            └────────────────────────────────────────────┘
                                 │
            3️⃣ Retorna HTML content
                                 │
                    ┌────────────▼─────────────────┐
                    │   Análise com Regex/Parser   │
                    │   (títulos, imagens, forms)  │
                    └────────────┬──────────────────┘
                                 │
            4️⃣ Calcula Score (0-10 pontos)
                                 │
                    ┌────────────▼──────────────────┐
                    │   MongoDB (Persistência)      │
                    │   Salva: url, score, timestamp│
                    └───────────────────────────────┘
                                 │
            5️⃣ Retorna Score + Detalhes (JSON)
                                 │
                    ┌────────────▼─────────────────┐
                    │  Frontend renderiza resultado │
                    │  (cards com score, descrição) │
                    └───────────────────────────────┘
```

### Frontend

**Stack:** Vue 3 + TypeScript + Vite + TailwindCSS + Shadcn-vue

#### Estrutura de Pastas:

Motivos pela escolha de arquitetura e padrões no frontend:

- **Module Based Architecture**
  - O encapsulamento por domínio aproxima a lógica de integração da API do contexto que a usa (em vez de um `services/` gigante e genérico).
  - Os arquivos relacionados à análise de site ficam juntos e separados do resto da aplicação, permitindo extração e deleção com baixo impacto.
- **Biblioteca de UI**
  - A utilização de uma biblioteca de UI incentiva reutilização, consistência visual e evita duplicação de código.
  - Além disso, possibilita a separação de responsabilidades (essa camada não está atrelada ao domínio de negócio).

De forma geral, essa combinação de Design System/Biblioteca de UI, arquitetura por features e camada de infraestrutura compartilhada é uma base saudável para escalabilidade.
Conforme o projeto cresce, poderíamos precisar de upgrades:

- Introduzir composables por módulo para centralizar regra de negócio e fluxo de dados do módulo em composables de caso de uso, conforme o amadurecimento do projeto.
- Introduzir uma lib de gerenciamento de estado local e global Imaginando que no futuro poderíamos ter um fluxo de login, por exemplo, precisaríamos guardar os dados do usuário logado em toda a aplicação, ou um módulo maior que precise de variáveis compartilhadas entre componentes, evitando assim _prop drilling_.

```
src/
├── components/
│   └── ui/
│       ├── accordion/    # Componentes accordion reutilizáveis
│       ├── alert/        # Alerts com estados (error, success)
│       ├── badge/        # Badges para status
│       ├── button/       # Botões estilizados
│       ├── card/         # Cards compostos (header, content, etc)
│       ├── input/        # Input customizado
│       └── spinner/      # Loading spinner
├── modules/
│   └── website/
│       ├── views/
│       │   ├── WebsiteAccessibilityPage.vue   # Página principal (análise)
│       │   └── WebsiteHistoryPage.vue         # Página de histórico
│       ├── components/
│       │   └── AnalysisResultModal.vue        # Modal com resultados
│       └── services/
│           └── website.ts                      # Serviço de integração API
├── router/
│   └── index.ts          # Configuração de rotas (Vue Router)
├── services/
│   └── api.ts            # Cliente Axios configurado
```

#### Fluxo de Dados - Frontend:

1. **Entrada:** Usuário digita URL e clica "Analisar"
2. **Validação:** Verifica se URL é válida
3. **Requisição:** `checkWebsiteAccessibility(url)` → POST `/api/websites/analyze`
4. **Estado:** Muda para "loading" com spinner
5. **Resposta:** Recebe `{ titleScore, imageAltScore, inputLabelScore, total }`
6. **Transformação:** Calcula percentuais e mensagens descritivas
7. **Renderização:** Exibe cards com scores coloridos (verde/azul/amarelo/vermelho)
8. **Histórico:** Carrega lista de análises anteriores

#### Componentes Principais:

- **WebsiteAccessibilityPage:** State manager da análise (form → loading → result)
- **AnalysisResultModal:** Exibe scores com feedback descritivo
- **UI Components:** System design reutilizável baseado em Reka UI

---

### Backend

**Stack:** Express + TypeScript + Mongoose + Node.js

#### Estrutura de Pastas:

Motivos pela escolha de arquitetura e padrões no backend:

- **Separação em camadas (Controller → Service → Repository → Model)**

  - Essa abordagem reduz acoplamento entre camadas, facilita testes (Mocks) e torna mais simples substituir detalhes de infraestrutura (por exemplo, trocar de MongoDB DynamoDB) sem reescrever a lógica de negócio.
    - \*\*Controller lida com HTTP (request/response).
    - Service concentra a regra de negócio (análise + cálculo de score).
    - Repository implementa a Data Access Layer isolando o acesso ao banco.
    - Model define o schema e a representação dos dados no MongoDB.

- **Domain Module Pattern**

  - Isso segue o padrão de arquitetura por módulo, onde matemos todas as partes relacionadas a um dominio estão no mesmo módulo (alta coesao). Também permite o isolamento do modulo, facilitando evolução, extração ou remoção com baixo impacto no restante do código (baixo acoplamento).

- **Camada de infraestrutura centralizada**
  - A centralizacao da conexão com o MongoDB em um arquivo em vez de espalhar lógica de conexão por vários módulos.
  - Isso segue o princípio de Separation of Concerns, deixando o módulo de domínio focado em regra de negócio, não em detalhes de conexão.

De forma geral, essa combinação de arquitetura em camadas, módulos por domínio e infraestrutura centralizada cria uma base limpa, organizada e saudável para um backend escalável, facilitando testes unitários, manutenção e adição de novas features.

Conforme o projeto cresce, poderíamos precisar de alguns upgrades:

- Consolidar a camada de infraestrutura e evita que lógica cross-cutting se espalhe por controllers e services (ex: middlewares globais, como de Error Handling).
- Introduzir um padrão de validação e DTOs de entrada/saída mais explícitos isso reforça o padrão de **DTOs** e facilita versionamento de API e documentação. Além disso, permite a implementação de um arquitetura hexagonal (ports e adapters) para permitir migracoes entre ferramentas de forma facilitada (ex: troca da banco, troca de gateway de pagamento)

```
src/
├── index.ts              # Entry point, inicializa servidor Express
├── core/
│   └── database.ts       # Conexão com MongoDB
└── modules/
    └── websites/
        ├── website.types.ts         # Interfaces TypeScript (PageAnalysisData, ScoreResult)
        ├── websites.model.ts        # Schema MongoDB (IWebsite)
        ├── websites.repository.ts   # Data Access Layer
        ├── websites.service.ts      # Business Logic (análise + cálculo score)
        ├── websites.controller.ts   # HTTP handlers (endpoints)
        └── websites.router.ts       # Definição de rotas
```

#### Padrão de Arquitetura - MVC/Clean:

```
Request → Controller → Service → Repository → Database
          (HTTP)    (Lógica)  (Persistência)
```

#### Endpoints:

| Método | Rota                    | Descrição                     |
| ------ | ----------------------- | ----------------------------- |
| POST   | `/api/websites/analyze` | Analisa URL e salva resultado |
| GET    | `/api/websites/list`    | Retorna histórico de análises |

## 📦 Configuração & Instalação

### Pré-requisitos

- Docker & Docker Compose
- Node.js 22+ (para desenvolvimento local)
- npm (para desenvolvimento local)

### Desenvolvimento Local

**1. Clone o repositório:**

```bash
git clone git@github.com:marianegrao/web-accessibility-checker.git
cd web-accessibility-checker
```

**2. Configure variáveis de ambiente:**

Em caso do rodar ambiente API locamente configurar env seguindo exemplo abaixo:
`server/.env` :

```
NODE_ENV=
MONGODB_URI=mongodb://username:password@mongodb:port/mongodb?authSource=
```

Em caso do rodar ambiente DOCKER `.env`, ignorar env anterior e configurar env seguindo exemplo abaixo:

```env
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
NODE_ENV=
MONGODB_URI=mongodb://username:password@mongodb:port/mongodb?authSource=
```

**3. Inicie com Docker Compose:**

```bash
docker compose up --build
```

**4. Instale dependências (para desenvolvimento local)**

```bash
cd front && npm install
cd ../server && npm install
```

Acesso:

- Frontend: `http://localhost:8080`
- API: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

### Desenvolvimento sem Docker

**Terminal 1 - Frontend:**

```bash
cd front
npm run dev  # Servidor Vite em http://localhost:5173
```

**Terminal 2 - Backend:**

```bash
cd server
npm run dev  # Servidor Express em http://localhost:3000
```

**Terminal 3 - MongoDB:**

```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass mongo:6
```

---

## 🚀 Como Usar

1. **Abra a aplicação:** `http://localhost:8080`
2. **Digite uma URL:** Ex: `https://google.com.br`
3. **Clique em "Analisar"**
4. **Visualize resultados:**
   - Score geral (0-10)
   - Detalhes por critério (título, imagens, formulários)
   - Feedback descritivo para cada área

---

## 💡 Melhorias & Refatorações

Para este projeto, foquei em cumprir os requisitos funcionais e não funcionais da aplicação. Dado o tempo reduzido para construção, eu dividiria as próximas melhorias da seguinte forma:

---

### A curto prazo

#### 1. Separação de Concerns

**Service**  
Antes: `analyzeUrl` faz tudo (fetch + regex + cálculo).  
Depois: dividir em:

- `UrlFetcher` (responsável por buscar o HTML);
- `HtmlParser` (extrai dados com regex ou outra técnica);
- `ScoringEngine` (calcula os scores).

**Benefício:** melhora de testabilidade, reutilização e manutenção.

#### 2. Comunicação via WebSocket

Com a etapa de serviço bem separada, é possível ir renderizando no front conforme cada subetapa é concluída, usando WebSocket para enviar atualizações em tempo real (ex.: “buscando HTML”, “analisando imagens”, “calculando score final”).

#### 3. Funcionalidade de histórico de análises

Já existe o endpoint, mas ele pode ser aprimorado:

- Criar índices adicionais (`url`, `score`, `details`, `createdAt`) para melhor detalhamento e performance de consulta;
- Usar paginação na listagem (evitar consultas muito grandes).

No front, disponibilizar um **datatable** em que cada linha abre um modal com o detalhamento da análise.

#### 4. Validação de Entrada

Usar uma biblioteca como **zod** ou **joi**:

```ts
const urlSchema = z.string().url();
const analyzeSchema = z.object({
  url: urlSchema,
});
```

---

### Médio Prazo

#### 1. Error Handling robusto

- Criar uma classe `AppError` customizada (códigos e mensagens padronizadas);
- Usar `try/catch` com tratamento por tipo de erro;
- Validação de URL além de apenas “string válida” (regras de domínio, protocolo, etc.);
- Definir timeouts para `fetch`/requisições HTTP (evitar travamentos);
- Configurar CORS adequadamente, alinhado com os domínios que irão consumir a API.

#### 2. Cache de resultados

Implementar cache de resultados de análise:

- Exemplo: **Redis**;
- Se a mesma URL foi analisada há menos de X dias (ex.: 7 dias), reutilizar o resultado em cache;
- Reduz carga no servidor e melhora o tempo de resposta.

#### 3. Testes

- Incluir um banco de dados de homologação no fluxo de testes de integração/completos, permitindo validar o comportamento da aplicação em um ambiente mais próximo de produção.
- Separar os testes de integração em um repositório específico, facilitando a manutenção por um time dedicado e contribuindo para uma organização mais clara entre testes unitários (no repositório principal) e testes de integração/end-to-end (no repositório de QA/integração).
- Abranger cenários de teste para verificar o sistema de contagem de elementos. Ex.: contar imagens totais e imagens sem `alt` e conferir se os números retornados estão corretos.

#### 4. Refinamento do Design

Manter um processo contínuo de refinamento do design, garantindo evolução visual e de usabilidade sem comprometer o nível de acessibilidade.

---

### Longo Prazo

#### 1. Refinamento da análise

Hoje em dia, a análise não abrange bem cenários de aplicações com páginas de conteúdo dinâmico. A solução seria integrar **Puppeteer/Playwright/Selenium**, o que também permitiria:

- Capturar **screenshot** da página analisada;
- Separar essa análise em um **microserviço** (por exemplo, em Lambda) isolado do core da API.

Também é possível adicionar novos critérios de acessibilidade (WCAG):

- Contraste de cores (WCAG AA/AAA);
- Hierarquia de headings (`<h1>`...`<h6>`);
- Links sem âncora descritiva (“clique aqui” vs descrição adequada);
- Estrutura semântica (`<main>`, `<nav>`, `<article>`, etc.);
- Atributos ARIA (`role`, `aria-label`, `aria-describedby`);
- Velocidade de carregamento;
- Métricas de performance (ex.: Lighthouse score).

---

## 📈 Escalabilidade

### Problemas Atuais e suas possíveis soluções

- **Análise síncrona (bloqueia a request)**

  - Problema: se o site analisado for lento, a requisição pode estourar por timeout.
  - Possível solução: transformar a análise em um processo assíncrono que apenas sinaliza (por e-mail, por exemplo) quando a análise for finalizada.
    - Nesse cenário, poderíamos utilizar **filas SQS** (FIFO caso um mesmo cliente precise de diferentes análises em uma ordem específica de processamento), que acionariam um sistema de análise em **AWS Lambda**.
    - Dessa forma, a API não ficaria bloqueada aguardando a conclusão da análise; sua responsabilidade seria basicamente **incluir a mensagem na fila** e retornar imediatamente.

- **Sem cache de resultados**

  - Problema: múltiplas análises do mesmo site resultam em múltiplas requisições completas, aumentando custo e latência.
  - Possível solução: introduzir um sistema de **cache** para respostas recentes, utilizando por exemplo **Redis** ou **Amazon ElastiCache**, reduzindo processamento desnecessário e acelerando respostas para URLs já analisadas.

- **Sem limite de requisições (risco de DoS)**

  - Problema: não há controle de taxa de requisições, abrindo brecha para abuso ou possíveis ataques de negação de serviço.
  - Possível solução: adicionar um **middleware de rate limiting**, que restrinja o número de requisições por IP/cliente em um intervalo de tempo.
    - Isso pode ser feito na camada de aplicação (bibliotecas de rate limit) ou em um proxy/reverso como **Nginx** ou API Gateway, que também oferecem mecanismos de throttling.

- **Risco ao servir em uma única máquina (EC2)**
  - Problema: se a API rodar em apenas uma instância (EC2), há risco de indisponibilidade em cenários de múltiplas requisições simultâneas ou falha da máquina.
  - Possível solução: utilizar um **load balancer** na frente de múltiplas instâncias da aplicação, permitindo **escalonamento horizontal** conforme picos de acesso e aumentando a resiliência em caso de falha de uma das instâncias. Para o frontend poderiamos servir no CloudFront (Vue build estático e seus assets) para redução de latencia. O Banco de dados poderia ser migrado para o DynamoDB de forma que toda nossa aplicação ficaria distribuida na AWS.
    > PS: Com essa abordagem teriamos um certo maleficio de lock-in na infraestrutura AWS o que pode dificultar na migracao de cloud, mas pode facilitar o processo de centralicao de servicos

### Monitoramento & Observabilidade

Quando falamos de infraestruturas escaláveis, estamos falando de múltiplas instâncias. Ou seja, na arquitetura passamos a ter mais pontos de acesso e mais modificações ocorrendo em paralelo, que precisam ser monitoradas para:

- análise de gastos,
- acompanhamento de picos de uso,
- rastreio e diagnóstico de erros.
  Um bom plano de monitoramento e observabilidade torna possível entender o comportamento do sistema em produção, reagir rapidamente a incidentes e planejar a evolução da infraestrutura de forma mais eficiente.

## 📝 Testes

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
# GitHub Actions executam em:
# - Push para master
# - Pull requests

# Stages:
1. Frontend: Install → Vitest → Cypress
2. Backend: Install → Vitest
```

---

## 🛠️ Tecnologias

### Frontend

- **Vue 3** - Framework reativo
- **TypeScript** - Type safety
- **Vite** - Build tool rápido
- **Vitest** - Testing framework
- **Cypress** - E2E testing
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client
- **Vue Router** - Roteamento SPA
- **Reka UI** - Component library

### Backend

- **Express 5** - Web framework
- **Node.js** - Runtime
- **TypeScript** - Type safety
- **Mongoose 8** - MongoDB ODM
- **Vitest** - Testing framework
- **ESLint** - Linting

### DevOps

- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **MongoDB 6** - Banco de dados
- **Nginx** - Proxy reverso (frontend)
- **GitHub Actions** - CI/CD

---

## 👤 Autora

Desenvolvido por Maria C. Negrão

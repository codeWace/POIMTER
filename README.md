# 🌍 Poimter — AI Market Intelligence Platform

> **Where should your business expand next?** Poimter answers that question in seconds using a multi-agent AI system that fuses real-time news, geo data, market signals, and hedge-fund-grade analysis into a single actionable report.

---

## Built for Hackathon

Poimter is a full-stack market intelligence platform powered by a swarm of 8 specialized AI agents. Enter a product or business idea, and Poimter tells you which global markets to enter, why, and what the risks are — with live data, interactive maps, and an AI analyst you can talk to.

---

## Features

- 🤖 **8-Agent AI Swarm** — Coordinator, Search, Market, News, Geo, Map, Fusion, and Report agents work in parallel
- 🗺️ **Global Heat Map** — Interactive geo visualization of market opportunity by country
- 📊 **Hedge Fund Reports** — Demand scores, competition analysis, risk-adjusted returns, investor outlook
- 💬 **Live AI Analyst Chat** — Ask questions about your report in natural language, powered by Claude
- 📰 **Real-Time News Intelligence** — Live news signals fused into market scoring
- 📄 **PDF Export** — Download your full intelligence report
- 🌐 **Globe View** — 3D visualization of global market signals

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI Agents | Anthropic Claude + Groq |
| Real-time | Band (WebSocket orchestration) |
| Maps | Leaflet + Choropleth |
| News | NewsAPI |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/codeWace/POIMTER.git
cd POIMTER
```

### 2. Install dependencies

```bash
npm install
cd brain-server && npm install && cd ..
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local` (see [Required API Keys](#-required-api-keys) below).

### 4. Run the app

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Brain server (WebSocket)
cd brain-server
node server.js
```

Open [http://localhost:3000](http://localhost:3000)

---

## Required API Keys

Create a `.env.local` file with the following:

```env
# AI
ANTHROPIC_API_KEY=          # claude.ai → API keys
GROQ_API_KEY=               # console.groq.com
NEXT_PUBLIC_GROQ_API_KEY=   # same as above

# News
NEWS_API_KEY=               # newsapi.org

# Band (multi-agent orchestration)
BAND_API_KEY=
BAND_SEARCH_KEY=
BAND_COORDINATOR_KEY=
BAND_MARKET_KEY=
BAND_NEWS_KEY=
BAND_GEO_KEY=
BAND_FUSION_KEY=
BAND_MAP_KEY=
BAND_REPORT_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## How It Works

```
User Query (e.g. "cricket bats in USA")
        ↓
  CoordinatorAgent
        ↓
  ┌─────┴──────┐
SearchAgent  NewsAgent
MarketAgent  GeoAgent
MapAgent     FusionAgent
        ↓
  ReportAgent
        ↓
  Full Intelligence Report + Heat Map + AI Chat
```

1. User enters a product/market query
2. The Coordinator spins up 7 specialist agents in parallel
3. Each agent fetches and scores real-time signals
4. FusionAgent combines all signals into a unified market score
5. ReportAgent generates a hedge-fund-style investment report
6. User can chat with the AI Analyst for deeper insight

---

## Project Structure

```
poimter/
├── agents/          # 8 AI agent definitions
├── app/             # Next.js pages and API routes
│   ├── api/         # Backend API endpoints
│   ├── dashboard/   # Main dashboard + AI chat
│   ├── report/      # Report view
│   └── map/         # Interactive map
├── brain/           # Core intelligence engine
│   ├── ml/          # Scoring, forecasting, anomaly detection
│   ├── geo/         # Global market geo engine
│   └── ai/          # LLM insight engine
├── brain-server/    # WebSocket server for real-time agents
├── band/            # Multi-agent orchestration layer
└── core/            # Shared state and signal processing
```

---

## Team BLACKQUANTUM

Built for the hackathon by **codeWace aka wajihatasaduq** and **madihatasaduq**

---

## 📜 License

MIT

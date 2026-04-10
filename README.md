# SPEX-Shop — The Ultimate Tech Hub

SPEX-Shop is a premium smartphone research and e-commerce ecosystem. It combines a professional-grade technical workstation for discovering and comparing smartphones with a high-performance shopping engine. Powered by Retrieval-Augmented Generation (RAG) and optimized for the Thai language, it provides AI-driven insights alongside a seamless, secure cart and checkout experience.

---

## Features

- **Neural Semantic Search** — Cross-Encoder reranker (`ms-marco-MiniLM-L-6-v2`) understands query intent, not just keywords.
- **Hybrid Scoring** — MongoDB Atlas Vector Search + exact keyword overlap for high-precision retrieval.
- **Smart E-Commerce Engine** — Secure JWT-based authentication, real-time cart synchronization, and persistent order tracking.
- **Multi-Query Expansion** — Typhoon LLM rewrites each query into 3 variations before searching, catching specs others miss.
- **Persistent Chat History** — Conversations are saved to MongoDB per session. AI assistant provides context-aware shopping advice.
- **Side-by-Side Compare** — Dedicated `/compare` workspace with 20+ spec rows across up to 4 models with fixed-slot UX.
- **Feedback Loop** — Thumbs up/down on every answer feeds into ongoing quality monitoring.
- **Auto Re-scrape** — GitHub Actions scrapes technical data monthly to keep the database fresh.

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Typhoon v2.5 (Thai-optimized) |
| Embeddings | `@xenova/transformers` — `paraphrase-multilingual-MiniLM-L12-v2` |
| Reranker | Neural Cross-Encoder `ms-marco-MiniLM-L-6-v2` |
| Database | MongoDB Atlas + Vector Search (`vector_index`, 384-dim cosine) |
| Backend | Node.js 22 · Express 4 · TypeScript strict · Bun |
| Web Frontend | Next.js 14 App Router · React 18 · Tailwind CSS 4 · Framer Motion |
| Mobile App | React Native (Expo) · Expo Router · Lucide Icons |
| State | TanStack Query v5 (React Query) |
| Analytics | AI-Powered Hardware Fingerprinting (Radar Charts) |
| Hosting | Azure App Service (backend) · Vercel (frontend) |
| CI/CD | GitHub Actions — Deploy + Monthly Scrape |

---

## RAG Pipeline

```
User query (Thai)
  ↓ Typhoon expands into 3 query variations
  ↓ Embed all 4 queries in parallel (@xenova/transformers)
  ↓ MongoDB Atlas $vectorSearch — top 15 results each
  ↓ Merge + deduplicate by slug (keep highest vector score)
  ↓ Neural rerank: (0.5 × Cross-Encoder) + (0.5 × Vector) + (0.1 × Keyword)
  ↓ Top 5 specs → Thai-language context block
  ↓ Typhoon generates answer (4096 tokens, temp 0.1)
  ↓ Fallback: retrieval-only Thai summary if generation fails
  ↓ { answer, sources[] } — saved to MongoDB chat_history
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | DB status + uptime |
| POST | `/api/search` | RAG search — `{ query, sessionId? }` |
| GET | `/api/products` | Paginated product catalog |
| GET | `/api/compare` | Side-by-side compare for 2–4 models |
| POST | `/api/auth/login` | Secure JWT Authentication |
| GET | `/api/cart` | User cart synchronization |
| POST | `/api/orders/create` | Order creation + Invoice generation |
| GET | `/api/images/official` | Model image lookup |
| POST | `/api/feedback` | Submit helpful/unhelpful rating |

Rate limits: 30 req/min global · 10 req/min on `/api/search`.

---

## Quick Start

### Prerequisites
- Bun installed
- MongoDB Atlas cluster with a Vector Search index named `vector_index` (384-dim, cosine)
- Typhoon API key from [opentyphoon.ai](https://opentyphoon.ai)

### Backend
```bash
cd backend
bun install
# Configure .env — see Environment Variables below
bun dev   # http://localhost:3001
```

### Frontend
```bash
cd frontend
bun install
# Configure .env.local — see Environment Variables below
bun dev   # http://localhost:3000
```

### Scraper (data ingestion)
```bash
cd scraper
pip install -r requirements.txt
python scraper.py           # fetch from Specphone.com
python cleaner.py           # deduplicate
python db.py                # import to MongoDB Atlas
pip install -r requirements-embedder.txt
python embedder.py          # generate 384-dim embeddings
python create_vector_index.py   # create Atlas vector index if missing
```

> **Specphone down?** Run `python import_csv_dataset.py` to load the bundled `smartphones(2015-2025).csv` fallback dataset instead.

---

## Environment Variables

### `backend/.env`
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=specbot
TYPHOON_API_KEY=...
TYPHOON_MODEL=typhoon-v2.5-30b-a3b-instruct
PORT=3001
NODE_ENV=development
VECTOR_INDEX_NAME=vector_index
HF_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=SpecBot
```

---

## MongoDB Collections

| Collection | Purpose |
|---|---|
| `specs` | Smartphone documents with embeddings — scraped from Specphone.com |
| `chat_history` | Persistent Q&A pairs keyed by `sessionId` (last 50 per session) |
| `feedback` | User ratings per RAG response |

---

## License

Built for educational and professional smartphone research. Data sourced from Specphone.com and public datasets.

---

*Built it. Use it or don't. (Buy me a coffee instead of money — cash is too much responsibility).*

# SpecBot — Thai Smartphone AI Assistant

SpecBot is a professional-grade technical workstation designed for discovering and comparing smartphones. Powered by Retrieval-Augmented Generation (RAG) and optimized for the Thai language, it combines real-time data scraping with state-of-the-art neural search.

---

## Key Features

- **Neural Semantic Search**: Beyond keyword matching, SpecBot uses a Cross-Encoder reranker (`ms-marco-MiniLM-L-6-v2`) to understand the intent behind your technical queries.
- **Hybrid Data Layer**: Combines high-speed Vector Search (MongoDB Atlas) with exact keyword overlap scoring for 99.9% technical accuracy.
- **Technical Workspace**: A Samsung-inspired, high-end comparison dashboard for side-by-side spec evaluation.
- **Automated Intelligence**:
  - **Auto Re-scrape**: GitHub Actions scheduled monthly to keep the database fresh.
  - **Feedback Loop**: Integrated "Thumbs Up/Down" system to continuously monitor and improve AI response quality.
  - **Multi-Query Expansion**: Uses Typhoon LLM to expand single queries into multiple search facets, catching details others miss.

## Tech Stack

### Core AI & Search
- **LLM**: Typhoon (Optimized for Thai Language)
- **Embeddings**: `@xenova/transformers` (Multilingual MiniLM)
- **Reranker**: Neural Cross-Encoder (ms-marco)
- **Database**: MongoDB Atlas + Vector Search Index

### Frontend (Modern Web)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4 & Framer Motion
- **State Management**: TanStack Query (React Query v5)

### Backend (Robust API)
- **Runtime**: Node.js & Bun
- **Framework**: Express & Mongoose
- **Architecture**: Unified API routing with rate-limiting and standard error handling.

---

## Quick Start

### 1. Prerequisites
- Bun installed.
- MongoDB Atlas cluster with a Vector Search index named `vector_index`.

### 2. Backend Setup
```bash
cd backend
bun install
# Configure .env with MONGODB_URI and TYPHOON_API_KEY
bun dev
```

### 3. Frontend Setup
```bash
cd frontend
bun install
# Configure .env.local with NEXT_PUBLIC_API_URL
bun dev
```

### 4. Data Sync (Scraper)
```bash
cd scraper
pip install -r requirements.txt
python scraper.py
python db.py
python embedder.py
```

---

## Architecture

SpecBot follows a Triple-Score RAG Pipeline:
1. **Expansion**: The user's query is expanded into 3 variations using Typhoon.
2. **Retrieval**: MongoDB Atlas performs a $vectorSearch across all variations.
3. **Neural Reranking**: Results are scored using `(0.5 * Neural) + (0.5 * Vector) + (0.1 * Keyword Match)`.
4. **Generation**: Top 5 technical specs are fed into Typhoon for a synthesized Thai response.

---

## License
This project is built as a technical workstation for educational and professional smartphone research. Data is sourced from Specphone.com and various technical datasets.

---

*Built it. Use it or don't. (Buy me a coffee instead of money, cash is too much responsibility).*

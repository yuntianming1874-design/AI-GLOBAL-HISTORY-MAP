# AI Global History Map — System Architecture

## 1. Overview

**AI Global History Map** is an educational platform for exploring human history through an
interactive timeline, a historical map, a character relationship graph, and an AI history
assistant. Phase 1 (MVP) focuses on the Tang Dynasty period (618–907) and its
contemporaries worldwide (Abbasid Caliphate, Byzantine Empire, Carolingian Empire, Silla,
Nara/Heian Japan, Maya, Srivijaya, Khazar Khaganate, Viking Age, …).

## 2. Layer Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│ PRESENTATION (Next.js 14 App Router · TypeScript strict · Tailwind CSS)   │
│                                                                           │
│   /            Overview dashboard: global timeline, China↔World panel,    │
│                featured event cards                                       │
│   /map         Full-screen historical map                                 │
│   /people      Character relationship graph                               │
│   /chat        AI history assistant                                       │
├───────────────────────────────────────────────────────────────────────────┤
│ VISUALIZATION (client components under /components/history)               │
│                                                                           │
│   Timeline.tsx      D3-based focus+context timeline with era bands        │
│   ComparisonPanel.tsx  China vs World century chart + parallel events     │
│   HistoryMap.tsx    MapAdapter → Mapbox GL (token) | D3 world map (auto   │
│                     fallback, world-atlas GeoJSON)                        │
│   PersonGraph.tsx   D3 force-directed relationship graph                  │
│   EventCard.tsx     Reusable event detail card (modal + inline)           │
│   AIChat.tsx        Chat UI with suggested prompts, source badges         │
├───────────────────────────────────────────────────────────────────────────┤
│ API (Next.js Route Handlers, app/api/*, Zod-validated inputs)             │
│                                                                           │
│   GET  /api/overview         stats, century comparison, parallel events   │
│   GET  /api/events           filters: civilization, category, from, to, q │
│   GET  /api/people           filters: civilization, q                     │
│   GET  /api/relationships    relationship edges for the graph             │
│   GET  /api/civilizations    civilizations (eras + theming)               │
│   GET  /api/locations        locations (map pins)                         │
│   POST /api/chat             AI assistant (pluggable engine)              │
├───────────────────────────────────────────────────────────────────────────┤
│ DATA ACCESS (lib/repository.ts — Repository pattern)                      │
│                                                                           │
│   PostgresRepository   pg Pool, activated by DATABASE_URL                 │
│   SeedRepository       in-memory seed data, zero-config fallback          │
│   Same interface; the app runs identically with or without a database.    │
├───────────────────────────────────────────────────────────────────────────┤
│ AI (lib/assistant.ts)                                                     │
│                                                                           │
│   OpenAIAssistant     called when OPENAI_API_KEY is set                   │
│   LocalAssistant      keyword retrieval + intent templates over the       │
│                       seed knowledge base, works fully offline,           │
│                       returns citations                                   │
├───────────────────────────────────────────────────────────────────────────┤
│ DATA (src/data/seed/*.ts · db/schema.sql · scripts/seed-db.ts)            │
│                                                                           │
│   civilizations (12) · locations (17) · events (48) · people (25)         │
│   relationships (40)  → 142 entities total                                │
└───────────────────────────────────────────────────────────────────────────┘
```

## 3. Data Flow

1. Pages are server components that render client component trees; each client
   visualization fetches its slice of data from the matching route handler.
2. Route handlers validate query/body with Zod, then call the repository.
3. The repository resolves to Postgres (when `DATABASE_URL` is set) or the in-memory
   seed store. Both return the same typed DTOs (`lib/types.ts`).
4. DTOs flow to D3/Mapbox renderers; user interaction (brush, click, filter) issues
   new fetches or re-renders client-side state.

## 4. Key Engineering Decisions

| Decision | Rationale |
|---|---|
| Repository pattern with two adapters | Zero-config demo (`npm run dev` works with no DB) while remaining production-ready for Postgres. |
| MapAdapter interface (`MapboxMapAdapter` / `D3WorldMapAdapter`) | Mapbox GL is used when `NEXT_PUBLIC_MAPBOX_TOKEN` exists; otherwise a full-featured D3 world map renders the same data — no dead UI. |
| Pluggable chat engine | OpenAI-compatible endpoint when a key exists; a local retrieval assistant (keyword scoring + intent templates over the seed knowledge base) otherwise — the demo works offline and the local engine cites its sources. |
| Year-range-first data model | `start_year`/`end_year` on civilizations and events supports spans (e.g. An Lushan Rebellion 755–763), era bands, and future multi-dynasty phases. |
| Strict TypeScript, Zod at the API boundary | End-to-end type safety; runtime validation for query params and chat payloads. |
| Shared theme module (`lib/theme.ts`) | Civilization colors, category colors, and period helpers live in one place; every component and both map adapters read from it — visual consistency. |

## 5. Non-Functional Properties

- **Responsive**: Tailwind grids stack on small screens; timeline and graph resize via
  `ResizeObserver`; map adapters re-fit on container resize.
- **Performance**: Mapbox GL is dynamically imported only when a token is configured
  (keeps the fallback bundle lean); world GeoJSON is a static import (~108 KB).
- **Accessibility**: semantic HTML, `aria-label`s on interactive SVG groups, keyboard
  focus on filter controls, modals close on Escape.
- **Error handling**: every fetch has loading, error, and empty states; API routes return
  structured `{ error }` JSON with proper status codes.

## 6. Evolution Path

The repository interface already mirrors the Postgres schema, so Phase 2 (additional
dynasties/eras, user accounts, saved timelines) only adds data and routes. The assistant
engine contract (`Assistant`) allows swapping in RAG over the live database in Phase 3
without touching the UI.

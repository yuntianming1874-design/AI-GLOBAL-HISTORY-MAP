# AI Global History Map

An educational platform for exploring world history through **interactive visualization**:
a global timeline, a historical map, a character relationship graph, a China↔World
comparison panel — and an **AI history assistant** that answers from the same dataset.

**Phase 1 (V0.1)** focused on the **Tang Dynasty period (618–907)** and its world
contemporaries: the Abbasid Caliphate, Byzantine Empire, Carolingian Empire, Unified
Silla, Nara/Heian Japan, the Classic Maya, Srivijaya, the Khazar Khaganate and the
Viking Age.

**V0.2 — Historical Knowledge Graph**: Timeline, Map, People, Events and the AI
Assistant are now one connected exploration system. The URL carries the global
exploration state (`?year=751&civ=c-tang&event=e-751-talas&person=p-li-bai&loc=loc-talas`),
every module reads it, and all navigation goes through one unified
`dispatchHistoryAction` API.

**V0.2.1 — Knowledge-Graph depth**: the `events_people` join table is the single
participant source (with `instigator/participant/witness` roles); territories ship
real boundary polygons from the open *historical-basemaps* dataset (GPL-3.0,
world_800.geojson snapshot — approximate borders, confidence surfaced in the UI);
the map has a sidebar event list; the timeline supports pinch/wheel zoom; the person
drawer groups shared events per partner; the AI understands causal chains
("What led to…?") and the OpenAI path returns structured entity links/actions via
JSON mode; URL params are whitelisted and every exploration step pushes browser
history.

**i18n — English / 中文**: a language toggle (EN | 中文) sits in the top navigation.
The choice is persisted in `localStorage`, reflected in `?lang=` (whitelisted param,
shareable), and applied server-side on every page.

**V0.2.1 — Cross-Module Navigation & History Context Stabilization**: the
unified `HistoryContext` now carries `year/startYear/endYear/eventId/personId/
civilizationId/locationId` with `setYearRange()` / `clearHistoryContext()`; the
timeline overview strip updates the main range **live during drag**; a
`focusTimeline()` action family (`FOCUS_TIMELINE / FOCUS_MAP / FOCUS_PERSON_GRAPH`)
drives Person→Timeline (`/?person=…&start=701&end=762`), Event→Timeline, Event→Map
(flyTo + auto-selected marker + detail popup) and AI navigation; ordered entity
retrieval (`searchHistoryEntities`: exact name → alias → title → full-text, with a
curated alias registry incl. 怛罗斯之战 → Battle of Talas); every cross-page
navigation carries its target entity explicitly (no stale state bleed).

**全量中文 (full Chinese)**: every entity carries authored Simplified-Chinese text —
49 event descriptions, 25 person summaries + roles, 12 civilization summaries,
20 location descriptions, 40 relationship descriptions, 11 territory names,
3 trade-route descriptions, region names — validated by `npm run validate:seed`
(zh coverage checks). In `zh` mode the UI, the event pages, the drawers and the AI
assistant (names, summaries, relationship lines, causal notes, labels) all render
Chinese; PostgreSQL mirrors the same texts via `*_zh` columns.

![stack](https://img.shields.io/badge/Next.js%2014-TypeScript%20strict-000) ![viz](https://img.shields.io/badge/D3.js%20v7-Mapbox%20GL-e34c26) ![data](https://img.shields.io/badge/149%20entities-12%20civilizations-2f8f6b)

## Quick Start (zero config)

```bash
npm install
npm run dev          # → http://localhost:3000
```

No environment variables are required:

| Without any keys… | The app uses… |
|---|---|
| `DATABASE_URL` | built-in in-memory seed data (149 entities) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | a full-featured **D3 world map** (Natural Earth) |
| `OPENAI_API_KEY` | an offline **local knowledge engine** with citations |

Set any of the keys (see [`.env.example`](.env.example)) and that capability upgrades
automatically — Mapbox GL map, LLM-powered chat, PostgreSQL persistence.

## Pages

| Route | Content |
|---|---|
| `/` | Overview: hero + stats, **global timeline** (D3 focus+context, era bands), **China vs World** comparison, featured event cards |
| `/map` | **Historical Map 2.0** — Current Year header, events, schematic territories (year-validity), clickable trade routes with node details; filters by civilization, category, year |
| `/people` | **Character relationship graph** + Person Detail Drawer (biography, events, relationships, locations, contemporaries) |
| `/chat` | **Context-aware AI assistant** — entity links and navigation actions in every answer |
| `/events/[id]` | **Event Detail** — map, related people / civilizations / events, AI explanation, Open in Map / People Graph / Ask AI |

## V0.2 Cross-Page Linkage (how it works)

```
URL search params (single source of truth)
      ▲            │
      │ read       │ dispatchHistoryAction()
ExplorerProvider (React context) ◄── Timeline / Map / People / Events / Chat
```

| Linkage | Implementation |
|---|---|
| Timeline → Map | Brush/timeline focus writes `?year=`; the Map re-centers its range and shows "Current Year" |
| Map → Event | Marker click → `OPEN_EVENT` → `/events/[id]`; the event page carries `?event=&year=` to the next hop |
| Event → People | "Open People Graph" → `/people?event=…`; the graph rings everyone alive in the event's year (gold) |
| Person → Map | Drawer "View on Map" → `/map?person=…`; map shows the person's activity locations and flies to them |
| Person → Timeline | Drawer "View on Timeline" → `/?person=…&year=…`; timeline focuses the person's lifetime and rings their events |
| AI → Timeline | Assistant returns `SET_YEAR` action → "Explore 751" button jumps to the focused timeline |
| AI → Map | Assistant returns `OPEN_LOCATION` / `FOCUS_CIVILIZATION` actions → map flies to the place / filters the civilization |
| AI → People | Assistant returns `OPEN_PERSON` actions and person entity links → People Graph opens the drawer |

The AI receives the current `HistoryContext` with every request, and the local
knowledge engine answers with structured **entity links** (clickable) and
**navigation actions** (buttons) — grounded first in the dataset, then in the
page context, only last in general knowledge.

## Architecture

```
app/                       Next.js App Router pages + API route handlers
├─ api/overview|events|events/[id]|people|relationships|civilizations|locations|territories|chat
├─ events/[id]             Event Detail page
components/history/        Timeline · HistoryMap · PersonGraph · PersonDrawer · EventCard ·
                           EventModal · AIChat · ComparisonPanel · ExplorerProvider ·
                           LocationModal · RouteModal · CivilizationModal · mapAdapters ·
                           EventPageWidgets · chatBlocks
lib/                       types · explorer (context+actions) · repository (Postgres | seed) ·
                           assistant · contemporaries · geo · theme
data/seed/                 civilizations(12) · locations(20) · events(49) · people(25) ·
                           relationships(40) · territories(3 schematic)
db/schema.sql              PostgreSQL DDL (+ territories)
scripts/                   seed-db.ts (upsert) · validate-seed.ts (integrity)
docs/                      architecture · database · roadmap
```

Design decisions are documented in [`docs/architecture.md`](docs/architecture.md) and
[`docs/database.md`](docs/database.md).

## Scripts

```bash
npm run dev              # dev server
npm run build            # production build
npm run start            # serve the production build
npm run lint             # eslint (next/core-web-vitals)
npm run typecheck        # tsc --noEmit (strict)
npm run validate:seed    # seed integrity: FKs, years, roles, counts, coverage
npm run seed:db          # upsert seed into Postgres (needs DATABASE_URL)
npm run fetch:territories # re-download + regenerate territory seed (open dataset)
npm run test:e2e         # Playwright E2E (3 demo flows + hydration checks)
```

### End-to-end tests

```bash
npx playwright install chromium   # one-time browser install
npm run test:e2e                  # builds + starts the app on :3100, runs e2e/
```

The suite covers the three acceptance demos (Timeline→Map→Event→People→AI,
People drawer→Timeline→Map, AI world snapshot with navigation actions), the
causal-chain intent, and per-page console/hydration hygiene. (The suite was
authored and assertion-verified against SSR output; running it requires a
standard desktop environment — browsers cannot launch inside the restricted
agent sandbox that built this project.)

### Using PostgreSQL (optional)

```bash
psql "$DATABASE_URL" -f db/schema.sql
DATABASE_URL=postgres://user:pass@localhost:5432/aghm npm run seed:db
DATABASE_URL=postgres://user:pass@localhost:5432/aghm npm run dev
```

The repository pattern serves identical data from Postgres or in-memory seed, so the
UI and API never change.

## V0.2 Acceptance Demos

- **Demo 1** — Timeline `?year=751` → Map shows "Current Year: 751 CE" → click
  Battle of Talas → Event Detail → People Graph rings everyone alive in 751 →
  AI already knows you're viewing Battle of Talas / 751 / Central Asia.
- **Demo 2** — People: click Li Bai → drawer → "View on Timeline" jumps to
  701–762 → click Chang'an → Map flies to Chang'an and opens its detail.
- **Demo 3** — AI: "What was happening in China and Europe in 751?" → world
  snapshot citing Tang China, Abbasid Caliphate, Byzantium and the Carolingian
  world, with Explore Timeline / View Map / Explore People actions.

## Roadmap

V0.1 (MVP) → V0.2 (knowledge graph & cross-page interaction, **this release**) →
Phase 2 (multi-era switching, accounts, saved timelines) → Phase 3 (RAG over live
DB, spatial queries, i18n, PWA). See [`docs/roadmap.md`](docs/roadmap.md).

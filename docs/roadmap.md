# AI Global History Map — Development Roadmap

## Phase 0 — Foundation ✅
- [x] Next.js 14 App Router + TypeScript strict + Tailwind CSS scaffold
- [x] Dependencies: D3 v7, Mapbox GL, pg, topojson-client, world-atlas, zod
- [x] Design docs (architecture / database / folder structure / roadmap)
- Acceptance: `npm run build` succeeds; app renders at `/`.

## Phase 1 — MVP: Tang Dynasty Period (618–907) ✅ (delivered)
- [x] Domain types + seed data: 142 entities (12 civilizations, 17 locations,
      48 events, 25 people, 40 relationships)
- [x] Repository pattern: Postgres adapter (`DATABASE_URL`) + in-memory fallback
- [x] API routes: overview, events, people, relationships, civilizations,
      locations, chat — Zod-validated
- [x] Components under `/components/history`:
      Timeline, HistoryMap, PersonGraph, EventCard, AIChat, ComparisonPanel
- [x] Mapbox GL map with automatic D3 world-map fallback (no token required)
- [x] AI assistant: OpenAI-compatible engine (key) or offline local knowledge
      engine with citations
- [x] Pages: `/` overview · `/map` · `/people` · `/chat`; responsive
- [x] `db/schema.sql`, `scripts/seed-db.ts`, `scripts/validate-seed.ts`
- Acceptance: full demo runs with `npm run dev` and zero env keys; with keys,
      Mapbox map and LLM chat activate automatically; `npm run validate:seed`
      passes; production build green — **all verified**.

## V0.2.2 — Historical Provenance Layer ✅ (delivered)

Unified `HistoricalDateValue` / `PersonRole[]` / `HistoricalSource` model, seed-wide
provenance (25 people / 49 events / 12 civilizations), single date formatter for
UI+AI, data-quality gates (`npm run validate:seed`) and a deeper provenance audit
(`npm run audit:history`). Docs: `docs/history-provenance.md`.

## V0.3 — Learning Journeys ✅ (delivered, Release Candidate)

- Journey vertical slice 《公元 751 年：唐朝与世界的交汇》(`talas-751`, 5 steps)
  with URL state (`?journey=&step=`), Narrative Story Engine, World Context panel,
  Person Lifespan Timeline, Journey Complete + Recall (5 questions),
  Featured Journeys, deterministic AI Historical Navigator (deepen/cause/compare/
  continue) with human-audited cause pairs.
- RC gates: CI on GitHub Actions (25 steps incl. Playwright E2E 12/12), mock
  OpenAI-path verification, navigator quality audit.
- Tags: `v0.2.2`, `v0.3-phase2`, `v0.3-phase3a/b/c`, `v0.3-phase3d`, `v0.3-rc`.

## Phase 2 — Depth & Accounts
- [x] **V0.2.1 — Knowledge-graph depth** (delivered)
  - [x] Data: `events_people` join consumed as the single participant source in
      seed + Postgres paths, with roles (instigator/participant/witness) surfaced
      in event cards
  - [x] Data: real territory polygons from the open *historical-basemaps* dataset
      (GPL-3.0, world_800.geojson snapshot) replace schematic placeholders —
      `scripts/fetch-territories.ts` regenerates them reproducibly; confidence
      mapped from BORDERPRECISION and surfaced in the UI (CHGIS-grade data can
      drop into the same pipeline)
  - [x] Interaction: Map sidebar event list (second entry point), Timeline
      pinch/wheel zoom, Person drawer shared-events collapsible groups
  - [x] AI: causal-chain intent (curated, dataset-traceable cause/effect links);
      OpenAI path returns structured links/actions via JSON mode with an entity-id
      catalog + defensive validation
  - [x] Architecture: push-based URL history semantics for every exploration step;
      URL param whitelist + sanitization (slug pattern, year clamping)
  - [x] Quality: Playwright E2E suite for the three demo flows + hydration/console
      checks (`npm run test:e2e`); Postgres regression guide (docs/regression-pg.md)
      — environment lacks PostgreSQL binaries, so the live PG run is documented
      with exact commands and the SQL paths were reviewed
- [x] **V0.2.1 — Cross-module navigation & history context stabilization** (delivered)
  - [x] HistoryContext extended (startYear/endYear + setYearRange/clearHistoryContext);
      URL scheme `/?start=&end=&year=&event=&person=` refresh-safe
  - [x] Timeline overview-strip drag updates the main range live (brush event),
      year sync to URL, comparison panel highlights the focused century
  - [x] Person→Timeline (start/end + highlight + auto-scroll), Event→Timeline
      (new action on event page), Person→Map (derived location list + flyTo),
      Event→Map (flyTo + auto-select marker + detail popup)
  - [x] Ordered AI retrieval: searchHistoryEntities (exact → alias → name →
      full-text) + alias registry (怛罗斯之战 → Battle of Talas); /api/search
  - [x] AI actions: FOCUS_TIMELINE / FOCUS_MAP / FOCUS_PERSON_GRAPH + OPEN_*;
      context carried on every request; 8-test acceptance matrix verified
- [x] **i18n — English / 中文 language setting** (delivered)
  - [x] EN | 中文 toggle in the nav; persisted in localStorage + `?lang=` param
      (whitelisted, shareable, SSR-applied)
  - [x] Full UI chrome localized (nav/hero/sections/map/timeline/people drawer/
      modals/event pages/chat); E2E coverage for the toggle
  - [x] AI assistant templates localized (greeting, suggestions, year/world-
      snapshot headers, causal-chain labels, compare/profile labels)
  - [x] **全量中文**: authored zh texts for all 157 entities + trade routes +
      region names (events / people + roles / civilizations / locations /
      relationships / territories), zh coverage checks in validate:seed,
      PG `*_zh` columns for full parity, Chinese UI + AI answers end-to-end
      (incl. Chinese regex intent matching)
- [ ] Era switching: Qin → Han → Three Kingdoms → Sui/Tang → Song → Yuan → Ming → Qing,
      with the world side shifting per era (data model already supports it)
- [ ] User accounts (Auth.js) + saved timelines / favorite events
- [ ] Timeline sharing (public URL with frozen view state)
- [ ] More granular categories: economy, science, art, religion sub-filters
- Acceptance: switch eras without code changes; persisted user state.

## Phase 3 — Intelligence & Scale
- [ ] RAG assistant grounded on the live Postgres data (retrieval + citations)
- [ ] Spatial queries on the map ("show all battles within 500 km of Chang'an")
- [ ] Machine-translated UI (i18n: EN / 中文)
- [ ] PWA + offline data pack; performance budgets (LCP < 2.5 s on /)
- Acceptance: assistant answers only from the DB with verifiable citations.

## Future Ideas (backlog)
- Animated war/campaign paths across the map (e.g. Tang campaigns, Viking raids)
- "What if" scenario cards generated by the assistant
- Timelapse mode: year slider animating events and empire extents
- Community-contributed event submissions with moderation

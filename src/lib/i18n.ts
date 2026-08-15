/**
 * i18n — English / 中文 UI dictionary.
 *
 * Entity DATA (seed summaries, descriptions) stays bilingual by design
 * (names carry chineseName), but stays in English as authored; this module
 * translates all UI chrome + assistant templates.
 */

export type Locale = "en" | "zh";

export const LOCALES: Locale[] = ["en", "zh"];

const DICT = {
  /* nav */
  "nav.brand": { en: "AI Global History Map", zh: "AI 全球历史地图" },
  "nav.tagline": { en: "Tang Era · 618–907", zh: "唐时代 · 618–907" },
  "nav.overview": { en: "Overview", zh: "总览" },
  "nav.map": { en: "Map", zh: "地图" },
  "nav.people": { en: "People", zh: "人物" },
  "nav.chat": { en: "AI Assistant", zh: "AI 助手" },

  /* footer */
  "footer.line1": {
    en: "AI Global History Map · V0.2 Knowledge Graph · Tang Dynasty era (618–907) & contemporaries · 157 curated entities",
    zh: "AI 全球历史地图 · V0.2 知识图谱 · 唐朝时期（618–907）与世界同时代 · 157 个精选实体",
  },
  "footer.tech": {
    en: "Next.js · TypeScript strict · Tailwind CSS · D3.js · Mapbox GL · PostgreSQL",
    zh: "Next.js · TypeScript strict · Tailwind CSS · D3.js · Mapbox GL · PostgreSQL",
  },

  /* common */
  "common.loading": { en: "Loading…", zh: "加载中…" },
  "common.open": { en: "Open", zh: "打开" },
  "common.back": { en: "Back", zh: "返回" },

  /* home */
  "home.badge": { en: "Phase 1 MVP · Tang Dynasty period 618–907", zh: "第一阶段 MVP · 唐朝时期 618–907" },
  "home.title1": { en: "See world history the way it actually happened —", zh: "以真实的方式看世界历史——" },
  "home.title2": { en: "in parallel", zh: "并行呈现" },
  "home.subtitle": {
    en: "While Li Shimin built the Tang, Muhammad's followers swept out of Arabia and Charlemagne's scribes copied ancient books. Explore the era through an interactive global timeline, a historical map, a character relationship graph — and an AI assistant that answers from the same dataset.",
    zh: "当李世民缔造大唐时，穆罕默德的追随者正席卷阿拉伯，查理曼的抄写员在复制古籍。通过交互式全球时间轴、历史地图、人物关系图谱，以及基于同一数据集的 AI 助手，探索这个时代。",
  },
  "home.cta.timeline": { en: "Explore the timeline", zh: "探索时间轴" },
  "home.cta.map": { en: "Historical map", zh: "历史地图" },
  "home.cta.people": { en: "People graph", zh: "人物图谱" },
  "home.cta.chat": { en: "Ask the assistant", zh: "询问助手" },
  "home.stat.events": { en: "Events", zh: "事件" },
  "home.stat.people": { en: "People", zh: "人物" },
  "home.stat.civilizations": { en: "Civilizations", zh: "文明" },
  "home.stat.relationships": { en: "Relationships", zh: "关系" },
  "home.stat.locations": { en: "Locations", zh: "地点" },
  "home.stat.years": { en: "Years covered", zh: "覆盖年份" },
  "home.datamode.seed": {
    en: "Data mode: built-in seed data (set DATABASE_URL + run `npm run seed:db` to switch)",
    zh: "数据模式：内置种子数据（设置 DATABASE_URL 并运行 `npm run seed:db` 可切换）",
  },
  "home.datamode.pg": { en: "Data mode: PostgreSQL", zh: "数据模式：PostgreSQL" },

  /* sections */
  "sec.timeline.title": { en: "Global Timeline", zh: "全球时间轴" },
  "sec.timeline.subtitle": {
    en: "Twelve civilizations side by side, 500–1000 CE. Drag the overview strip to zoom, click a dot for event details.",
    zh: "十二个文明并排呈现，公元 500–1000 年。拖动底部概览条缩放，点击圆点查看事件详情。",
  },
  "sec.comparison.title": { en: "China vs. the World", zh: "中国与世界" },
  "sec.comparison.subtitle": {
    en: "How the Tang compared with its contemporaries, century by century — with the top parallel event on each side.",
    zh: "唐王朝如何与同时代文明逐世纪对比——每侧各附同期最重要事件。",
  },
  "sec.events.title": { en: "Featured Events", zh: "精选事件" },
  "sec.events.subtitle": {
    en: "The era's most significant moments, picked from the knowledge base.",
    zh: "从知识库中精选的这个时代最重要的时刻。",
  },
  "sec.explore.title": { en: "Explore Further", zh: "继续探索" },
  "sec.explore.subtitle": { en: "Dive deeper into each visualization.", zh: "深入每个可视化模块。" },
  "home.explore.map.desc": {
    en: "Events across Eurasia and beyond — Silk Road, maritime routes, and the campaigns that connected civilizations.",
    zh: "欧亚大陆及更远地区的事件——丝绸之路、海上航线，以及连接各文明的征途。",
  },
  "home.explore.people.desc": {
    en: "The force-directed graph of 25 key figures: emperors, poets, generals, monks and caliphs — and the bonds between them.",
    zh: "25 位关键人物的力导向图谱：皇帝、诗人、将军、僧侣与哈里发——以及他们之间的纽带。",
  },
  "home.explore.chat.desc": {
    en: "Ask anything about the era — 755 CE, Li Bai, or how Chang'an compared to Baghdad.",
    zh: "关于这个时代的一切都可以问——755 年、李白，或长安与巴格达的比较。",
  },

  /* page headers */
  "page.map.title": { en: "Historical Map", zh: "历史地图" },
  "page.map.subtitle": {
    en: "Events across the world during the Tang era, with the Silk Road and maritime trade routes. Click any marker for details — filter by civilization, category and year.",
    zh: "唐朝时期的世界事件，含丝绸之路与海上商路。点击任意标记查看详情——可按文明、类别与年份筛选。",
  },
  "page.people.title": { en: "People & Relationships", zh: "人物与关系" },
  "page.people.subtitle": {
    en: "25 key figures of the Tang era and its world — emperors, poets, generals, monks, caliphs and missionaries — connected by family, rivalry, patronage and friendship.",
    zh: "唐时代及其世界的 25 位关键人物——皇帝、诗人、将军、僧侣、哈里发与传教士——由家族、敌对、庇护与友谊相连。",
  },
  "page.chat.title": { en: "AI History Assistant", zh: "AI 历史助手" },
  "page.chat.subtitle": {
    en: "Ask about events, people and civilizations of the Tang era. Works offline via a local knowledge engine; upgrades to an LLM automatically when OPENAI_API_KEY is configured.",
    zh: "询问唐朝时代的事件、人物与文明。离线本地知识引擎即可运行；配置 OPENAI_API_KEY 后自动升级为 LLM。",
  },

  /* categories */
  "cat.political": { en: "Politics", zh: "政治" },
  "cat.military": { en: "Military", zh: "军事" },
  "cat.cultural": { en: "Culture", zh: "文化" },
  "cat.economic": { en: "Economy", zh: "经济" },
  "cat.religious": { en: "Religion", zh: "宗教" },
  "cat.technological": { en: "Technology", zh: "科技" },
  "cat.diplomatic": { en: "Diplomacy", zh: "外交" },

  /* relationship types */
  "rel.family": { en: "Family", zh: "家族" },
  "rel.mentor": { en: "Mentor", zh: "导师" },
  "rel.student": { en: "Student", zh: "学生" },
  "rel.friend": { en: "Friend", zh: "好友" },
  "rel.rival": { en: "Rival", zh: "对手" },
  "rel.enemy": { en: "Enemy", zh: "敌人" },
  "rel.patron": { en: "Patron", zh: "庇护者" },
  "rel.colleague": { en: "Colleague", zh: "同僚" },

  /* timeline */
  "tl.filter": { en: "Filter", zh: "筛选" },
  "tl.reset": { en: "Reset · Tang era", zh: "重置 · 唐时代" },
  "tl.life": { en: "life", zh: "生平" },
  "tl.hint": {
    en: "Drag on the bottom overview strip or scroll / pinch on the timeline to zoom · Click any dot for event details · Bands show each civilization's lifespan. Default view: Tang era 618–907.",
    zh: "拖动底部概览条，或在时间轴上滚动 / 双指缩放 · 点击圆点查看事件详情 · 色带表示各文明存续期。默认视图：唐时代 618–907。",
  },
  "tl.empty": { en: "No events match the current filters.", zh: "没有符合当前筛选条件的事件。" },
  "tl.loading": { en: "Loading global timeline…", zh: "正在加载全球时间轴…" },
  "tl.error": { en: "Failed to load timeline data.", zh: "时间轴数据加载失败。" },

  /* map */
  "map.currentYear": { en: "Current Year", zh: "当前年份" },
  "map.viewing": {
    en: "Viewing events around {year} · default range 618–907",
    zh: "正在查看 {year} 前后的事件 · 默认范围 618–907",
  },
  "map.browsing": {
    en: "Browsing {from}–{to} · default 618–907",
    zh: "正在浏览 {from}–{to} · 默认 618–907",
  },
  "map.allCategories": { en: "All categories", zh: "全部分类" },
  "map.fromYear": { en: "From year", zh: "起始年份" },
  "map.toYear": { en: "To year", zh: "结束年份" },
  "map.tradeRoutes": { en: "Trade routes", zh: "商路" },
  "map.territories": { en: "Territories", zh: "疆域" },
  "map.eventsShown": { en: "events shown", zh: "个事件" },
  "map.eventsList": { en: "Events list", zh: "事件列表" },
  "map.eventsInView": { en: "Events in view", zh: "视野内事件" },
  "map.listEmpty": { en: "No events match the current filters.", zh: "没有符合当前筛选条件的事件。" },
  "map.territoriesBadge": {
    en: "Territories: historical-basemaps @800 · approximate",
    zh: "疆域：historical-basemaps @800 · 近似边界",
  },
  "map.personActivity": { en: "activity locations", zh: "活动地点" },
  "map.engineD3": {
    en: "— add NEXT_PUBLIC_MAPBOX_TOKEN to use Mapbox GL",
    zh: "—— 设置 NEXT_PUBLIC_MAPBOX_TOKEN 可使用 Mapbox GL",
  },
  "map.loading": { en: "Loading map…", zh: "正在加载地图…" },
  "map.error": { en: "Failed to load map data.", zh: "地图数据加载失败。" },

  /* comparison panel */
  "cmp.china": { en: "Tang China", zh: "唐朝中国" },
  "cmp.world": { en: "Rest of world", zh: "世界其他地区" },
  "cmp.noEvent": { en: "No event recorded.", zh: "暂无事件记录。" },
  "cmp.around": { en: "Around the {century} · {year}", zh: "{century}前后 · {year}" },
  "cmp.century": { en: "{n}th century", zh: "公元 {n} 世纪" },
  "cmp.legendNote": {
    en: "Event counts per century in the dataset",
    zh: "数据集中每世纪的事件数",
  },

  /* route modal */
  "route.majorStops": { en: "Major stops — click for details", zh: "主要节点——点击查看详情" },
  "route.connects": { en: "Civilizations it connects", zh: "途经文明" },
  "route.schematicNote": {
    en: "Routes are schematic trade corridors, not exact historical paths.",
    zh: "商路为示意性贸易通道，并非精确历史路线。",
  },
  "route.close": { en: "Close route details", zh: "关闭路线详情" },

  /* location modal */
  "loc.eventsHere": { en: "Events here", zh: "此地事件" },
  "loc.noEvents": { en: "No events recorded at this location.", zh: "该地点暂无事件记录。" },
  "loc.focusOnMap": { en: "Focus on map", zh: "在地图上定位" },
  "loc.askAI": { en: "Ask AI about this place", zh: "询问 AI 此地详情" },
  "loc.close": { en: "Close location details", zh: "关闭地点详情" },

  /* civilization modal */
  "civ.focusOnMap": { en: "Focus on map", zh: "在地图上定位" },
  "civ.askAI": { en: "Ask AI about it", zh: "询问 AI" },
  "civ.close": { en: "Close civilization details", zh: "关闭文明详情" },

  /* event modal / card */
  "em.keyPeople": { en: "Key people", zh: "关键人物" },
  "em.tags": { en: "Tags", zh: "标签" },
  "em.close": { en: "Close event details", zh: "关闭事件详情" },
  "ec.significance": { en: "Significance {n} of 5", zh: "重要性 {n}/5" },
  "ec.role": { en: "Role: {role}", zh: "角色：{role}" },

  /* people graph */
  "pg.allCivs": { en: "All civilizations", zh: "全部文明" },
  "pg.filterBy": { en: "Filter by civilization", zh: "按文明筛选" },
  "pg.counts": { en: "{people} people · {links} relationships", zh: "{people} 人 · {links} 条关系" },
  "pg.hint": {
    en: "Drag nodes to explore · Scroll to zoom · Click a node for details · Gold rings mark people active in the focused event's year",
    zh: "拖拽节点探索 · 滚动缩放 · 点击节点查看详情 · 金色圆环标记聚焦事件年份的活跃人物",
  },
  "pg.activeIn": { en: "Active in {id}", zh: "活跃于 {id}" },
  "pg.loading": { en: "Laying out the graph…", zh: "正在布局图谱…" },
  "pg.error": { en: "Failed to load person graph data.", zh: "人物图谱数据加载失败。" },

  /* person drawer */
  "dr.biography": { en: "Biography", zh: "生平" },
  "dr.importantEvents": { en: "Important events", zh: "重要事件" },
  "dr.noEvents": { en: "No events recorded for this person.", zh: "该人物暂无事件记录。" },
  "dr.relationships": { en: "Relationships", zh: "关系" },
  "dr.locations": { en: "Locations", zh: "地点" },
  "dr.noLocations": {
    en: "No locations derived from the dataset.",
    zh: "数据集中未推导出地点。",
  },
  "dr.contemporaries": { en: "Contemporaries", zh: "同时代人" },
  "dr.contemporariesNote": {
    en: "Computed from overlapping lifespans in the dataset.",
    zh: "根据数据集中重叠的寿命区间计算。",
  },
  "dr.sharedEvents": { en: "Shared events", zh: "共同事件" },
  "dr.sharedNone": {
    en: "No events shared with other people in the dataset.",
    zh: "数据集中没有与他人共同参与的事件。",
  },
  "dr.with": { en: "With {name}", zh: "与 {name}" },
  "dr.eventsUnit": { en: "{n} events", zh: "{n} 个事件" },
  "dr.eventUnit": { en: "{n} event", zh: "{n} 个事件" },
  "dr.viewTimeline": { en: "View on Timeline", zh: "在时间轴上查看" },
  "dr.viewMap": { en: "View on Map", zh: "在地图上查看" },
  "dr.askAI": { en: "Ask AI", zh: "询问 AI" },
  "dr.close": { en: "Close person details", zh: "关闭人物详情" },
  "dr.openProfile": { en: "Open person profile", zh: "打开人物档案" },
  "dr.datesUncertain": { en: "dates uncertain", zh: "年代不详" },
  "dr.seatOf": { en: "Seat of {civ}", zh: "{civ}之都" },

  /* journey (V0.3) */
  "journey.badge": { en: "Learning Journey", zh: "学习旅程" },
  "journey.stepOf": { en: "Step {step} / {total}", zh: "第 {step} / {total} 步" },
  "journey.progress": { en: "Progress {p}", zh: "进度 {p}" },
  "journey.exit": { en: "Exit journey", zh: "退出旅程" },
  "journey.previous": { en: "Previous", zh: "← 上一步" },
  "journey.continue": { en: "Continue", zh: "下一步 →" },
  "journey.complete": { en: "Finish", zh: "完成" },
  "journey.whyItMatters": { en: "Why it matters", zh: "为什么重要" },
  "journey.keyFacts": { en: "Key facts", zh: "关键事实" },
  "journey.relatedEntities": { en: "Related entities", zh: "相关实体" },
  "journey.openEntity": { en: "Open {id}", zh: "打开 {id}" },
  "journey.notFound": { en: "This journey could not be found.", zh: "未找到该旅程。" },
  "journey.backToAtlas": { en: "Back to World Atlas", zh: "返回世界地图集" },
  "journey.stepsAria": { en: "Journey steps", zh: "旅程步骤" },
  "journey.worldNoYear": { en: "This step has no specific year to compare.", zh: "这一步没有可对比的具体年份。" },
  "journey.worldError": { en: "World data could not be loaded.", zh: "世界数据加载失败。" },
  "journey.worldLoading": { en: "Loading world data…", zh: "正在加载世界数据…" },
  "journey.worldTitle": { en: "The World in This Year", zh: "这一年，世界同期" },
  "journey.worldSubtitle": { en: "What was happening elsewhere at the same time? From curated data only.", zh: "同一时间，其他地方发生了什么？仅来自现有结构化资料。" },
  "journey.worldNoData": { en: "No reliable structured data for this region yet.", zh: "暂无足够可靠的结构化资料。" },
  "journey.start": { en: "Start Journey", zh: "开始旅程" },
  "journey.noRelated": { en: "No related entities for this step.", zh: "本步暂无相关实体。" },
  "journey.nextStepReason": { en: "Why what happens next", zh: "接下来会发生什么" },
  "journey.relatedPeople": { en: "Related people", zh: "相关人物" },
  "journey.relatedCivilizations": { en: "Related civilizations", zh: "相关文明" },
  "journey.relatedLocations": { en: "Related locations", zh: "相关地点" },
  "journey.relatedEvents": { en: "Related events", zh: "相关事件" },
  "journey.lifespanTitle": { en: "People alive in this step", zh: "这一时刻活跃的人物" },
  "journey.lifespanSubtitle": { en: "Lifespans with roles and key events, from curated data.", zh: "人物生平、角色区间与关键事件，均来自现有数据。" },
  "journey.lifespanOpen": { en: "Open person", zh: "打开人物" },
  "journey.lifespanNoPerson": { en: "No person data for this year.", zh: "该年份暂无可用的人物数据。" },
  "world.confidence.disputed": { en: "disputed", zh: "存在争议" },
  "review.pageTitle": { en: "Journey Review", zh: "旅程回顾" },
  "review.pageSubtitle": { en: "Retrieval practice — not an exam.", zh: "回忆练习——不是考试。" },
  "review.badge": { en: "Recall", zh: "回忆练习" },
  "review.progress": { en: "Question {n} / {total}", zh: "第 {n} / {total} 题" },
  "review.type.fact": { en: "Fact", zh: "史实" },
  "review.type.relationship": { en: "Relationship", zh: "关系" },
  "review.type.causal": { en: "Cause & significance", zh: "因果与意义" },
  "review.placeholder": { en: "Type your answer… (Ctrl/⌘+Enter to submit)", zh: "输入你的回答…（Ctrl/⌘+Enter 提交）" },
  "review.submit": { en: "Check my answer", zh: "检查回答" },
  "review.submitHint": { en: "Free-form is fine — synonyms and bilingual names all count.", zh: "自由作答即可——同义表达与中英文都算。" },
  "review.grade.correct": { en: "Correct", zh: "回答正确" },
  "review.grade.partial": { en: "Partially correct", zh: "部分正确" },
  "review.grade.needsReview": { en: "Needs review", zh: "需要复习" },
  "review.seeTimeline": { en: "Revisit timeline", zh: "重新查看时间轴" },
  "review.seeMap": { en: "Revisit map", zh: "重新查看地图" },
  "review.seePeople": { en: "View related people", zh: "查看相关人物" },
  "review.nextQuestion": { en: "Next question", zh: "下一题" },
  "review.finish": { en: "Finish review", zh: "完成复习" },
  "review.noQuestions": { en: "No recall questions for this journey yet.", zh: "该旅程暂无回忆练习题。" },
  "review.notFound": { en: "Question not found.", zh: "未找到该题目。" },
  "review.doneTitle": { en: "Review complete", zh: "复习完成" },
  "review.doneSummary": { en: "You answered {total} questions: {correct} correct, {partial} partially correct. Keep the key dates, places, people and relationships in mind — revisit the journey any time.", zh: "你回答了 {total} 道题：{correct} 道正确、{partial} 道部分正确。记住关键的时间、地点、人物与关系——随时可以重新探索这段旅程。" },
  "review.redo": { en: "Review again", zh: "再练一遍" },
  "review.reExplore": { en: "Re-explore journey", zh: "重新探索旅程" },
  "review.backToAtlas": { en: "Back to World Atlas", zh: "回到世界地图集" },
  "world.confidence.unverified": { en: "unverified", zh: "未经核实" },
  "journey.steps": { en: "Journey steps", zh: "旅程步骤" },
  "journey.minutes": { en: "{m} min", zh: "{m} 分钟" },
  "journey.difficulty.beginner": { en: "Beginner", zh: "入门" },
  "journey.difficulty.intermediate": { en: "Intermediate", zh: "进阶" },
  "journey.difficulty.advanced": { en: "Advanced", zh: "高级" },
  "journey.listTitle": { en: "Learning Journeys", zh: "学习旅程" },
  "journey.listSubtitle": { en: "Guided explorations connecting time, map, events, people and AI.", zh: "串联时间、地图、事件、人物与 AI 的引导式探索。" },

  /* chat */
  "chat.greeting": {
    en: "Welcome! I'm your AI history guide for the Tang Dynasty era (618–907) and its world contemporaries. Ask me about events, people, civilizations — or how China compared with the wider world. I can see what you're currently viewing and jump to the timeline, map or people graph.",
    zh: "欢迎！我是唐时代（618–907）及其世界同时代文明的 AI 历史向导。可以问我事件、人物、文明——或中国与外部世界的比较。我能看到你正在查看的内容，并跳转到时间轴、地图或人物图谱。",
  },
  "chat.sugg.0": { en: "What happened in 755?", zh: "755 年发生了什么？" },
  "chat.sugg.1": { en: "Who was Li Bai?", zh: "李白是谁？" },
  "chat.sugg.2": { en: "Compare Tang China and the Abbasid Caliphate", zh: "比较唐朝中国与阿拔斯王朝" },
  "chat.sugg.3": { en: "Relationship between Li Bai and Du Fu", zh: "李白与杜甫的关系" },
  "chat.sugg.4": { en: "Timeline of the Tang Dynasty", zh: "唐朝年表" },
  "chat.sugg.5": { en: "What was the Silk Road?", zh: "丝绸之路是什么？" },
  "chat.placeholder": {
    en: "Ask about the Tang era… e.g. “What happened in 751?”",
    zh: "询问唐时代… 例如“751 年发生了什么？”",
  },
  "chat.send": { en: "Send", zh: "发送" },
  "chat.online": { en: "Online", zh: "在线" },
  "chat.local": { en: "Local knowledge", zh: "本地知识" },
  "chat.model": { en: "AI model", zh: "AI 模型" },
  "chat.sources": { en: "Sources:", zh: "来源：" },
  "chat.thinking": { en: "thinking…", zh: "思考中…" },
  "chat.contextViewing": {
    en: "Context-aware · viewing: {ctx}",
    zh: "上下文感知 · 正在查看：{ctx}",
  },
  "chat.noContext": { en: "Grounded in the Tang-era knowledge base · answers in seconds", zh: "基于唐时代知识库 · 秒级回答" },
  "chat.entities": { en: "Entities:", zh: "实体：" },
  "chat.actions": { en: "Actions:", zh: "操作：" },
  "chat.error": { en: "The assistant is unavailable right now — please try again.", zh: "助手暂时不可用——请重试。" },

  /* action labels */
  "act.openEvent": { en: "Open event", zh: "打开事件" },
  "act.openPerson": { en: "Open person", zh: "打开人物" },
  "act.viewMap": { en: "View on map", zh: "在地图上查看" },
  "act.exploreYear": { en: "Explore {year}", zh: "探索 {year}" },
  "act.focusCiv": { en: "Focus civilization", zh: "聚焦文明" },
  "act.focusTimeline": { en: "View timeline", zh: "查看时间轴" },
  "act.personGraph": { en: "View people graph", zh: "查看人物图谱" },

  /* event detail page */
  "ev.back": { en: "Back to overview", zh: "返回总览" },
  "ev.openMap": { en: "Open in Map", zh: "在地图上打开" },
  "ev.openPeople": { en: "Open People Graph", zh: "打开人物图谱" },
  "ev.viewTimeline": { en: "View on Timeline", zh: "在时间轴上查看" },
  "ev.askAI": { en: "Ask AI", zh: "询问 AI" },
  "ev.map": { en: "Map", zh: "地图" },
  "ev.onTimeline": { en: "On the timeline", zh: "时间轴上的相关事件" },
  "ev.timelineNote": {
    en: "Solid rows: same civilization · dashed rows: elsewhere in the world",
    zh: "实线行：同一文明 · 虚线行：世界其他地区",
  },
  "ev.whyMatters": { en: "Why it matters", zh: "为何重要" },
  "ev.aiExplain": { en: "— AI explanation", zh: "—— AI 解读" },
  "ev.relatedPeople": { en: "Related People", zh: "相关人物" },
  "ev.noParticipants": {
    en: "No named participants in the dataset — but see who was alive then in the People Graph.",
    zh: "数据集中没有具名参与者——但可在人物图谱中查看当时在世的人物。",
  },
  "ev.seeActive": { en: "See people active in {year}", zh: "查看活跃于 {year} 的人物" },
  "ev.relatedCivs": { en: "Related Civilizations", zh: "相关文明" },
  "ev.location": { en: "Location", zh: "地点" },
  "ev.openOnMap": { en: "Open on map →", zh: "在地图上打开 →" },
  "ev.aiLoading": {
    en: "The AI is reading the event context…",
    zh: "AI 正在读取事件上下文…",
  },
  "ev.aiUnavailable": {
    en: "The AI explanation is unavailable right now.",
    zh: "AI 解读暂时不可用。",
  },
  "ev.significance": { en: "Significance {n} of 5", zh: "重要性 {n}/5" },
  "ev.mapUnavailable": { en: "Map unavailable", zh: "地图不可用" },

  /* assistant engine templates (server-side) */
  "eng.tryAsking": { en: "Try asking:", zh: "可以试试问：" },
  "eng.greeting": {
    en: "Welcome to the AI Global History Map! I'm your guide to the Tang Dynasty era (618–907) and the wider world.",
    zh: "欢迎来到 AI 全球历史地图！我是唐时代（618–907）与更广阔世界的向导。",
  },
  "eng.fallback": {
    en: "I couldn't find that in my knowledge base yet — I currently cover the Tang Dynasty era and its world contemporaries (Abbasids, Byzantium, Carolingians, Japan, Silla, Maya, Srivijaya and more).",
    zh: "我的知识库中还没有这个内容——目前覆盖唐时代及其世界同时代文明（阿拔斯、拜占庭、加洛林、日本、新罗、玛雅、室利佛逝等）。",
  },
  "eng.eventsAround": { en: "Events around {year}:", zh: "{year} 年前后的事件：" },
  "eng.worldSnapshot": { en: "World snapshot around {year}:", zh: "{year} 年前后的世界快照：" },
  "eng.noContemporaries": { en: "No contemporaries found in our dataset.", zh: "数据集中未找到同时代人。" },
  "eng.noConnection": {
    en: "No direct relationship recorded between them.",
    zh: "数据集中没有记录他们之间的直接关系。",
  },
  "eng.meanwhile": { en: "Meanwhile, elsewhere in the world:", zh: "与此同时，世界其他地方：" },
  "eng.connection": { en: "Connection:", zh: "关联：" },
  "eng.keyRoles": { en: "Roles:", zh: "主要角色：" },
  "eng.keyRelationships": { en: "Key relationships:", zh: "主要关系：" },
  "eng.keyEvents": { en: "Key events:", zh: "主要事件：" },
  "eng.keyEventsHere": { en: "Key events here:", zh: "此地主要事件：" },
  "eng.sharedConnections": { en: "Shared connections:", zh: "共同关联：" },
  "eng.contemporaries": { en: "Contemporaries:", zh: "同时代人：" },
  "eng.contemporariesOf": { en: "**{name}**'s contemporaries:", zh: "**{name}** 的同时代人：" },
  "eng.timelineOf": { en: "Timeline of {name}:", zh: "{name} 年表：" },
  "eng.peopleConnectedTo": { en: "People connected to **{name}**:", zh: "与 **{name}** 相关的人物：" },
  "eng.categorySig": { en: "Category: {cat} · Significance: {stars}", zh: "类别：{cat} · 重要性：{stars}" },
  "eng.whatLedTo": { en: "What led to **{title}** ({year}):", zh: "是什么导致了 **{title}**（{year}）：" },
  "eng.ledTo": { en: "What **{title}** ({year}) led to:", zh: "**{title}**（{year}）导致了什么：" },
} as const;

export type TranslationKey = keyof typeof DICT;

export function t(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const entry = DICT[key];
  let out: string = entry[locale] ?? entry.en;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.replaceAll(`{${name}}`, String(value));
    }
  }
  return out;
}

export function detectLocale(
  urlLang: string | null,
  stored: string | null,
): Locale {
  if (urlLang === "zh" || urlLang === "en") return urlLang;
  if (stored === "zh" || stored === "en") return stored;
  return "en";
}

export const LOCALE_STORAGE_KEY = "aghm.locale";

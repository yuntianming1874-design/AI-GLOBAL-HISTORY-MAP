# AI Global History Map — V0.2.2 Historical Provenance Layer

> 版本：V0.2.2 · 状态：已发布 · 关联：[history-data-policy.md](./history-data-policy.md)、[history-data-audit.md](./history-data-audit.md)

本文档记录 V0.2.2 的实现内容：统一的历史值模型、seed 级 provenance 填充、
单一日期格式化入口、AI 不确定性措辞规则、审计升级与数据质量门禁。

---

## 1. 目标

落实 V0.3 审计报告（docs/history-data-audit.md）的 6 项修正建议：

1. Charlemagne 出生年修正（`747–748`，disputed，alternatives 742/747/748）；
2. `PersonRole[]` 时间区间角色（不再把身份当作静态字段）；
3. 近似日期事件 precision 标注（Tikal 741、可萨改宗 740、花拉子米 820、Sulayman 851 等）；
4. 争议生年标注（武曌 623/624/625、Abu Muslim 700/718/723、Oleg unknown）；
5. 事实级来源层（`entity_sources` 表 + provenance 字段，URL 一律人工确认后才填）；
6. AI 措辞规则（disputed → “存在学术争议/通常认为/一些研究认为”，unknown → “现有可靠资料无法确定”）。

**边界（本次不做）**：不重做 UI 布局、不引入 Neo4j、不批量新增数据、
不把 disputed 事实改成精确值、不强制填充 unknown 事实、不猜测来源 URL。

---

## 2. 统一数据模型（`src/lib/provenance.ts`）

```ts
type HistoricalPrecision = "exact" | "approximate" | "range" | "century" | "unknown";
type HistoricalConfidence = "high" | "medium" | "low" | "disputed" | "unverified";
type HistoricalNameType = "contemporary" | "modern_scholarly" | "retrospective";
type HistoricalSourceType = "primary" | "peer_reviewed" | "university_press" | "museum" | "reference" | "web";
type HistoricalAuthorityLevel = "A" | "B" | "C" | "D" | "E";
type HistoricalReviewStatus = "verified" | "pending";

interface HistoricalDateValue {
  year?: number;
  yearMax?: number;          // range 上界（yearMax >= year）
  precision: HistoricalPrecision;
  confidence: HistoricalConfidence;
  alternatives?: number[];   // 备选年份（disputed 必填或给 note）
  note?: string;
}

interface PersonRole {
  personId: string;
  role: string;
  validFrom?: HistoricalDateValue;
  validTo?: HistoricalDateValue;
  civilizationId?: string;
  confidence: HistoricalConfidence;
  note?: string;
}

interface HistoricalSource {
  entityId: string;
  entityType: string;
  factKey?: string;          // 绑定具体事实（如 "birth" / "role:King of the Franks"）
  sourceTitle: string;
  sourceUrl?: string | null; // 未经人工确认必须为 null（禁止猜测）
  sourceType: HistoricalSourceType;
  authorityLevel: HistoricalAuthorityLevel;
  reviewStatus: HistoricalReviewStatus;
  note?: string;
  reviewedAt?: string;
}

interface PersonProvenance {
  birth?: HistoricalDateValue;
  death?: HistoricalDateValue;
  roles?: PersonRole[];
  sources?: HistoricalSource[];
  notes?: string[];
}
```

**单一事实来源（Single Source of Truth）**：年份事实只存在于 seed
（`src/data/seed/provenance.ts` + 各实体数值字段）。UI / AI / 审计一律从
repository DTO 读取，禁止在组件或引擎中硬编码年份。

---

## 3. 统一日期格式化（所有 UI/AI 共用）

| precision | 中文 | English |
|---|---|---|
| exact | `618 年` | `618` |
| approximate | `约 741 年` | `c. 741` |
| range | `747–748 年` | `747–748` |
| century | `8 世纪` | `8th century` |
| unknown | `年代不详` | `unknown` |
| disputed（任意精度） | 追加`（存在学术争议）` | 追加` (disputed)` |

- `formatDateCore(v, locale)` — 核心值（不含争议后缀）；
- `formatHistoricalDate(v, locale)` — 完整显示（含 disputed 后缀）；
- `formatYearSpan(year, yearEnd, dateProvenance?, locale)` — 事件起止
  （755–763；约 741；起点已是区间时直接输出区间）；
- `formatLifespan(birth?, death?, locale)` — 生平（含 disputed 标注）。

**接线点**：EventCard、EventDetailView、PersonDrawer（生卒 + 角色时间区间）、
LocalAssistant（profile/contemporaries/events-around/列表行）。

---

## 4. Seed 填充（`src/data/seed/provenance.ts`）

- **人物 25/25** 携带 `provenance`（birth/death 精度 + 置信度 + alternatives + note）；
  其中 24 人数据转录自审计知识库（史学共识），`p-gaozu` 为补充条目。
- **角色时间区间**：Charlemagne 3 段（King of Franks 768–814 / King of Lombards
  774–814 / Emperor 800–814）、Taizong、Xuanzong、Wu Zetian、Xuanzang 2 段
  （西行 629–645、译经 645–664）、Harun al-Rashid、Li Bai、Abu Muslim。
- **事件 49/49** 携带 `dateProvenance`；关键非精确项：e-741（约）、e-740（约）、
  e-820（约）、e-851（约）、e-629（629–645）、e-745（745/744 两说）、e-742（742–744）。
- **文明 12/12** 携带 `nameType` + `nameNote`（contemporary / modern_scholarly / retrospective）。

关键争议数据：

| 实体 | 数值 | 精度/置信度 | alternatives |
|---|---|---|---|
| Charlemagne 出生 | 747 (yearMax 748) | range / disputed | 742, 747, 748 |
| Wu Zetian 出生 | 624 | range / disputed | 623, 625 |
| Abu Muslim 出生 | 700 | range / disputed | 718, 723 |
| Oleg 出生 | 850 | unknown / unverified | — |
| Oleg 死亡 | 912 | range / disputed | 911, 922 |

---

## 5. Schema / 持久层

`db/schema.sql`（幂等 `ADD COLUMN IF NOT EXISTS`，不破坏现有数据）：

```sql
ALTER TABLE people ADD COLUMN IF NOT EXISTS provenance JSONB;
ALTER TABLE events ADD COLUMN IF NOT EXISTS date_provenance JSONB;
ALTER TABLE civilizations ADD COLUMN IF NOT EXISTS name_type TEXT;
ALTER TABLE civilizations ADD COLUMN IF NOT EXISTS name_note TEXT;
ALTER TABLE entity_sources ADD COLUMN IF NOT EXISTS fact_key TEXT;
ALTER TABLE entity_sources ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) DEFAULT 'pending';
```

- `scripts/seed-db.ts` 三个 INSERT 透传新列（JSON.stringify）；
- `src/lib/repository.ts` Postgres SELECT 透传 `provenance` / `dateProvenance` /
  `nameType` / `nameNote`（JSONB 自动反序列化）。
- 回归说明：本机无 PostgreSQL 二进制，PG 路径回归仅文档化
  （见 docs/regression-pg.md 惯例）；内存 SeedRepository 路径已由测试覆盖。

---

## 6. AI 措辞规则（`src/lib/assistant.ts`）

- 所有日期输出改经 `formatYearSpan` / `formatLifespan` / `formatHistoricalDate`；
- 新增 `uncertaintySentence` / `personUncertaintyLines`：
  - `disputed` → “该说法存在学术争议：通常认为 X 年，一些研究认为其他年份，
    现有资料无法完全确定。”（en: `scholarly consensus is disputed…`）
  - `unknown` → “现有可靠资料无法确定，学界亦无共识。”
    （en: `no reliable surviving source establishes it…`）
- profile 回答新增“主要角色”块（`eng.keyRoles` i18n），按时间区间展示。

---

## 7. 审计升级（`scripts/audit-history-data.ts`）

新增 2.8 节 **V0.2.2 Provenance 深度检查**：

- person/event 的 `provenance` / `dateProvenance` 与史学共识知识库逐字段比对
  （year / yearMax / precision / confidence / alternatives / 角色区间）→ `PROVENANCE_MISMATCH`；
- 角色区间有效性（validFrom ≤ validTo）、duplicated facts（数值字段 ↔ provenance 一致）、
  invalid alternative years（整数且范围合理）；
- 全库来源覆盖状态 → `MISSING_SOURCES`（entity_sources 未填充，URL 一律 pending）。

**数据质量门禁（`scripts/validate-seed.ts`）**：

| 门禁 | 规则 |
|---|---|
| disputed | 必须带 `alternatives` 或 `note` |
| range | `yearMax >= year`（连续区间）；无 yearMax 必须有 alternatives |
| unknown | 必须带 `note` 说明 |
| verified | 必须带 `sourceTitle` |
| URL | `null` 或合法 `http(s)://`，禁止猜测 |
| duplicated facts | `birthYear`/`year`/`yearEnd` 与 provenance 年份一致 |
| role interval | `validFrom.year <= validTo.year` |
| alternative year | 必须为整数 |

---

## 8. 测试（`npm run test:provenance` — 56 断言）

1. formatter 统一性：exact/approximate/range/century/unknown/disputed 中英文全部格式；
2. Charlemagne：birth 747–748 disputed + alternatives [742,747,748]、death 814、
   3 段角色（768/774/800 起）、生卒显示；
3. 武曌 624 disputed（623/625）、Abu Muslim 700 disputed（718/723）；
4. Oleg birth unknown → “年代不详”；
5. approximate 事件：e-741 → “约 741 年”、e-629 → “629–645 年”；
6. AI 措辞：LocalAssistant 问查理曼出生 → 含“存在学术争议/通常认为”；
   问 Oleg → 含“现有可靠资料无法确定”；问武曌 → 含争议措辞。

回归：`npm run test:interaction`（3 项时间轴绑定测试）保持通过。

---

## 9. 门禁与前后对比

| 门禁 | V0.2.2 结果 |
|---|---|
| `npx tsc --noEmit` | ✅ 0 error |
| `npm run lint` | ✅（见下） |
| `npm run build` | ✅（见下） |
| `npm run validate:seed` | ✅ 157 实体，0 error / 0 warning |
| `npm run audit:history` | PASS 82 · WARN 73 · CONFLICT 0 · UNVERIFIED 3 |
| `npm run test:provenance` | ✅ 56 passed |
| `npm run test:interaction` | ✅ 3 passed |
| `npm run test:e2e`（Playwright） | ⚠️ 本机浏览器 SIGTRAP 无法启动，需 CI/可运行环境执行（见 docs/regression-pg.md 同类说明） |

**审计前后对比**：

| 指标 | V0.3 基线 | V0.2.2 | 变化 |
|---|---|---|---|
| PASS | 61 | 82 | +21（新增 21 项深度检查全过） |
| WARN | 73 | 73 | 持平（深度检查无新增 WARN） |
| CONFLICT | 0 | 0 | 保持 0（硬性要求） |
| UNVERIFIED | 2 | 3 | +1（MISSING_SOURCES 来源填充待人工） |
| TEMPORAL_CONFLICT | 0 | 0 | 保持 0（硬性要求） |

**Modified 清单**：

- schema：`db/schema.sql`（people.provenance / events.date_provenance /
  civilizations.name_type+name_note / entity_sources.fact_key+review_status）；
- seed：`src/data/seed/provenance.ts`（新）、people.ts / events.ts / civilizations.ts
  （挂载 provenance，数组结构不变）；
- APIs/层：`scripts/seed-db.ts`、`src/lib/repository.ts`（PG 透传）；
- AI policy：`src/lib/assistant.ts`（措辞规则 + 统一 formatter）、`src/lib/i18n.ts`
  （eng.keyRoles）；
- UI：EventCard / EventDetailView / PersonDrawer（统一 formatter + 角色时间区间）；
- 测试：`scripts/provenance.test.ts`（新）、package.json（test:provenance）；
- 文档：本文件、history-data-policy.md、history-data-audit.md（自动生成）。

# AI Global History Map — Historical Data Policy

> 版本：V0.2.2（Historical Provenance Layer）· 状态：已发布 · 关联：[history-data-audit.md](./history-data-audit.md)、[history-provenance.md](./history-provenance.md)

本政策定义本项目历史数据的**来源等级、日期精度、不确定性、名称、AI 使用与人工审核**规则。
原则一句话：**历史数据不能默认视为绝对事实——不确定必须显式标注，禁止悄悄“补全”。**

---

## 1. 数据来源等级（authority_level）

| 等级 | 定义 | 允许的用途 |
|---|---|---|
| **A** | Primary source / contemporary evidence（原始史料/同时代证据，如《旧唐书》、编年史、碑铭） | 可作“明确记载”表述 |
| **B** | Peer-reviewed scholarship / Cambridge / Oxford / major university press（同行评审学术著作） | 可作“学界普遍认为”表述 |
| **C** | Museum / academic reference database / high-quality encyclopedia（博物馆/学术数据库/高质量百科） | 可作参考；存疑时降级为 WARN |
| **D** | General reference websites（普通参考网站） | 仅可作线索，不得作为事实依据 |
| **E** | Unverified web / AI generated material（未核实网页/AI 生成） | **禁止**作为事实依据；只能标记 `unverified` |

**事实级来源**：来源绑定到**事实**而非整个实体——同一个人物的出生、死亡、角色可有不同来源
（`entity_sources` 表 + `PersonProvenance`）。未标注来源的事实一律视为 `unverified`。

## 2. 历史日期精度规则（precision）

| precision | 含义 | 显示 |
|---|---|---|
| `exact` | 明确史料记载到年（或更细） | `814` |
| `approximate` | 约数（c. 747） | `约 747` |
| `range` | 区间（747–748，含 `yearMax`） | `747–748` |
| `century` | 仅知世纪 | `8 世纪` |
| `unknown` | 未知 | `不详` |

**硬性规则**：
1. 禁止把 `c. 747` 自动写成 `747`——必须保留 precision 元数据。
2. 数值上允许 `year` + `yearMax` 表达区间；单值字段不得伪造精确。
3. 区间事件（An Lushan 755–763）用 `year`/`yearEnd` 表达，语义为“起止”，不是精度缺失。
4. 日期显示按上表呈现（如“约 747–748”），UI 不得省略限定语。

## 3. 不确定性规则（confidence）

| confidence | 含义 | 展示/表述 |
|---|---|---|
| `high` | 明确史料支持 | 正常显示 |
| `medium` | 学界普遍接受 | 正常显示；涉及争议时加注 |
| `low` | 间接/推定支持 | 显示“约/推定”，标注低置信 |
| `disputed` | 学界存在争议 | 显示“存在学术争议”，点击展开“为什么存在争议？参考来源” |
| `unverified` | 无可靠来源 | 显示“未经核实”，不参与任何确定性表述 |

`alternatives` 字段记录备选值（如 Charlemagne 742 / 747 / 748），并附 `note` 说明争议来源。
**任何 `disputed`/`approximate`/`unverified` 事实都不得在 UI 或 AI 回答中表述为确定事实。**

## 4. 历史名称规则（nameType）

| nameType | 含义 | 示例 |
|---|---|---|
| `contemporary` | 当代（当时）自称/他称 | 唐、吐蕃、新罗 |
| `modern_scholarly` | 现代学界标签 | “Tang Dynasty”“Abbasid Caliphate”“Byzantine Empire” |
| `retrospective` | 回溯性分期标签 | “Viking Age”“Classic Maya”“Nara & Heian Japan” |

规则：
1. 不得假设现代标签是当时唯一正式国名（如“Carolingian Empire”为现代史学标签，查理曼时代无此国名）。
2. 展示上可保留现代标签，但数据层必须记录 `nameType` 与 `confidence`（`CivilizationName[]`）。
3. 人物角色不得作为静态身份字段：使用带时间区间的 `PersonRole[]`
   （如 Charlemagne：法兰克国王 768–814 / 伦巴第国王 774–814 / 皇帝 800–814）。

## 5. AI 数据使用规则

1. AI 回答前必须读取实体的 `confidence`、`precision`、`sources`。
2. 禁止措辞模板：
   - ❌ “查理曼出生于 747 年。”（`disputed` 事实被表述为确定）
3. 允许措辞模板：
   - ✅ “查理曼的出生年份存在争议，现代研究常采用约 747/748 年，传统说法也有 742 年。”
   - ✅ “约 740 年（时间点存在学术讨论）。”
   - ✅ “学界普遍认为……”（authority B 且有 `medium`/`high` 置信时）
4. `unverified` 事实只能以“未经核实/无可靠记载”表述；`E` 级来源不得被 AI 引用为事实。
5. 涉及争议时，AI 应给出 alternatives 与“参考来源”入口（数据层提供），而非回避或断言。
6. AI 生成内容若超出数据集（general knowledge）必须与数据集事实区分，不得混同。

### 5.1 V0.2.2 AI 措辞硬性规则（统一 `formatHistoricalDate` 输出）

1. **所有日期一律经 `formatHistoricalDate` / `formatYearSpan` / `formatLifespan` 输出**
   （exact→`618`、approximate→`约 741`、range→`747–748`、century→`8 世纪`、
   unknown→`年代不详`、disputed→追加`（存在学术争议）`）——UI 与 AI 不得自行拼接年份。
2. **disputed 事实**必须使用“存在学术争议 / 通常认为 / 一些研究认为”措辞，
   不得表述为确定事实。示例：
   - ✅ “查理曼的出生年份存在学术争议：通常认为 747 或 748 年（一些研究认为 742 年），现有资料无法完全确定。”
   - ❌ “查理曼出生于 747 年。”
3. **unknown 事实**必须使用“现有可靠资料无法确定”措辞，不得补全或猜测。示例：
   - ✅ “奥列格的出生年份——现有可靠资料无法确定，学界亦无共识。”
   - ❌ “奥列格出生于 850 年左右。”（无依据推定）
4. **来源 URL 禁止猜测**：未经人工确认的 `sourceUrl` 一律为 `null` 且
   `reviewStatus = 'pending'`；AI 与代码不得自行编造链接。

## 6. 人工审核规则

1. **只读审计先行**：`npm run audit:history` 生成报告（PASS / WARN / CONFLICT / UNVERIFIED），
   审计器不修改任何 seed 数据。
2. **修正流程**：只有**人工确认**的修正项才允许进入正式 seed——
   - 先在 `docs/history-data-audit.md` 的“修正建议”中登记；
   - 人工逐条确认（标注确认人/日期）；
   - 确认后按本政策填充 `provenance` / `PersonRole[]` / `CivilizationName[]` / `entity_sources`。
3. **冲突处理**：审计器发现的 `CONFLICT`（如 TEMPORAL_CONFLICT / ROLE_TIMELINE_CONFLICT）
   一律先归为“待核实”，不得静默修改数据“圆过去”。
4. **新增数据门槛**：任何新增实体/事实必须携带来源（authority ≥ B 或注明 A 级史料），
   否则标记 `unverified` 且不得进入主展示路径。
5. **数据质量门禁（`npm run validate:seed`）**：
   - `confidence = disputed` → 必须带 `alternatives` 或 `note`；
   - `precision = range` → `yearMax >= year`（连续区间必须给上界，枚举型备选必须给 `alternatives`）；
   - `reviewStatus = verified` → 必须带 `sourceTitle`；
   - `sourceUrl` → 必须为 `null` 或合法 `http(s)://` 链接；
   - 数值字段（`birthYear`/`year`/`yearEnd`）与 provenance 年份必须一致（duplicated facts 检查）；
   - 角色区间 `validFrom.year <= validTo.year`；alternative 年份必须为整数。
5. **复审节奏**：每轮数据变更后重跑审计；关键人物/事件（见审计报告首批名单）每年或
   每次重大修订时人工复核。

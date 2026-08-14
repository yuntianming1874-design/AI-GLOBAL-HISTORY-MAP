/**
 * V0.2.2 — Historical Provenance & Uncertainty Layer.
 *
 * 统一历史值模型：日期、置信度、精度、角色、名称类型、来源。
 * 所有 UI（Timeline / Event Card / Person Drawer / Map popup / Event Detail / AI）
 * 必须通过 formatHistoricalDate / formatYearSpan / formatLifespan 显示日期——
 * 禁止各组件自行拼接年份（Single Source of Truth）。
 *
 * 原则：禁止把 disputed/approximate/unknown 表述为确定事实；
 * 禁止 AI/代码"猜测" sourceUrl（无人工确认 → null + reviewStatus pending）。
 */

export type HistoricalPrecision =
  | "exact"
  | "approximate"
  | "range"
  | "century"
  | "unknown";

export type HistoricalConfidence =
  | "high"
  | "medium"
  | "low"
  | "disputed"
  | "unverified";

export type HistoricalNameType =
  | "contemporary"
  | "modern_scholarly"
  | "retrospective";

export type HistoricalSourceType =
  | "primary"
  | "peer_reviewed"
  | "university_press"
  | "museum"
  | "reference"
  | "web";

export type HistoricalAuthorityLevel = "A" | "B" | "C" | "D" | "E";

export type HistoricalReviewStatus = "verified" | "pending";

/** 统一历史日期值：年份 + 精度 + 置信度 + 备选年份。 */
export interface HistoricalDateValue {
  year?: number;
  /** range 上界（yearMax >= year）。 */
  yearMax?: number;
  precision: HistoricalPrecision;
  confidence: HistoricalConfidence;
  alternatives?: number[];
  note?: string;
}

/** 人物角色——随时间变化，不做静态身份。 */
export interface PersonRole {
  personId: string;
  role: string;
  validFrom?: HistoricalDateValue;
  validTo?: HistoricalDateValue;
  civilizationId?: string;
  confidence: HistoricalConfidence;
  note?: string;
}

/** 事实级来源。URL 未经人工确认必须为 null（禁止猜测）。 */
export interface HistoricalSource {
  entityId: string;
  entityType: string;
  /** 绑定到具体事实（如 "birth" / "death" / "role:King of the Franks"）。 */
  factKey?: string;
  sourceTitle: string;
  sourceUrl?: string | null;
  sourceType: HistoricalSourceType;
  authorityLevel: HistoricalAuthorityLevel;
  reviewStatus: HistoricalReviewStatus;
  note?: string;
  reviewedAt?: string;
}

/** 附加到 Person 实体的来源元数据（可选，不破坏现有字段）。 */
export interface PersonProvenance {
  birth?: HistoricalDateValue;
  death?: HistoricalDateValue;
  roles?: PersonRole[];
  sources?: HistoricalSource[];
  notes?: string[];
}

/* ── 统一日期格式化 ────────────────────────────────────────────────── */

export type UILocale = "en" | "zh";

function yearLabel(n: number, locale: UILocale): string {
  return locale === "zh" ? `${n} 年` : String(n);
}

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const rem10 = n % 10;
  if (rem10 === 1) return `${n}st`;
  if (rem10 === 2) return `${n}nd`;
  if (rem10 === 3) return `${n}rd`;
  return `${n}th`;
}

function centuryLabel(year: number, locale: UILocale): string {
  const c = Math.ceil(year / 100);
  return locale === "zh" ? `${c} 世纪` : `${ordinal(c)} century`;
}

/** 核心格式化（不含争议后缀）——所有 UI/AI 共用的唯一入口。 */
export function formatDateCore(
  v: HistoricalDateValue | undefined,
  locale: UILocale = "en",
): string {
  if (!v || v.precision === "unknown" || v.year === undefined) {
    return locale === "zh" ? "年代不详" : "unknown";
  }
  switch (v.precision) {
    case "exact":
      return yearLabel(v.year, locale);
    case "approximate":
      return `${locale === "zh" ? "约 " : "c. "}${yearLabel(v.year, locale)}`;
    case "range": {
      // 连续区间（yearMax > year）输出 "747–748 年"；否则退化为单一年份
      if (v.yearMax !== undefined && v.yearMax > v.year) {
        return locale === "zh"
          ? `${v.year}–${v.yearMax} 年`
          : `${v.year}–${v.yearMax}`;
      }
      return yearLabel(v.year, locale);
    }
    case "century":
      return centuryLabel(v.year, locale);
  }
}

/**
 * 完整格式化（含不确定性标注）。
 *  exact → 618 · approximate → 约 741 · range → 747–748
 *  century → 8 世纪 · unknown → 年代不详 · disputed → …（存在学术争议）
 */
export function formatHistoricalDate(
  v: HistoricalDateValue | undefined,
  locale: UILocale = "en",
): string {
  const core = formatDateCore(v, locale);
  if (v && v.confidence === "disputed" && core !== (locale === "zh" ? "年代不详" : "unknown")) {
    return locale === "zh" ? `${core}（存在学术争议）` : `${core} (disputed)`;
  }
  return core;
}

/** 事件日期（支持 span 与起点精度）：约 755–763 / 747–748。 */
export function formatYearSpan(
  year: number,
  yearEnd: number | null,
  dateProvenance?: HistoricalDateValue,
  locale: UILocale = "en",
): string {
  const start: HistoricalDateValue =
    dateProvenance && dateProvenance.year !== undefined
      ? dateProvenance
      : { year, precision: "exact", confidence: "high" };
  if (yearEnd !== null && yearEnd > year) {
    // 起点已是完整区间（如 dateProvenance range 747–748）→ 直接输出
    if (start.precision === "range" && start.yearMax === yearEnd) {
      return formatHistoricalDate(start, locale);
    }
    const core = formatDateCore(start, locale);
    if (locale === "zh") {
      // "约 755 年" → "约 755–763 年"；"755 年" → "755–763 年"
      return `${core.replace(/ 年$/, "")}–${yearEnd} 年`;
    }
    return `${core}–${yearEnd}`;
  }
  return formatHistoricalDate(start, locale);
}

/** 人物生平：出生–卒年（含争议标注）。 */
export function formatLifespan(
  birth?: HistoricalDateValue,
  death?: HistoricalDateValue,
  locale: UILocale = "en",
): string {
  const b = formatDateCore(birth, locale);
  const d = formatDateCore(death, locale);
  const disputed =
    birth?.confidence === "disputed" || death?.confidence === "disputed";
  const span = `${b}–${d}`;
  if (disputed) {
    return locale === "zh" ? `${span}（存在学术争议）` : `${span} (disputed)`;
  }
  return span;
}

/* ── 来源等级定义 ──────────────────────────────────────────────────── */

export const AUTHORITY_LEVELS: Record<HistoricalAuthorityLevel, string> = {
  A: "Primary source / contemporary evidence",
  B: "Peer-reviewed scholarship / Cambridge / Oxford / major university press",
  C: "Museum / academic reference database / high-quality encyclopedia",
  D: "General reference websites",
  E: "Unverified web / AI generated material",
};

/* ── 审计输出类型 ──────────────────────────────────────────────────── */

export type AuditStatus = "PASS" | "WARN" | "CONFLICT" | "UNVERIFIED";

export interface AuditFinding {
  status: AuditStatus;
  entityId: string;
  entityType: "person" | "event" | "civilization" | "location" | "relationship" | "system";
  label: string;
  code?: string;
  details: string[];
  authority?: HistoricalAuthorityLevel;
}

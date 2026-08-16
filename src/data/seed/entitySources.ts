/**
 * V0.2.2 → P2-12 — 实体来源层（第一批：5 个 Journey 关键实体）。
 *
 * 政策约束（docs/history-data-policy.md）：
 *   - sourceTitle 为真实史料/学术著作名（学术事实）；
 *   - sourceUrl 未经人工确认一律 null —— 禁止 AI/代码猜测链接；
 *   - reviewStatus = "pending"（待人工复核 URL/页码后改 verified）。
 * 每个实体的 factKey 绑定具体事实（date / birth / span / location）。
 */
import type { HistoricalSource } from "../../lib/provenance";

export const ENTITY_SOURCES: HistoricalSource[] = [
  /* ── c-tang（唐朝）── */
  {
    entityId: "c-tang",
    entityType: "civilization",
    factKey: "span",
    sourceTitle: "《旧唐书》",
    sourceUrl: null,
    sourceType: "primary",
    authorityLevel: "A",
    reviewStatus: "pending",
    note: "五代后晋官修唐史；618–907 年断代依据（待人工核对卷目后置 verified）。",
  },
  {
    entityId: "c-tang",
    entityType: "civilization",
    factKey: "span",
    sourceTitle: "《新唐书》",
    sourceUrl: null,
    sourceType: "primary",
    authorityLevel: "A",
    reviewStatus: "pending",
    note: "北宋官修唐史，与《旧唐书》互补。",
  },
  {
    entityId: "c-tang",
    entityType: "civilization",
    factKey: "span",
    sourceTitle: "The Cambridge History of China, Vol. 3: Sui and T'ang China, 589–906",
    sourceUrl: null,
    sourceType: "university_press",
    authorityLevel: "B",
    reviewStatus: "pending",
    note: "现代通史基准（Twitchett 主编，Cambridge University Press）。",
  },

  /* ── c-abbasid（阿拔斯王朝）── */
  {
    entityId: "c-abbasid",
    entityType: "civilization",
    factKey: "span",
    sourceTitle: "al-Tabari《历代先知与帝王史》（Ta'rikh al-Rusul wa-l-Muluk）",
    sourceUrl: null,
    sourceType: "primary",
    authorityLevel: "A",
    reviewStatus: "pending",
    note: "阿拔斯革命与建国的核心同时代史料。",
  },
  {
    entityId: "c-abbasid",
    entityType: "civilization",
    factKey: "span",
    sourceTitle: "Hugh Kennedy, The Early Abbasid Caliphate: A Political History",
    sourceUrl: null,
    sourceType: "university_press",
    authorityLevel: "B",
    reviewStatus: "pending",
    note: "现代学术基准（Croom Helm/Routledge 系）。",
  },

  /* ── e-751-talas（怛罗斯之战）── */
  {
    entityId: "e-751-talas",
    entityType: "event",
    factKey: "date",
    sourceTitle: "《资治通鉴》卷二一六（天宝十载条）",
    sourceUrl: null,
    sourceType: "primary",
    authorityLevel: "A",
    reviewStatus: "pending",
    note: "751 年怛逻斯之战的中文核心记载；具体日期（7–8 月）为学界推算（待人工核对后置 verified）。",
  },
  {
    entityId: "e-751-talas",
    entityType: "event",
    factKey: "date",
    sourceTitle: "《旧唐书·高仙芝传》",
    sourceUrl: null,
    sourceType: "primary",
    authorityLevel: "A",
    reviewStatus: "pending",
    note: "唐军统帅高仙芝的传记记载（高仙芝尚未作为实体入库，仅作来源引用）。",
  },
  {
    entityId: "e-751-talas",
    entityType: "event",
    factKey: "date",
    sourceTitle: "白寿彝主编《中国通史》隋唐卷",
    sourceUrl: null,
    sourceType: "university_press",
    authorityLevel: "B",
    reviewStatus: "pending",
    note: "现代学术综述对怛罗斯之战时间与规模的通行表述。",
  },

  /* ── p-abu-muslim（阿布·穆斯林）── */
  {
    entityId: "p-abu-muslim",
    entityType: "person",
    factKey: "birth",
    sourceTitle: "M. A. Shaban, The 'Abbāsid Revolution",
    sourceUrl: null,
    sourceType: "university_press",
    authorityLevel: "B",
    reviewStatus: "pending",
    note: "生年 700/718/723 诸说（disputed）的学术讨论来源。",
  },
  {
    entityId: "p-abu-muslim",
    entityType: "person",
    factKey: "death",
    sourceTitle: "al-Tabari《历代先知与帝王史》",
    sourceUrl: null,
    sourceType: "primary",
    authorityLevel: "A",
    reviewStatus: "pending",
    note: "755 年为曼苏尔所杀的记载。",
  },

  /* ── loc-talas（怛罗斯）── */
  {
    entityId: "loc-talas",
    entityType: "location",
    factKey: "location",
    sourceTitle: "《新唐书·地理志》",
    sourceUrl: null,
    sourceType: "primary",
    authorityLevel: "A",
    reviewStatus: "pending",
    note: "怛逻斯城/河谷的历史地理记载。",
  },
  {
    entityId: "loc-talas",
    entityType: "location",
    factKey: "location",
    sourceTitle: "谭其骧主编《中国历史地图集》第五册",
    sourceUrl: null,
    sourceType: "university_press",
    authorityLevel: "B",
    reviewStatus: "pending",
    note: "怛逻斯河谷（今哈萨克斯坦–吉尔吉斯斯坦交界）的现代定位依据。",
  },
];

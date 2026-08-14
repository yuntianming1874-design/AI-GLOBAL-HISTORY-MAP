import type { Civilization } from "../../lib/types";
import { CIV_NAME_META } from "./provenance";

/**
 * 12 civilizations — the anchor entities. Every event, person and location
 * references these stable ids. Colors are the single source of truth for
 * the timeline bands, map regions and graph nodes.
 */
const civilizationsRaw: Civilization[] = [
  {
    id: "c-tang",
    name: "Tang Dynasty",
    chineseName: "唐朝",
    region: "East Asia",
    startYear: 618,
    endYear: 907,
    color: "#b3402a",
    summary:
      "The cosmopolitan golden age of China: Chang'an, the Silk Road, poetry, printing and the civil service examination system.",
  },
  {
    id: "c-tibet",
    name: "Tibetan Empire",
    chineseName: "吐蕃",
    region: "East Asia",
    startYear: 618,
    endYear: 842,
    color: "#8a5a2b",
    summary:
      "A highland military power that contested Tang control of Central Asia, sacked Chang'an in 763 and allied with Tang through marriage.",
  },
  {
    id: "c-silla",
    name: "Unified Silla",
    chineseName: "新罗",
    region: "East Asia",
    startYear: 668,
    endYear: 935,
    color: "#6d5ba6",
    summary:
      "Korea's first unified kingdom, a close Tang ally and cultural partner that ended the Three Kingdoms period.",
  },
  {
    id: "c-japan",
    name: "Nara & Heian Japan",
    chineseName: "奈良·平安日本",
    region: "East Asia",
    startYear: 710,
    endYear: 1185,
    color: "#d4a017",
    summary:
      "Japan's classical age: the capital cities Nara and Heian-kyō (Kyoto), Buddhism, and intensive study of Tang civilization.",
  },
  {
    id: "c-abbasid",
    name: "Abbasid Caliphate",
    chineseName: "阿拔斯王朝",
    region: "West Asia",
    startYear: 750,
    endYear: 1258,
    color: "#1f7a5c",
    summary:
      "The Islamic Golden Age: Baghdad's House of Wisdom, algebra, and the translation of Greek science — contemporaries of the Tang.",
  },
  {
    id: "c-umayyad",
    name: "Umayyad Caliphate",
    chineseName: "倭马亚王朝",
    region: "West Asia",
    startYear: 661,
    endYear: 750,
    color: "#3f8f5f",
    summary:
      "The first hereditary caliphate, stretching from Spain to Central Asia; the enemy Tang met at the Battle of Talas.",
  },
  {
    id: "c-byzantium",
    name: "Byzantine Empire",
    chineseName: "拜占庭帝国",
    region: "Europe",
    startYear: 395,
    endYear: 1453,
    color: "#8e44ad",
    summary:
      "The eastern Roman Empire: Constantinople, Greek learning and Orthodox Christianity — a bridge between East and West.",
  },
  {
    id: "c-carolingian",
    name: "Carolingian Empire",
    chineseName: "加洛林帝国",
    region: "Europe",
    startYear: 751,
    endYear: 888,
    color: "#2c5e8f",
    summary:
      "Charlemagne's Frankish realm, crowned emperor in 800 — the political foundation of medieval western Europe.",
  },
  {
    id: "c-vikings",
    name: "Viking Age",
    chineseName: "维京时代",
    region: "Europe",
    startYear: 793,
    endYear: 1066,
    color: "#557a95",
    summary:
      "Scandinavian seafarers who raided, traded and settled from the North Sea to the Volga and Byzantium.",
  },
  {
    id: "c-maya",
    name: "Classic Maya",
    chineseName: "古典玛雅",
    region: "Americas",
    startYear: 250,
    endYear: 900,
    color: "#1e8449",
    summary:
      "City-states of the Yucatán lowlands at their cultural peak — then the mysterious 9th-century collapse.",
  },
  {
    id: "c-srivijaya",
    name: "Srivijaya",
    chineseName: "室利佛逝",
    region: "Southeast Asia",
    startYear: 650,
    endYear: 1377,
    color: "#16a085",
    summary:
      "A maritime empire based in Palembang controlling the Strait of Malacca — the hinge of the Indian Ocean trade.",
  },
  {
    id: "c-khazars",
    name: "Khazar Khaganate",
    chineseName: "可萨汗国",
    region: "West Asia",
    startYear: 650,
    endYear: 969,
    color: "#a67c00",
    summary:
      "A Turkic steppe state on the Volga — Silk Road middlemen, feared by the Caliphate, patrons of trade routes to the north.",
  },
];

export const civilizations: Civilization[] = civilizationsRaw.map((c) => {
  const meta = CIV_NAME_META[c.id];
  return meta ? { ...c, nameType: meta.nameType, nameNote: meta.note } : c;
});

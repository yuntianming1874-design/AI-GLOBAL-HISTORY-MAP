/**
 * V0.2.2 — Seed 级 Historical Provenance（单一事实来源）。
 *
 * 年份事实只允许出现在 seed（此处 + 各实体数值字段）；UI / AI / 审计
 * 一律从 repository DTO 读取。来源 URL 未经人工确认一律 null + pending。
 */
import type { HistoricalDateValue, HistoricalNameType, PersonProvenance } from "../../lib/provenance";

export const PERSON_PROVENANCE: Record<string, PersonProvenance> = {
  "p-abd-al-rahman-i": {
    birth: {
      year: 731,
      precision: "exact",
      confidence: "high",
    },
    death: {
      year: 788,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-abu-bakr": {
    birth: {
      year: 573,
      precision: "approximate",
      confidence: "medium",
      note: "约 573 年。",
    },
    death: {
      year: 634,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-abu-muslim": {
    birth: {
      year: 700,
      precision: "range",
      confidence: "disputed",
      alternatives: [718, 723],
      note: "生年分歧大：约 700（或 718/723）。",
    },
    death: {
      year: 755,
      precision: "exact",
      confidence: "high",
      note: "755 年为曼苏尔所杀。",
    },
    roles: [
      {
        personId: "p-abu-muslim",
        role: "Revolutionary general 革命将领（呼罗珊）",
        validFrom: {
          year: 747,
          precision: "exact",
          confidence: "medium",
        },
        validTo: {
          year: 755,
          precision: "exact",
          confidence: "medium",
        },
        confidence: "medium",
      },
    ],
  },
  "p-al-khwarizmi": {
    birth: {
      year: 780,
      precision: "range",
      confidence: "medium",
      alternatives: [783],
      note: "约 780 或 783 年。",
    },
    death: {
      year: 850,
      precision: "approximate",
      confidence: "medium",
      note: "卒年约 850（另有 840 前后说）。",
    },
  },
  "p-alcuin": {
    birth: {
      year: 735,
      precision: "approximate",
      confidence: "medium",
      note: "约 735 年。",
    },
    death: {
      year: 804,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-an-lushan": {
    birth: {
      year: 703,
      precision: "approximate",
      confidence: "medium",
      note: "约 703 年（另有 705 说）。",
    },
    death: {
      year: 757,
      precision: "exact",
      confidence: "high",
      note: "757 年初为其子安庆绪所杀。",
    },
  },
  "p-charlemagne": {
    birth: {
      year: 747,
      yearMax: 748,
      precision: "range",
      confidence: "disputed",
      alternatives: [742, 747, 748],
      note: "艾因哈德《查理大帝传》记 742；现代研究多取 747/748（由加冕年龄反推）。生年存在学术争议。",
    },
    death: {
      year: 814,
      precision: "exact",
      confidence: "high",
      note: "814 年 1 月 28 日，亚琛。",
    },
    roles: [
      {
        personId: "p-charlemagne",
        role: "King of the Franks 法兰克国王",
        validFrom: {
          year: 768,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 814,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
      {
        personId: "p-charlemagne",
        role: "King of the Lombards 伦巴第国王",
        validFrom: {
          year: 774,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 814,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
      {
        personId: "p-charlemagne",
        role: "Emperor 皇帝（罗马人的皇帝）",
        validFrom: {
          year: 800,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 814,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
    ],
  },
  "p-cyril": {
    birth: {
      year: 826,
      precision: "range",
      confidence: "medium",
      alternatives: [827],
      note: "826 或 827 年。",
    },
    death: {
      year: 869,
      precision: "exact",
      confidence: "high",
      note: "869 年 2 月 14 日。",
    },
  },
  "p-du-fu": {
    birth: {
      year: 712,
      precision: "exact",
      confidence: "high",
    },
    death: {
      year: 770,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-gaozu": {
    birth: {
      year: 566,
      precision: "exact",
      confidence: "medium",
      note: "566 年为通行记载（《旧唐书》）。",
    },
    death: {
      year: 635,
      precision: "exact",
      confidence: "high",
      note: "635 年（贞观九年）五月驾崩。",
    },
    roles: [
      {
        personId: "p-gaozu",
        role: "Emperor of Tang 皇帝（唐高祖）",
        validFrom: {
          year: 618,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 626,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
    ],
  },
  "p-genmei": {
    birth: {
      year: 660,
      precision: "approximate",
      confidence: "medium",
      note: "约 660 年（661 说）。",
    },
    death: {
      year: 721,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-guo-ziyi": {
    birth: {
      year: 697,
      precision: "exact",
      confidence: "medium",
      note: "697 年（或有 696 说）。",
    },
    death: {
      year: 781,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-han-yu": {
    birth: {
      year: 768,
      precision: "exact",
      confidence: "high",
    },
    death: {
      year: 824,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-harun-al-rashid": {
    birth: {
      year: 766,
      precision: "range",
      confidence: "medium",
      alternatives: [763],
      note: "766 或 763 年两说。",
    },
    death: {
      year: 809,
      precision: "exact",
      confidence: "high",
    },
    roles: [
      {
        personId: "p-harun-al-rashid",
        role: "Abbasid Caliph 哈里发",
        validFrom: {
          year: 786,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 809,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
    ],
  },
  "p-huang-chao": {
    birth: {
      year: 835,
      precision: "approximate",
      confidence: "low",
      note: "生年无确载，约 820–835 年间，835 为常用推定。",
    },
    death: {
      year: 884,
      precision: "exact",
      confidence: "medium",
      note: "884 年（一说 883 年末），虎狼谷之死。",
    },
  },
  "p-kukai": {
    birth: {
      year: 774,
      precision: "exact",
      confidence: "high",
    },
    death: {
      year: 835,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-li-bai": {
    birth: {
      year: 701,
      precision: "range",
      confidence: "medium",
      alternatives: [700],
      note: "701 年为主流；一说 700。",
    },
    death: {
      year: 762,
      precision: "exact",
      confidence: "high",
      note: "762 年（11 月）为通行说。",
    },
    roles: [
      {
        personId: "p-li-bai",
        role: "Hanlin Academician 翰林供奉",
        validFrom: {
          year: 742,
          precision: "exact",
          confidence: "medium",
        },
        validTo: {
          year: 744,
          precision: "exact",
          confidence: "medium",
        },
        confidence: "medium",
      },
    ],
  },
  "p-methodius": {
    birth: {
      year: 815,
      precision: "range",
      confidence: "medium",
      alternatives: [816],
      note: "约 815/816 年。",
    },
    death: {
      year: 885,
      precision: "exact",
      confidence: "high",
    },
  },
  "p-muhammad": {
    birth: {
      year: 570,
      precision: "range",
      confidence: "medium",
      alternatives: [571],
      note: "传统记载 570 或 571 年（象年）。",
    },
    death: {
      year: 632,
      precision: "exact",
      confidence: "high",
      note: "632 年 6 月 8 日（伊斯兰历 11 年）。",
    },
  },
  "p-oleg": {
    birth: {
      year: 850,
      precision: "unknown",
      confidence: "unverified",
      note: "生年无任何可靠记载。",
    },
    death: {
      year: 912,
      precision: "range",
      confidence: "disputed",
      alternatives: [911, 922],
      note: "《往年纪事》记 912；另有 911/922 说，且死因（蛇咬）属传说层。",
    },
  },
  "p-taizong": {
    birth: {
      year: 598,
      precision: "range",
      confidence: "medium",
      alternatives: [599],
      note: "《旧唐书》《新唐书》生年记载略有出入，学界常用 598 或 599。",
    },
    death: {
      year: 649,
      precision: "exact",
      confidence: "high",
    },
    roles: [
      {
        personId: "p-taizong",
        role: "Emperor of Tang 皇帝",
        validFrom: {
          year: 626,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 649,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
    ],
  },
  "p-wu-zetian": {
    birth: {
      year: 624,
      precision: "range",
      confidence: "disputed",
      alternatives: [623, 625],
      note: "武曌生年有 623/624/625 三说。",
    },
    death: {
      year: 705,
      precision: "exact",
      confidence: "high",
    },
    roles: [
      {
        personId: "p-wu-zetian",
        role: "Empress Regnant 皇帝（武周）",
        validFrom: {
          year: 690,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 705,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
    ],
  },
  "p-xuanzang": {
    birth: {
      year: 602,
      precision: "range",
      confidence: "medium",
      alternatives: [600, 603],
      note: "生年有 600/602/603 诸说。",
    },
    death: {
      year: 664,
      precision: "exact",
      confidence: "high",
    },
    roles: [
      {
        personId: "p-xuanzang",
        role: "Buddhist pilgrim 西行求法",
        validFrom: {
          year: 629,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 645,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
      {
        personId: "p-xuanzang",
        role: "Buddhist translator 译经师",
        validFrom: {
          year: 645,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 664,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
    ],
  },
  "p-xuanzong": {
    birth: {
      year: 685,
      precision: "range",
      confidence: "medium",
      alternatives: [686],
      note: "685 或 686 两说。",
    },
    death: {
      year: 762,
      precision: "exact",
      confidence: "high",
    },
    roles: [
      {
        personId: "p-xuanzong",
        role: "Emperor of Tang 皇帝",
        validFrom: {
          year: 712,
          precision: "exact",
          confidence: "high",
        },
        validTo: {
          year: 756,
          precision: "exact",
          confidence: "high",
        },
        confidence: "high",
      },
    ],
  },
  "p-yang-guifei": {
    birth: {
      year: 719,
      precision: "exact",
      confidence: "medium",
      note: "719 年为通行推定。",
    },
    death: {
      year: 756,
      precision: "exact",
      confidence: "high",
      note: "756 年马嵬驿赐死。",
    },
  },
};

export const EVENT_DATE_PROVENANCE: Record<string, HistoricalDateValue> = {
  "e-618-tang-founded": {
  "year": 618,
  "precision": "exact",
  "confidence": "high"
},
  "e-622-hijra": {
  "year": 622,
  "precision": "exact",
  "confidence": "high",
  "note": "622 年（伊斯兰历元年）。"
},
  "e-626-xuanwu-gate": {
  "year": 626,
  "precision": "exact",
  "confidence": "high",
  "note": "626 年 7 月 2 日（武德九年六月初四）。"
},
  "e-629-xuanzang-india": {
  "year": 629,
  "yearMax": 645,
  "precision": "range",
  "confidence": "medium",
  "note": "玄奘西行出发年有 627/629 两说；629 为主流。"
},
  "e-630-eastern-turks": {
  "year": 630,
  "precision": "exact",
  "confidence": "high"
},
  "e-632-muhammad-dies": {
  "year": 632,
  "precision": "exact",
  "confidence": "high",
  "note": "632 年 6 月 8 日。"
},
  "e-634-arab-conquests": {
  "year": 634,
  "yearMax": 651,
  "precision": "range",
  "confidence": "high",
  "note": "终点取耶兹德戈尔德三世之死（651；亦有 652 说）。"
},
  "e-638-jerusalem-siege": {
  "year": 638,
  "precision": "exact",
  "confidence": "high",
  "note": "637/638 两说，638 常用。"
},
  "e-649-taizong-dies": {
  "year": 649,
  "precision": "exact",
  "confidence": "high"
},
  "e-651-islam-china": {
  "year": 651,
  "precision": "exact",
  "confidence": "medium",
  "note": "依《旧唐书》永徽二年遣使记载；学界对“首次官方接触”的解读有讨论。"
},
  "e-661-umayyad-founded": {
  "year": 661,
  "precision": "exact",
  "confidence": "high"
},
  "e-668-silla-unifies": {
  "year": 668,
  "precision": "exact",
  "confidence": "high"
},
  "e-671-yijing-srivijaya": {
  "year": 671,
  "yearMax": 695,
  "precision": "range",
  "confidence": "medium"
},
  "e-690-wu-zetian-zhou": {
  "year": 690,
  "precision": "exact",
  "confidence": "high",
  "note": "690 年 10 月（载初元年九月）。"
},
  "e-705-wu-zetian-abdication": {
  "year": 705,
  "precision": "exact",
  "confidence": "high"
},
  "e-710-nara-capital": {
  "year": 710,
  "precision": "exact",
  "confidence": "high"
},
  "e-711-umayyad-iberia": {
  "year": 711,
  "precision": "exact",
  "confidence": "high"
},
  "e-712-kojiki": {
  "year": 712,
  "precision": "exact",
  "confidence": "high"
},
  "e-717-siege-constantinople": {
  "year": 717,
  "yearMax": 718,
  "precision": "range",
  "confidence": "high"
},
  "e-726-iconoclasm": {
  "year": 726,
  "precision": "exact",
  "confidence": "medium",
  "note": "726 或 730 年诏令之争议；726 常用。"
},
  "e-732-tours": {
  "year": 732,
  "precision": "exact",
  "confidence": "high",
  "note": "732 年 10 月。"
},
  "e-740-khazar-judaism": {
  "year": 740,
  "precision": "approximate",
  "confidence": "medium",
  "note": "约 740 年，或 8 世纪中叶；可萨改宗时间本身存在争议。"
},
  "e-741-tikal-temple-iv": {
  "year": 741,
  "precision": "approximate",
  "confidence": "medium",
  "note": "约 741 年（基于纪年铭文推算）。"
},
  "e-742-libai-court": {
  "year": 742,
  "yearMax": 744,
  "precision": "range",
  "confidence": "medium",
  "note": "742 年应召入翰林（天宝元年/二年说）。"
},
  "e-745-yang-guifei": {
  "year": 745,
  "precision": "range",
  "confidence": "medium",
  "alternatives": [
    744
  ],
  "note": "745（天宝四载）或 744 年。"
},
  "e-750-abbasid-revolution": {
  "year": 750,
  "precision": "exact",
  "confidence": "high",
  "note": "扎卜河之战 750 年 1 月。"
},
  "e-751-talas": {
  "year": 751,
  "precision": "exact",
  "confidence": "high",
  "note": "751 年 7–8 月（怛逻斯河）；具体日期无载。"
},
  "e-755-anlushan": {
  "year": 755,
  "yearMax": 763,
  "precision": "range",
  "confidence": "high",
  "note": "755 年 12 月起兵（天宝十四载十一月）。"
},
  "e-762-baghdad": {
  "year": 762,
  "precision": "exact",
  "confidence": "high"
},
  "e-763-tibetans-changan": {
  "year": 763,
  "precision": "exact",
  "confidence": "high",
  "note": "763 年 11 月。"
},
  "e-768-charlemagne-king": {
  "year": 768,
  "precision": "exact",
  "confidence": "high"
},
  "e-781-nestorian-stele": {
  "year": 781,
  "precision": "exact",
  "confidence": "high",
  "note": "781 年（建中二年）立碑。"
},
  "e-786-harun-caliph": {
  "year": 786,
  "precision": "exact",
  "confidence": "high"
},
  "e-786-translation-movement": {
  "year": 786,
  "yearMax": 830,
  "precision": "range",
  "confidence": "medium",
  "note": "翻译运动为长时段现象（约 750–900）；取 786–830 为高峰期。"
},
  "e-793-lindisfarne": {
  "year": 793,
  "precision": "exact",
  "confidence": "high",
  "note": "793 年 6 月 8 日（盎格鲁-撒克逊编年史）。"
},
  "e-794-heiankyo": {
  "year": 794,
  "precision": "exact",
  "confidence": "high"
},
  "e-800-charlemagne-emperor": {
  "year": 800,
  "precision": "exact",
  "confidence": "high",
  "note": "800 年 12 月 25 日。"
},
  "e-804-kukai-china": {
  "year": 804,
  "precision": "exact",
  "confidence": "high"
},
  "e-810-maya-collapse": {
  "year": 810,
  "yearMax": 900,
  "precision": "range",
  "confidence": "medium",
  "note": "古典期崩溃为长时段过程；起止为学术分期。"
},
  "e-820-khwarizmi-algebra": {
  "year": 820,
  "precision": "approximate",
  "confidence": "medium",
  "note": "约 820（一说 813–833 年间）。"
},
  "e-828-jang-bogo": {
  "year": 828,
  "precision": "exact",
  "confidence": "medium"
},
  "e-845-buddhist-persecution": {
  "year": 845,
  "precision": "exact",
  "confidence": "high",
  "note": "会昌五年（845）诏令。"
},
  "e-851-sulayman-china": {
  "year": 851,
  "precision": "approximate",
  "confidence": "medium",
  "note": "约 851 年成书。"
},
  "e-863-cyril-methodius": {
  "year": 863,
  "precision": "exact",
  "confidence": "high"
},
  "e-868-diamond-sutra": {
  "year": 868,
  "precision": "exact",
  "confidence": "high",
  "note": "868 年 5 月 11 日（咸通九年四月十五日）刊记。"
},
  "e-875-huang-chao": {
  "year": 875,
  "yearMax": 884,
  "precision": "range",
  "confidence": "high",
  "note": "875 年起兵（乾符二年）。"
},
  "e-882-oleg-kiev": {
  "year": 882,
  "precision": "exact",
  "confidence": "medium",
  "note": "依《往年纪事》；882 为编年记载。"
},
  "e-885-vikings-paris": {
  "year": 885,
  "yearMax": 886,
  "precision": "range",
  "confidence": "high"
},
  "e-907-fall-of-tang": {
  "year": 907,
  "precision": "exact",
  "confidence": "high",
  "note": "907 年（天祐四年）。"
},
};

export const CIV_NAME_META: Record<string, { nameType: HistoricalNameType; note: string }> = {
  "c-abbasid": { nameType: "modern_scholarly", note: "当代自称“达瓦拉/阿拔斯家族之政”；“Abbasid Caliphate”为现代标签。" },
  "c-byzantium": { nameType: "modern_scholarly", note: "帝国当代自称“罗马/罗马尼亚”；“Byzantine Empire”为后世史学标签。" },
  "c-carolingian": { nameType: "modern_scholarly", note: "查理曼时代不存在“Carolingian Empire”国名；为现代史学/回溯性标签。" },
  "c-japan": { nameType: "retrospective", note: "“奈良·平安”为后世对时代的回溯性分期，非当时自称。" },
  "c-khazars": { nameType: "modern_scholarly", note: "当代称可萨（哈扎尔）；“Khazar Khaganate”为现代标签。" },
  "c-maya": { nameType: "retrospective", note: "“Classic Maya”为考古学分期标签；“玛雅”为后世称谓。" },
  "c-silla": { nameType: "modern_scholarly", note: "当代称“新罗”；“Unified Silla”为现代史学分期标签。" },
  "c-srivijaya": { nameType: "contemporary", note: "中文/阿拉伯史料称室利佛逝/三佛齐；本土自称无直接记载。" },
  "c-tang": { nameType: "modern_scholarly", note: "当代自称“唐/大唐”；“Tang Dynasty”为现代学界标签。" },
  "c-tibet": { nameType: "modern_scholarly", note: "当代称“吐蕃”；“Tibetan Empire”为现代标签。" },
  "c-umayyad": { nameType: "modern_scholarly", note: "当代称“穆阿维叶之政”；“Umayyad”为现代史学称谓。" },
  "c-vikings": { nameType: "retrospective", note: "“维京时代”为后世分期概念，当时无此自称。" },
};

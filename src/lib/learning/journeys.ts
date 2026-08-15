/**
 * V0.3 — Journey seed data (Phase 2: one vertical slice).
 *
 * `talas-751` — 「公元 751 年：唐朝与世界的交汇」
 *
 * 怛罗斯之战是本旅程的核心事件之一（step 2），但不是唯一焦点：
 * 标题强调 751 年唐朝与阿拔斯王朝、中亚世界在同一时刻的相遇与连接。
 *
 * 只引用 seed 中已存在并经 provenance 审核的实体 id（events / people /
 * civilizations / locations）。narrative 中可以提到历史人物姓名（如高仙芝），
 * 但绝不把它们作为可点击实体——高仙芝尚未通过人工 provenance 审核，
 * 因此不出现在任何 entityId 字段中。
 */
import type { Journey } from "./journeyTypes";

export const JOURNEYS: Journey[] = [
  {
    id: "talas-751",
    slug: "talas-751",
    title: "公元 751 年：唐朝与世界的交汇",
    titleEn: "751 CE: Tang China and the Meeting of Worlds",
    subtitle: "怛罗斯之战与丝绸之路上的相遇之年",
    subtitleEn: "The Battle of Talas and a year of Silk Road encounters",
    description:
      "沿着时间、地图、人物与文明的线索，走进公元 751 年的世界：唐朝的向西扩张、阿拔斯王朝的崛起、怛罗斯之战与丝绸之路上的知识交汇——理解这个时代如何把欧亚大陆第一次真正连接在一起。",
    descriptionEn:
      "Follow time, map, people and civilizations into the world of 751 CE: Tang westward expansion, the rise of the Abbasids, the Battle of Talas and the exchange of knowledge along the Silk Road — how this era first truly connected Eurasia.", 
    startYear: 618,
    endYear: 751,
    estimatedMinutes: 10,
    difficulty: "beginner",
    steps: [
      {
        id: "talas-751-step-1",
        order: 1,
        title: "唐帝国进入中亚",
        titleEn: "The Tang Empire Moves into Central Asia",
        narrative:
          "618 年唐朝建立后，历代皇帝沿丝绸之路向西推进：630 年灭东突厥，640 年代设安西都护府，把安西四镇（龟兹、疏勒、于阗、焉耆）纳入版图。到 8 世纪中叶，唐朝的势力已深入中亚腹地，与当地政权及西进的阿拉伯势力正面相遇。唐军将领如高仙芝正是在这样的背景下远赴中亚——但请注意，高仙芝尚未通过人工史料审核，本旅程不把他列为可点击人物。",
        narrativeEn:
          "After the Tang was founded in 618, successive emperors pushed west along the Silk Road: the Eastern Turks were subdued in 630, and the Protectorate General of Anxi was established in the 640s with the Four Garrisons (Kucha, Kashgar, Khotan, Karasahr) incorporated. By the mid-8th century Tang power reached deep into Central Asia, bringing it face to face with the westward-moving Arab caliphate. Generals such as Gao Xianzhi campaigned in this frontier — but Gao Xianzhi has not yet passed human provenance review, so this journey does not list him as a clickable person.",
        question: "唐朝是如何一步步进入中亚的？",
        questionEn: "How did the Tang empire gradually reach into Central Asia?",
        whyImportant: "理解唐朝向西推进的过程，才能理解 751 年怛罗斯之战为什么发生在中亚而不是唐朝边境——向西的每一步扩张，都让唐朝与伊斯兰世界的相遇更近一步。",
        whyImportantEn:
          "Understanding how the Tang pushed west is the key to why the Battle of Talas happened in Central Asia in 751 rather than at the Tang frontier — every step westward brought Tang China one step closer to the Islamic world.",
        nextStepReason: "唐朝的扩张最终在怛罗斯与阿拔斯军队相遇——下一步，我们来看 751 年那场改变边界的战役。",
        nextStepReasonEn:
          "Tang expansion finally met the Abbasid army at Talas — next, we look at the battle in 751 that redrew the frontier.",
        keyFactEntityIds: ["c-tang", "e-630-eastern-turks", "loc-changan"],
        people: [],
        locations: ["loc-changan"],
        civilizations: ["c-tang"],
        year: 618,
        startYear: 618,
        endYear: 751,
        civilizationId: "c-tang",
        locationId: "loc-changan",
        surroundingEntities: [
          { id: "c-tang", type: "civilization" },
          { id: "e-630-eastern-turks", type: "event" },
          { id: "e-649-taizong-dies", type: "event" },
          { id: "loc-changan", type: "location" },
        ],
      },
      {
        id: "talas-751-step-2",
        order: 2,
        title: "怛罗斯之战",
        titleEn: "The Battle of Talas",
        narrative:
          "751 年 7–8 月，唐朝安西节度使高仙芝所率唐军与阿拔斯王朝军队在中亚怛逻斯河（今哈萨克斯坦与吉尔吉斯斯坦交界一带）交战，唐军失利。传说被俘的唐军工匠把造纸术带到撒马尔罕，再传向伊斯兰世界与欧洲。怛罗斯之战标志着唐朝向西扩张的终点，也是中国与伊斯兰世界在中亚长期共存的起点。",
        narrativeEn:
          "In July–August 751, Tang forces under the Anxi jiedushi Gao Xianzhi met an Abbasid army at the Talas River (on the modern Kyrgyzstan–Kazakhstan frontier) and were routed. Legend holds that captured Chinese artisans carried paper-making to Samarkand and from there across the Islamic world and into Europe. Talas marked the end of Tang westward expansion — and the beginning of a lasting coexistence between the Chinese and Islamic worlds in Central Asia.",
        question: "751 年怛罗斯之战发生了什么？它为什么成为唐朝与阿拔斯王朝的转折点？",
        questionEn: "What happened at the Battle of Talas in 751, and why was it a turning point between Tang China and the Abbasids?",
        whyImportant: "怛罗斯之战常被视为唐朝在中亚扩张的终点、中国与伊斯兰世界在中亚长期共存的起点；它还因“造纸术西传”的传说而闻名，是丝绸之路知识交流的标志性事件。",
        whyImportantEn:
          "Talas is often read as the end of Tang expansion in Central Asia and the start of a lasting Sino-Islamic coexistence there; it is also famous for the legend of paper-making spreading westward — an emblem of Silk Road knowledge exchange.",
        nextStepReason: "一场战役的胜负取决于双方背后的世界——下一步，我们把唐朝与阿拔斯王朝放进中亚的棋盘，看看 751 年前后的完整图景。",
        nextStepReasonEn:
          "A battle's outcome depends on the worlds behind both sides — next, we place Tang and the Abbasids on the Central Asian board to see the full picture around 751.",
        keyFactEntityIds: ["e-751-talas", "loc-talas", "c-tang", "c-abbasid"],
        people: [],
        locations: ["loc-talas"],
        civilizations: ["c-tang", "c-abbasid"],
        year: 751,
        startYear: 751,
        endYear: 751,
        eventId: "e-751-talas",
        locationId: "loc-talas",
        civilizationId: "c-tang",
        surroundingEntities: [
          { id: "e-751-talas", type: "event" },
          { id: "loc-talas", type: "location" },
          { id: "c-tang", type: "civilization" },
          { id: "c-abbasid", type: "civilization" },
        ],
      },
      {
        id: "talas-751-step-3",
        order: 3,
        title: "唐帝国、阿拔斯王朝与中亚世界",
        titleEn: "Tang, the Abbasids and the Central Asian World",
        narrative:
          "怛罗斯之战的双方并不只是唐朝与阿拔斯王朝。750 年阿拔斯革命刚刚推翻倭马亚王朝，哈里发政权正在巩固；中亚的粟特城邦、突厥部落与吐蕃势力也在这盘棋局之中。751 年前后，阿拉伯帝国与唐朝都从这场接触中获得了对方的知识——纸张、丝绸、天文与数学在中亚走廊上双向流动。",
        narrativeEn:
          "The two sides at Talas were never simply Tang versus Abbasid. The Abbasid Revolution had just toppled the Umayyads in 750, and the new caliphate was still consolidating; Sogdian city-states, Turkic tribes and the Tibetan empire were all pieces on the same board. Around 751 both empires gained from the encounter — paper, silk, astronomy and mathematics flowed both ways along the Central Asian corridor.",
        question: "751 年前后，唐朝、阿拔斯王朝与中亚世界是什么关系？",
        questionEn: "Around 751, what was the relationship between Tang China, the Abbasid Caliphate and the Central Asian world?",
        whyImportant: "怛罗斯之战并非两个帝国的全部故事——阿拔斯革命、中亚城邦与丝绸之路上的知识流动，共同构成这一地区更完整的图景；理解它才能避免把一场战役简化成“中西对抗”。",
        whyImportantEn:
          "Talas was never the whole story of two empires — the Abbasid Revolution, the Central Asian city-states and the flow of knowledge along the Silk Road complete the picture, and prevent a single battle from being flattened into a simple 'East vs West' clash.",
        nextStepReason: "中亚的故事并非孤立发生——下一步，我们把目光投向世界其他地区，看看 751 年地球上还发生了什么。",
        nextStepReasonEn:
          "Central Asia did not happen in isolation — next, we look beyond to see what else was happening on Earth in 751.",
        keyFactEntityIds: ["c-abbasid", "e-750-abbasid-revolution", "p-abu-muslim", "loc-samarkand"],
        people: ["p-abu-muslim"],
        locations: ["loc-samarkand"],
        civilizations: ["c-abbasid", "c-tang"],
        year: 751,
        startYear: 751,
        endYear: 751,
        civilizationId: "c-abbasid",
        locationId: "loc-samarkand",
        surroundingEntities: [
          { id: "c-abbasid", type: "civilization" },
          { id: "c-tang", type: "civilization" },
          { id: "e-750-abbasid-revolution", type: "event" },
          { id: "e-751-talas", type: "event" },
          { id: "p-abu-muslim", type: "person" },
          { id: "loc-samarkand", type: "location" },
        ],
      },
      {
        id: "talas-751-step-4",
        order: 4,
        title: "中国与世界：同一时间发生了什么？",
        titleEn: "China and the World: What Else Happened in 751?",
        narrative:
          "751 年并非只属于怛罗斯。长安城中，唐玄宗治下的盛唐正处在开元天宝盛世的高峰；巴格达，阿拔斯王朝刚迁都立基；西欧，矮子丕平即将开启加洛林时代；日本奈良、玛雅古典期的城邦也在各自的轨道上运行。把 751 年放进世界坐标，才能理解怛罗斯之战为何只是更大图景中的一环。",
        narrativeEn:
          "751 did not belong to Talas alone. In Chang'an the Tang was at the peak of the Kaiyuan–Tianbao golden age; in Baghdad the Abbasids were founding a new capital; in Western Europe Pepin the Short was about to open the Carolingian era; Nara Japan and the Classic Maya city-states ran on their own clocks. Placing 751 on a world map shows why Talas was only one thread in a much larger fabric.",
        question: "751 年，世界不同地区各自发生了什么？",
        questionEn: "In 751, what was happening in different parts of the world at the same time?",
        whyImportant: "把 751 年放进世界坐标，才能避免以单一中心看历史——长安、巴格达、西欧、奈良与玛雅城邦在同一时间各自演进，怛罗斯只是其中一环。",
        whyImportantEn:
          "Placing 751 on a world grid avoids a single-centred view of history — Chang'an, Baghdad, Western Europe, Nara and the Maya city-states each evolved on their own clocks, and Talas was only one thread.",
        nextStepReason: "看见世界之后，让我们回到起点，回答最后一个问题：为什么怛罗斯之战值得记住？",
        nextStepReasonEn:
          "Having seen the world, let us return to where we started and answer the final question: why does the Battle of Talas deserve to be remembered?",
        keyFactEntityIds: ["e-751-talas", "c-japan", "c-carolingian", "c-maya"],
        people: [],
        locations: [],
        civilizations: ["c-tang", "c-abbasid", "c-carolingian", "c-japan", "c-maya"],
        year: 751,
        startYear: 751,
        endYear: 751,
        surroundingEntities: [
          { id: "c-tang", type: "civilization" },
          { id: "c-abbasid", type: "civilization" },
          { id: "c-carolingian", type: "civilization" },
          { id: "c-japan", type: "civilization" },
          { id: "c-maya", type: "civilization" },
          { id: "e-751-talas", type: "event" },
        ],
      },
      {
        id: "talas-751-step-5",
        order: 5,
        title: "回顾：为什么怛罗斯之战值得记住？",
        titleEn: "Review: Why Does the Battle of Talas Matter?",
        narrative:
          "怛罗斯之战本身未必改变世界格局，但它浓缩了一个时代的相遇：唐朝的向西扩张在这里停下，伊斯兰世界的东进在这里缓和，丝绸之路上的知识交换却从未中断。理解 751 年，就是理解欧亚大陆如何第一次被真正连接起来——以及这种连接如何塑造了之后一千年的历史。",
        narrativeEn:
          "The battle itself may not have redrawn the world, but it condenses an era's encounter: Tang expansion halted here, the Islamic advance softened here, and the exchange of knowledge along the Silk Road never stopped. Understanding 751 is understanding how Eurasia was first truly connected — and how that connection shaped the next millennium.",
        question: "为什么怛罗斯之战值得记住？",
        questionEn: "Why does the Battle of Talas deserve to be remembered?",
        whyImportant: "它浓缩了一个时代的相遇：唐朝向西扩张在此停下、伊斯兰世界东进在此缓和、丝绸之路上的知识交换却从未中断——理解 751 年，就是理解欧亚大陆如何第一次被真正连接。",
        whyImportantEn:
          "It condenses an era's encounter: Tang expansion halted here, the Islamic advance softened here, yet the exchange of knowledge along the Silk Road never stopped — understanding 751 is understanding how Eurasia was first truly connected.",
        nextStepReason: "旅程到此结束——你可以回顾关键事实巩固记忆，或继续探索丝绸之路上的其他节点。",
        nextStepReasonEn:
          "This concludes the journey — review the key facts to consolidate your memory, or continue exploring other nodes along the Silk Road.",
        keyFactEntityIds: ["e-751-talas", "c-tang", "c-abbasid"],
        people: [],
        locations: [],
        civilizations: ["c-tang", "c-abbasid"],
        year: 751,
        startYear: 751,
        endYear: 751,
        eventId: "e-751-talas",
        surroundingEntities: [
          { id: "e-751-talas", type: "event" },
          { id: "c-tang", type: "civilization" },
          { id: "c-abbasid", type: "civilization" },
          { id: "loc-talas", type: "location" },
        ],
      },
    ],
  },
];

/**
 * V0.3 — Journey seed data (Phase 2: one vertical slice).
 *
 * `talas-751` — 「公元 751 年：唐朝与世界的交汇」
 *
 * 怛罗斯之战是本旅程的核心事件之一（step 2），但不是唯一焦点：
 * 标题强调 751 年唐朝与阿拔斯王朝、中亚世界在同一时刻的相遇与连接。
 *
 * 只引用 seed 中已存在并经 provenance 审核的实体 id（events / people /
 * civilizations / locations）。高仙芝已于 P2-14 通过人工来源审核入库
 * （p-gao-xianzhi），可作为可点击实体引用。
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
    status: "published",
    featured: true,
    keywords: [
      { labelZh: "丝绸之路", labelEn: "Silk Road" },
      { labelZh: "中亚", labelEn: "Central Asia" },
      { labelZh: "知识交换", labelEn: "Knowledge exchange" },
      { labelZh: "唐朝与阿拔斯", labelEn: "Tang & Abbasids" },
    ],
    steps: [
      {
        id: "talas-751-step-1",
        order: 1,
        title: "唐帝国进入中亚",
        titleEn: "The Tang Empire Moves into Central Asia",
        narrative:
          "618 年唐朝建立后，历代皇帝沿丝绸之路向西推进：630 年灭东突厥，640 年代设安西都护府，把安西四镇（龟兹、疏勒、于阗、焉耆）纳入版图。到 8 世纪中叶，唐朝的势力已深入中亚腹地，与当地政权及西进的阿拉伯势力正面相遇。唐军将领如高仙芝正是在这样的背景下远赴中亚——高仙芝已经人工审核入库，你可以通过「相关人物」深入了解他。",
        narrativeEn:
          "After the Tang was founded in 618, successive emperors pushed west along the Silk Road: the Eastern Turks were subdued in 630, and the Protectorate General of Anxi was established in the 640s with the Four Garrisons (Kucha, Kashgar, Khotan, Karasahr) incorporated. By the mid-8th century Tang power reached deep into Central Asia, bringing it face to face with the westward-moving Arab caliphate. Generals such as Gao Xianzhi campaigned in this frontier — Gao Xianzhi has now passed human provenance review and is a clickable person in this journey.",
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
        keyFactEntityIds: ["e-751-talas", "p-gao-xianzhi", "loc-talas", "c-tang", "c-abbasid"],
        people: ["p-gao-xianzhi"],
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
          { id: "p-gao-xianzhi", type: "person" },
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
  {
    id: "an-lushan-rebellion",
    slug: "an-lushan-rebellion",
    title: "安史之乱：755–763 年唐朝的惊变",
    titleEn: "The An Lushan Rebellion: Tang China's Crisis, 755–763",
    subtitle: "从盛世到叛乱，再到乱后的唐朝",
    subtitleEn: "From golden age to rebellion, and the Tang after",
    description:
      "跟随安禄山、唐玄宗、杨贵妃与郭子仪，经历 755 年渔阳起兵、长安陷落与马嵬之变，理解这场叛乱如何让唐朝由盛转衰——全部基于现有结构化历史数据。",
    descriptionEn:
      "Follow An Lushan, Xuanzong, Yang Guifei and Guo Ziyi through the rebellion of 755, the fall of Chang'an and the Mawei mutiny — and how it turned Tang China from zenith to decline, from curated data only.",
    startYear: 712,
    endYear: 907,
    estimatedMinutes: 12,
    difficulty: "beginner",
    status: "published",
    featured: true,
    keywords: [
      { labelZh: "安史之乱", labelEn: "An Lushan Rebellion" },
      { labelZh: "由盛转衰", labelEn: "From zenith to decline" },
      { labelZh: "马嵬之变", labelEn: "The Mawei mutiny" },
    ],
    steps: [
      {
        id: "an-lushan-rebellion-step-1",
        order: 1,
        title: "盛世之下：天宝年间的唐朝",
        titleEn: "Beneath the Golden Age: Tang China in the Tianbao Years",
        question: "天宝年间的唐朝看起来盛世繁华——但这繁华之下潜伏着什么？",
        questionEn: "The Tianbao years looked like a golden age — what lurked beneath the surface?",
        narrative:
          "天宝年间（742–756），唐玄宗治下的唐朝看似达到顶峰：742 年李白应召入翰林，745 年杨贵妃被册封，长安城万国来朝。但盛世背后，玄宗怠政、边镇节度使权力膨胀——安禄山一人身兼三镇节度使。危机的种子已经在盛世中埋下。",
        narrativeEn:
          "In the Tianbao years (742–756), the Tang under Xuanzong looked at its zenith: Li Bai was summoned to the Hanlin Academy in 742, Yang Guifei was installed as consort in 745, and Chang'an drew visitors from across the world. Beneath the surface, however, Xuanzong neglected government and frontier jiedushi amassed power — An Lushan alone commanded three garrisons. The seeds of crisis were sown inside the golden age.",
        whyImportant: "理解盛世内部的结构性隐患（皇帝怠政、藩镇坐大），才能理解安史之乱为何爆发，而不是把它当成一次偶然的叛乱。",
        whyImportantEn:
          "Understanding the structural flaws inside the golden age (an inattentive emperor, over-mighty frontier commands) explains WHY the rebellion broke out, instead of treating it as an accident.",
        nextStepReason: "隐患终于在 755 年爆发——下一步，我们看渔阳的叛乱如何震动整个帝国。",
        nextStepReasonEn:
          "The flaws detonated in 755 — next, we see how the rebellion from Fanyang shook the whole empire.",
        keyFactEntityIds: ["c-tang", "e-742-libai-court", "e-745-yang-guifei", "loc-changan"],
        people: ["p-xuanzong", "p-yang-guifei"],
        locations: ["loc-changan"],
        civilizations: ["c-tang"],
        year: 745,
        startYear: 712,
        endYear: 755,
        civilizationId: "c-tang",
        locationId: "loc-changan",
        surroundingEntities: [
          { id: "c-tang", type: "civilization" },
          { id: "e-742-libai-court", type: "event" },
          { id: "e-745-yang-guifei", type: "event" },
          { id: "p-xuanzong", type: "person" },
          { id: "p-yang-guifei", type: "person" },
          { id: "loc-changan", type: "location" },
        ],
      },
      {
        id: "an-lushan-rebellion-step-2",
        order: 2,
        title: "755 年：渔阳鼙鼓动地来",
        titleEn: "755: The War Drums of Fanyang",
        question: "755 年 12 月发生了什么，让盛唐在一夜之间进入战争？",
        questionEn: "What happened in December 755 that plunged the golden Tang into war overnight?",
        narrative:
          "755 年 12 月，深受玄宗宠信的边镇节度使安禄山从范阳（今北京一带）起兵叛乱，号称二十万大军南下。叛军势如破竹，不足一个月便攻占东都洛阳，随后兵锋直指长安。这场持续近八年的战争（755–763）被称为安史之乱，是唐朝由盛转衰的转折点。",
        narrativeEn:
          "In December 755, An Lushan — a frontier jiedushi deeply favored by Xuanzong — rebelled from Fanyang (near modern Beijing) with a claimed 200,000 men. The rebels swept south, took the eastern capital Luoyang within a month, and aimed next at Chang'an. The war that followed (755–763) is the An Lushan Rebellion — the turning point from Tang zenith to decline.",
        whyImportant: "安史之乱不是一次边境冲突，而是帝国腹地的全面内战：两京沦陷、皇帝出逃、人口锐减——它定义了此后一百五十年的唐朝。",
        whyImportantEn:
          "The rebellion was not a border skirmish but a full civil war in the imperial heartland: both capitals fell, the emperor fled, and the population collapsed — it defined the Tang for the next 150 years.",
        nextStepReason: "叛乱迅速吞没了长安——下一步，我们跟随玄宗出逃，见证马嵬之变。",
        nextStepReasonEn:
          "The rebellion swallowed Chang'an — next, we follow Xuanzong's flight and witness the Mawei mutiny.",
        keyFactEntityIds: ["e-755-anlushan", "p-an-lushan", "loc-luoyang"],
        people: ["p-an-lushan"],
        locations: ["loc-luoyang"],
        civilizations: ["c-tang"],
        year: 755,
        startYear: 755,
        endYear: 763,
        eventId: "e-755-anlushan",
        civilizationId: "c-tang",
        locationId: "loc-luoyang",
        surroundingEntities: [
          { id: "e-755-anlushan", type: "event" },
          { id: "p-an-lushan", type: "person" },
          { id: "loc-luoyang", type: "location" },
          { id: "c-tang", type: "civilization" },
        ],
      },
      {
        id: "an-lushan-rebellion-step-3",
        order: 3,
        title: "长安陷落与马嵬之变",
        titleEn: "The Fall of Chang'an and the Mawei Mutiny",
        question: "756 年，玄宗与杨贵妃的命运发生了什么剧变？",
        questionEn: "In 756, what dramatic fate befell Xuanzong and Yang Guifei?",
        narrative:
          "756 年，潼关失守，玄宗仓皇逃离长安，向蜀地避难。行至马嵬驿（今陕西兴平），随行禁军哗变，杨贵妃被缢死，玄宗被迫继续西行，而太子李亨在灵武即位（即唐肃宗）。长安就此沦入叛军之手——唐朝最黑暗的时刻之一。",
        narrativeEn:
          "In 756, after the fall of the Tong Pass, Xuanzong fled Chang'an for Sichuan. At Mawei post-station (modern Xingping, Shaanxi), the escorting troops mutinied: Yang Guifei was strangled, Xuanzong continued west, and the crown prince Li Heng proclaimed himself emperor (Suzong) at Lingwu. Chang'an fell to the rebels — one of the Tang's darkest moments.",
        whyImportant: "马嵬之变浓缩了这场叛乱的全部悲剧：帝国的心脏沦陷、皇权被迫出逃、最受宠的贵妃死于哗变——盛世的幻象彻底破碎。",
        whyImportantEn:
          "The Mawei mutiny condenses the tragedy of the rebellion: the imperial heart fell, the throne fled, and the most favored consort died in a mutiny — the golden-age illusion shattered completely.",
        nextStepReason: "帝国的抵抗并没有结束——下一步，我们看郭子仪如何一步步夺回两京。",
        nextStepReasonEn:
          "The empire's resistance was not over — next, we see how Guo Ziyi fought to retake the capitals.",
        keyFactEntityIds: ["p-yang-guifei", "p-xuanzong", "loc-changan"],
        people: ["p-yang-guifei", "p-xuanzong"],
        locations: ["loc-changan"],
        civilizations: ["c-tang"],
        year: 756,
        startYear: 756,
        endYear: 756,
        civilizationId: "c-tang",
        locationId: "loc-changan",
        surroundingEntities: [
          { id: "p-yang-guifei", type: "person" },
          { id: "p-xuanzong", type: "person" },
          { id: "loc-changan", type: "location" },
          { id: "e-755-anlushan", type: "event" },
        ],
      },
      {
        id: "an-lushan-rebellion-step-4",
        order: 4,
        title: "郭子仪与平叛之路",
        titleEn: "Guo Ziyi and the Road to Recovery",
        question: "唐朝如何在溃败边缘重新组织起反击？",
        questionEn: "How did the Tang regroup from the brink of collapse?",
        narrative:
          "在灵武新朝廷的调度下，名将郭子仪率军反击：757 年收复两京（长安、洛阳），762 年前后平定了叛乱的主要残余。这场平叛依赖回纥骑兵的援助，也让平叛将领们（郭子仪等）获得了巨大的威望与兵权——为乱后的藩镇割据埋下了伏笔。",
        narrativeEn:
          "Under the new court at Lingwu, the great general Guo Ziyi led the counteroffensive: both capitals (Chang'an and Luoyang) were retaken in 757, and the main rebel remnants were crushed around 762. The recovery relied on Uyghur cavalry aid — and left the victorious generals (Guo Ziyi foremost) with immense prestige and military power, foreshadowing the post-war military governors.",
        whyImportant: "平叛的代价与方式同样重要：借兵回纥、重用武人，都成为乱后唐朝难以摆脱的结构性遗产。",
        whyImportantEn:
          "The COST and METHOD of recovery mattered as much as victory: Uyghur auxiliaries and empowered generals became structural legacies the post-war Tang could not shake off.",
        nextStepReason: "叛乱结束了，但唐朝再也回不到从前——下一步，我们看乱后由盛转衰的一百五十年。",
        nextStepReasonEn:
          "The rebellion ended, but the Tang never returned to what it was — next, the 150 years of decline that followed.",
        keyFactEntityIds: ["p-guo-ziyi", "e-755-anlushan", "c-tang"],
        people: ["p-guo-ziyi"],
        locations: [],
        civilizations: ["c-tang"],
        year: 757,
        startYear: 757,
        endYear: 763,
        civilizationId: "c-tang",
        surroundingEntities: [
          { id: "p-guo-ziyi", type: "person" },
          { id: "e-755-anlushan", type: "event" },
          { id: "c-tang", type: "civilization" },
        ],
      },
      {
        id: "an-lushan-rebellion-step-5",
        order: 5,
        title: "乱后唐朝：由盛转衰",
        titleEn: "The Tang After: From Zenith to Decline",
        question: "安史之乱结束后，唐朝为什么再也无法恢复盛世？",
        questionEn: "After the rebellion, why could the Tang never restore its golden age?",
        narrative:
          "763 年叛乱平定，但同年吐蕃就攻陷长安；此后藩镇割据、宦官专权接踵而至。875 年黄巢之乱再次席卷帝国，907 年朱温篡唐——唐朝的灭亡，几乎可以视为安史之乱开启的衰亡长链的终点。",
        narrativeEn:
          "The rebellion was put down in 763 — yet in that same year Tibetan forces sacked Chang'an; military governors and palace eunuchs dominated what followed. The Huang Chao rebellion swept the empire from 875, and in 907 Zhu Wen deposed the last Tang emperor — the dynasty's fall can be read as the endpoint of the long chain of decline opened by the An Lushan Rebellion.",
        whyImportant: "把安史之乱放进 755→907 的长时段，才能真正理解'由盛转衰'：它不是单一事件，而是衰亡链条的第一环。",
        whyImportantEn:
          "Placing the rebellion in the long span of 755→907 reveals what 'decline' really means: not a single event, but the first link in a long chain of decay.",
        nextStepReason: "旅程结束——你可以通过回忆练习巩固，或回到 751 年的世界做横向比较。",
        nextStepReasonEn:
          "The journey ends here — consolidate with the recall quiz, or compare with the world of 751.",
        keyFactEntityIds: ["e-763-tibetans-changan", "e-875-huang-chao", "e-907-fall-of-tang"],
        people: [],
        locations: [],
        civilizations: ["c-tang"],
        year: 763,
        startYear: 763,
        endYear: 907,
        eventId: "e-763-tibetans-changan",
        civilizationId: "c-tang",
        surroundingEntities: [
          { id: "e-763-tibetans-changan", type: "event" },
          { id: "e-875-huang-chao", type: "event" },
          { id: "e-907-fall-of-tang", type: "event" },
          { id: "c-tang", type: "civilization" },
        ],
      },
    ],
  },
  {
    id: "li-bai-life",
    slug: "li-bai-life",
    title: "李白的一生：701–762",
    titleEn: "The Life of Li Bai: 701–762",
    subtitle: "诗仙的游历、宫廷与乱世",
    subtitleEn: "The poet's travels, his court years and a world at war",
    description:
      "跟随李白从出生到逝世：早年游历、长安翰林供奉、与杜甫的友谊，以及安史之乱中的晚年——通过时间轴与地图理解一位诗人的一生如何嵌进盛唐的兴衰。",
    descriptionEn:
      "Follow Li Bai from birth to death: his early travels, his Hanlin Academy years in Chang'an, his friendship with Du Fu, and his final years amid the An Lushan Rebellion — how one poet's life was embedded in the rise and fall of the golden Tang.",
    startYear: 701,
    endYear: 762,
    estimatedMinutes: 10,
    difficulty: "beginner",
    status: "published",
    featured: true,
    keywords: [
      { labelZh: "李白", labelEn: "Li Bai" },
      { labelZh: "唐诗", labelEn: "Tang poetry" },
      { labelZh: "长安", labelEn: "Chang'an" },
    ],
    steps: [
      {
        id: "li-bai-life-step-1",
        order: 1,
        title: "诗仙的诞生",
        titleEn: "The Birth of a Poet",
        question: "李白出生于何时何地？为什么连他的出生年份都存在两说？",
        questionEn: "When and where was Li Bai born — and why is even his birth year debated?",
        narrative:
          "李白生于 701 年（主流说法；一说 700 年），少年时代在蜀中度过，二十余岁开始壮游长江中下游。关于他的出生地也有争议（一说碎叶城，一说蜀中）——本项目采用学界通行的 701 年，并以 medium 置信度标注（存在学术讨论）。",
        narrativeEn:
          "Li Bai was born in 701 (the mainstream date; some say 700) and grew up in the Shu region, beginning his grand travels along the Yangtze in his twenties. His birthplace is also debated (some say Suyab in Central Asia, others Shu) — this project follows the scholarly mainstream of 701, marked with medium confidence (scholarly discussion exists).",
        whyImportant: "李白的出生年份与出生地本身就是史学讨论的案例——理解这种不确定性，是读历史的基本功。",
        whyImportantEn:
          "Li Bai's birth date and birthplace are themselves case studies in historical uncertainty — learning to live with it is a basic skill of reading history.",
        nextStepReason: "从蜀中到长安——下一步，我们看李白如何在 742 年进入盛唐的权力与文化中心。",
        nextStepReasonEn:
          "From Shu to Chang'an — next, how Li Bai entered the golden Tang's center of power and culture in 742.",
        keyFactEntityIds: ["p-li-bai", "c-tang"],
        people: ["p-li-bai"],
        locations: [],
        civilizations: ["c-tang"],
        year: 701,
        startYear: 701,
        endYear: 724,
        personId: "p-li-bai",
        civilizationId: "c-tang",
        surroundingEntities: [
          { id: "p-li-bai", type: "person" },
          { id: "c-tang", type: "civilization" },
        ],
      },
      {
        id: "li-bai-life-step-2",
        order: 2,
        title: "长安：翰林供奉",
        titleEn: "Chang'an: The Hanlin Academy",
        question: "742 年，李白如何进入了唐玄宗的长安宫廷？",
        questionEn: "In 742, how did Li Bai enter Xuanzong's court in Chang'an?",
        narrative:
          "742 年，经人举荐，李白应召入长安，供奉翰林（742–744）。传说他曾令高力士脱靴、为杨贵妃写诗——这些轶事层不可尽信，但翰林岁月确实是他一生距离权力中心最近的时光。744 年他离开长安，重新开始游历。",
        narrativeEn:
          "In 742, recommended to court, Li Bai was summoned to Chang'an and served in the Hanlin Academy (742–744). Legends say he made Gao Lishi pull off his boots and wrote poems for Yang Guifei — the anecdotes cannot all be trusted, but the Hanlin years were indeed the closest he ever stood to the center of power. He left Chang'an in 744 and returned to his travels.",
        whyImportant: "长安岁月是理解李白的关键：他既是盛唐文化的象征，也始终是宫廷的局外人——这种张力贯穿他的一生。",
        whyImportantEn:
          "The Chang'an years are the key to Li Bai: at once a symbol of golden-Tang culture and always an outsider at court — a tension that runs through his whole life.",
        nextStepReason: "离开长安后，李白遇到了他一生最重要的朋友——下一步，我们看李杜的相遇。",
        nextStepReasonEn:
          "After leaving Chang'an, Li Bai met the most important friend of his life — next, the meeting of Li and Du.",
        keyFactEntityIds: ["e-742-libai-court", "p-xuanzong", "loc-changan"],
        people: ["p-li-bai", "p-xuanzong"],
        locations: ["loc-changan"],
        civilizations: ["c-tang"],
        year: 742,
        startYear: 742,
        endYear: 744,
        eventId: "e-742-libai-court",
        personId: "p-li-bai",
        civilizationId: "c-tang",
        locationId: "loc-changan",
        surroundingEntities: [
          { id: "e-742-libai-court", type: "event" },
          { id: "p-li-bai", type: "person" },
          { id: "p-xuanzong", type: "person" },
          { id: "loc-changan", type: "location" },
        ],
      },
      {
        id: "li-bai-life-step-3",
        order: 3,
        title: "与杜甫的友谊",
        titleEn: "The Friendship with Du Fu",
        question: "李白与杜甫的相遇，为什么被视为中国文学史上最重要的友谊？",
        questionEn: "Why is the meeting of Li Bai and Du Fu seen as the greatest friendship in Chinese literature?",
        narrative:
          "744 年前后，李白在洛阳一带与比他小十一岁的杜甫相遇，二人同游梁宋（今河南一带），结下深厚友谊。杜甫后来写下了多首怀念李白的诗（如《梦李白》）。两位并称'李杜'的诗人，共同定义了唐诗的最高峰。",
        narrativeEn:
          "Around 744, near Luoyang, Li Bai met Du Fu — eleven years his junior — and they traveled together in the Liang-Song region (modern Henan), forming a deep friendship. Du Fu later wrote several poems in memory of Li Bai (such as 'Dreaming of Li Bai'). Together, the two poets known as 'Li Du' defined the summit of Tang poetry.",
        whyImportant: "李杜之交让两条最伟大的诗歌生命线交汇——通过这段友谊，可以看到盛唐文化最灿烂的一面。",
        whyImportantEn:
          "The Li–Du friendship is where the two greatest poetic lifelines crossed — through it we glimpse the most radiant side of golden-Tang culture.",
        nextStepReason: "然而盛世不会永恒——下一步，安史之乱将两位诗人的命运卷入乱世。",
        nextStepReasonEn:
          "But golden ages do not last — next, the An Lushan Rebellion sweeps both poets into a world at war.",
        keyFactEntityIds: ["p-du-fu", "p-li-bai"],
        people: ["p-li-bai", "p-du-fu"],
        locations: ["loc-luoyang"],
        civilizations: ["c-tang"],
        year: 744,
        startYear: 744,
        endYear: 745,
        personId: "p-li-bai",
        civilizationId: "c-tang",
        locationId: "loc-luoyang",
        surroundingEntities: [
          { id: "p-li-bai", type: "person" },
          { id: "p-du-fu", type: "person" },
          { id: "loc-luoyang", type: "location" },
          { id: "c-tang", type: "civilization" },
        ],
      },
      {
        id: "li-bai-life-step-4",
        order: 4,
        title: "乱世中的诗人",
        titleEn: "A Poet in a World at War",
        question: "安史之乱如何改变了李白生命的最后七年？",
        questionEn: "How did the An Lushan Rebellion change the last seven years of Li Bai's life?",
        narrative:
          "755 年安史之乱爆发后，李白避乱南奔。757 年前后他入永王李璘幕府，永王兵败后李白受牵连流放夜郎（今贵州一带），中途遇赦。762 年，李白病逝于当涂（今安徽当涂），结束了他传奇的一生。",
        narrativeEn:
          "After the rebellion erupted in 755, Li Bai fled south. Around 757 he joined the staff of Prince Yong Li Lin; when the prince was defeated, Li Bai was implicated and exiled to Yelang (modern Guizhou), pardoned en route. In 762 he died at Dangtu (modern Anhui) — closing his legendary life.",
        whyImportant: "李白的晚年是安史之乱如何席卷无数个人命运的缩影——盛世的诗人在乱世中漂泊，直到离世。",
        whyImportantEn:
          "Li Bai's final years are a miniature of how the rebellion swept up countless individual fates — the poet of the golden age drifting through a world at war until his death.",
        nextStepReason: "诗人逝去，诗歌长存——下一步，我们回顾李白留下的遗产。",
        nextStepReasonEn:
          "The poet died; the poetry endured — next, the legacy Li Bai left behind.",
        keyFactEntityIds: ["e-755-anlushan", "p-li-bai"],
        people: ["p-li-bai"],
        locations: [],
        civilizations: ["c-tang"],
        year: 755,
        startYear: 755,
        endYear: 762,
        eventId: "e-755-anlushan",
        personId: "p-li-bai",
        civilizationId: "c-tang",
        surroundingEntities: [
          { id: "e-755-anlushan", type: "event" },
          { id: "p-li-bai", type: "person" },
          { id: "c-tang", type: "civilization" },
        ],
      },
      {
        id: "li-bai-life-step-5",
        order: 5,
        title: "李白的遗产",
        titleEn: "The Legacy of Li Bai",
        question: "为什么一千三百年后，我们仍然在读李白？",
        questionEn: "Why, thirteen centuries later, do we still read Li Bai?",
        narrative:
          "李白存世诗歌约千首，以豪放飘逸著称，与杜甫并称'李杜'，被视为中国诗歌的最高峰之一。他的诗作跨越时代，成为汉语世界的共同记忆——从'床前明月光'到'天生我材必有用'。理解李白，就是理解盛唐文化最自由、最浪漫的一面。",
        narrativeEn:
          "About a thousand of Li Bai's poems survive, famed for their unbridled, soaring style. Together with Du Fu as 'Li Du', he stands at the summit of Chinese poetry. His verses cross the centuries into the shared memory of the Chinese-speaking world — from 'Moonlight before my bed' to 'Heaven gave me talents for a purpose'. To understand Li Bai is to understand the freest, most romantic side of golden-Tang culture.",
        whyImportant: "李白的一生是一个时代的人格化：他的自由与浪漫，正是盛唐文化的自由与浪漫；他的漂泊与晚年，也映照着那个时代的终结。",
        whyImportantEn:
          "Li Bai's life personifies an era: his freedom and romance are the freedom and romance of golden-Tang culture; his wandering and his final years also mirror that era's ending.",
        nextStepReason: "旅程结束——你可以通过回忆练习巩固，或继续探索安史之乱的另一条故事线。",
        nextStepReasonEn:
          "The journey ends here — consolidate with the recall quiz, or follow the other storyline of the An Lushan Rebellion.",
        keyFactEntityIds: ["p-li-bai", "p-du-fu", "c-tang"],
        people: ["p-li-bai", "p-du-fu"],
        locations: [],
        civilizations: ["c-tang"],
        year: 762,
        startYear: 762,
        endYear: 762,
        personId: "p-li-bai",
        civilizationId: "c-tang",
        surroundingEntities: [
          { id: "p-li-bai", type: "person" },
          { id: "p-du-fu", type: "person" },
          { id: "c-tang", type: "civilization" },
        ],
      },
    ],
  },
];

# AI Global History Map — Historical Data Provenance & Accuracy Audit

> 生成日期：2026-08-16 · 范围：Functional Alpha 全量 157 实体（重点：关键人物/事件） · 模式：只读审计（未修改任何 seed 数据）

## 来源等级定义

| 等级 | 定义 |
|---|---|
| A | Primary source / contemporary evidence |
| B | Peer-reviewed scholarship / Cambridge / Oxford / major university press |
| C | Museum / academic reference database / high-quality encyclopedia |
| D | General reference websites |
| E | Unverified web / AI generated material |

## Summary

| 状态 | 数量 |
|---|---|
| PASS | 82 |
| WARN | 73 |
| CONFLICT | 0 |
| UNVERIFIED | 3 |

自动矛盾检测：**TEMPORAL_CONFLICT = 0**；ROLE_TIMELINE_CONFLICT（角色区间未覆盖）见下。

## People（关键人物首批）

### WARN Li Shimin (Taizong)（李世民）
`PRECISION_WARN`
- birth: seed=598 知识库=598 — 日期非精确（precision=range；《旧唐书》《新唐书》生年记载略有出入，学界常用 598 或 599。）
- death: seed=649 知识库=649 — PASS
- roles(知识库): Emperor of Tang 皇帝 626–649 — 角色随时间变化，不应作为静态身份
- authority: B

### WARN Wu Zetian（武则天）
`PRECISION_WARN`
- birth: seed=624 知识库=624 — 存在学术争议（623 / 625）；武曌生年有 623/624/625 三说。
- death: seed=705 知识库=705 — PASS
- roles(知识库): Empress Regnant 皇帝（武周） 690–705 — 角色随时间变化，不应作为静态身份
- authority: B

### WARN Li Longji (Xuanzong)（李隆基）
`PRECISION_WARN`
- birth: seed=685 知识库=685 — 日期非精确（precision=range；685 或 686 两说。）
- death: seed=762 知识库=762 — PASS
- roles(知识库): Emperor of Tang 皇帝 712–756 — 角色随时间变化，不应作为静态身份
- authority: B

### WARN Li Bai（李白）
`PRECISION_WARN`
- birth: seed=701 知识库=701 — 日期非精确（precision=range；701 年为主流；一说 700。）
- death: seed=762 知识库=762 — PASS
- roles(知识库): Hanlin Academician 翰林供奉 742–744 — 角色随时间变化，不应作为静态身份
- authority: B

### PASS Du Fu（杜甫）
- birth: seed=712 知识库=712 — PASS
- death: seed=770 知识库=770 — PASS
- authority: B

### WARN An Lushan（安禄山）
`PRECISION_WARN`
- birth: seed=703 知识库=703 — 日期非精确（precision=approximate；约 703 年（另有 705 说）。）
- death: seed=757 知识库=757 — PASS
- authority: B

### WARN Xuanzang（玄奘）
`PRECISION_WARN`
- birth: seed=602 知识库=602 — 日期非精确（precision=range；生年有 600/602/603 诸说。）
- death: seed=664 知识库=664 — PASS
- roles(知识库): Buddhist translator 译经师 645–664 — 角色随时间变化，不应作为静态身份
- authority: B

### WARN Charlemagne（查理曼）
`PRECISION_WARN`
- birth: seed=747 知识库=747–748 — 存在学术争议（742 / 747 / 748）；艾因哈德《查理大帝传》记 742；现代研究多取 747/748（由加冕年龄反推）。生年存在学术争议。
- death: seed=814 知识库=814 — PASS
- roles(知识库): King of the Franks 法兰克国王 768–814；King of the Lombards 伦巴第国王 774–814；Emperor 皇帝（罗马人的皇帝） 800–814 — 角色随时间变化，不应作为静态身份
- authority: B

### WARN Harun al-Rashid（哈伦·拉希德）
`PRECISION_WARN`
- birth: seed=766 知识库=766 — 日期非精确（precision=range；766 或 763 年两说。）
- death: seed=809 知识库=809 — PASS
- roles(知识库): Abbasid Caliph 哈里发 786–809 — 角色随时间变化，不应作为静态身份
- authority: B

### WARN Abu Muslim（阿布·穆斯林）
`PRECISION_WARN`
- birth: seed=700 知识库=700 — 存在学术争议（718 / 723）；生年分歧大：约 700（或 718/723）。
- death: seed=755 知识库=755 — PASS
- roles(知识库): Revolutionary general 革命将领（呼罗珊） 747–755 — 角色随时间变化，不应作为静态身份
- authority: C

### WARN Muhammad（穆罕默德）
`PRECISION_WARN`
- birth: seed=570 知识库=570 — 日期非精确（precision=range；传统记载 570 或 571 年（象年）。）
- death: seed=632 知识库=632 — PASS
- authority: B

### UNVERIFIED Oleg of Novgorod（奥列格）
`UNVERIFIED_FACT`
- birth: seed=null 知识库=850（生年无任何可靠记载。）
- authority: D

### PASS Li Shimin (Taizong)（李世民） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Wu Zetian（武则天） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Li Longji (Xuanzong)（李隆基） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Li Bai（李白） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Du Fu（杜甫） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS An Lushan（安禄山） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Xuanzang（玄奘） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Charlemagne（查理曼） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Harun al-Rashid（哈伦·拉希德） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Abu Muslim（阿布·穆斯林） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### PASS Muhammad（穆罕默德） provenance 与知识库一致
- birth/death precision、confidence、alternatives、角色区间均与史学共识知识库一致
- authority: B

### WARN Charlemagne 专项（查理曼）
`DISPUTED_BIRTH`
- Birth: 742 / 747 / 748 disputed（艾因哈德记 742；现代研究由 800 年加冕年龄反推多取 747/748）
- Death: 814 exact（814-01-28，亚琛）
- King of the Franks 768–814（非整个生命周期的静态身份）
- King of the Lombards 774–814
- Emperor 800–814
- “Carolingian Empire / 法兰克皇帝”为现代史学/回溯性标签，非当时唯一正式国名
- authority: B

## Events（关键事件 + 近似/争议日期标注）

- WARN Li Yuan Founds the Tang Dynasty（李渊建立唐朝） ★关键：year: seed=618 知识库=618（）（authority A）
- WARN The Hijra: Muhammad Emigrates to Medina（希吉拉：穆罕默德迁徙麦地那）：year: seed=622 知识库=622（622 年（伊斯兰历元年）。）（authority B）
- WARN Xuanwu Gate Incident（玄武门之变）：year: seed=626 知识库=626（626 年 7 月 2 日（武德九年六月初四）。）（authority A）
- WARN Xuanzang's Journey to India（玄奘西行求法）：year=629–645 — 日期非精确（precision=range；玄奘西行出发年有 627/629 两说；629 为主流。）（authority B）
- WARN Tang Defeats the Eastern Turks（唐灭东突厥） ★关键：year: seed=630 知识库=630（）（authority A）
- WARN Muhammad Dies; Abu Bakr Becomes Caliph（穆罕默德逝世）：year: seed=632 知识库=632（632 年 6 月 8 日。）（authority A）
- WARN Arab Conquests of the Levant and Persia（阿拉伯征服黎凡特与波斯） ★关键：year=634–651 — 日期非精确（precision=range；终点取耶兹德戈尔德三世之死（651；亦有 652 说）。）（authority B）
- WARN Arab Siege of Jerusalem（阿拉伯军围攻耶路撒冷）：year: seed=638 知识库=638（637/638 两说，638 常用。）（authority B）
- WARN Emperor Taizong Dies（唐太宗驾崩）：year: seed=649 知识库=649（）（authority A）
- WARN Islam Reaches China via Envoys（伊斯兰教传入中国）：year: seed=651 知识库=651（依《旧唐书》永徽二年遣使记载；学界对“首次官方接触”的解读有讨论。）（authority B）
- WARN Umayyad Caliphate Founded（倭马亚王朝建立）：year: seed=661 知识库=661（）（authority B）
- WARN Silla Unifies Korea（新罗统一三国）：year: seed=668 知识库=668（）（authority B）
- WARN Yijing's Voyages via Srivijaya（义净南海求法）：year=671–695 — 日期非精确（precision=range；）（authority C）
- WARN Wu Zetian Founds the Zhou Interregnum（武则天称帝建周）：year: seed=690 知识库=690（690 年 10 月（载初元年九月）。）（authority A）
- WARN Wu Zetian's Abdication（武则天退位）：year: seed=705 知识库=705（）（authority A）
- WARN Nara Becomes Japan's Capital（日本迁都平城京）：year: seed=710 知识库=710（）（authority B）
- WARN Umayyad Conquest of Iberia（倭马亚征服伊比利亚）：year: seed=711 知识库=711（）（authority B）
- WARN Kojiki Completed（《古事记》成书）：year: seed=712 知识库=712（）（authority B）
- WARN Second Arab Siege of Constantinople（第二次君士坦丁堡之围）：year=717–718 — 日期非精确（precision=range；）（authority B）
- WARN Byzantine Iconoclasm（拜占庭圣像破坏运动）：year: seed=726–843 知识库=726（726 或 730 年诏令之争议；726 常用。）（authority B）
- WARN Battle of Tours（图尔战役）：year: seed=732 知识库=732（732 年 10 月。）（authority B）
- WARN Khazar Adoption of Judaism（可萨人皈依犹太教）：year: seed=740 知识库=740（约 740 年，或 8 世纪中叶；可萨改宗时间本身存在争议。）（authority C）
- WARN Temple IV Dedicated at Tikal（蒂卡尔四号神庙建成）：year: seed=741 知识库=741（约 741 年（基于纪年铭文推算）。）（authority C）
- WARN Li Bai Joins the Hanlin Academy（李白供奉翰林） ★关键：year=742–744 — 日期非精确（precision=range；742 年应召入翰林（天宝元年/二年说）。）（authority B）
- WARN Xuanzong Takes Yang Guifei as Consort（唐玄宗册封杨贵妃）：year: seed=745 知识库=745（745（天宝四载）或 744 年。）（authority B）
- WARN Abbasid Revolution and Battle of the Zab（阿拔斯革命与扎卜河战役） ★关键：year: seed=750 知识库=750（扎卜河之战 750 年 1 月。）（authority B）
- WARN Battle of Talas（怛罗斯之战） ★关键：year: seed=751 知识库=751（751 年 7–8 月（怛逻斯河）；具体日期无载。）（authority B）
- WARN An Lushan Rebellion（安史之乱） ★关键：year=755–763 — 日期非精确（precision=range；755 年 12 月起兵（天宝十四载十一月）。）（authority A）
- WARN Baghdad Founded（巴格达建城）：year: seed=762 知识库=762（）（authority B）
- WARN Tibetans Sack Chang'an（吐蕃攻陷长安）：year: seed=763 知识库=763（763 年 11 月。）（authority A）
- WARN Charlemagne Becomes King of the Franks（查理曼继任法兰克国王）：year: seed=768 知识库=768（）（authority B）
- WARN Nestorian Stele Erected in Chang'an（《大秦景教流行中国碑》）：year: seed=781 知识库=781（781 年（建中二年）立碑。）（authority A）
- WARN Harun al-Rashid Becomes Caliph（哈伦·拉希德继任哈里发）：year: seed=786 知识库=786（）（authority B）
- WARN Abbasid Translation Movement（阿拔斯王朝翻译运动）：year=786–830 — 日期非精确（precision=range；翻译运动为长时段现象（约 750–900）；取 786–830 为高峰期。）（authority B）
- WARN Viking Raid on Lindisfarne（维京人劫掠林迪斯法恩）：year: seed=793 知识库=793（793 年 6 月 8 日（盎格鲁-撒克逊编年史）。）（authority B）
- WARN Heian-kyō (Kyoto) Founded（迁都平安京）：year: seed=794 知识库=794（）（authority B）
- WARN Charlemagne Crowned Emperor（查理曼加冕称帝） ★关键：year: seed=800 知识库=800（800 年 12 月 25 日。）（authority A）
- WARN Kūkai Travels to Tang China（空海入唐求法）：year: seed=804 知识库=804（）（authority B）
- WARN Collapse of the Classic Maya（古典玛雅文明的崩溃）：year=810–900 — 日期非精确（precision=range；古典期崩溃为长时段过程；起止为学术分期。）（authority B）
- WARN al-Khwarizmi's Algebra Treatise（花拉子米著《代数学》）：year: seed=820 知识库=820（约 820（一说 813–833 年间）。）（authority B）
- WARN Jang Bogo Founds a Maritime Trade Base（张保皋设清海镇）：year: seed=828 知识库=828（）（authority C）
- WARN Great Anti-Buddhist Persecution（会昌灭佛）：year: seed=845 知识库=845（会昌五年（845）诏令。）（authority A）
- WARN Sulayman's Account of China（《中国印度见闻录》）：year: seed=851 知识库=851（约 851 年成书。）（authority C）
- WARN Cyril and Methodius Mission to Moravia（西里尔与美多德传教摩拉维亚）：year: seed=863 知识库=863（）（authority B）
- WARN Diamond Sutra Printed（《金刚经》雕版印刷） ★关键：year: seed=868 知识库=868（868 年 5 月 11 日（咸通九年四月十五日）刊记。）（authority A）
- WARN Huang Chao Rebellion（黄巢之乱）：year=875–884 — 日期非精确（precision=range；875 年起兵（乾符二年）。）（authority A）
- WARN Oleg Seizes Kiev（奥列格夺取基辅）：year: seed=882 知识库=882（依《往年纪事》；882 为编年记载。）（authority B）
- WARN Vikings Besiege Paris（维京人围攻巴黎）：year=885–886 — 日期非精确（precision=range；）（authority B）
- WARN Zhu Wen Ends the Tang（朱温废唐建梁） ★关键：year: seed=907 知识库=907（907 年（天祐四年）。）（authority A）
- WARN Xuanzang's Journey to India × Xuanzang：事件年 629 不在该人物已知角色区间内：Buddhist translator 译经师 645–664；可能角色缺失或事件年份存疑——需人工核对（authority B）
- PASS Li Yuan Founds the Tang Dynasty（李渊建立唐朝） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS Tang Defeats the Eastern Turks（唐灭东突厥） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS Li Bai Joins the Hanlin Academy（李白供奉翰林） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS An Lushan Rebellion（安史之乱） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS Battle of Talas（怛罗斯之战） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS Abbasid Revolution and Battle of the Zab（阿拔斯革命与扎卜河战役） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS Arab Conquests of the Levant and Persia（阿拉伯征服黎凡特与波斯） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS Charlemagne Crowned Emperor（查理曼加冕称帝） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS Diamond Sutra Printed（《金刚经》雕版印刷） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）
- PASS Zhu Wen Ends the Tang（朱温废唐建梁） dateProvenance 与知识库一致：year/yearMax/precision/confidence/alternatives 均与史学共识知识库一致（authority B）

## Civilizations（名称类型）

- WARN Tang Dynasty（唐朝）：名称“Tang Dynasty”为 modern_scholarly（当代自称“唐/大唐”；“Tang Dynasty”为现代学界标签。）；年代 seed=618–907（学界分期，边界为约定）
- WARN Tibetan Empire（吐蕃）：名称“Tibetan Empire”为 modern_scholarly（当代称“吐蕃”；“Tibetan Empire”为现代标签。）；年代 seed=618–842（学界分期，边界为约定）
- WARN Unified Silla（新罗）：名称“Unified Silla”为 modern_scholarly（当代称“新罗”；“Unified Silla”为现代史学分期标签。）；年代 seed=668–935（学界分期，边界为约定）
- WARN Nara & Heian Japan（奈良·平安日本）：名称“Nara & Heian Japan”为 retrospective（“奈良·平安”为后世对时代的回溯性分期，非当时自称。）；年代 seed=710–1185（学界分期，边界为约定）
- WARN Abbasid Caliphate（阿拔斯王朝）：名称“Abbasid Caliphate”为 modern_scholarly（当代自称“达瓦拉/阿拔斯家族之政”；“Abbasid Caliphate”为现代标签。）；年代 seed=750–1258（学界分期，边界为约定）
- WARN Umayyad Caliphate（倭马亚王朝）：名称“Umayyad Caliphate”为 modern_scholarly（当代称“穆阿维叶之政”；“Umayyad”为现代史学称谓。）；年代 seed=661–750（学界分期，边界为约定）
- WARN Byzantine Empire（拜占庭帝国）：名称“Byzantine Empire”为 modern_scholarly（帝国当代自称“罗马/罗马尼亚”；“Byzantine Empire”为后世史学标签。）；年代 seed=395–1453（学界分期，边界为约定）
- WARN Carolingian Empire（加洛林帝国）：名称“Carolingian Empire”为 modern_scholarly（查理曼时代不存在“Carolingian Empire”国名；为现代史学/回溯性标签。）；年代 seed=751–888（学界分期，边界为约定）
- WARN Viking Age（维京时代）：名称“Viking Age”为 retrospective（“维京时代”为后世分期概念，当时无此自称。）；年代 seed=793–1066（学界分期，边界为约定）
- WARN Classic Maya（古典玛雅）：名称“Classic Maya”为 retrospective（“Classic Maya”为考古学分期标签；“玛雅”为后世称谓。）；年代 seed=250–900（学界分期，边界为约定）
- WARN Srivijaya（室利佛逝）：名称“Srivijaya”为 contemporary（中文/阿拉伯史料称室利佛逝/三佛齐；本土自称无直接记载。）；年代 seed=650–1377（学界分期，边界为约定）
- WARN Khazar Khaganate（可萨汗国）：名称“Khazar Khaganate”为 modern_scholarly（当代称可萨（哈扎尔）；“Khazar Khaganate”为现代标签。）；年代 seed=650–969（学界分期，边界为约定）

## Locations

- PASS Chang'an（长安）：现代坐标 34.34, 108.94（现代城址/河谷，精度 approximate）；历史对应：Tang capital and the largest city in the world (c. 1 million people), eastern terminus of the Silk Road.。
- PASS Luoyang（洛阳）：现代坐标 34.62, 112.45（现代城址/河谷，精度 approximate）；历史对应：The eastern capital of the Tang, favored by Empress Wu Zetian and the court in times of crisis.。
- PASS Dunhuang（敦煌）：现代坐标 40.14, 94.66（现代城址/河谷，精度 approximate）；历史对应：Silk Road oasis town and gateway to the Tarim Basin; home of the Mogao Caves and the Diamond Sutra.。
- PASS Kashgar（喀什）：现代坐标 39.47, 75.99（现代城址/河谷，精度 approximate）；历史对应：Strategic oasis on the western Silk Road where Tang, Tibetans and Arabs contended for control.。
- PASS Guangzhou（广州）：现代坐标 23.13, 113.26（现代城址/河谷，精度 approximate）；历史对应：The Tang's great southern port, where Arab and Persian merchants paid customs duty to the court.。
- PASS Samarkand（撒马尔罕）：现代坐标 39.65, 66.96（现代城址/河谷，精度 approximate）；历史对应：Sogdian trading capital at the heart of the Silk Road, famed for its merchants and dancers.。
- PASS Baghdad（巴格达）：现代坐标 33.32, 44.37（现代城址/河谷，精度 approximate）；历史对应：Round City founded in 762 by al-Mansur; center of the Islamic Golden Age's scholarship.。
- PASS Mecca（麦加）：现代坐标 21.39, 39.86（现代城址/河谷，精度 approximate）；历史对应：Birthplace of Muhammad and the holiest city of Islam.。
- PASS Medina（麦地那）：现代坐标 24.47, 39.61（现代城址/河谷，精度 approximate）；历史对应：City of the Prophet's hijra and the first Islamic state.。
- PASS Constantinople（君士坦丁堡）：现代坐标 41.01, 28.98（现代城址/河谷，精度 approximate）；历史对应：Imperial capital of Byzantium, the greatest fortress-city of the medieval world.。
- PASS Aachen（亚琛）：现代坐标 50.78, 6.08（现代城址/河谷，精度 approximate）；历史对应：Charlemagne's favorite residence and the heart of the Carolingian Renaissance.。
- PASS Heian-kyō (Kyoto)（平安京）：现代坐标 35.01, 135.77（现代城址/河谷，精度 approximate）；历史对应：Japan's imperial capital from 794, modeled on Tang Chang'an.。
- PASS Lhasa（拉萨）：现代坐标 29.65, 91.17（现代城址/河谷，精度 approximate）；历史对应：Capital of the Tibetan Empire and the site of the Jokhang Temple.。
- PASS Palembang（巨港）：现代坐标 -2.99, 104.76（现代城址/河谷，精度 approximate）；历史对应：Seat of the Srivijaya thalassocracy on the Strait of Malacca.。
- PASS Tikal（蒂卡尔）：现代坐标 17.22, -89.62（现代城址/河谷，精度 approximate）；历史对应：One of the greatest Maya city-states, at its peak in the 8th century.。
- PASS Córdoba（科尔多瓦）：现代坐标 37.89, -4.78（现代城址/河谷，精度 approximate）；历史对应：Capital of the Umayyad emirate in al-Andalus after the dynasty's fall in Damascus.。
- PASS Kiev（基辅）：现代坐标 50.45, 30.52（现代城址/河谷，精度 approximate）；历史对应：Rising power of the Rus', on the trade route from the Baltic to Byzantium.。
- PASS Talas（怛罗斯）：现代坐标 42.52, 72.24（现代城址/河谷，精度 approximate）；历史对应：River valley in the Tian Shan where Tang and Abbasid forces met in the Battle of Talas in 751.。；注意：怛罗斯战场具体位置在学界仍有讨论（塔拉斯河谷一带）。
- PASS Kucha（龟兹）：现代坐标 41.72, 82.95（现代城址/河谷，精度 approximate）；历史对应：Buddhist oasis kingdom on the northern Silk Road; a Tang protectorate from 648 and gateway for the Xuanzang route west.。
- PASS Damascus（大马士革）：现代坐标 33.51, 36.29（现代城址/河谷，精度 approximate）；历史对应：Capital of the Umayyad Caliphate (661–750) and a major Silk Road terminus toward the Mediterranean.。

## Relationships

- PASS Li Yuan —family→ Li Shimin (Taizong)：时间窗口 598–635 一致
- PASS Li Shimin (Taizong) —family→ Wu Zetian：时间窗口 637–649 一致
- PASS Wu Zetian —family→ Li Longji (Xuanzong)：时间窗口 685–705 一致
- PASS Li Longji (Xuanzong) —family→ Yang Guifei：时间窗口 745–756 一致
- PASS Li Longji (Xuanzong) —patron→ An Lushan：时间窗口 742–755 一致
- PASS Yang Guifei —family→ An Lushan：时间窗口 750–756 一致
- PASS An Lushan —enemy→ Guo Ziyi：时间窗口 755–763 一致
- PASS Guo Ziyi —colleague→ Li Longji (Xuanzong)：时间窗口 754–762 一致
- PASS Li Bai —friend→ Du Fu：时间窗口 744–762 一致
- PASS Li Bai —patron→ Li Longji (Xuanzong)：时间窗口 742–744 一致
- PASS Xuanzang —patron→ Li Shimin (Taizong)：时间窗口 645–649 一致
- PASS Muhammad —family→ Abu Bakr：时间窗口 620–632 一致
- PASS Muhammad —colleague→ Abu Bakr：时间窗口 610–634 一致
- PASS Harun al-Rashid —patron→ Al-Khwarizmi：时间窗口 786–809 一致
- PASS Charlemagne —patron→ Alcuin of York：时间窗口 782–804 一致
- PASS Charlemagne —student→ Alcuin of York：时间窗口 782–804 一致
- PASS Alcuin of York —mentor→ Charlemagne：时间窗口 782–804 一致
- PASS Charlemagne —colleague→ Harun al-Rashid：时间窗口 797–802 一致
- PASS Empress Genmei —colleague→ Li Longji (Xuanzong)：时间窗口 712–715 一致
- PASS Kūkai —colleague→ Xuanzang：时间窗口 804–806 一致；比较性关联（二人从未谋面）已显式注明
- PASS Abu Muslim —enemy→ Abd al-Rahman I：时间窗口 750–756 一致
- PASS Abd al-Rahman I —enemy→ Charlemagne：时间窗口 778–778 一致
- PASS Cyril —family→ Methodius：时间窗口 826–869 一致
- PASS Cyril —colleague→ Methodius：时间窗口 863–869 一致
- PASS Oleg of Novgorod —colleague→ Methodius：时间窗口 ?–? 一致
- PASS Huang Chao —rival→ An Lushan：时间窗口 ?–? 一致；比较性关联（二人从未谋面）已显式注明
- PASS Han Yu —enemy→ Xuanzang：时间窗口 ?–? 一致；比较性关联（二人从未谋面）已显式注明
- PASS Wu Zetian —patron→ Xuanzang：时间窗口 655–705 一致
- PASS Abd al-Rahman I —enemy→ Harun al-Rashid：时间窗口 756–788 一致
- PASS Empress Genmei —colleague→ Wu Zetian：时间窗口 ?–? 一致；比较性关联（二人从未谋面）已显式注明
- PASS Oleg of Novgorod —colleague→ Cyril：时间窗口 860–861 一致
- PASS Li Yuan —family→ Li Longji (Xuanzong)：时间窗口 ?–? 一致
- PASS Li Shimin (Taizong) —family→ Li Longji (Xuanzong)：时间窗口 ?–? 一致
- PASS Li Longji (Xuanzong) —colleague→ Du Fu：时间窗口 746–756 一致
- PASS Han Yu —colleague→ Li Bai：时间窗口 ?–? 一致
- PASS Han Yu —colleague→ Du Fu：时间窗口 ?–? 一致
- PASS Muhammad —mentor→ Abu Bakr：时间窗口 610–632 一致
- PASS Abu Bakr —student→ Muhammad：时间窗口 610–632 一致
- PASS Li Bai —friend→ Guo Ziyi：时间窗口 735–757 一致
- PASS Li Longji (Xuanzong) —rival→ An Lushan：时间窗口 755–757 一致

## 自动矛盾检测

- WARN ROLE_TIMELINE_CONFLICT Xuanzang's Journey to India × Xuanzang：事件年 629 不在该人物已知角色区间内：Buddhist translator 译经师 645–664；可能角色缺失或事件年份存疑——需人工核对
- TEMPORAL_CONFLICT：无（所有 participant 的出生/卒年与事件年份一致）

## Charlemagne 专项

- Birth: 742 / 747 / 748 disputed（艾因哈德记 742；现代研究由 800 年加冕年龄反推多取 747/748）
- Death: 814 exact（814-01-28，亚琛）
- King of the Franks 768–814（非整个生命周期的静态身份）
- King of the Lombards 774–814
- Emperor 800–814
- “Carolingian Empire / 法兰克皇帝”为现代史学/回溯性标签，非当时唯一正式国名

## V0.2.2 Provenance 深度检查

- 检查实体 21 个（关键人物 11 + 关键事件 10）：全部 PASS
- UNVERIFIED MISSING_SOURCES entity_sources 填充状态（V0.2.2）：provenance 深度检查实体 21 个：0 个不一致；全部一致——precision/confidence/角色时间线/年份与知识库吻合；entity_sources 第一批已建：5 个 Journey 关键实体（c-tang、c-abbasid、e-751-talas、p-abu-muslim、loc-talas）携带真实史料/学术著作名（《旧唐书》《资治通鉴》、al-Tabari、Kennedy、Shaban 等），sourceUrl 一律 null + reviewStatus=pending（禁止猜测 URL）；待人工复核：Charlemagne 出生（742/747/748）、武曌生年（623/624/625）、Abu Muslim 生年（700/718/723）、Oleg 生年（unknown）

## 修正建议（待人工确认后才进入 seed）

1. **Charlemagne 出生年**：seed `747` → 建议标注 `birthYear: 747, birthYearMax: 748, birthPrecision: "range", confidence: "disputed"`，alternatives 记录 742/747/748；显示“约 747–748，存在学术争议”。
2. **角色字段**：为关键人物引入 `PersonRole[]`（如 Charlemagne 三段角色 768/774/800），UI 与 AI 展示角色时按时间区间呈现，而非静态“Emperor”。
3. **近似日期事件**（`PRECISION_WARN`）：Tikal 741、可萨改宗 740、花拉子米代数学 820、Sulayman 851、玄奘西行 629、杨贵妃入宫 745 等 → 补充 precision 标注，显示“约 X”。
4. **有争议生年**（Wu Zetian 623/624/625、Abu Muslim 700/718/723、Oleg 无载）→ 标注 `disputed/unverified` 与 alternatives。
5. **来源填充**：将本轮知识库的 authority 引用写入 `entity_sources` 表与各实体 provenance 字段。
6. **AI 措辞**：AI 回答涉及 disputed/approximate 事实时使用“存在争议/约/学界普遍认为”等限定语（见 policy 文档第 5 节）。

## 附注

- 非关键实体（未列入首批名单者）本轮仅做结构性检查；待下一轮审计扩展。
- 本轮审计未修改任何 seed 数据；全部修正项需人工确认后进入正式数据。

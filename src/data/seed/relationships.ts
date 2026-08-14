import type { Relationship } from "../../lib/types";

/**
 * 40 historically grounded relationships among the seed's 25 people.
 * Every type (family, mentor, student, friend, rival, enemy, patron,
 * colleague) appears at least twice; edges marked as comparative links
 * connect figures who never met, and their descriptions say so.
 */
export const relationships: Relationship[] = [
  {
    id: "r-gaozu-taizong-family",
    sourcePersonId: "p-gaozu",
    targetPersonId: "p-taizong",
    type: "family",
    description:
      "Father and son: Li Shimin seized the throne in the Xuanwu Gate coup of 626 and retired his father.",
    startYear: 598,
    endYear: 635,
  },
  {
    id: "r-taizong-wu-zetian-family",
    sourcePersonId: "p-taizong",
    targetPersonId: "p-wu-zetian",
    type: "family",
    description:
      "Wu Zetian entered the palace as a young concubine of Taizong from c. 637.",
    startYear: 637,
    endYear: 649,
  },
  {
    id: "r-wu-zetian-xuanzong-family",
    sourcePersonId: "p-wu-zetian",
    targetPersonId: "p-xuanzong",
    type: "family",
    description:
      "Xuanzong was Wu Zetian's grandson; her Zhou interregnum (690–705) interrupted the Tang line.",
    startYear: 685,
    endYear: 705,
  },
  {
    id: "r-xuanzong-yang-guifei-family",
    sourcePersonId: "p-xuanzong",
    targetPersonId: "p-yang-guifei",
    type: "family",
    description:
      "Xuanzong took Yang Guifei as his consort in 745 and heaped favor on her family.",
    startYear: 745,
    endYear: 756,
  },
  {
    id: "r-xuanzong-an-lushan-patron",
    sourcePersonId: "p-xuanzong",
    targetPersonId: "p-an-lushan",
    type: "patron",
    description:
      "An Lushan rose through imperial favor to command the northeast frontier armies by the 740s.",
    startYear: 742,
    endYear: 755,
  },
  {
    id: "r-yang-guifei-an-lushan-family",
    sourcePersonId: "p-yang-guifei",
    targetPersonId: "p-an-lushan",
    type: "family",
    description:
      "An Lushan was adopted as Yang Guifei's son around 750, deepening his influence at court.",
    startYear: 750,
    endYear: 756,
  },
  {
    id: "r-an-lushan-guo-ziyi-enemy",
    sourcePersonId: "p-an-lushan",
    targetPersonId: "p-guo-ziyi",
    type: "enemy",
    description:
      "Guo Ziyi commanded the Tang armies that crushed the An Lushan rebellion (755–763).",
    startYear: 755,
    endYear: 763,
  },
  {
    id: "r-guo-ziyi-xuanzong-colleague",
    sourcePersonId: "p-guo-ziyi",
    targetPersonId: "p-xuanzong",
    type: "colleague",
    description:
      "Guo Ziyi served the Tang court across reigns, holding frontier command under Xuanzong before the rebellion.",
    startYear: 754,
    endYear: 762,
  },
  {
    id: "r-li-bai-du-fu-friend",
    sourcePersonId: "p-li-bai",
    targetPersonId: "p-du-fu",
    type: "friend",
    description:
      "The two greatest Tang poets met in Luoyang in 744 and exchanged verses for the rest of their lives.",
    startYear: 744,
    endYear: 762,
  },
  {
    id: "r-li-bai-xuanzong-patron",
    sourcePersonId: "p-li-bai",
    targetPersonId: "p-xuanzong",
    type: "patron",
    description:
      "Li Bai was summoned to Chang'an in 742 and served as a court poet until 744.",
    startYear: 742,
    endYear: 744,
  },
  {
    id: "r-xuanzang-taizong-patron",
    sourcePersonId: "p-xuanzang",
    targetPersonId: "p-taizong",
    type: "patron",
    description:
      "On his return from India in 645, Xuanzang received Taizong's support for his great translation project.",
    startYear: 645,
    endYear: 649,
  },
  {
    id: "r-muhammad-abu-bakr-family",
    sourcePersonId: "p-muhammad",
    targetPersonId: "p-abu-bakr",
    type: "family",
    description:
      "Abu Bakr was Muhammad's father-in-law; his daughter Aisha married the Prophet.",
    startYear: 620,
    endYear: 632,
  },
  {
    id: "r-muhammad-abu-bakr-colleague",
    sourcePersonId: "p-muhammad",
    targetPersonId: "p-abu-bakr",
    type: "colleague",
    description:
      "The Prophet's closest companion, Abu Bakr became the first caliph in 632.",
    startYear: 610,
    endYear: 634,
  },
  {
    id: "r-harun-al-rashid-al-khwarizmi-patron",
    sourcePersonId: "p-harun-al-rashid",
    targetPersonId: "p-al-khwarizmi",
    type: "patron",
    description:
      "Harun's court and Baghdad's House of Wisdom patronized scholars such as al-Khwarizmi.",
    startYear: 786,
    endYear: 809,
  },
  {
    id: "r-charlemagne-alcuin-patron",
    sourcePersonId: "p-charlemagne",
    targetPersonId: "p-alcuin",
    type: "patron",
    description:
      "Charlemagne brought Alcuin to Aachen in 782 to lead the palace school.",
    startYear: 782,
    endYear: 804,
  },
  {
    id: "r-charlemagne-alcuin-student",
    sourcePersonId: "p-charlemagne",
    targetPersonId: "p-alcuin",
    type: "student",
    description:
      "Alcuin tutored Charlemagne and the royal court in grammar, rhetoric and theology.",
    startYear: 782,
    endYear: 804,
  },
  {
    id: "r-alcuin-charlemagne-mentor",
    sourcePersonId: "p-alcuin",
    targetPersonId: "p-charlemagne",
    type: "mentor",
    description:
      "Alcuin was Charlemagne's theological adviser and the architect of the Carolingian educational reforms.",
    startYear: 782,
    endYear: 804,
  },
  {
    id: "r-charlemagne-harun-al-rashid-colleague",
    sourcePersonId: "p-charlemagne",
    targetPersonId: "p-harun-al-rashid",
    type: "colleague",
    description:
      "Embassies and gifts passed between Aachen and Baghdad, including the elephant Abul-Abbas sent c. 802.",
    startYear: 797,
    endYear: 802,
  },
  {
    id: "r-genmei-xuanzong-colleague",
    sourcePersonId: "p-genmei",
    targetPersonId: "p-xuanzong",
    type: "colleague",
    description:
      "Contemporary imperial rulers in the age of the Tang–Japan missions; Genmei's reign (707–715) overlapped Xuanzong's accession in 712.",
    startYear: 712,
    endYear: 715,
  },
  {
    id: "r-kukai-xuanzang-colleague",
    sourcePersonId: "p-kukai",
    targetPersonId: "p-xuanzang",
    type: "colleague",
    description:
      "Kūkai studied in Tang China (804–806), drawing on the Buddhist canon Xuanzang's translation school had established — a legacy link; the two never met.",
    startYear: 804,
    endYear: 806,
  },
  {
    id: "r-abu-muslim-abd-al-rahman-enemy",
    sourcePersonId: "p-abu-muslim",
    targetPersonId: "p-abd-al-rahman-i",
    type: "enemy",
    description:
      "Abu Muslim's agents hunted the surviving Umayyad prince after 750, driving Abd al-Rahman to flee west to Spain.",
    startYear: 750,
    endYear: 756,
  },
  {
    id: "r-abd-al-rahman-charlemagne-enemy",
    sourcePersonId: "p-abd-al-rahman-i",
    targetPersonId: "p-charlemagne",
    type: "enemy",
    description:
      "Charlemagne's 778 campaign across the Pyrenees against the emirate ended in the rearguard disaster at Roncevaux.",
    startYear: 778,
    endYear: 778,
  },
  {
    id: "r-cyril-methodius-family",
    sourcePersonId: "p-cyril",
    targetPersonId: "p-methodius",
    type: "family",
    description:
      "The brothers from Thessalonica — Cyril, born Constantine, and Methodius — were siblings.",
    startYear: 826,
    endYear: 869,
  },
  {
    id: "r-cyril-methodius-colleague",
    sourcePersonId: "p-cyril",
    targetPersonId: "p-methodius",
    type: "colleague",
    description:
      "Co-missionaries to the Slavs from 863, they devised the Glagolitic alphabet and translated the liturgy into Slavonic.",
    startYear: 863,
    endYear: 869,
  },
  {
    id: "r-oleg-methodius-colleague",
    sourcePersonId: "p-oleg",
    targetPersonId: "p-methodius",
    type: "colleague",
    description:
      "Contemporary forces shaping the Slavic world — Oleg's Rus' realm at Kiev and Methodius' Moravian mission — though there is no record they met.",
    startYear: null,
    endYear: null,
  },
  {
    id: "r-huang-chao-an-lushan-rival",
    sourcePersonId: "p-huang-chao",
    targetPersonId: "p-an-lushan",
    type: "rival",
    description:
      "A comparative link between the two great Tang rebellions — Huang Chao's revolt (875–884) and An Lushan's (755–763); they never met.",
    startYear: null,
    endYear: null,
  },
  {
    id: "r-han-yu-xuanzang-enemy",
    sourcePersonId: "p-han-yu",
    targetPersonId: "p-xuanzang",
    type: "enemy",
    description:
      "Han Yu's anti-Buddhist memorial of 819 attacked the Buddhist legacy Xuanzang's translations exemplified — a comparative link; the two never met.",
    startYear: null,
    endYear: null,
  },
  {
    id: "r-wu-zetian-xuanzang-patron",
    sourcePersonId: "p-wu-zetian",
    targetPersonId: "p-xuanzang",
    type: "patron",
    description:
      "As empress consort and later sole ruler, Wu Zetian lavishly patronized Buddhism, continuing the imperial support Xuanzang's translations had enjoyed.",
    startYear: 655,
    endYear: 705,
  },
  {
    id: "r-abd-al-rahman-harun-enemy",
    sourcePersonId: "p-abd-al-rahman-i",
    targetPersonId: "p-harun-al-rashid",
    type: "enemy",
    description:
      "The Umayyad emirate of Córdoba defied Abbasid Baghdad, which never recognized its independence.",
    startYear: 756,
    endYear: 788,
  },
  {
    id: "r-genmei-wu-zetian-colleague",
    sourcePersonId: "p-genmei",
    targetPersonId: "p-wu-zetian",
    type: "colleague",
    description:
      "Near-contemporary female sovereigns — Genmei's reign (707–715) began just after Wu Zetian's death in 705; they never met.",
    startYear: null,
    endYear: null,
  },
  {
    id: "r-oleg-cyril-colleague",
    sourcePersonId: "p-oleg",
    targetPersonId: "p-cyril",
    type: "colleague",
    description:
      "Cyril's Khazar mission c. 860 crossed the Volga trade routes the Rus' were opening — the world Oleg later ruled from Kiev.",
    startYear: 860,
    endYear: 861,
  },
  {
    id: "r-gaozu-xuanzong-family",
    sourcePersonId: "p-gaozu",
    targetPersonId: "p-xuanzong",
    type: "family",
    description:
      "Xuanzong was a great-great-grandson of the founding emperor through Taizong, Gaozong and Ruizong.",
    startYear: null,
    endYear: null,
  },
  {
    id: "r-taizong-xuanzong-family",
    sourcePersonId: "p-taizong",
    targetPersonId: "p-xuanzong",
    type: "family",
    description:
      "Great-grandfather and great-grandson: Taizong's line passed through Gaozong and Ruizong to Xuanzong.",
    startYear: null,
    endYear: null,
  },
  {
    id: "r-xuanzong-du-fu-colleague",
    sourcePersonId: "p-xuanzong",
    targetPersonId: "p-du-fu",
    type: "colleague",
    description:
      "Du Fu sought office in Chang'an under Xuanzong, witnessing the court's decline into the 750s.",
    startYear: 746,
    endYear: 756,
  },
  {
    id: "r-han-yu-li-bai-colleague",
    sourcePersonId: "p-han-yu",
    targetPersonId: "p-li-bai",
    type: "colleague",
    description:
      "Han Yu championed the plain classical style of Li Bai's generation — a literary lineage link; Han Yu was born after Li Bai died.",
    startYear: null,
    endYear: null,
  },
  {
    id: "r-han-yu-du-fu-colleague",
    sourcePersonId: "p-han-yu",
    targetPersonId: "p-du-fu",
    type: "colleague",
    description:
      "Han Yu's classical prose revival drew on Du Fu's generation — a literary lineage link; Han Yu was born two years before Du Fu died.",
    startYear: null,
    endYear: null,
  },
  {
    id: "r-muhammad-abu-bakr-mentor",
    sourcePersonId: "p-muhammad",
    targetPersonId: "p-abu-bakr",
    type: "mentor",
    description:
      "The Prophet was Abu Bakr's teacher and spiritual guide from the earliest Meccan revelations.",
    startYear: 610,
    endYear: 632,
  },
  {
    id: "r-abu-bakr-muhammad-student",
    sourcePersonId: "p-abu-bakr",
    targetPersonId: "p-muhammad",
    type: "student",
    description:
      "The first adult male convert to Islam, Abu Bakr was the Prophet's devoted disciple through the Meccan persecution and the Hijra.",
    startYear: 610,
    endYear: 632,
  },
  {
    id: "r-li-bai-guo-ziyi-friend",
    sourcePersonId: "p-li-bai",
    targetPersonId: "p-guo-ziyi",
    type: "friend",
    description:
      "According to the Tang histories, Li Bai once saved the young Guo Ziyi from execution, and Guo later pleaded for Li Bai's pardon after the Yong Wang rebellion of 757.",
    startYear: 735,
    endYear: 757,
  },
  {
    id: "r-xuanzong-an-lushan-rival",
    sourcePersonId: "p-xuanzong",
    targetPersonId: "p-an-lushan",
    type: "rival",
    description:
      "An Lushan, once Xuanzong's favorite, proclaimed himself emperor of the Great Yan in 756 — a rival claimant to the Tang throne.",
    startYear: 755,
    endYear: 757,
  },
];

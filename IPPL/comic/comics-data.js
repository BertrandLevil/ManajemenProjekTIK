/* ==========================================================================
   COMICS DATA MODEL & METADATA
   Includes all comics from Trending and Latest Updates
   ========================================================================== */

const COMICS_DATA = {
  "world-after-fall": {
    id: "world-after-fall",
    title: "The World After the Fall",
    coverBase: "world-after-fall",
    author: "Sing Shong & S-Cynic",
    genreEyebrow: "FANTASY – ADVENTURE",
    genres: ["adventure", "action"],
    status: "ongoing",
    rating: 4.8,
    latestChapter: 32,
    chapterPrefix: "Episode",
    synopsis: "When mysterious Towers of Nightmares appeared across the world, humanity faced annihilation. Tower Walkers were granted a 'regression stone' to reset time if they died, but Jaehwan refused to regress and chose to battle past the 100th floor alone into the unknown.",
    episodes: [
      { number: 32, title: "Episode 32 – The World After the Fall", pages: 12, date: "Sep 24" },
      { number: 31, title: "Episode 31 – The World After the Fall", pages: 12, date: "Sep 24" },
      { number: 30, title: "Episode 30 – The World After the Fall", pages: 12, date: "Sep 24" },
      { number: 29, title: "Episode 29 – The World After the Fall", pages: 14, date: "Sep 17" }
    ]
  },
  "magic-emperor": {
    id: "magic-emperor",
    title: "Magic Emperor",
    coverBase: "magic-emperor",
    author: "Wuer Manhua",
    genreEyebrow: "ACTION – FANTASY",
    genres: ["action", "adventure"],
    status: "ongoing",
    rating: 4.9,
    latestChapter: 220,
    chapterPrefix: "Chapter",
    synopsis: "Zhuo Yifan was the Demonic Emperor who mastered the Nine Nether Secret Art. Betrayed and killed by his trusted disciple, he reincarnates into the body of an ordinary servant boy in the Luo Clan. Using ruthless cunning and demonic strength, he rises to protect the family and reclaim his throne.",
    episodes: [
      { number: 220, title: "Chapter 220 – Sovereign Blood Awakening", pages: 16, date: "Oct 10" },
      { number: 219, title: "Chapter 219 – The Grand Elder's Gambit", pages: 15, date: "Oct 03" },
      { number: 218, title: "Chapter 218 – Demonic Flame Unleashed", pages: 14, date: "Sep 26" },
      { number: 217, title: "Chapter 217 – Clash of the Seven Houses", pages: 15, date: "Sep 19" }
    ]
  },
  "ranker-second": {
    id: "ranker-second",
    title: "Ranker Second",
    coverBase: "ranker-second",
    author: "Nong Ma",
    genreEyebrow: "ACTION – FANTASY",
    genres: ["action", "adventure"],
    status: "ongoing",
    rating: 4.8,
    latestChapter: 97,
    chapterPrefix: "Chapter",
    synopsis: "Yeon-woo's twin brother disappeared five years ago. When a pocket watch arrives containing his brother's recorded diary, Yeon-woo discovers the Obelisk, the Tower of the Sun God. Armed with his brother's secrets and tactical training, Yeon-woo enters the tower to exact vengeance on those who betrayed his kin.",
    episodes: [
      { number: 97, title: "Chapter 97 – Trials of the Iron Throne", pages: 18, date: "Oct 08" },
      { number: 96, title: "Chapter 96 – Dragon's Sacred Eye", pages: 16, date: "Oct 01" },
      { number: 95, title: "Chapter 95 – Shadows in the Labyrinth", pages: 14, date: "Sep 24" },
      { number: 94, title: "Chapter 94 – The Red Dragon Clan", pages: 15, date: "Sep 17" }
    ]
  },
  "martial-reigns": {
    id: "martial-reigns",
    title: "Martial Reigns",
    coverBase: "martial-reigns",
    author: "Bohe Manhua",
    genreEyebrow: "ACTION – DRAMA",
    genres: ["action", "drama"],
    status: "ongoing",
    rating: 4.7,
    latestChapter: 317,
    chapterPrefix: "Chapter",
    synopsis: "Ye Chen, once hailed as a martial prodigy, suffered betrayal from his clan and had his cultivation channels torn apart. Defying his cruel destiny, he merges with a primordial celestial sword spirit and rises anew to dominate the celestial empires.",
    episodes: [
      { number: 317, title: "Chapter 317 – Celestial Sword Inscription", pages: 15, date: "Oct 09" },
      { number: 316, title: "Chapter 316 – Gathering of the Sect Prodigies", pages: 14, date: "Oct 02" },
      { number: 315, title: "Chapter 315 – Primordial Qi Breakthrough", pages: 16, date: "Sep 25" },
      { number: 314, title: "Chapter 314 – Battle at Blood River", pages: 15, date: "Sep 18" }
    ]
  },
  "versatile-mage": {
    id: "versatile-mage",
    title: "Versatile Mage",
    coverBase: "versatile-mage",
    author: "Chaos",
    genreEyebrow: "ADVENTURE – MYSTERY",
    genres: ["adventure", "mystery"],
    status: "ongoing",
    rating: 4.8,
    latestChapter: 757,
    chapterPrefix: "Chapter",
    synopsis: "Mo Fan wakes up in a familiar city where magic has replaced science. While other students can only awaken one element after years of study, Mo Fan miraculously awakens the ultra-rare dual elements of Fire and Lightning, embarking on a quest to combat monstrous beasts threatening civilization.",
    episodes: [
      { number: 757, title: "Chapter 757 – Thunder Domain Overdrive", pages: 16, date: "Oct 10" },
      { number: 756, title: "Chapter 756 – The Ancient Pharaoh's Tomb", pages: 15, date: "Oct 03" },
      { number: 755, title: "Chapter 755 – Lightning Strike Mastery", pages: 14, date: "Sep 26" },
      { number: 754, title: "Chapter 754 – Siege of the Desert Citadel", pages: 15, date: "Sep 19" }
    ]
  },
  "reverse-world": {
    id: "reverse-world",
    title: "Reverse World",
    coverBase: "reverse-world",
    author: "Yuusol",
    genreEyebrow: "ADVENTURE – FANTASY",
    genres: ["adventure", "action"],
    status: "ongoing",
    rating: 4.9,
    latestChapter: 241,
    chapterPrefix: "Chapter",
    synopsis: "In a catastrophic reality where humanity was annihilated by the apocalyptic Shadow Labyrinth, Desir Arman is sent thirteen years back in time. Armed with complete knowledge of the tragic future, Desir enrolls in the Hebrion Academy to train the strongest magicians and prevent the downfall.",
    episodes: [
      { number: 241, title: "Chapter 241 – Decryption of the High Spells", pages: 17, date: "Oct 07" },
      { number: 240, title: "Chapter 240 – The Hebrion Tournament Finals", pages: 16, date: "Sep 30" },
      { number: 239, title: "Chapter 239 – Shadow World Revelation", pages: 15, date: "Sep 23" },
      { number: 238, title: "Chapter 238 – Party Tactics in Motion", pages: 14, date: "Sep 16" }
    ]
  },
  "go-toubun": {
    id: "go-toubun",
    title: "Go-Toubun",
    coverBase: "go-toubun",
    author: "Negi Haruba",
    genreEyebrow: "LOVE – COMEDY – SCHOOL",
    genres: ["love", "comedy", "school"],
    status: "ongoing",
    rating: 4.9,
    latestChapter: 112,
    chapterPrefix: "Chapter",
    synopsis: "Futaro Uesugi is a gifted but impoverished high schooler who lands a high-paying tutoring gig. To his surprise, his pupils are five identical quintuplet sisters — Ichika, Nino, Miku, Yotsuba, and Itsuki — each possessing distinct personalities and a mutual contempt for studying.",
    episodes: [
      { number: 112, title: "Chapter 112 – The School Festival Confession", pages: 20, date: "Oct 06" },
      { number: 111, title: "Chapter 111 – Fireworks Across the Night Sky", pages: 18, date: "Sep 29" },
      { number: 110, title: "Chapter 110 – Sisters' Vow of Friendship", pages: 19, date: "Sep 22" },
      { number: 109, title: "Chapter 109 – Study Session on the Rooftop", pages: 18, date: "Sep 15" }
    ]
  },
  "shenwu-tianzun": {
    id: "shenwu-tianzun",
    title: "Shenwu Tianzun",
    coverBase: "shenwu-tianzun",
    author: "Feng Ling Tian Xia",
    genreEyebrow: "ACTION – ADVENTURE",
    genres: ["action", "adventure"],
    status: "ongoing",
    rating: 4.7,
    latestChapter: 357,
    chapterPrefix: "Chapter",
    synopsis: "The betrayed prodigy of a supreme immortal sect is exiled to the mortal realm with shattered meridians. Fortuitously finding an ancient nine-turn dragon pill, he remolds his constitution into an indestructible supreme physique to challenge the gods.",
    episodes: [
      { number: 357, title: "Chapter 357 – Awakening of the Supreme Martial Soul", pages: 15, date: "Oct 08" },
      { number: 356, title: "Chapter 356 – Suppressing the Demon Sect Elders", pages: 14, date: "Oct 01" },
      { number: 355, title: "Chapter 355 – Heavenly Dragon Fist Technique", pages: 16, date: "Sep 24" },
      { number: 354, title: "Chapter 354 – Descent into the Nine Springs", pages: 15, date: "Sep 17" }
    ]
  },
  "evil-god": {
    id: "evil-god",
    title: "Evil God",
    coverBase: "evil-god",
    author: "Cuttlefish That Loves Diving",
    genreEyebrow: "HORROR – MYSTERY",
    genres: ["horror", "mystery"],
    status: "ongoing",
    rating: 4.9,
    latestChapter: 187,
    chapterPrefix: "Chapter",
    synopsis: "In a Victorian steampunk metropolis brimming with steam engines, esoteric tarot secret societies, and uncanny potions, Klein Moretti transmutes into an otherworldly scholar. By consuming supernatural potions, he ascends the Sequence pathways amidst cosmic horrors.",
    episodes: [
      { number: 187, title: "Chapter 187 – Whisperings of the Tarot Club", pages: 18, date: "Oct 09" },
      { number: 186, title: "Chapter 186 – The Clown Potion Ingestion", pages: 17, date: "Oct 02" },
      { number: 185, title: "Chapter 185 – Fog Above the Gray Sanctuary", pages: 16, date: "Sep 25" },
      { number: 184, title: "Chapter 184 – Crimson Moon Invocations", pages: 18, date: "Sep 18" }
    ]
  }
};

// Export to window
window.COMICS_DATA = COMICS_DATA;

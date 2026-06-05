// Real stories from @kadhaisolai YouTube channel — narrated by RJ Devi
export interface DemoBook {
  id: string          // YouTube video ID used as the demo book ID
  ytId: string
  title: string       // Tamil title
  titleEn: string     // English translation
  author: string
  narrator: string
  genre: string
  type: 'Short Story' | 'Full Story' | 'Historical' | 'Spiritual' | 'Family' | 'Thriller'
  description: string
  thumbnail: string
  duration: string    // approximate
  plays: number
  part?: number
  seriesName?: string
}

export const DEMO_BOOKS: DemoBook[] = [
  // ─── Short Stories ──────────────────────────────────────────────
  {
    id: 'WtcPQC30axU', ytId: 'WtcPQC30axU',
    title: 'கண்ணீர்', titleEn: 'Tears',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Drama', type: 'Short Story',
    description: 'A deeply emotional Tamil short story that explores the unspoken pain and silent tears of everyday life. RJ Devi narrates this touching drama with warmth and depth.',
    thumbnail: 'https://img.youtube.com/vi/WtcPQC30axU/maxresdefault.jpg',
    duration: '~15 min', plays: 1240,
  },
  {
    id: '8yU_Yt1fM4c', ytId: '8yU_Yt1fM4c',
    title: 'மூன்றாம் உலகப் போர்', titleEn: 'Third World War',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Thriller', type: 'Thriller',
    description: 'A gripping Tamil thriller that imagines the chaos and human cost of a third world war, told through intimate personal stories of survival and sacrifice.',
    thumbnail: 'https://img.youtube.com/vi/8yU_Yt1fM4c/maxresdefault.jpg',
    duration: '~20 min', plays: 2180,
  },
  {
    id: '42XfYQrixbc', ytId: '42XfYQrixbc',
    title: 'இரையும் இறையும்', titleEn: 'Prey and Providence',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Drama', type: 'Short Story',
    description: 'A thought-provoking Tamil short story that weaves together themes of faith, fate and the thin line between predator and protector in human life.',
    thumbnail: 'https://img.youtube.com/vi/42XfYQrixbc/maxresdefault.jpg',
    duration: '~18 min', plays: 875,
  },
  {
    id: '6cK_XvaAKhU', ytId: '6cK_XvaAKhU',
    title: 'அப்பா அன்புள்ள அப்பா', titleEn: 'Dear Father',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Drama', type: 'Short Story',
    description: 'A heartfelt tribute to fatherhood — a beautiful Tamil story about the unspoken love, quiet sacrifices, and gentle strength of a father told through a daughter\'s eyes.',
    thumbnail: 'https://img.youtube.com/vi/6cK_XvaAKhU/maxresdefault.jpg',
    duration: '~22 min', plays: 3420,
  },
  {
    id: 'OrBRgN1KXj4', ytId: 'OrBRgN1KXj4',
    title: 'கூடு விட்டு கூடு', titleEn: 'Shell to Shell',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Drama', type: 'Short Story',
    description: 'An introspective Tamil short story about transformation, identity, and the journey of the soul from one life to another — poetic and deeply moving.',
    thumbnail: 'https://img.youtube.com/vi/OrBRgN1KXj4/maxresdefault.jpg',
    duration: '~16 min', plays: 1590,
  },
  {
    id: 'jV5M8liGiZE', ytId: 'jV5M8liGiZE',
    title: 'வயல்காட்டு இசக்கி', titleEn: 'Isaki of the Fields',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Drama', type: 'Short Story',
    description: 'A vivid Tamil story set in the rural heartlands — the life, love, and spirit of a village woman named Isaki, told with earthy authenticity.',
    thumbnail: 'https://img.youtube.com/vi/jV5M8liGiZE/maxresdefault.jpg',
    duration: '~25 min', plays: 980,
  },
  // ─── Full Stories ────────────────────────────────────────────────
  {
    id: 'dN05TxI9zjY', ytId: 'dN05TxI9zjY',
    title: 'ஆறில் ஒரு பங்கு', titleEn: 'One in Six',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Fiction', type: 'Full Story',
    description: 'A rich Tamil novel about family bonds, inheritance, and the complex emotions that arise when six siblings must share what their parents left behind.',
    thumbnail: 'https://img.youtube.com/vi/dN05TxI9zjY/maxresdefault.jpg',
    duration: '~45 min', plays: 2750,
  },
  {
    id: '5CMzmgdxRRo', ytId: '5CMzmgdxRRo',
    title: 'கோவிந்தக் கூத்து', titleEn: "Govinda's Dance",
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Spiritual', type: 'Spiritual',
    description: 'A divine Tamil story rooted in devotion and mythology — the celestial dance of Govinda told through beautifully crafted prose that uplifts the spirit.',
    thumbnail: 'https://img.youtube.com/vi/5CMzmgdxRRo/maxresdefault.jpg',
    duration: '~35 min', plays: 1830,
  },
  {
    id: 'F6RdaV6x6wI', ytId: 'F6RdaV6x6wI',
    title: 'மோகினி வந்தாள்', titleEn: 'Mohini Arrived',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Family', type: 'Family',
    description: 'A captivating Tamil family novel about the arrival of an enchanting woman who stirs up buried emotions and unspoken desires within a traditional household.',
    thumbnail: 'https://img.youtube.com/vi/F6RdaV6x6wI/maxresdefault.jpg',
    duration: '~50 min', plays: 4100,
  },
  // ─── Historical Novels ───────────────────────────────────────────
  {
    id: 'GEkvfoBwzHc', ytId: 'GEkvfoBwzHc',
    title: 'நித்திலவல்லி', titleEn: 'Nithilavalli',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'Part 1 of the epic historical Tamil novel — the story of Nithilavalli, a woman of extraordinary strength set against the grand backdrop of ancient Tamil kingdoms.',
    thumbnail: 'https://img.youtube.com/vi/GEkvfoBwzHc/maxresdefault.jpg',
    duration: '~1h 10m', plays: 6200, part: 1, seriesName: 'நித்திலவல்லி',
  },
  {
    id: 'FvPyaIbIfdE', ytId: 'FvPyaIbIfdE',
    title: 'நித்திலவல்லி — Part 2', titleEn: 'Nithilavalli Part 2',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'The saga continues — Nithilavalli faces greater trials as palace politics, love, and war converge in this gripping second chapter of the historical series.',
    thumbnail: 'https://img.youtube.com/vi/FvPyaIbIfdE/maxresdefault.jpg',
    duration: '~1h 5m', plays: 5400, part: 2, seriesName: 'நித்திலவல்லி',
  },
  {
    id: 'aHak38zTlbA', ytId: 'aHak38zTlbA',
    title: 'நித்திலவல்லி — Part 3', titleEn: 'Nithilavalli Part 3',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'The epic conclusion to Nithilavalli\'s journey — destiny, sacrifice, and the indomitable spirit of a Tamil woman come to a powerful climax in this finale.',
    thumbnail: 'https://img.youtube.com/vi/aHak38zTlbA/maxresdefault.jpg',
    duration: '~1h', plays: 4800, part: 3, seriesName: 'நித்திலவல்லி',
  },
  {
    id: 'BQ1PyYLH1J8', ytId: 'BQ1PyYLH1J8',
    title: 'ராஜ திலகம் — Part 2', titleEn: 'Raj Tilakam Part 2',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'The royal saga deepens — Part 2 of the historical novel about power, betrayal, and honour in the courts of ancient Tamil Nadu.',
    thumbnail: 'https://img.youtube.com/vi/BQ1PyYLH1J8/maxresdefault.jpg',
    duration: '~1h 15m', plays: 3900, part: 2, seriesName: 'ராஜ திலகம்',
  },
  {
    id: '02jP-JSxsMo', ytId: '02jP-JSxsMo',
    title: 'ராஜ திலகம் — Part 3', titleEn: 'Raj Tilakam Part 3',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'Wars are waged and alliances shattered — Part 3 of this sweeping historical epic takes the listener deeper into the labyrinth of royal ambition.',
    thumbnail: 'https://img.youtube.com/vi/02jP-JSxsMo/maxresdefault.jpg',
    duration: '~1h 10m', plays: 3600, part: 3, seriesName: 'ராஜ திலகம்',
  },
  {
    id: 'Zs3dpBc1OkE', ytId: 'Zs3dpBc1OkE',
    title: 'ராஜ திலகம் — Part 4', titleEn: 'Raj Tilakam Part 4',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'The grand conclusion — Part 4 brings the royal saga to its dramatic end as truth, justice, and legacy define the fate of the kingdom.',
    thumbnail: 'https://img.youtube.com/vi/Zs3dpBc1OkE/maxresdefault.jpg',
    duration: '~55 min', plays: 3200, part: 4, seriesName: 'ராஜ திலகம்',
  },
  {
    id: 'XGtkcJW3zMw', ytId: 'XGtkcJW3zMw',
    title: 'கடல் புறா — Part 2', titleEn: 'Sea Dove Part 2',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'Across trade routes and stormy seas — Part 2 of this maritime Tamil historical novel unfolds the epic journey of a dove who carries the weight of kingdoms.',
    thumbnail: 'https://img.youtube.com/vi/XGtkcJW3zMw/maxresdefault.jpg',
    duration: '~1h 20m', plays: 4500, part: 2, seriesName: 'கடல் புறா',
  },
  {
    id: 'vtH4RY9spwk', ytId: 'vtH4RY9spwk',
    title: 'கடல் புறா — Part 3', titleEn: 'Sea Dove Part 3',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'The culmination of the sea voyage — Part 3 reveals the secrets of the deep and the destiny of those bound to the ancient Tamil maritime world.',
    thumbnail: 'https://img.youtube.com/vi/vtH4RY9spwk/maxresdefault.jpg',
    duration: '~1h 15m', plays: 4200, part: 3, seriesName: 'கடல் புறா',
  },
  {
    id: '2d1CjI9f9x4', ytId: '2d1CjI9f9x4',
    title: 'புரட்சி ராணி மங்கம்மாள்', titleEn: 'Revolutionary Queen Mangammal',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'The awe-inspiring true story of Mangammal — the fearless queen who ruled the Madurai Nayak kingdom with justice and iron will in the 17th century.',
    thumbnail: 'https://img.youtube.com/vi/2d1CjI9f9x4/maxresdefault.jpg',
    duration: '~1h 30m', plays: 7800,
  },
  {
    id: 'ZMm70ogYAWU', ytId: 'ZMm70ogYAWU',
    title: 'பாண்டியன் பவனி', titleEn: 'Pandiyan Procession',
    author: 'KadhaiSolai', narrator: 'RJ Devi',
    genre: 'Historical', type: 'Historical',
    description: 'The grandeur of the Pandiyan dynasty — a sweeping Tamil historical novel about royal processions, palace intrigues, and the eternal glory of the Tamil people.',
    thumbnail: 'https://img.youtube.com/vi/ZMm70ogYAWU/maxresdefault.jpg',
    duration: '~1h 25m', plays: 5600,
  },
]

export const GENRE_LIST = ['All', 'Historical', 'Drama', 'Thriller', 'Family', 'Spiritual', 'Fiction']

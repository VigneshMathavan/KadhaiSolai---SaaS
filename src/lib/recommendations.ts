import { getInProgress, getListeningHistory } from './listening'
import { DEMO_BOOKS, type DemoBook } from './demo-books'

export interface ContinueItem extends DemoBook {
  completionPct: number
  lastPosition: number
}

export interface Recommendations {
  continueListening: ContinueItem[]
  forYou: DemoBook[]
  trending: DemoBook[]
  topGenre: string | null
}

export function getRecommendations(excludeId?: string): Recommendations {
  const history = getListeningHistory()
  const inProgress = getInProgress()
  const listenedIds = new Set(history.map(h => h.bookId))

  const freq: Record<string, number> = {}
  history.forEach(h => { freq[h.genre] = (freq[h.genre] ?? 0) + 1 })
  const topGenre = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const continueListening = inProgress
    .map(p => {
      const book = DEMO_BOOKS.find(b => b.id === p.bookId)
      return book && book.id !== excludeId
        ? { ...book, completionPct: p.completionPct, lastPosition: p.lastPosition }
        : null
    })
    .filter((x): x is ContinueItem => x !== null)

  const notListened = DEMO_BOOKS.filter(b => b.id !== excludeId && !listenedIds.has(b.id))

  const forYou = (topGenre
    ? notListened.filter(b => b.genre === topGenre)
    : notListened
  ).slice(0, 6)

  const trending = [...DEMO_BOOKS]
    .filter(b => b.id !== excludeId)
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 6)

  return { continueListening, forYou, trending, topGenre }
}

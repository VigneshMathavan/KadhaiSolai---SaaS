export interface ListenProgress {
  bookId: string
  title: string
  genre: string
  thumbnail: string
  lastPosition: number   // seconds
  duration: number       // seconds
  completionPct: number  // 0–100
  lastPlayedAt: string   // ISO
  totalListenTime: number // cumulative seconds
}

export interface ListeningStats {
  totalTime: number      // seconds
  completedCount: number
  currentStreak: number
  longestStreak: number
  history: string[]      // YYYY-MM-DD
}

const K = { history: 'ks_listen_history', stats: 'ks_listen_stats' } as const

const todayStr = () => new Date().toISOString().split('T')[0]
const yesterdayStr = () => {
  const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]
}

export function getListeningHistory(): ListenProgress[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(K.history) || '[]') } catch { return [] }
}

export function getProgress(bookId: string): ListenProgress | null {
  return getListeningHistory().find(h => h.bookId === bookId) ?? null
}

export function updateProgress(
  bookId: string, title: string, genre: string, thumbnail: string,
  position: number, duration: number
) {
  if (typeof window === 'undefined') return
  const history = getListeningHistory()
  const idx = history.findIndex(h => h.bookId === bookId)
  const pct = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0
  const prev = idx >= 0 ? history[idx] : null
  const elapsed = prev ? Math.min(30, Math.max(0, position - prev.lastPosition)) : 0
  const entry: ListenProgress = {
    bookId, title, genre, thumbnail,
    lastPosition: position, duration, completionPct: pct,
    lastPlayedAt: new Date().toISOString(),
    totalListenTime: (prev?.totalListenTime ?? 0) + elapsed,
  }
  if (idx >= 0) history[idx] = entry
  else history.unshift(entry)
  try { localStorage.setItem(K.history, JSON.stringify(history.slice(0, 50))) } catch {}
  _addTime(elapsed, pct >= 90 && (prev?.completionPct ?? 0) < 90)
}

function _addTime(elapsed: number, justCompleted: boolean) {
  const s = getListeningStats()
  s.totalTime += elapsed
  if (justCompleted) s.completedCount++
  try { localStorage.setItem(K.stats, JSON.stringify(s)) } catch {}
}

export function recordListenDay() {
  if (typeof window === 'undefined') return
  const s = getListeningStats()
  const t = todayStr()
  if (s.history.includes(t)) return
  const last = s.history[s.history.length - 1]
  s.currentStreak = last === yesterdayStr() ? s.currentStreak + 1 : 1
  s.longestStreak = Math.max(s.longestStreak, s.currentStreak)
  s.history = [...s.history, t].slice(-60)
  try { localStorage.setItem(K.stats, JSON.stringify(s)) } catch {}
}

export function getListeningStats(): ListeningStats {
  const base: ListeningStats = { totalTime: 0, completedCount: 0, currentStreak: 0, longestStreak: 0, history: [] }
  if (typeof window === 'undefined') return base
  try {
    const raw = localStorage.getItem(K.stats)
    if (!raw) return base
    const d: ListeningStats = { ...base, ...JSON.parse(raw) }
    const last = d.history[d.history.length - 1]
    if (last && last !== todayStr() && last !== yesterdayStr()) {
      d.currentStreak = 0
      try { localStorage.setItem(K.stats, JSON.stringify(d)) } catch {}
    }
    return d
  } catch { return base }
}

export function getInProgress(): ListenProgress[] {
  return getListeningHistory()
    .filter(h => h.completionPct > 2 && h.completionPct < 90)
    .sort((a, b) => new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime())
}

export function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

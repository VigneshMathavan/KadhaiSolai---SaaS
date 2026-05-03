const K = {
  streak: 'ks_streak',
  longest: 'ks_streak_longest',
  lastDate: 'ks_streak_last',
  history: 'ks_streak_history',
  total: 'ks_streak_total',
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalStories: number
  lastPublishedDate: string | null
  history: string[] // ISO date strings of activity
}

function todayISO() { return new Date().toISOString().split('T')[0] }
function yesterdayISO() {
  const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') return {
    currentStreak: 0, longestStreak: 0, totalStories: 0, lastPublishedDate: null, history: []
  }
  const lastDate = localStorage.getItem(K.lastDate)
  let current = parseInt(localStorage.getItem(K.streak) || '0')
  // Expire streak if gap > 1 day
  if (lastDate && lastDate !== todayISO() && lastDate !== yesterdayISO()) {
    current = 0; localStorage.setItem(K.streak, '0')
  }
  return {
    currentStreak: current,
    longestStreak: parseInt(localStorage.getItem(K.longest) || '0'),
    totalStories: parseInt(localStorage.getItem(K.total) || '0'),
    lastPublishedDate: lastDate,
    history: JSON.parse(localStorage.getItem(K.history) || '[]'),
  }
}

export function recordPublish(): StreakData {
  if (typeof window === 'undefined') return getStreakData()
  const today = todayISO()
  const last = localStorage.getItem(K.lastDate)
  let streak = parseInt(localStorage.getItem(K.streak) || '0')
  if (last !== today) {
    streak = last === yesterdayISO() ? streak + 1 : 1
  }
  const longest = Math.max(streak, parseInt(localStorage.getItem(K.longest) || '0'))
  const total = parseInt(localStorage.getItem(K.total) || '0') + 1
  const history: string[] = JSON.parse(localStorage.getItem(K.history) || '[]')
  if (!history.includes(today)) history.push(today)
  const trimmed = history.slice(-60)
  localStorage.setItem(K.streak, String(streak))
  localStorage.setItem(K.longest, String(longest))
  localStorage.setItem(K.lastDate, today)
  localStorage.setItem(K.total, String(total))
  localStorage.setItem(K.history, JSON.stringify(trimmed))
  return { currentStreak: streak, longestStreak: longest, totalStories: total, lastPublishedDate: today, history: trimmed }
}

export function publishedToday(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(K.lastDate) === todayISO()
}

export type FlameLevel = 'cold' | 'warm' | 'hot' | 'legendary'
export function flameLevel(streak: number): FlameLevel {
  if (streak === 0) return 'cold'
  if (streak < 3) return 'warm'
  if (streak < 7) return 'hot'
  return 'legendary'
}

export const FLAME_COLORS: Record<FlameLevel, string> = {
  cold: 'text-white/30',
  warm: 'text-orange-400',
  hot: 'text-orange-500',
  legendary: 'text-gold',
}

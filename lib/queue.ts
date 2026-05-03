export interface QueueItem {
  id: string
  ytId: string
  title: string
  genre: string
  thumbnail: string
  duration: string
  narrator: string
}

const KEY = 'ks_listen_queue'

const load = (): QueueItem[] => {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
const save = (q: QueueItem[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(q)) } catch {}
}

export const getQueue = load

export function addToQueue(item: QueueItem): boolean {
  const q = load()
  if (q.find(x => x.id === item.id)) return false
  save([...q, item]); return true
}

export function removeFromQueue(id: string) { save(load().filter(x => x.id !== id)) }
export function clearQueue() { save([]) }

export function moveInQueue(id: string, dir: -1 | 1) {
  const q = load()
  const i = q.findIndex(x => x.id === id), j = i + dir
  if (i < 0 || j < 0 || j >= q.length) return
  ;[q[i], q[j]] = [q[j], q[i]]; save(q)
}

export function isInQueue(id: string): boolean { return load().some(x => x.id === id) }

export function getNextAfter(currentId: string): QueueItem | null {
  const q = load()
  if (!q.length) return null
  const i = q.findIndex(x => x.id === currentId)
  if (i === -1) return q[0]
  return i + 1 < q.length ? q[i + 1] : null
}

export function dequeueId(id: string) {
  const q = load(); const i = q.findIndex(x => x.id === id)
  if (i >= 0) { q.splice(i, 1); save(q) }
}

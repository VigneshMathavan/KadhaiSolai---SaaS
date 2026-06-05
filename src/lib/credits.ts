// ─── Credits system constants ──────────────────────────────────────────────────
export const MESSAGE_COST       = 100   // credits to send one message to an author
export const SESSION_COST       = 1000  // credits to request a 30-min session
export const AUTHOR_SHARE_PCT   = 0.70  // 70% of credits go to the author
export const AUTHOR_SHARE       = Math.round(MESSAGE_COST * AUTHOR_SHARE_PCT) // 70 credits

export const FREE_WELCOME       = 100   // one-time welcome credits
export const PREMIUM_MONTHLY    = 2000  // credits per month with Premium sub
export const CREATOR_MONTHLY    = 3500  // credits per month with Creator Pro sub

export interface CreditPack {
  id: string
  label: string
  credits: number
  price: number       // INR
  badge?: string
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'starter', label: 'Starter',    credits: 500,  price: 59  },
  { id: 'popular', label: 'Popular',    credits: 1500, price: 149, badge: 'Best Value' },
  { id: 'power',   label: 'Power User', credits: 5000, price: 449 },
]

export interface CreditTransaction {
  id: string
  amount: number
  type: string
  note: string | null
  created_at: string
}

export interface AuthorMessage {
  id: string
  from_name: string
  story_id: string | null
  message_text: string
  credits_spent: number
  author_credits_earned: number
  status: string
  created_at: string
}

// ─── API helpers ───────────────────────────────────────────────────────────────
export async function getCreditsData(fingerprint: string): Promise<{
  balance: number
  transactions: CreditTransaction[]
}> {
  const res = await fetch(`/api/credits?fp=${encodeURIComponent(fingerprint)}`)
  if (!res.ok) return { balance: 0, transactions: [] }
  return res.json()
}

export async function purchaseCredits(fingerprint: string, packId: string): Promise<{
  success: boolean
  newBalance: number
  error?: string
}> {
  const res = await fetch('/api/credits/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, packId }),
  })
  return res.json()
}

export async function sendMessage(
  fromFp: string,
  fromName: string,
  toFp: string,
  storyId: string,
  messageText: string,
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const res = await fetch('/api/credits/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromFp, fromName, toFp, storyId, messageText }),
  })
  return res.json()
}

export async function getAuthorMessages(fingerprint: string): Promise<AuthorMessage[]> {
  const res = await fetch(`/api/credits/messages?fp=${encodeURIComponent(fingerprint)}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.messages || []
}

export async function recordListenEarning(authorFp: string, referenceId: string): Promise<void> {
  await fetch('/api/credits/listen-earn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorFp, referenceId }),
  }).catch(() => {})
}

// ─── Utils ────────────────────────────────────────────────────────────────────
export function creditsToRupees(credits: number): string {
  const rupees = credits * 0.1
  if (rupees < 1) return `₹${rupees.toFixed(1)}`
  return `₹${Math.round(rupees)}`
}

export function typeLabel(type: string): string {
  const map: Record<string, string> = {
    welcome:          '🎁 Welcome gift',
    subscription:     '💎 Subscription',
    purchase:         '🛒 Purchase',
    message_sent:     '✉️ Message sent',
    message_received: '📬 Message received',
    listen_earn:      '🎧 Listening earn',
  }
  return map[type] || type
}

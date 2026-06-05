'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import {
  Headphones, BookOpen, CheckCircle, XCircle, Users,
  ArrowUpRight, Plus, Clock, Play, Zap, Calendar, Star,
  Coins, MessageCircle, Inbox,
} from 'lucide-react'
import { fetchMyStories, getFingerprint, type Story } from '@/lib/stories'
import { getStreakData, flameLevel, FLAME_COLORS, type StreakData } from '@/lib/streaks'
import {
  getCreditsData, purchaseCredits, CREDIT_PACKS,
  creditsToRupees, typeLabel, getAuthorMessages,
  type CreditTransaction, type AuthorMessage,
} from '@/lib/credits'
import AppNav from '@/components/AppNav'

// ── Constants ──────────────────────────────────────────────────────────────────
const EARNINGS_PER_PLAY = 2 // ₹2 per play (simulated)

// ── Demo data (connect requests & sessions have no backend yet) ───────────────
const DEMO_REQUESTS = [
  { id: '1', from: 'Priya Meenakshi', emoji: '👩', message: 'Your historical research is incredible. Would love a 30-min discussion!', credits: 50, time: '2h ago' },
  { id: '2', from: 'Raj Kumar', emoji: '👨', message: 'Running a Tamil book club — want to feature your reading for our 50 members.', credits: 120, time: '1d ago' },
  { id: '3', from: 'Santhosh V.', emoji: '🧑', message: 'Writing thesis on modern Tamil literature. Can we connect for 15 mins?', credits: 30, time: '3d ago' },
]

const DEMO_SESSIONS = [
  { id: '1', title: 'Live Reading — Chapter 1', date: 'May 10, 2026', time: '7:00 PM IST', free: true, price: 0, registered: 24, capacity: 50 },
  { id: '2', title: 'Author Q&A Session', date: 'May 17, 2026', time: '6:30 PM IST', free: false, price: 49, registered: 8, capacity: 20 },
  { id: '3', title: 'Book Club Read-Along', date: 'May 24, 2026', time: '8:00 PM IST', free: false, price: 99, registered: 3, capacity: 15 },
]

const EARNINGS_CHART = [
  { month: 'Jan', v: 320 }, { month: 'Feb', v: 580 }, { month: 'Mar', v: 440 },
  { month: 'Apr', v: 920 }, { month: 'May', v: 1240 },
]

// ── Shared UI ─────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px w-5 bg-gold/40" />
      <p className="font-mono text-[9px] tracking-[0.35em] text-gold/55 uppercase">{children}</p>
    </div>
  )
}

function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean
}) {
  return (
    <div className={`p-5 rounded-2xl border ${accent ? 'border-gold/25 bg-gold/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-sm ${accent ? 'bg-gold/10 text-gold' : 'bg-white/[0.05] text-white/40'}`}>
        {icon}
      </div>
      <div className={`font-serif font-bold text-2xl mb-0.5 ${accent ? 'text-gold' : 'text-white'}`}>{value}</div>
      <div className="text-white/45 text-xs">{label}</div>
      {sub && <div className="text-white/25 text-[10px] mt-0.5">{sub}</div>}
    </div>
  )
}

function EarningsChart({ data }: { data: typeof EARNINGS_CHART }) {
  const max = Math.max(...data.map(d => d.v))
  return (
    <div className="flex items-end gap-2 h-28 pt-2">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono text-gold/60">₹{d.v >= 1000 ? `${(d.v/1000).toFixed(1)}k` : d.v}</span>
          <motion.div
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: `${Math.round((d.v / max) * 72)}px`, transformOrigin: 'bottom' }}
            className="w-full rounded-t-lg bg-gradient-to-t from-gold/25 to-gold/60 min-h-[6px]"
          />
          <span className="font-mono text-[8px] text-white/25">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

// ── Create Session Modal ───────────────────────────────────────────────────────
function CreateSessionModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: any) => void }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [capacity, setCapacity] = useState(20)
  const [free, setFree] = useState(true)
  const [price, setPrice] = useState(49)

  const handleCreate = () => {
    if (!title || !date || !time) { toast.error('Please fill in all fields'); return }
    const newSession = {
      id: Date.now().toString(), title, date, time: time + ' IST',
      free, price: free ? 0 : price, registered: 0, capacity,
    }
    onCreated(newSession)
    toast.success('Read-along session created!')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#0d0a1a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-serif text-xl text-white mb-5">Create Read-Along Session</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1.5">Session Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Live Reading — Chapter 1"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-gold/40 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1.5">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-gold/40 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1.5">Time (IST) *</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-gold/40 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1.5">Max Capacity</label>
            <input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} min={1} max={1000}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-gold/40 transition-colors" />
          </div>

          <div>
            <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-2">Access Type</label>
            <div className="flex gap-2">
              <button onClick={() => setFree(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${free ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/[0.08] text-white/35 hover:border-white/20'}`}>
                Free
              </button>
              <button onClick={() => setFree(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${!free ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/[0.08] text-white/35 hover:border-white/20'}`}>
                Paid
              </button>
            </div>
            <AnimatePresence>
              {!free && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-3">
                    <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1.5">Price per Seat (₹)</label>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={1}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-gold/40 transition-colors" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleCreate}
            className="flex-1 bg-gold text-void font-semibold py-2.5 rounded-full text-sm hover:bg-gold2 transition-colors">
            Create Session
          </button>
          <button onClick={onClose} className="px-5 text-white/35 hover:text-white text-sm transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Listener View ─────────────────────────────────────────────────────────────
function ListenerView() {
  const [currentBook, setCurrentBook] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [myStories, setMyStories] = useState<Story[]>([])
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, totalStories: 0, lastPublishedDate: null, history: [] })
  const [fp, setFp] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ks_current_book')
      if (saved) setCurrentBook(JSON.parse(saved))
    } catch {}
    const fingerprint = getFingerprint()
    setFp(fingerprint)
    setStreak(getStreakData())
    fetchMyStories(fingerprint).then(setMyStories).catch(() => {})
    getCreditsData(fingerprint)
      .then(({ balance, transactions: txns }) => {
        setCredits(balance)
        setTransactions(txns)
      })
      .catch(() => {})
      .finally(() => setCreditsLoading(false))
  }, [])

  const handlePurchase = async (packId: string) => {
    if (!fp) return
    setPurchasing(packId)
    try {
      const result = await purchaseCredits(fp, packId)
      if (result.success) {
        // Update balance optimistically from purchase response — don't re-query
        // (immediate re-query may hit a read replica with lag and revert the balance)
        setCredits(result.newBalance)
        toast.success(`Credits added! New balance: ${result.newBalance.toLocaleString()}`)
        // Refresh only transactions (not balance) after a short delay for replica sync
        setTimeout(() => {
          getCreditsData(fp).then(({ transactions: txns }) => {
            setTransactions(txns)
          }).catch(() => {})
        }, 1500)
      } else {
        toast.error(result.error || 'Purchase failed. Try again.')
      }
    } catch {
      toast.error('Network error. Please retry.')
    } finally {
      setPurchasing(null)
    }
  }

  const recentDemoBooks = [
    { id: 'WtcPQC30axU', title: 'Ponniyin Selvan', genre: 'Historical', progress: 45 },
    { id: 'jNQXAC9IVRw', title: 'Valli', genre: 'Drama', progress: 20 },
    { id: 'qeMFqkcPD8Q', title: 'Naan Ee', genre: 'Thriller', progress: 8 },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard icon={<BookOpen size={15} />} label="Books Listened" value="3" />
        <StatCard icon={<Clock size={15} />} label="Hours Streamed" value="4.2h" />
        <StatCard icon={<Zap size={15} />} label="Credits" value={credits !== null ? credits.toLocaleString() : '…'} sub="Use to connect with authors" accent />
        <StatCard icon={<Star size={15} />} label="Current Plan" value="Free" sub="Upgrade for more" />
      </div>

      <div className="grid lg:grid-cols-[1fr,300px] gap-6">
        <div className="space-y-5">
          {/* Currently Listening */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <SectionLabel>Now Playing</SectionLabel>
            {currentBook ? (
              <div className="flex gap-4">
                <div className="relative w-24 aspect-video rounded-xl overflow-hidden shrink-0 bg-purple/20">
                  {currentBook.thumbnail && (
                    <Image src={currentBook.thumbnail} alt={currentBook.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-white text-base mb-1 truncate">{currentBook.title}</h3>
                  <p className="text-white/35 text-xs mb-3">{currentBook.genre}</p>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${currentBook.progress || 30}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">{currentBook.progress || 30}% complete</span>
                    <Link href={`/listen/${currentBook.id}`}
                      className="flex items-center gap-1.5 text-[10px] text-gold hover:text-gold2 transition-colors font-medium">
                      <Play size={9} /> Resume listening
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Headphones className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm mb-3">Nothing playing yet</p>
                <Link href="/listen"
                  className="inline-flex items-center gap-2 text-xs text-gold border border-gold/25 px-4 py-2 rounded-full hover:bg-gold/10 transition-colors">
                  Browse books <ArrowUpRight size={11} />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Listens */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <SectionLabel>Recent Listens</SectionLabel>
            <div className="space-y-2">
              {recentDemoBooks.map(b => (
                <Link key={b.id} href={`/listen/${b.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                  <div className="relative w-16 aspect-video rounded-lg overflow-hidden shrink-0 bg-purple/20">
                    <Image
                      src={`https://img.youtube.com/vi/${b.id}/mqdefault.jpg`}
                      alt={b.title} fill className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{b.title}</p>
                    <p className="text-white/30 text-xs">{b.genre}</p>
                    <div className="h-0.5 bg-white/10 rounded-full mt-1.5 w-full overflow-hidden">
                      <div className="h-full bg-gold/50 rounded-full" style={{ width: `${b.progress}%` }} />
                    </div>
                    <span className="text-[9px] text-white/20 font-mono">{b.progress}%</span>
                  </div>
                  <ArrowUpRight size={12} className="text-white/15 group-hover:text-gold/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
            <Link href="/listen" className="block text-center text-xs text-white/25 hover:text-white/50 transition-colors mt-4 pt-4 border-t border-white/[0.04]">
              Browse full library →
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Subscription */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <SectionLabel>Your Plan</SectionLabel>
            <div className="mb-4">
              <span className="px-3 py-1.5 rounded-full bg-white/[0.06] text-white/50 text-[10px] font-mono uppercase tracking-widest">
                Free Plan
              </span>
            </div>
            <ul className="space-y-2 mb-5">
              {['Unlimited streaming', 'Basic player', 'Browse by genre'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-white/40">
                  <CheckCircle size={10} className="text-green-400 shrink-0" /> {f}
                </li>
              ))}
              {['Offline downloads', '0.5×–3× speed control', 'Cross-device sync'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-white/20 line-through decoration-white/20">
                  <XCircle size={10} className="text-white/15 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing"
              className="block w-full text-center bg-gold text-void font-semibold py-2.5 rounded-full text-xs hover:bg-gold2 transition-colors">
              Upgrade to Premium
            </Link>
          </div>

          {/* Credits */}
          <div className="p-5 rounded-2xl border border-gold/15 bg-gold/[0.03]">
            <SectionLabel>Author Connect Credits</SectionLabel>
            <div className="text-center mb-4">
              {creditsLoading ? (
                <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <div className="text-4xl font-serif font-bold text-gold mb-1">
                    {credits !== null ? credits.toLocaleString() : '0'}
                  </div>
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest">credits</p>
                  <p className="text-white/20 text-[10px] mt-1">≈ {creditsToRupees(credits ?? 0)} value</p>
                </>
              )}
            </div>
            <p className="text-white/25 text-xs text-center mb-5 leading-relaxed px-2">
              100 credits = one message to an author. Premium plan includes 2,000/mo.
            </p>
            <div className="space-y-2 mb-4">
              {CREDIT_PACKS.map(pack => (
                <button
                  key={pack.id}
                  onClick={() => handlePurchase(pack.id)}
                  disabled={purchasing === pack.id}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/[0.07] hover:border-gold/25 hover:bg-gold/[0.04] transition-all text-xs group disabled:opacity-50">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 group-hover:text-white transition-colors">
                      {purchasing === pack.id ? 'Processing…' : `${pack.credits.toLocaleString()} credits`}
                    </span>
                    {pack.badge && (
                      <span className="text-[9px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full font-mono">{pack.badge}</span>
                    )}
                  </div>
                  <span className="text-gold font-medium">₹{pack.price}</span>
                </button>
              ))}
            </div>
            {transactions.length > 0 && (
              <div className="border-t border-white/[0.05] pt-3 space-y-1.5">
                <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Recent</p>
                {transactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between text-[10px]">
                    <span className="text-white/30 truncate">{typeLabel(tx.type)}</span>
                    <span className={tx.amount > 0 ? 'text-green-400 font-mono' : 'text-red-400/70 font-mono'}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connect CTA */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <SectionLabel>Meet an Author</SectionLabel>
            <p className="text-white/30 text-xs mb-4 leading-relaxed">
              Request a 1-on-1 session with any Tamil author. Discuss their books, get writing tips, or join a live read-along.
            </p>
            <Link href="/listen"
              className="block w-full text-center border border-white/[0.1] text-white/45 py-2.5 rounded-full text-xs hover:border-gold/30 hover:text-gold transition-all">
              Browse Authors →
            </Link>
          </div>

          {/* Writing Streak */}
          {streak.currentStreak > 0 && (
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <SectionLabel>Writing Streak</SectionLabel>
              <div className={`flex items-center gap-3 mb-3 ${FLAME_COLORS[flameLevel(streak.currentStreak)]}`}>
                <span className="text-2xl">🔥</span>
                <div>
                  <div className="font-serif font-bold text-xl">{streak.currentStreak}-day streak</div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                    Best: {streak.longestStreak} days · {streak.totalStories} stories
                  </div>
                </div>
              </div>
              <Link href="/create"
                className="block w-full text-center border border-gold/25 text-gold py-2 rounded-full text-xs hover:bg-gold/10 transition-all font-mono uppercase tracking-wider">
                ✍️ Write Today
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* My Stories */}
      <div className="mt-6 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center justify-between mb-5">
          <SectionLabel>My Stories</SectionLabel>
          <Link href="/create" className="flex items-center gap-1 text-[10px] text-gold/60 hover:text-gold transition-colors font-mono">
            + Write New
          </Link>
        </div>
        {myStories.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-white/25 text-sm mb-3">No stories published yet</p>
            <Link href="/create"
              className="inline-flex items-center gap-2 text-xs text-gold border border-gold/25 px-4 py-2 rounded-full hover:bg-gold/10 transition-colors">
              Write your first story <ArrowUpRight size={11} />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myStories.slice(0, 5).map(s => (
              <Link key={s.id} href={`/stories/${s.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-gold2 transition-colors">{s.title}</p>
                  <p className="text-white/30 text-xs">{s.genre} · {s.word_count} words</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[10px] text-white/25">
                  <span>❤ {s.likes_count}</span>
                  <span>💬 {s.comments_count}</span>
                  <ArrowUpRight size={11} className="group-hover:text-gold/50 transition-colors" />
                </div>
              </Link>
            ))}
            {myStories.length > 5 && (
              <Link href="/stories" className="block text-center text-xs text-white/25 hover:text-white/50 transition-colors pt-2 border-t border-white/[0.04] mt-2">
                View all {myStories.length} stories →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Author View ────────────────────────────────────────────────────────────────
function AuthorView() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState(DEMO_REQUESTS)
  const [sessions, setSessions] = useState(DEMO_SESSIONS)
  const [showCreate, setShowCreate] = useState(false)
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, totalStories: 0, lastPublishedDate: null, history: [] })
  const [authorCredits, setAuthorCredits] = useState<number | null>(null)
  const [authorMessages, setAuthorMessages] = useState<AuthorMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)

  useEffect(() => {
    supabase.from('books').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setBooks(data || []); setLoading(false) })
    setStreak(getStreakData())

    const fp = getFingerprint()
    // Fetch author credits balance
    getCreditsData(fp)
      .then(({ balance }) => setAuthorCredits(balance))
      .catch(() => {})
    // Fetch messages sent to this author
    getAuthorMessages(fp)
      .then(msgs => setAuthorMessages(msgs))
      .catch(() => {})
      .finally(() => setMessagesLoading(false))
  }, [])

  const readyBooks = books.filter(b => b.status === 'ready')
  const totalPlays = books.reduce((s, b) => s + (b.plays_count || 0), 0)
  const totalEarnings = totalPlays * EARNINGS_PER_PLAY

  const accept = (id: string) => {
    setRequests(r => r.filter(x => x.id !== id))
    toast.success('Accepted! Meeting details sent to listener.')
  }
  const decline = (id: string) => {
    setRequests(r => r.filter(x => x.id !== id))
    toast('Declined. Credits returned to listener.', { icon: '↩️' })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard icon={<BookOpen size={15} />} label="Books Published" value={loading ? '…' : String(readyBooks.length)} />
        <StatCard icon={<Headphones size={15} />} label="Total Plays" value={loading ? '…' : totalPlays >= 1000 ? `${(totalPlays / 1000).toFixed(1)}k` : String(totalPlays)} />
        <StatCard icon={<Coins size={15} />} label="Credits Earned" value={authorCredits !== null ? authorCredits.toLocaleString() : '…'} sub={authorCredits !== null ? `≈ ${creditsToRupees(authorCredits)}` : 'From messages & listens'} accent />
        <StatCard icon={<Inbox size={15} />} label="Messages Inbox" value={messagesLoading ? '…' : String(authorMessages.length)} sub={authorMessages.length > 0 ? 'From listeners' : 'No messages yet'} />
      </div>

      <div className="grid lg:grid-cols-[1fr,340px] gap-6">
        <div className="space-y-5">
          {/* Book Performance */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-5">
              <SectionLabel>Book Performance</SectionLabel>
              <Link href="/author" className="text-[10px] text-white/30 hover:text-gold transition-colors font-mono">
                + Upload New
              </Link>
            </div>
            {loading ? (
              <div className="py-8 text-center text-white/25 text-sm">Loading books…</div>
            ) : readyBooks.length === 0 ? (
              <div className="py-10 text-center">
                <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm mb-3">No published books yet</p>
                <Link href="/author"
                  className="inline-flex items-center gap-2 text-xs text-gold border border-gold/25 px-4 py-2 rounded-full hover:bg-gold/10 transition-colors">
                  Upload your first book <ArrowUpRight size={11} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {readyBooks.map((book, i) => {
                  const maxPlays = Math.max(...readyBooks.map(b => b.plays_count || 1), 1)
                  const pct = Math.round(((book.plays_count || 0) / maxPlays) * 100)
                  const earnings = (book.plays_count || 0) * EARNINGS_PER_PLAY
                  return (
                    <div key={book.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[9px] text-white/20 w-4 shrink-0">#{i + 1}</span>
                          <span className="font-serif text-sm text-white truncate">{book.title}</span>
                          <span className="text-[9px] text-gold/50 bg-gold/[0.06] px-1.5 py-0.5 rounded shrink-0">{book.genre}</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-3">
                          <span className="text-xs text-white/35">{(book.plays_count || 0).toLocaleString()} plays</span>
                          <span className="text-xs text-gold font-semibold">₹{earnings.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-gold/40 to-gold2/70"
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="pt-3 flex items-center justify-between border-t border-white/[0.04]">
                  <span className="text-xs text-white/25">Total earnings (simulated)</span>
                  <span className="text-sm text-gold font-serif font-bold">₹{totalEarnings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Earnings Chart */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-start justify-between mb-2">
              <SectionLabel>Monthly Earnings</SectionLabel>
              <span className="text-[9px] text-white/20 font-mono mt-1">Demo projection</span>
            </div>
            <EarningsChart data={EARNINGS_CHART} />
            <p className="text-center text-[10px] text-white/20 mt-2 font-mono">
              2026 total: <span className="text-gold">₹{EARNINGS_CHART.reduce((s, d) => s + d.v, 0).toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Messages Inbox (real) */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Messages Inbox</SectionLabel>
              {authorCredits !== null && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-gold/70 border border-gold/20 bg-gold/[0.05] px-2.5 py-1 rounded-full">
                  <Coins size={9} />
                  <span>{authorCredits.toLocaleString()} credits</span>
                </div>
              )}
            </div>
            {messagesLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
              </div>
            ) : authorMessages.length === 0 ? (
              <div className="py-6 text-center">
                <MessageCircle className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/25 text-sm">No messages yet</p>
                <p className="text-white/15 text-xs mt-1">Listeners can message you from your stories</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {authorMessages.map(msg => (
                  <div key={msg.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-white text-sm font-medium truncate">{msg.from_name}</p>
                      <div className="flex items-center gap-1 shrink-0 bg-gold/[0.08] border border-gold/20 px-2 py-0.5 rounded-full">
                        <Coins size={8} className="text-gold" />
                        <span className="text-gold text-[10px] font-mono">+{msg.author_credits_earned}</span>
                      </div>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed mb-2">{msg.message_text}</p>
                    <p className="text-white/20 text-[10px] font-mono">
                      {new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demo Connect Requests */}
          {requests.length > 0 && (
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <SectionLabel>Connect Requests</SectionLabel>
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="text-lg mt-0.5">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white text-sm font-medium truncate">{r.from}</p>
                        <div className="flex items-center gap-1 shrink-0 bg-gold/[0.08] border border-gold/20 px-2 py-0.5 rounded-full">
                          <Zap size={8} className="text-gold" />
                          <span className="text-gold text-[10px] font-mono">{r.credits}</span>
                        </div>
                      </div>
                      <p className="text-white/25 text-[10px] mt-0.5">{r.time}</p>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed mb-3">{r.message}</p>
                  <div className="flex gap-2">
                    <button onClick={() => accept(r.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gold/10 text-gold border border-gold/25 py-1.5 rounded-lg text-xs hover:bg-gold/20 transition-colors">
                      <CheckCircle size={10} /> Accept
                    </button>
                    <button onClick={() => decline(r.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-white/30 border border-white/[0.08] py-1.5 rounded-lg text-xs hover:border-white/20 hover:text-white/50 transition-colors">
                      <XCircle size={10} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Writing Streak */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <SectionLabel>Writing Streak</SectionLabel>
            <div className={`flex items-center gap-3 mb-3 ${streak.currentStreak > 0 ? FLAME_COLORS[flameLevel(streak.currentStreak)] : 'text-white/25'}`}>
              <span className="text-2xl">{streak.currentStreak > 0 ? '🔥' : '✏️'}</span>
              <div>
                <div className="font-serif font-bold text-xl">{streak.currentStreak > 0 ? `${streak.currentStreak}-day streak` : 'No streak yet'}</div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                  Best: {streak.longestStreak} days · {streak.totalStories} stories written
                </div>
              </div>
            </div>
            {streak.history.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-3">
                {streak.history.slice(-14).map(d => (
                  <div key={d} title={d} className="w-4 h-4 rounded-sm bg-gold/30" />
                ))}
              </div>
            )}
            <Link href="/create"
              className="block w-full text-center border border-gold/25 text-gold py-2 rounded-full text-xs hover:bg-gold/10 transition-all font-mono uppercase tracking-wider">
              ✍️ Write a Story Today
            </Link>
          </div>

          {/* Read-Along Sessions */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Read-Along Sessions</SectionLabel>
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 text-[9px] text-gold border border-gold/25 px-3 py-1.5 rounded-full hover:bg-gold/10 transition-colors font-mono uppercase tracking-wider">
                <Plus size={9} /> Create
              </button>
            </div>
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-tight">{s.title}</p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-mono px-2 py-0.5 rounded-full border ${s.free ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-gold bg-gold/10 border-gold/20'}`}>
                      {s.free ? 'FREE' : `₹${s.price}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/30 mb-2.5">
                    <span className="flex items-center gap-1"><Calendar size={9} /> {s.date}</span>
                    <span className="flex items-center gap-1"><Clock size={9} /> {s.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-white/30">
                      <Users size={9} /> {s.registered}/{s.capacity}
                    </div>
                    <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                      <div className="h-full bg-gold/40 rounded-full transition-all" style={{ width: `${(s.registered / s.capacity) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-white/20 font-mono">{Math.round((s.registered / s.capacity) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateSessionModal
            onClose={() => setShowCreate(false)}
            onCreated={s => setSessions(prev => [s, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [tab, setTab] = useState<'listener' | 'author'>('listener')

  return (
    <div className="min-h-screen bg-void">
      {/* Film grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")" }} />

      <AppNav showCredits />

      {/* Tab bar */}
      <div className="border-b border-white/[0.05] bg-void/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-end gap-1 pt-8 pb-0">
          <h1 className="font-serif font-bold text-2xl text-white mr-8 mb-2.5">Dashboard</h1>
          {([
            { key: 'listener', label: '🎧 Listener' },
            { key: 'author', label: '✍️ Author' },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${tab === key ? 'text-white' : 'text-white/30 hover:text-white/55'}`}>
              {label}
              {tab === key && (
                <motion.div layoutId="dashboard-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          {tab === 'listener' ? <ListenerView /> : <AuthorView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Sparkles, Loader2, Check, X, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react'
import { aiAssist, type AIMode } from '@/lib/ai'
import { publishStory, getFingerprint } from '@/lib/stories'
import { recordPublish, getStreakData, flameLevel, FLAME_COLORS, type StreakData } from '@/lib/streaks'

const GENRES = ['Drama', 'Thriller', 'Historical', 'Family', 'Spiritual', 'Fiction', 'Poetry']
const DRAFT_KEY = 'ks_create_draft'
const AUTHOR_KEY = 'ks_author_name'

const GENRE_EMOJI: Record<string, string> = {
  Drama: '🎭', Thriller: '⚡', Historical: '🏛️', Family: '🏡', Spiritual: '🪔', Fiction: '✨', Poetry: '🌸',
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return 'Just saved'
  return `Saved ${Math.floor(s / 60)}m ago`
}

// ── Streak badge ───────────────────────────────────────────────────────────────
function StreakBadge({ streak }: { streak: StreakData }) {
  const level = flameLevel(streak.currentStreak)
  const color = FLAME_COLORS[level]
  if (streak.currentStreak === 0) return null
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.03] text-xs ${color}`}>
      <span>🔥</span>
      <span className="font-mono font-medium">{streak.currentStreak}</span>
      <span className="text-white/30">day streak</span>
    </div>
  )
}

// ── AI panel ───────────────────────────────────────────────────────────────────
function AIPanel({
  open, onClose, body, genre,
  onAccept,
}: {
  open: boolean
  onClose: () => void
  body: string
  genre: string
  onAccept: (result: string, mode: AIMode) => void
}) {
  const [loading, setLoading] = useState<AIMode | null>(null)
  const [result, setResult] = useState('')
  const [activeMode, setActiveMode] = useState<AIMode | null>(null)

  const run = async (mode: AIMode) => {
    if (!body.trim()) { toast.error('Write something first'); return }
    setLoading(mode); setResult(''); setActiveMode(mode)
    try {
      const res = await aiAssist({ text: body, mode, genre })
      setResult(res.result)
    } catch (e: any) {
      toast.error(e.message || 'AI failed'); setResult('')
    } finally {
      setLoading(null)
    }
  }

  const MODES: { key: AIMode; label: string; desc: string }[] = [
    { key: 'continue', label: 'Continue Story', desc: 'Add 2–3 more paragraphs' },
    { key: 'improve', label: 'Improve Writing', desc: 'Better flow & vocabulary' },
    { key: 'title', label: 'Suggest Titles', desc: '5 title ideas for your story' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0c0918] border-l border-white/[0.07] z-50 flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-gold" />
                <span className="font-medium text-white text-sm">AI Assist</span>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 border-b border-white/[0.04]">
              <div className="space-y-2">
                {MODES.map(m => (
                  <button key={m.key} onClick={() => run(m.key)} disabled={!!loading}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                      activeMode === m.key && !loading
                        ? 'border-gold/30 bg-gold/[0.06]'
                        : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}>
                    <div>
                      <p className="text-white text-xs font-medium">{m.label}</p>
                      <p className="text-white/35 text-[10px] mt-0.5">{m.desc}</p>
                    </div>
                    {loading === m.key
                      ? <Loader2 size={13} className="text-gold animate-spin shrink-0" />
                      : activeMode === m.key && result
                      ? <Check size={13} className="text-gold shrink-0" />
                      : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading && (
                <div className="flex items-center gap-3 text-white/40 text-sm py-8 justify-center">
                  <Loader2 size={16} className="animate-spin text-gold" />
                  Generating…
                </div>
              )}
              {result && !loading && (
                <div>
                  <p className="text-[10px] text-gold/60 font-mono uppercase tracking-widest mb-3">Result</p>
                  <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-serif bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                    {result}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => { onAccept(result, activeMode!); setResult(''); setActiveMode(null) }}
                      className="flex-1 bg-gold text-void font-semibold py-2.5 rounded-full text-xs hover:bg-gold2 transition-colors">
                      {activeMode === 'continue' ? 'Append to Story' : activeMode === 'title' ? 'Copy Titles' : 'Replace Text'}
                    </button>
                    <button onClick={() => { setResult(''); setActiveMode(null) }}
                      className="px-4 text-white/35 hover:text-white text-xs transition-colors">
                      Discard
                    </button>
                  </div>
                </div>
              )}
              {!result && !loading && (
                <p className="text-white/20 text-xs text-center py-8 leading-relaxed">
                  Choose an action above to get AI suggestions for your story.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<'setup' | 'write'>('setup')
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('Drama')
  const [body, setBody] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiUsed, setAiUsed] = useState(false)
  const [distraction, setDistraction] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [fp, setFp] = useState('')
  const [showPenName, setShowPenName] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fingerprint = getFingerprint()
    setFp(fingerprint)
    const name = localStorage.getItem(AUTHOR_KEY) || ''
    setAuthorName(name)
    setStreak(getStreakData())
    // Restore draft
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const d = JSON.parse(draft)
        if (d.title) setTitle(d.title)
        if (d.genre) setGenre(d.genre)
        if (d.body) setBody(d.body)
        if (d.step) setStep(d.step)
      }
    } catch {}
  }, [])

  // Auto-save draft
  const saveDraft = useCallback(() => {
    if (!title && !body) return
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, genre, body, step }))
    setLastSaved(new Date())
  }, [title, genre, body, step])

  useEffect(() => {
    const t = setTimeout(saveDraft, 1500)
    return () => clearTimeout(t)
  }, [saveDraft])

  const wc = wordCount(body)
  const canPublish = title.trim().length > 0 && body.trim().length > 50

  const handlePublish = async () => {
    if (!canPublish) return
    if (!authorName.trim()) { setShowPenName(true); return }
    setPublishing(true)
    try {
      const story = await publishStory({
        fingerprint: fp,
        author_name: authorName.trim() || 'Anonymous',
        title: title.trim(),
        body: body.trim(),
        genre,
        ai_assisted: aiUsed,
      })
      const updated = recordPublish()
      setStreak(updated)
      localStorage.removeItem(DRAFT_KEY)
      toast.success('Story published! 🎉')
      router.push(`/stories/${story.id}`)
    } catch (e: any) {
      toast.error(e.message || 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const handleAIAccept = (result: string, mode: AIMode) => {
    if (mode === 'continue') {
      setBody(prev => prev.trimEnd() + '\n\n' + result)
    } else if (mode === 'title') {
      // Just copy first suggestion
      const first = result.split('\n')[0].replace(/^\d+\.\s*/, '').trim()
      setTitle(first)
      toast.success('Title applied!')
    } else {
      setBody(result)
    }
    setAiUsed(true)
    setAiOpen(false)
  }

  const saveName = () => {
    localStorage.setItem(AUTHOR_KEY, authorName.trim())
    setShowPenName(false)
    handlePublish()
  }

  return (
    <div className={`min-h-screen bg-void flex flex-col ${distraction ? 'bg-[#07050f]' : ''}`}>

      {/* Pen name modal */}
      <AnimatePresence>
        {showPenName && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0d0a1a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-serif text-xl text-white mb-2">Your pen name</h3>
              <p className="text-white/35 text-sm mb-5">This appears on all your stories. You can change it anytime.</p>
              <input value={authorName} onChange={e => setAuthorName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                placeholder="Your name or pseudonym"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-gold/40 mb-4 placeholder-white/20" />
              <div className="flex gap-3">
                <button onClick={saveName}
                  className="flex-1 bg-gold text-void font-semibold py-2.5 rounded-full text-sm hover:bg-gold2 transition-colors">
                  Publish Story
                </button>
                <button onClick={() => { setAuthorName('Anonymous'); setShowPenName(false); handlePublish() }}
                  className="px-4 text-white/35 hover:text-white text-sm transition-colors">
                  Skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Panel */}
      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} body={body} genre={genre} onAccept={handleAIAccept} />

      {/* Nav */}
      {!distraction && (
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 bg-void/90 backdrop-blur-xl border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <Link href="/stories" className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <span className="font-serif font-bold text-white text-sm hidden sm:block">KadhaiSolai</span>
            <span className="text-white/25 text-xs hidden sm:block">/ Create</span>
          </div>
          <div className="flex items-center gap-3">
            {streak && <StreakBadge streak={streak} />}
            {lastSaved && (
              <span className="text-[10px] text-white/25 font-mono hidden sm:block">{timeAgo(lastSaved)}</span>
            )}
            {step === 'write' && (
              <>
                <button onClick={() => setDistraction(d => !d)} title="Distraction-free mode"
                  className="text-white/35 hover:text-white transition-colors">
                  {distraction ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button onClick={() => setAiOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-gold border border-gold/25 px-3 py-1.5 rounded-full hover:bg-gold/10 transition-colors">
                  <Sparkles size={11} /> AI Assist
                </button>
              </>
            )}
          </div>
        </header>
      )}

      {/* ── STEP: SETUP ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.main key="setup"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-xl mx-auto w-full">

            <div className="w-full mb-10">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-px w-5 bg-gold/40" />
                <p className="font-mono text-[9px] tracking-[0.35em] text-gold/55 uppercase">New Story</p>
              </div>

              <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-2">Story Title *</label>
              <input
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="உங்கள் கதையின் தலைப்பு…"
                className="w-full bg-transparent border-b border-white/[0.12] pb-3 text-white text-2xl font-serif outline-none placeholder-white/15 focus:border-gold/40 transition-colors mb-10"
                autoFocus
              />

              <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-3">Genre</label>
              <div className="flex flex-wrap gap-2 mb-10">
                {GENRES.map(g => (
                  <button key={g} onClick={() => setGenre(g)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs border transition-all ${
                      genre === g
                        ? 'border-gold/40 bg-gold/10 text-gold'
                        : 'border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/65'
                    }`}>
                    <span>{GENRE_EMOJI[g]}</span> {g}
                  </button>
                ))}
              </div>

              <label className="block text-[10px] text-white/40 font-mono uppercase tracking-widest mb-2">Your Pen Name</label>
              <input value={authorName} onChange={e => setAuthorName(e.target.value)}
                placeholder="Anonymous"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-gold/40 transition-colors mb-10" />

              <button
                onClick={() => { if (!title.trim()) { toast.error('Add a title first'); return } localStorage.setItem(AUTHOR_KEY, authorName.trim()); setStep('write') }}
                className="w-full bg-gold text-void font-semibold py-3.5 rounded-full text-sm hover:bg-gold2 transition-all hover:-translate-y-0.5">
                Start Writing →
              </button>
            </div>

            {streak && streak.currentStreak > 0 && (
              <div className="flex items-center gap-2 text-xs text-white/25">
                <span>🔥</span>
                <span>{streak.currentStreak}-day streak · {streak.totalStories} stories published</span>
              </div>
            )}
          </motion.main>
        )}

        {/* ── STEP: WRITE ─────────────────────────────────────────────────────── */}
        {step === 'write' && (
          <motion.main key="write"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col">

            {/* Title bar */}
            {!distraction && (
              <div className="border-b border-white/[0.04] px-6 py-3 flex items-center gap-4">
                <button onClick={() => setStep('setup')} className="text-white/30 hover:text-white transition-colors text-xs">
                  ← Setup
                </button>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="flex-1 bg-transparent text-white font-serif text-lg outline-none placeholder-white/20 min-w-0"
                  placeholder="Story title…" />
                <span className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.02] text-white/30 shrink-0">
                  <span>{GENRE_EMOJI[genre]}</span> {genre}
                </span>
              </div>
            )}

            {/* Editor */}
            <div className={`flex-1 relative ${distraction ? 'py-16 px-8' : 'py-8 px-6'}`}>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="உங்கள் கதையை இங்கே எழுதுங்கள்…

Write your story here. Tamil or English — your choice."
                className={`w-full h-full resize-none bg-transparent text-white/85 outline-none placeholder-white/15 font-serif leading-[2.1] ${
                  distraction ? 'text-xl max-w-2xl mx-auto block' : 'text-base'
                }`}
                style={{ minHeight: distraction ? '60vh' : '50vh' }}
              />
            </div>

            {/* Bottom bar */}
            <div className={`border-t border-white/[0.05] px-6 py-4 flex items-center justify-between gap-4 bg-void/80 backdrop-blur-sm ${distraction ? 'fixed bottom-0 left-0 right-0 z-20' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="text-xs font-mono">
                  <span className={wc >= 500 ? 'text-gold' : 'text-white/35'}>{wc}</span>
                  <span className="text-white/20"> / 500 words</span>
                </div>
                {wc > 0 && (
                  <div className="h-1 w-24 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gold/50 transition-all duration-300"
                      style={{ width: `${Math.min((wc / 500) * 100, 100)}%` }} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {aiUsed && (
                  <span className="text-[9px] text-gold/50 font-mono px-2 py-1 border border-gold/15 rounded-full">AI assisted</span>
                )}
                <button onClick={() => setAiOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors border border-white/[0.08] px-3 py-2 rounded-full hover:border-white/20 sm:hidden">
                  <Sparkles size={11} /> AI
                </button>
                <button onClick={handlePublish}
                  disabled={!canPublish || publishing}
                  className="flex items-center gap-2 bg-gold text-void font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-gold2 transition-all disabled:opacity-35 disabled:cursor-not-allowed">
                  {publishing ? <Loader2 size={13} className="animate-spin" /> : null}
                  Publish Story
                </button>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

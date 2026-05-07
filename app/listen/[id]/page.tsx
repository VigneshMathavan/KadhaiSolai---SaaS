'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Heart, Headphones, Clock, BookOpen, ExternalLink,
  Play, Pause, Volume2, VolumeX, X, ChevronUp, ChevronDown,
  ListMusic, Gauge, Waves, SkipBack, SkipForward, Flame,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { DEMO_BOOKS, type DemoBook } from '@/lib/demo-books'
import AppNav from '@/components/AppNav'
import {
  getProgress, updateProgress, recordListenDay, getListeningStats, fmtDuration,
} from '@/lib/listening'
import {
  getQueue, addToQueue, removeFromQueue, clearQueue, moveInQueue,
  isInQueue, getNextAfter, dequeueId, type QueueItem,
} from '@/lib/queue'

declare global { interface Window { YT: any; onYouTubeIframeAPIReady: () => void } }

const WAVEFORM = Array.from({ length: 64 }, (_, i) =>
  Math.round(18 + Math.sin(i * 0.52) * 14 + Math.sin(i * 0.31) * 18 + Math.sin(i * 1.1) * 7)
)
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const RELATED_COUNT = 4

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
const PLAYS = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

// ── Queue Panel ───────────────────────────────────────────────────────────────
function QueuePanel({
  queue, currentId, onClose, onRefresh,
}: {
  queue: QueueItem[]; currentId: string; onClose: () => void; onRefresh: () => void
}) {
  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
      className="fixed right-0 top-0 bottom-0 w-72 sm:w-80 z-50 bg-[#080613] border-l border-white/[0.07] shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <ListMusic size={13} className="text-gold/60" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase">
            Queue · {queue.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {queue.length > 0 && (
            <button onClick={() => { clearQueue(); onRefresh() }}
              className="text-[9px] font-mono text-white/20 hover:text-red-400 uppercase tracking-wider transition-colors">
              Clear all
            </button>
          )}
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.05] transition-all">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListMusic className="w-8 h-8 text-white/10 mb-3" />
            <p className="text-white/25 text-sm mb-1">Queue is empty</p>
            <p className="text-white/15 text-xs leading-relaxed">
              Add books to listen without stopping
            </p>
          </div>
        ) : (
          queue.map((item, i) => (
            <div key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                item.id === currentId
                  ? 'border-gold/25 bg-gold/[0.04]'
                  : 'border-white/[0.05] bg-white/[0.015] hover:border-white/[0.1]'
              }`}>
              <div className="relative w-11 h-7 rounded-lg overflow-hidden shrink-0 border border-white/[0.06]">
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="44px" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/listen/${item.id}`}
                  className="text-white text-[11px] font-medium truncate block hover:text-gold2 transition-colors">
                  {item.title}
                </Link>
                <p className="text-white/25 text-[9px]">{item.duration}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {i > 0 && (
                  <button onClick={() => { moveInQueue(item.id, -1); onRefresh() }}
                    className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors">
                    <ChevronUp size={10} />
                  </button>
                )}
                {i < queue.length - 1 && (
                  <button onClick={() => { moveInQueue(item.id, 1); onRefresh() }}
                    className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors">
                    <ChevronDown size={10} />
                  </button>
                )}
                <button onClick={() => { removeFromQueue(item.id); onRefresh() }}
                  className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors ml-0.5">
                  <X size={10} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: next up */}
      {queue.length > 0 && (
        <div className="px-5 py-3 border-t border-white/[0.05]">
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
            Auto-plays when current story ends
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [book, setBook] = useState<DemoBook | null>(null)
  const [liked, setLiked] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  // Player state
  const [playing, setPlaying]       = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]     = useState(0)
  const [muted, setMuted]           = useState(false)
  const [ytReady, setYtReady]       = useState(false)
  const [ytStatus, setYtStatus]     = useState<'loading' | 'ready' | 'error'>('loading')

  // New features state
  const [speed, setSpeedState]      = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [ambientOn, setAmbientOn]   = useState(false)
  const [showQueue, setShowQueue]   = useState(false)
  const [queue, setQueueState]      = useState<QueueItem[]>([])
  const [inQueue, setInQueue]       = useState(false)
  const [savedProgress, setSavedProgress] = useState<{ pct: number; pos: number } | null>(null)
  const [listenStats, setListenStats] = useState({ streak: 0, totalTime: 0 })

  // Refs
  const playerRef    = useRef<any>(null)
  const intervalRef  = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastSaveRef  = useRef<number>(0)
  const sessionRef   = useRef(false)
  const durationRef  = useRef(0)

  // Ambient Web Audio refs
  const ambCtxRef  = useRef<AudioContext | null>(null)
  const ambSrcRef  = useRef<AudioBufferSourceNode | null>(null)
  const ambGainRef = useRef<GainNode | null>(null)

  // ── Queue helpers ──────────────────────────────────────────────────────────
  const refreshQueue = useCallback(() => {
    const q = getQueue()
    setQueueState(q)
    setInQueue(isInQueue(id || ''))
  }, [id])

  // ── Ambient ────────────────────────────────────────────────────────────────
  const startAmbient = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ambCtxRef.current = ctx
      const len = 2 * ctx.sampleRate
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const d = buf.getChannelData(0)
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980
        d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11
        b6 = w * 0.115926
      }
      const src = ctx.createBufferSource()
      src.buffer = buf; src.loop = true
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'; lp.frequency.value = 320
      const gain = ctx.createGain(); gain.gain.value = 0.07
      ambGainRef.current = gain
      src.connect(lp); lp.connect(gain); gain.connect(ctx.destination)
      src.start(); ambSrcRef.current = src
    } catch {}
  }, [])

  const stopAmbient = useCallback(() => {
    try { ambSrcRef.current?.stop() } catch {}
    try { ambCtxRef.current?.close() } catch {}
    ambCtxRef.current = null; ambSrcRef.current = null; ambGainRef.current = null
  }, [])

  const toggleAmbient = () => {
    if (ambientOn) { stopAmbient(); setAmbientOn(false); toast('Ambient off') }
    else { startAmbient(); setAmbientOn(true); toast('🌧 Ambient on') }
  }

  // ── Load book + init ───────────────────────────────────────────────────────
  useEffect(() => {
    const found = DEMO_BOOKS.find(b => b.id === id) ?? null
    setBook(found)
    setImgErr(false); setPlaying(false); setCurrentTime(0); setDuration(0)
    setYtReady(false); setYtStatus('loading'); setSpeedState(1)
    setShowSpeedMenu(false); setShowQueue(false)
    sessionRef.current = false; lastSaveRef.current = 0; durationRef.current = 0

    if (found) {
      const prog = getProgress(found.id)
      if (prog && prog.completionPct < 90 && prog.lastPosition > 10) {
        setSavedProgress({ pct: prog.completionPct, pos: prog.lastPosition })
      } else {
        setSavedProgress(null)
      }
    }
    const stats = getListeningStats()
    setListenStats({ streak: stats.currentStreak, totalTime: stats.totalTime })
    refreshQueue()
    if (playerRef.current) { try { playerRef.current.destroy() } catch {} playerRef.current = null }
    if (intervalRef.current) clearInterval(intervalRef.current)
    window.scrollTo(0, 0)
    stopAmbient(); setAmbientOn(false)
  }, [id, refreshQueue, stopAmbient])

  // ── YouTube player ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!book) return

    const initPlayer = () => {
      if (!containerRef.current) return
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '1', width: '1',
          videoId: book.ytId,
          playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1, fs: 0 },
          events: {
            onReady: (e: any) => {
              const dur = e.target.getDuration()
              setDuration(dur); durationRef.current = dur
              setYtReady(true); setYtStatus('ready')
              // Resume from saved position
              const prog = getProgress(book.id)
              if (prog && prog.completionPct < 90 && prog.lastPosition > 10) {
                e.target.seekTo(prog.lastPosition, true)
                setCurrentTime(prog.lastPosition)
                toast(`Resuming from ${fmt(prog.lastPosition)}`, { icon: '▶️' })
              }
            },
            onStateChange: (e: any) => {
              if (e.data === 1) {
                // Playing
                setPlaying(true)
                if (!sessionRef.current) {
                  sessionRef.current = true
                  recordListenDay()
                  const s = getListeningStats()
                  setListenStats({ streak: s.currentStreak, totalTime: s.totalTime })
                }
                intervalRef.current = setInterval(() => {
                  if (!playerRef.current?.getCurrentTime) return
                  const t = playerRef.current.getCurrentTime()
                  const dur = playerRef.current.getDuration()
                  setCurrentTime(t); setDuration(dur); durationRef.current = dur
                  // Save progress every 5 s
                  if (book && t - lastSaveRef.current >= 5) {
                    lastSaveRef.current = t
                    updateProgress(book.id, book.title, book.genre, book.thumbnail, t, dur)
                    try {
                      localStorage.setItem('ks_current_book', JSON.stringify({
                        id: book.id, title: book.title, genre: book.genre,
                        thumbnail: book.thumbnail,
                        progress: dur > 0 ? Math.round((t / dur) * 100) : 0,
                      }))
                    } catch {}
                  }
                }, 500)
              } else {
                setPlaying(false)
                if (intervalRef.current) clearInterval(intervalRef.current)
                if (e.data === 0) {
                  // Ended — save 100%, auto-play next from queue
                  if (book) {
                    updateProgress(book.id, book.title, book.genre, book.thumbnail,
                      durationRef.current, durationRef.current)
                  }
                  const next = getNextAfter(id)
                  if (next) {
                    dequeueId(next.id)
                    toast(`▶ Playing next: ${next.title.slice(0, 30)}…`)
                    router.push(`/listen/${next.id}`)
                  } else {
                    setCurrentTime(0)
                  }
                }
              }
            },
            onError: () => setYtStatus('error'),
          },
        })
      } catch { setYtStatus('error') }
    }

    if (window.YT?.Player) { initPlayer() }
    else {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => { prev?.(); initPlayer() }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [book, id, router])

  // Cleanup ambient on unmount
  useEffect(() => () => { stopAmbient() }, [stopAmbient])

  // ── Controls ───────────────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!ytReady || !playerRef.current) return
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  const skip = (sec: number) => {
    if (!ytReady || !playerRef.current) return
    const t = Math.max(0, Math.min(durationRef.current, currentTime + sec))
    playerRef.current.seekTo(t, true); setCurrentTime(t)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ytReady || !playerRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    playerRef.current.seekTo(pct * duration, true); setCurrentTime(pct * duration)
  }

  const changeSpeed = (rate: number) => {
    setSpeedState(rate)
    if (playerRef.current?.setPlaybackRate) playerRef.current.setPlaybackRate(rate)
    setShowSpeedMenu(false)
    toast(`${rate}× speed`, { icon: '⚡', duration: 1200 })
  }

  const toggleMute = () => {
    if (!playerRef.current) return
    if (muted) { playerRef.current.unMute(); setMuted(false) }
    else { playerRef.current.mute(); setMuted(true) }
  }

  const toggleQueueItem = () => {
    if (!book) return
    if (inQueue) {
      removeFromQueue(book.id)
      toast('Removed from queue')
    } else {
      addToQueue({ id: book.id, ytId: book.ytId, title: book.title, genre: book.genre, thumbnail: book.thumbnail, duration: book.duration, narrator: book.narrator })
      toast('Added to queue', { icon: '📋' })
    }
    refreshQueue()
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!book) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 opacity-20">📖</div>
        <p className="text-white/30 text-sm">Story not found</p>
        <Link href="/listen" className="mt-4 inline-block text-gold text-sm hover:text-gold2 transition-colors">← Back to library</Link>
      </div>
    </div>
  )

  const related = DEMO_BOOKS
    .filter(b => b.id !== book.id && (b.genre === book.genre || b.seriesName === book.seriesName))
    .slice(0, RELATED_COUNT)

  return (
    <div className="min-h-screen bg-void">

      {/* Hidden YouTube audio iframe */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden>
        <div ref={containerRef} />
      </div>

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.022]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")" }} />

      {/* Ambient blur background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {!imgErr && (
          <div className="absolute inset-0 scale-110 blur-3xl opacity-[0.07]"
            style={{ backgroundImage: `url(${book.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(74,45,138,0.4) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/95 to-void/80" />
      </div>

      {/* Queue overlay backdrop */}
      <AnimatePresence>
        {showQueue && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowQueue(false)} />
        )}
      </AnimatePresence>

      {/* Queue panel */}
      <AnimatePresence>
        {showQueue && (
          <QueuePanel
            queue={queue} currentId={book.id}
            onClose={() => setShowQueue(false)}
            onRefresh={refreshQueue}
          />
        )}
      </AnimatePresence>

      {/* NAV */}
      <AppNav showCredits />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
        <div className="grid lg:grid-cols-[1fr,340px] gap-8 lg:gap-14">

          {/* ── LEFT: Player ── */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">
                {book.genre}
              </span>
              {book.part && (
                <span className="font-mono text-[9px] tracking-[0.3em] text-gold/60 uppercase bg-gold/[0.06] border border-gold/[0.15] px-3 py-1.5 rounded-full">
                  Part {book.part} of {book.seriesName}
                </span>
              )}
              <span className="font-mono text-[9px] tracking-[0.3em] text-white/25 uppercase">{book.type}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif font-bold text-white leading-[0.9] mb-2"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)' }}>
              {book.title}
            </h1>
            <p className="text-white/35 font-mono text-sm tracking-wider mb-2">{book.titleEn}</p>
            <div className="flex flex-wrap items-center gap-3 text-white/30 text-[12px] mb-7">
              <span className="flex items-center gap-1.5"><Headphones size={12} />{PLAYS(book.plays)} plays</span>
              <span className="flex items-center gap-1.5"><Clock size={12} />{book.duration}</span>
              <span>· <span className="text-white/50">{book.narrator}</span></span>
            </div>

            {/* Thumbnail — mobile */}
            <div className="lg:hidden mb-6 relative aspect-video rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/50">
              {!imgErr
                ? <Image src={book.thumbnail} alt={book.title} fill className="object-cover" onError={() => setImgErr(true)} sizes="100vw" priority />
                : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple/40 to-void"><span className="text-7xl">📖</span></div>
              }
            </div>

            {/* Queue "next up" banner */}
            {queue.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <ListMusic size={12} className="text-gold/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Next up · </span>
                  <span className="text-white/50 text-xs truncate">{getNextAfter(book.id)?.title || queue[0]?.title}</span>
                </div>
                <button onClick={() => setShowQueue(true)}
                  className="text-[9px] text-gold/60 hover:text-gold font-mono uppercase tracking-wider transition-colors shrink-0">
                  View queue
                </button>
              </motion.div>
            )}

            {/* Resume banner */}
            {savedProgress && !playing && currentTime < 5 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gold/[0.15] bg-gold/[0.04]">
                <div className="h-1 flex-1 bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-gold/60 rounded-full" style={{ width: `${savedProgress.pct}%` }} />
                </div>
                <span className="text-gold/60 text-[10px] font-mono shrink-0">{savedProgress.pct}% · {fmt(savedProgress.pos)}</span>
                <span className="text-gold/40 text-[9px] font-mono uppercase shrink-0">Saved</span>
              </motion.div>
            )}

            {/* ── Audio Player Card ── */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.015] mb-6 shadow-2xl shadow-black/60">
              <div className="absolute inset-0 opacity-25 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(74,45,138,0.6) 0%, transparent 65%)' }} />

              <div className="relative p-6 sm:p-8">
                {/* Status */}
                <div className="flex items-center gap-2.5 mb-7">
                  {playing ? (
                    <div className="flex items-end gap-[2.5px] h-4">
                      {[0.7,1,0.5,0.85,0.6].map((h, i) => (
                        <motion.div key={i} className="w-[3px] rounded-full bg-gold"
                          animate={{ scaleY: [h, 1, h] }}
                          transition={{ duration: 0.45 + i * 0.09, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
                          style={{ height: '100%', transformOrigin: 'bottom' }} />
                      ))}
                    </div>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${ytStatus === 'ready' ? 'bg-white/25' : 'bg-white/10 animate-pulse'}`} />
                  )}
                  <span className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase">
                    {playing ? 'Now Playing · Tamil Audio'
                      : ytStatus === 'loading' ? 'Loading audio…'
                      : ytStatus === 'error' ? 'Error — open on YouTube'
                      : 'Ready to play'}
                  </span>
                  {speed !== 1 && (
                    <span className="ml-auto font-mono text-[9px] text-gold/60 bg-gold/[0.08] px-2 py-0.5 rounded-full">
                      {speed}×
                    </span>
                  )}
                </div>

                {/* Waveform */}
                <div className="flex items-end gap-[2px] h-14 mb-7 select-none">
                  {WAVEFORM.map((h, i) => {
                    const active = progress > 0 && (i / WAVEFORM.length) * 100 <= progress
                    return (
                      <motion.div key={i}
                        className={`flex-1 rounded-full transition-colors duration-300 ${active ? 'bg-gold/60' : 'bg-white/[0.08]'}`}
                        style={{ height: `${h}%` }}
                        animate={playing && active ? { scaleY: [1, 1.15, 0.9, 1] } : { scaleY: 1 }}
                        transition={{ duration: 0.6, repeat: playing ? Infinity : 0, delay: i * 0.02, ease: 'easeInOut' }} />
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div className="mb-7 cursor-pointer group/seek" onClick={seek}>
                  <div className="h-[3px] rounded-full bg-white/[0.07] relative">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold via-gold2 to-gold rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold shadow-lg shadow-gold/50 -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity"
                      style={{ left: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="font-mono text-[10px] text-white/25 tabular-nums">{fmt(currentTime)}</span>
                    <span className="font-mono text-[10px] text-white/15 tabular-nums">{Math.round(progress)}%</span>
                    <span className="font-mono text-[10px] text-white/25 tabular-nums">{fmt(duration)}</span>
                  </div>
                </div>

                {/* Row 1: Skip + Play + Skip */}
                <div className="flex items-center justify-center gap-5 mb-5">
                  <button onClick={() => skip(-10)} disabled={!ytReady}
                    className="group flex flex-col items-center gap-0.5 text-white/35 hover:text-white disabled:opacity-30 transition-colors">
                    <SkipBack size={20} />
                    <span className="font-mono text-[8px]">10s</span>
                  </button>

                  <motion.button onClick={togglePlay} disabled={!ytReady}
                    whileHover={ytReady ? { scale: 1.06 } : {}} whileTap={ytReady ? { scale: 0.94 } : {}}
                    className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-void shadow-xl shadow-gold/30 hover:bg-gold2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <AnimatePresence mode="wait">
                      {playing
                        ? <motion.div key="p" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Pause size={24} /></motion.div>
                        : <motion.div key="pl" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Play size={24} className="ml-0.5" /></motion.div>
                      }
                    </AnimatePresence>
                  </motion.button>

                  <button onClick={() => skip(10)} disabled={!ytReady}
                    className="group flex flex-col items-center gap-0.5 text-white/35 hover:text-white disabled:opacity-30 transition-colors">
                    <SkipForward size={20} />
                    <span className="font-mono text-[8px]">10s</span>
                  </button>
                </div>

                {/* Row 2: Mute + Speed ← → Ambient + Queue */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all">
                      {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>

                    {/* Speed */}
                    <div className="relative">
                      <button onClick={() => setShowSpeedMenu(s => !s)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-mono transition-all ${
                          speed !== 1 ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/[0.08] text-white/35 hover:border-gold/30 hover:text-gold'
                        }`}>
                        <Gauge size={10} /> {speed}×
                      </button>
                      <AnimatePresence>
                        {showSpeedMenu && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                            className="absolute bottom-full mb-2 left-0 bg-[#0d0a1a] border border-white/[0.1] rounded-xl p-1.5 flex gap-1 shadow-xl z-20">
                            {SPEEDS.map(s => (
                              <button key={s} onClick={() => changeSpeed(s)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                                  speed === s ? 'bg-gold text-void' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
                                }`}>
                                {s}×
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ambient */}
                    <button onClick={toggleAmbient}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-mono transition-all ${
                        ambientOn
                          ? 'border-blue-400/40 bg-blue-400/10 text-blue-300'
                          : 'border-white/[0.08] text-white/30 hover:border-blue-400/30 hover:text-blue-300'
                      }`}>
                      <Waves size={10} /> {ambientOn ? 'On' : 'Ambient'}
                    </button>

                    {/* Queue toggle */}
                    <button onClick={toggleQueueItem}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-mono transition-all ${
                        inQueue
                          ? 'border-gold/40 bg-gold/10 text-gold'
                          : 'border-white/[0.08] text-white/30 hover:border-gold/30 hover:text-gold'
                      }`}>
                      <ListMusic size={10} />
                      {inQueue ? 'In queue' : '+ Queue'}
                    </button>

                    {/* Open queue panel */}
                    {queue.length > 0 && (
                      <button onClick={() => { refreshQueue(); setShowQueue(q => !q) }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-gold hover:bg-white/[0.05] transition-all relative">
                        <ListMusic size={13} />
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold text-void text-[8px] font-bold flex items-center justify-center">
                          {queue.length}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Attribution */}
                <div className="mt-6 pt-4 border-t border-white/[0.05] text-center">
                  <a href="https://www.youtube.com/@kadhaisolai" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white/18 hover:text-white/40 transition-colors font-mono text-[8px] tracking-[0.3em] uppercase">
                    <ExternalLink size={8} /> Audio via YouTube · @kadhaisolai
                  </a>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] mb-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen size={14} className="text-gold/50" />
                <span className="font-mono text-[9px] tracking-[0.3em] text-white/25 uppercase">About this story</span>
              </div>
              <p className="text-white/45 text-sm leading-relaxed">{book.description}</p>
            </div>

            {/* Series nav */}
            {book.seriesName && (
              <div className="p-5 sm:p-6 rounded-2xl border border-gold/[0.12] bg-gold/[0.03]">
                <p className="font-mono text-[9px] tracking-[0.3em] text-gold/50 uppercase mb-4">More from {book.seriesName}</p>
                <div className="space-y-2">
                  {DEMO_BOOKS.filter(b => b.seriesName === book.seriesName).map(b => (
                    <Link key={b.id} href={`/listen/${b.id}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm ${
                        b.id === book.id ? 'bg-gold/[0.08] border border-gold/[0.2] text-gold' : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
                      }`}>
                      <span className="font-mono text-[10px] text-white/25 w-6">P{b.part}</span>
                      <span className="flex-1 truncate font-serif">{b.title}</span>
                      {b.id === book.id && <span className="font-mono text-[8px] text-gold/60 uppercase">Playing</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Cover + Info ── */}
          <div className="space-y-5">

            {/* Cover — desktop */}
            <div className="hidden lg:block relative aspect-video rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/50">
              {!imgErr
                ? <Image src={book.thumbnail} alt={book.title} fill className="object-cover" onError={() => setImgErr(true)} sizes="340px" priority />
                : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple/40 to-void"><span className="text-7xl">📖</span></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-void/50 to-transparent" />
              {liked && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-400/80 backdrop-blur-sm flex items-center justify-center">
                  <Heart size={14} fill="white" className="text-white" />
                </motion.div>
              )}
            </div>

            {/* Your Progress */}
            {savedProgress && (
              <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
                <p className="font-mono text-[9px] tracking-[0.3em] text-white/25 uppercase mb-3">Your Progress</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${savedProgress.pct}%` }} />
                  </div>
                  <span className="font-mono text-xs text-gold shrink-0">{savedProgress.pct}%</span>
                </div>
                <p className="text-white/30 text-xs">Last at {fmt(savedProgress.pos)} · resuming automatically</p>
              </div>
            )}

            {/* Listening Stats */}
            {(listenStats.streak > 0 || listenStats.totalTime > 0) && (
              <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
                <p className="font-mono text-[9px] tracking-[0.3em] text-white/25 uppercase mb-3">Your Stats</p>
                <div className="flex items-center gap-4">
                  {listenStats.streak > 0 && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <Flame size={14} />
                      <div>
                        <div className="font-serif font-bold text-lg leading-none">{listenStats.streak}</div>
                        <div className="text-[9px] font-mono text-white/25 uppercase tracking-wider">day streak</div>
                      </div>
                    </div>
                  )}
                  {listenStats.totalTime > 0 && (
                    <div className="flex items-center gap-2 text-gold/70">
                      <Headphones size={14} />
                      <div>
                        <div className="font-serif font-bold text-lg leading-none">{fmtDuration(listenStats.totalTime)}</div>
                        <div className="text-[9px] font-mono text-white/25 uppercase tracking-wider">listened</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Narrator */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-gold flex items-center justify-center text-lg shrink-0">🎙️</div>
                <div>
                  <p className="text-white text-sm font-medium">{book.narrator}</p>
                  <p className="text-white/30 text-xs">Voice Narrator · KadhaiSolai</p>
                </div>
              </div>
              <p className="text-white/30 text-xs leading-relaxed">
                RJ Devi brings Tamil literature to life with expressive, natural narration — every story feels like a personal telling.
              </p>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-white/20 uppercase mb-4">You might also like</p>
                <div className="space-y-2">
                  {related.map(r => (
                    <Link key={r.id} href={`/listen/${r.id}`}
                      className="flex items-center gap-3 group hover:bg-white/[0.03] p-2 -mx-2 rounded-xl transition-all">
                      <div className="relative w-14 h-9 rounded-lg overflow-hidden shrink-0 border border-white/[0.08]">
                        <Image src={r.thumbnail} alt={r.title} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-white/70 text-[12px] font-semibold group-hover:text-gold2 transition-colors truncate">{r.title}</p>
                        <p className="text-white/25 text-[10px]">{r.duration} · {r.genre}</p>
                      </div>
                      <ChevronLeft size={12} className="text-white/20 group-hover:text-white/40 rotate-180 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-purple/[0.1] to-transparent">
              <p className="font-serif text-white text-sm mb-1">Have a Tamil story?</p>
              <p className="text-white/30 text-xs leading-relaxed mb-4">Upload your text — our AI narrates it for the world to hear.</p>
              <Link href="/author"
                className="flex items-center justify-center gap-2 bg-gold text-void font-semibold text-xs px-4 py-2.5 rounded-full hover:bg-gold2 transition-colors w-full">
                Upload Your Book
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

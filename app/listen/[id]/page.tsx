'use client'
import { useParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Heart, Headphones, Clock, BookOpen, ExternalLink, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { DEMO_BOOKS, type DemoBook } from '@/lib/demo-books'

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void }
}

const RELATED_COUNT = 4
const WAVEFORM = Array.from({ length: 64 }, (_, i) =>
  Math.round(18 + Math.sin(i * 0.52) * 14 + Math.sin(i * 0.31) * 18 + Math.sin(i * 1.1) * 7)
)

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const PLAYS_DISPLAY = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<DemoBook | null>(null)
  const [liked, setLiked] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [ytReady, setYtReady] = useState(false)
  const [ytStatus, setYtStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const found = DEMO_BOOKS.find(b => b.id === id)
    setBook(found || null)
    setImgErr(false)
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setYtReady(false)
    setYtStatus('loading')
    if (playerRef.current) { try { playerRef.current.destroy() } catch {} playerRef.current = null }
    if (intervalRef.current) clearInterval(intervalRef.current)
    window.scrollTo(0, 0)
  }, [id])

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
              setDuration(e.target.getDuration())
              setYtReady(true)
              setYtStatus('ready')
            },
            onStateChange: (e: any) => {
              if (e.data === 1) {
                setPlaying(true)
                intervalRef.current = setInterval(() => {
                  if (playerRef.current?.getCurrentTime) {
                    setCurrentTime(playerRef.current.getCurrentTime())
                    setDuration(playerRef.current.getDuration())
                  }
                }, 500)
              } else {
                setPlaying(false)
                if (intervalRef.current) clearInterval(intervalRef.current)
                if (e.data === 0) setCurrentTime(0)
              }
            },
            onError: () => setYtStatus('error'),
          },
        })
      } catch { setYtStatus('error') }
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => { prev?.(); initPlayer() }
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [book])

  const togglePlay = () => {
    if (!ytReady || !playerRef.current) return
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  const restart = () => {
    if (!ytReady || !playerRef.current) return
    playerRef.current.seekTo(0, true)
    playerRef.current.playVideo()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ytReady || !playerRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    playerRef.current.seekTo(pct * duration, true)
    setCurrentTime(pct * duration)
  }

  const toggleMute = () => {
    if (!playerRef.current) return
    if (muted) { playerRef.current.unMute(); setMuted(false) }
    else { playerRef.current.mute(); setMuted(true) }
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

      {/* Ambient blurred thumbnail */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {!imgErr && (
          <div className="absolute inset-0 scale-110 blur-3xl opacity-[0.07]"
            style={{ backgroundImage: `url(${book.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(74,45,138,0.4) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/95 to-void/80" />
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-4 bg-void/80 backdrop-blur-xl border-b border-white/[0.05]">
        <Link href="/listen" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ChevronLeft size={16} /><span className="hidden sm:inline">Library</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple to-gold flex items-center justify-center text-xs">🎧</div>
          <span className="font-serif font-bold text-sm text-white hidden sm:block">KadhaiSolai</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => setLiked(l => !l)}
            className={`transition-colors ${liked ? 'text-pink-400' : 'text-white/35 hover:text-white'}`}>
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <a href={`https://www.youtube.com/watch?v=${book.ytId}`} target="_blank" rel="noopener noreferrer"
            className="text-white/35 hover:text-white transition-colors" title="Watch on YouTube">
            <ExternalLink size={16} />
          </a>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
        <div className="grid lg:grid-cols-[1fr,340px] gap-8 lg:gap-14">

          {/* ── Left: Player ── */}
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
              <span className="flex items-center gap-1.5"><Headphones size={12} />{PLAYS_DISPLAY(book.plays)} plays</span>
              <span className="flex items-center gap-1.5"><Clock size={12} />{book.duration}</span>
              <span>· Narrated by <span className="text-white/50">{book.narrator}</span></span>
            </div>

            {/* Thumbnail — mobile (shown above player) */}
            <div className="lg:hidden mb-6 relative aspect-video rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/50">
              {!imgErr
                ? <Image src={book.thumbnail} alt={book.title} fill className="object-cover" onError={() => setImgErr(true)} sizes="100vw" priority />
                : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple/40 to-void"><span className="text-7xl">📖</span></div>
              }
            </div>

            {/* ── Audio Player Card ── */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.015] mb-6 shadow-2xl shadow-black/60">
              {/* Ambient glow */}
              <div className="absolute inset-0 opacity-25 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(74,45,138,0.6) 0%, transparent 65%)' }} />

              <div className="relative p-6 sm:p-8">
                {/* Status */}
                <div className="flex items-center gap-2.5 mb-7">
                  {playing ? (
                    <div className="flex items-end gap-[2.5px] h-4">
                      {[0.7, 1, 0.5, 0.85, 0.6].map((h, i) => (
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
                    {playing ? 'Now Playing · Tamil Audio' : ytStatus === 'loading' ? 'Loading audio…' : ytStatus === 'error' ? 'Error — open on YouTube' : 'Ready to play'}
                  </span>
                </div>

                {/* Decorative waveform */}
                <div className="flex items-end gap-[2px] h-14 mb-7 select-none">
                  {WAVEFORM.map((h, i) => {
                    const active = progress > 0 && (i / WAVEFORM.length) * 100 <= progress
                    return (
                      <motion.div key={i}
                        className={`flex-1 rounded-full transition-colors duration-300 ${active ? 'bg-gold/60' : 'bg-white/[0.08]'}`}
                        style={{ height: `${h}%` }}
                        animate={playing && active ? { scaleY: [1, 1.15, 0.9, 1] } : { scaleY: 1 }}
                        transition={{ duration: 0.6, repeat: playing ? Infinity : 0, delay: i * 0.02, ease: 'easeInOut' }}
                      />
                    )
                  })}
                </div>

                {/* Progress bar */}
                <div className="mb-6 cursor-pointer group/seek" onClick={seek}>
                  <div className="h-[3px] rounded-full bg-white/[0.07] relative">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold via-gold2 to-gold rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold shadow-lg shadow-gold/50 -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity"
                      style={{ left: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="font-mono text-[10px] text-white/25 tabular-nums">{fmt(currentTime)}</span>
                    <span className="font-mono text-[10px] text-white/25 tabular-nums">{fmt(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <button onClick={toggleMute}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all">
                    {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>

                  <div className="flex items-center gap-4">
                    <button onClick={restart}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all">
                      <RotateCcw size={16} />
                    </button>
                    <motion.button onClick={togglePlay} disabled={!ytReady}
                      whileHover={ytReady ? { scale: 1.06 } : {}} whileTap={ytReady ? { scale: 0.94 } : {}}
                      className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-void shadow-xl shadow-gold/30 hover:bg-gold2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <AnimatePresence mode="wait">
                        {playing
                          ? <motion.div key="pause" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Pause size={24} /></motion.div>
                          : <motion.div key="play" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Play size={24} className="ml-0.5" /></motion.div>
                        }
                      </AnimatePresence>
                    </motion.button>
                    <div className="w-10 h-10" />
                  </div>

                  <a href={`https://www.youtube.com/watch?v=${book.ytId}`} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all" title="Watch on YouTube">
                    <ExternalLink size={15} />
                  </a>
                </div>

                {/* Attribution */}
                <div className="mt-6 pt-4 border-t border-white/[0.05] text-center">
                  <a href={`https://www.youtube.com/@kadhaisolai`} target="_blank" rel="noopener noreferrer"
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
                      {b.id === book.id && <span className="font-mono text-[8px] text-gold/60 uppercase">Now Playing</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Cover + Info ── */}
          <div className="space-y-5">

            {/* Cover — desktop only, full 16:9 */}
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
                RJ Devi brings Tamil literature to life with her expressive, natural narration style — making every story feel like a personal telling.
              </p>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-white/20 uppercase mb-4">Related Stories</p>
                <div className="space-y-2">
                  {related.map(r => (
                    <Link key={r.id} href={`/listen/${r.id}`}
                      className="flex items-center gap-3 group hover:bg-white/[0.03] p-2 -mx-2 rounded-xl transition-all">
                      <div className="relative w-14 h-9 rounded-lg overflow-hidden shrink-0 border border-white/[0.08]">
                        <Image src={r.thumbnail} alt={r.title} fill className="object-cover" sizes="56px" onError={() => {}} />
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

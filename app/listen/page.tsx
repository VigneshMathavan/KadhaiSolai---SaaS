'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Play, Pause, Headphones, Clock, ChevronRight, X, Volume2, Flame, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import AppNav from '@/components/AppNav'
import Image from 'next/image'
import { DEMO_BOOKS, GENRE_LIST, type DemoBook } from '@/lib/demo-books'
import { getRecommendations, type Recommendations, type ContinueItem } from '@/lib/recommendations'
import { getListeningStats } from '@/lib/listening'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PLAYS_DISPLAY = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

const GENRE_COLORS: Record<string, string> = {
  Historical: 'from-amber-950/80 to-yellow-950/80',
  Drama:      'from-blue-950/80 to-indigo-950/80',
  Thriller:   'from-red-950/80 to-rose-950/80',
  Family:     'from-pink-950/80 to-rose-950/80',
  Spiritual:  'from-emerald-950/80 to-teal-950/80',
  Fiction:    'from-purple/80 to-violet-950/80',
}

// ─── Shelf Item ───────────────────────────────────────────────────────────────
function ShelfItem({ book, progress }: { book: DemoBook; progress?: number }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <Link href={`/listen/${book.id}`} className="group shrink-0 w-36 sm:w-44">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-2 border border-white/[0.06] group-hover:border-gold/25 transition-all bg-void">
        {!imgErr
          ? <Image src={book.thumbnail} alt={book.title} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgErr(true)} sizes="176px" />
          : <div className="absolute inset-0 bg-gradient-to-br from-purple/40 to-void flex items-center justify-center"><span className="text-3xl">📖</span></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-transparent" />
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.08]">
            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {progress !== undefined && progress > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-void/80 backdrop-blur-sm text-gold text-[8px] font-mono px-1.5 py-0.5 rounded-full">
              {progress}%
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-gold/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Play size={14} className="text-void ml-0.5" />
          </div>
        </div>
      </div>
      <p className="font-serif text-[12px] font-medium text-white/75 group-hover:text-gold2 transition-colors line-clamp-2 leading-tight mb-0.5">{book.title}</p>
      <p className="text-white/25 text-[10px]">{book.duration} · {book.genre}</p>
    </Link>
  )
}

function BookShelf({ label, icon, books, progresses }: {
  label: string; icon: React.ReactNode; books: DemoBook[]; progresses?: Record<string, number>
}) {
  if (!books.length) return null
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-5 bg-gold/40" />
        <p className="font-mono text-[9px] tracking-[0.35em] text-gold/55 uppercase flex items-center gap-1.5">
          {icon}{label}
        </p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {books.map(b => <ShelfItem key={b.id} book={b} progress={progresses?.[b.id]} />)}
      </div>
    </div>
  )
}

// ─── Book Card ────────────────────────────────────────────────────────────────
function BookCard({ book, index, onPlay, playing }: {
  book: DemoBook; index: number
  onPlay: (b: DemoBook) => void; playing: boolean
}) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>

      <Link href={`/listen/${book.id}`} className="group block">
        {/* Cover */}
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 border border-white/[0.06] group-hover:border-gold/25 transition-all duration-300 bg-void">
          {!imgErr ? (
            <Image
              src={book.thumbnail}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              onError={() => setImgErr(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${GENRE_COLORS[book.genre] || 'from-purple/60 to-void'} flex items-center justify-center`}>
              <span className="text-5xl">📖</span>
            </div>
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-void/20 to-transparent" />

          {/* Genre badge */}
          <div className="absolute top-3 left-3">
            <span className="font-mono text-[8px] tracking-widest text-white/60 uppercase bg-void/60 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-full">
              {book.type === 'Short Story' ? 'Short' : book.genre}
            </span>
          </div>

          {/* Part badge */}
          {book.part && (
            <div className="absolute top-3 right-3">
              <span className="font-mono text-[8px] tracking-widest text-gold/80 uppercase bg-gold/10 border border-gold/20 px-2 py-1 rounded-full">
                Pt {book.part}
              </span>
            </div>
          )}

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={e => { e.preventDefault(); onPlay(book) }}
              className="w-14 h-14 rounded-full bg-gold/90 backdrop-blur-sm flex items-center justify-center text-void shadow-2xl shadow-gold/40">
              {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </motion.button>
          </div>

          {/* Duration bottom */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-void/60 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Clock size={9} className="text-white/40" />
            <span className="font-mono text-[8px] text-white/40">{book.duration}</span>
          </div>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-serif text-[13px] font-semibold text-white leading-tight mb-0.5 group-hover:text-gold2 transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-white/35 text-[11px] mb-1">{book.narrator}</p>
          <div className="flex items-center gap-2 text-white/22 text-[10px]">
            <Headphones size={9} />
            <span>{PLAYS_DISPLAY(book.plays)}</span>
            <span className="text-white/10">·</span>
            <span>{book.duration}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Featured hero card ───────────────────────────────────────────────────────
function FeaturedCard({ book, onPlay }: { book: DemoBook; onPlay: (b: DemoBook) => void }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] h-[340px] lg:h-[400px] mb-10 group cursor-pointer"
      onClick={() => onPlay(book)}>
      {!imgErr ? (
        <Image src={book.thumbnail} alt={book.title} fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setImgErr(true)} priority sizes="100vw" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${GENRE_COLORS[book.genre] || 'from-purple/60 to-void'}`} />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-void/95 via-void/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="font-mono text-[9px] tracking-[0.35em] text-gold/70 uppercase">Featured Story</span>
          </div>
          <h2 className="font-serif font-bold text-white mb-2 leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {book.title}
          </h2>
          <p className="text-white/40 text-xs mb-1 font-mono tracking-wider">{book.titleEn}</p>
          <p className="text-white/50 text-sm leading-relaxed mb-6 line-clamp-2 max-w-md">{book.description}</p>
          <div className="flex items-center gap-4">
            <Link href={`/listen/${book.id}`} onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 bg-gold text-void font-semibold px-6 py-3 rounded-full hover:bg-gold2 transition-all text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/20">
              <Play size={14} className="ml-0.5" /> Listen Now
            </Link>
            <div className="flex items-center gap-2 text-white/35 text-sm">
              <Headphones size={14} />
              <span>{PLAYS_DISPLAY(book.plays)} plays</span>
              <span className="text-white/15">·</span>
              <span>{book.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mini bottom player ───────────────────────────────────────────────────────
function MiniPlayer({ book, onClose }: { book: DemoBook; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-void/95 backdrop-blur-xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
            <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="48px"
              onError={() => {}} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-serif text-white text-sm font-semibold truncate">{book.title}</p>
            <p className="text-white/35 text-xs">{book.narrator} · {book.genre}</p>
          </div>

          {/* Waveform (visual only) */}
          <div className="hidden sm:flex items-end gap-[2px] h-6">
            {[60, 85, 45, 95, 55, 75, 40, 90, 65, 80].map((h, i) => (
              <motion.div key={i} className="w-[2px] rounded-full bg-gold/50"
                style={{ height: '30%' }}
                animate={{ height: [`30%`, `${h}%`, `30%`] }}
                transition={{ duration: 0.8 + i * 0.05, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }} />
            ))}
          </div>

          {/* Full player link */}
          <Link href={`/listen/${book.id}`}
            className="flex items-center gap-1.5 bg-gold/10 border border-gold/25 text-gold text-xs font-medium px-4 py-2 rounded-full hover:bg-gold/20 transition-all">
            <Volume2 size={12} /> Open Player
          </Link>

          {/* Close */}
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.05] transition-all">
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ListenPage() {
  const [genre, setGenre] = useState('All')
  const [search, setSearch] = useState('')
  const [activeBook, setActiveBook] = useState<DemoBook | null>(null)
  const [recs, setRecs] = useState<Recommendations | null>(null)
  const [listenStreak, setListenStreak] = useState(0)

  useEffect(() => {
    setRecs(getRecommendations())
    setListenStreak(getListeningStats().currentStreak)
  }, [])

  const filtered = DEMO_BOOKS.filter(b => {
    const matchGenre = genre === 'All' || b.genre === genre || b.type === genre
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.titleEn.toLowerCase().includes(search.toLowerCase())
    return matchGenre && matchSearch
  })

  const featured = DEMO_BOOKS.find(b => b.id === '2d1CjI9f9x4')! // புரட்சி ராணி மங்கம்மாள்

  return (
    <div className="min-h-screen bg-void pb-24">

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.022]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")" }} />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full -top-32 -right-32 opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #4a2d8a 0%, transparent 60%)' }} />
      </div>

      <AppNav showCredits />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10 relative z-10">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold/40" />
            <p className="font-mono text-[10px] tracking-[0.35em] text-gold/55 uppercase">Tamil Audio Library</p>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h1 className="font-serif font-bold text-white leading-[0.9]" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              Stories waiting<br /><em className="text-gold italic">to be heard.</em>
            </h1>
            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search stories…"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-full pl-10 pr-4 py-2.5 text-white/80 text-sm placeholder-white/25 outline-none focus:border-gold/30 transition-colors font-light" />
            </div>
          </div>
        </div>

        {/* ── Continue Listening ── */}
        {recs && recs.continueListening.length > 0 && (
          <BookShelf
            label="Continue Listening"
            icon={<span>▶</span>}
            books={recs.continueListening}
            progresses={Object.fromEntries(recs.continueListening.map(b => [b.id, b.completionPct]))}
          />
        )}

        {/* ── Featured ── */}
        <FeaturedCard book={featured} onPlay={setActiveBook} />

        {/* ── Genre filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {GENRE_LIST.map(g => (
            <button key={g} onClick={() => setGenre(g)}
              className={`px-4 py-1.5 rounded-full text-[12px] whitespace-nowrap transition-all border font-light ${
                genre === g
                  ? 'bg-gold text-void border-gold font-semibold'
                  : 'border-white/[0.08] text-white/45 hover:border-gold/25 hover:text-white'
              }`}>
              {g}
            </button>
          ))}
        </div>

        {/* ── Count ── */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[10px] tracking-widest text-white/20 uppercase">
            {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
          </span>
          <div className="h-px flex-1 bg-white/[0.04]" />
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-4 opacity-20">🎧</div>
            <p className="text-white/30 text-sm">No stories match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map((book, i) => (
              <BookCard key={book.id} book={book} index={i}
                onPlay={setActiveBook}
                playing={activeBook?.id === book.id} />
            ))}
          </div>
        )}

        {/* ── For You + Trending ── */}
        {recs && (
          <div className="mt-12 space-y-2">
            {recs.forYou.length > 0 && (
              <BookShelf
                label={recs.topGenre ? `More ${recs.topGenre} for You` : 'Recommended for You'}
                icon={<Sparkles size={9} />}
                books={recs.forYou}
              />
            )}
            <BookShelf
              label="Trending Now"
              icon={<TrendingUp size={9} />}
              books={recs.trending}
            />
          </div>
        )}

        {/* ── Listening streak CTA ── */}
        {listenStreak > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-orange-400/20 bg-orange-400/[0.04]">
            <Flame size={16} className="text-orange-400" />
            <span className="text-orange-300 text-sm font-medium">{listenStreak}-day listening streak!</span>
            <span className="text-white/25 text-xs">Keep it going</span>
          </div>
        )}

        {/* ── Footer note ── */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/18 text-xs font-mono tracking-widest uppercase">
            {DEMO_BOOKS.length} stories · Narrated by RJ Devi · KadhaiSolai
          </p>
          <Link href="/author"
            className="flex items-center gap-1.5 text-gold/50 hover:text-gold text-xs transition-colors">
            Share your story <ChevronRight size={12} />
          </Link>
        </div>
      </main>

      {/* ── Mini Player ── */}
      {activeBook && (
        <MiniPlayer book={activeBook} onClose={() => setActiveBook(null)} />
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, MessageSquare, BookOpen, Clock, Pencil, Headphones, TrendingUp } from 'lucide-react'
import {
  fetchStories, likeStory, unlikeStory, hasLiked, getFingerprint, type Story,
} from '@/lib/stories'
import { getStreakData, FLAME_COLORS, flameLevel } from '@/lib/streaks'

const GENRES = ['All', 'Drama', 'Thriller', 'Historical', 'Family', 'Spiritual', 'Fiction', 'Poetry']
const GENRE_EMOJI: Record<string, string> = {
  Drama: '🎭', Thriller: '⚡', Historical: '🏛️', Family: '🏡', Spiritual: '🪔', Fiction: '✨', Poetry: '🌸',
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function StoryCard({ story, fingerprint, onLike }: {
  story: Story & { liked?: boolean }
  fingerprint: string
  onLike: (id: string) => void
}) {
  const snippet = story.body.slice(0, 160).trim() + (story.body.length > 160 ? '…' : '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] hover:bg-white/[0.025] transition-all duration-300">

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/[0.08] text-white/35">
              {GENRE_EMOJI[story.genre]} {story.genre}
            </span>
            {story.ai_assisted && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-gold/15 text-gold/45">✨ AI</span>
            )}
          </div>
          <Link href={`/stories/${story.id}`}>
            <h3 className="font-serif font-bold text-white text-lg leading-tight group-hover:text-gold2 transition-colors duration-200 line-clamp-2">
              {story.title}
            </h3>
          </Link>
        </div>
      </div>

      <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-3 font-light">{snippet}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-xs">{story.author_name}</span>
          <span className="text-white/[0.12]">·</span>
          <span className="text-white/20 text-xs font-mono">{story.word_count || '?'} words</span>
          <span className="text-white/[0.12]">·</span>
          <span className="text-white/20 text-xs">{timeAgo(story.created_at)}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.preventDefault(); onLike(story.id) }}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              story.liked ? 'text-pink-400' : 'text-white/25 hover:text-pink-400'
            }`}>
            <Heart size={13} fill={story.liked ? 'currentColor' : 'none'} />
            <span className="font-mono">{story.likes_count}</span>
          </button>
          <Link href={`/stories/${story.id}#comments`}
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/55 transition-colors">
            <MessageSquare size={13} />
            <span className="font-mono">{story.comments_count}</span>
          </Link>
          <Link href={`/stories/${story.id}`}
            className="text-[10px] text-gold/50 hover:text-gold transition-colors font-mono">
            Read →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function StoriesPage() {
  const [stories, setStories] = useState<(Story & { liked?: boolean })[]>([])
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState<'newest' | 'popular'>('newest')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [fp, setFp] = useState('')
  const [streak, setStreak] = useState({ currentStreak: 0, totalStories: 0 })

  useEffect(() => {
    const fingerprint = getFingerprint()
    setFp(fingerprint)
    setStreak(getStreakData())
  }, [])

  const load = async (reset = true) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)
    const offset = reset ? 0 : stories.length
    try {
      const data = await fetchStories({ genre, sort, limit: 20, offset })
      // Fetch liked status for each
      const withLiked = await Promise.all(data.map(async s => ({
        ...s,
        liked: fp ? await hasLiked(s.id, fp) : false,
      })))
      if (reset) setStories(withLiked)
      else setStories(prev => [...prev, ...withLiked])
      setHasMore(data.length === 20)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => { if (fp !== undefined) load(true) }, [genre, sort, fp])

  const handleLike = async (storyId: string) => {
    if (!fp) return
    const story = stories.find(s => s.id === storyId)
    if (!story) return
    const nowLiked = !story.liked
    setStories(prev => prev.map(s => s.id === storyId
      ? { ...s, liked: nowLiked, likes_count: nowLiked ? s.likes_count + 1 : s.likes_count - 1 }
      : s))
    try {
      if (nowLiked) await likeStory(storyId, fp)
      else await unlikeStory(storyId, fp)
    } catch {
      setStories(prev => prev.map(s => s.id === storyId
        ? { ...s, liked: !nowLiked, likes_count: !nowLiked ? s.likes_count + 1 : s.likes_count - 1 }
        : s))
    }
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")" }} />

      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 lg:px-12 py-4 bg-void/90 backdrop-blur-xl border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-purple to-gold flex items-center justify-center text-sm">🎧</div>
          <span className="font-serif font-bold text-[15px] text-white">KadhaiSolai</span>
        </Link>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-1.5">
          <Link href="/listen" className="hidden sm:block text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/[0.05] flex items-center gap-1.5">
            <Headphones size={11} /> Listen
          </Link>
          <Link href="/dashboard" className="hidden sm:block text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/[0.05]">Dashboard</Link>
          <Link href="/create" className="text-xs bg-gold text-void font-semibold px-4 py-1.5 rounded-full hover:bg-gold2 transition-colors flex items-center gap-1.5">
            <Pencil size={11} /> Write
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-6 bg-gold/40" />
            <p className="font-mono text-[9px] tracking-[0.35em] text-gold/55 uppercase">Community Stories</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <h1 className="font-serif font-bold text-white" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.9 }}>
              Tamil<br /><em className="text-gold italic">Stories</em>
            </h1>
            {streak.currentStreak > 0 && (
              <div className={`flex items-center gap-2 text-sm ${FLAME_COLORS[flameLevel(streak.currentStreak)]}`}>
                <span>🔥</span>
                <span className="font-medium">{streak.currentStreak}-day streak</span>
                <span className="text-white/25">· {streak.totalStories} stories</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  genre === g
                    ? 'border-gold/40 bg-gold/10 text-gold'
                    : 'border-white/[0.07] text-white/35 hover:border-white/20 hover:text-white/60'
                }`}>
                {g !== 'All' ? `${GENRE_EMOJI[g]} ` : ''}{g}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {(['newest', 'popular'] as const).map(s => (
              <button key={s} onClick={() => setSort(s)}
                className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  sort === s
                    ? 'border-white/20 bg-white/[0.06] text-white/70'
                    : 'border-white/[0.06] text-white/25 hover:text-white/50'
                }`}>
                {s === 'popular' && <TrendingUp size={9} />}
                {s === 'newest' && <Clock size={9} />}
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stories */}
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
            <p className="text-white/25 text-sm">Loading stories…</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-white/35 text-lg mb-2">No stories yet</p>
            <p className="text-white/20 text-sm mb-6">Be the first to publish a Tamil story.</p>
            <Link href="/create"
              className="inline-flex items-center gap-2 bg-gold text-void font-semibold px-6 py-3 rounded-full text-sm hover:bg-gold2 transition-all">
              <Pencil size={13} /> Write First Story
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {stories.map(story => (
                <StoryCard key={story.id} story={story} fingerprint={fp} onLike={handleLike} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={() => load(false)} disabled={loadingMore}
                  className="text-sm text-white/35 border border-white/[0.08] px-6 py-2.5 rounded-full hover:border-white/20 hover:text-white/60 transition-all disabled:opacity-40">
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Write FAB */}
      <Link href="/create"
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-gold text-void font-semibold px-5 py-3 rounded-full shadow-xl shadow-gold/20 hover:bg-gold2 transition-all hover:-translate-y-0.5 text-sm z-30">
        <Pencil size={14} /> Write a Story
      </Link>
    </div>
  )
}

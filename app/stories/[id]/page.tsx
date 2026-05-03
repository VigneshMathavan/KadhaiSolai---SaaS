'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Heart, MessageSquare, Share2, Sparkles, Loader2, Clock, Headphones } from 'lucide-react'
import {
  fetchStory, fetchComments, hasLiked, likeStory, unlikeStory,
  addComment, getFingerprint, type Story, type StoryComment,
} from '@/lib/stories'

const GENRE_EMOJI: Record<string, string> = {
  Drama: '🎭', Thriller: '⚡', Historical: '🏛️', Family: '🏡', Spiritual: '🪔', Fiction: '✨', Poetry: '🌸',
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function readTime(text: string) {
  const wpm = 130 // Tamil reading pace
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / wpm))
  return `${mins} min read`
}

function CommentItem({ comment }: { comment: StoryComment }) {
  return (
    <div className="py-4 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple/60 to-gold/40 flex items-center justify-center text-[10px] font-bold text-white">
          {comment.author_name[0]?.toUpperCase() || 'A'}
        </div>
        <span className="text-white/60 text-xs font-medium">{comment.author_name}</span>
        <span className="text-white/20 text-xs">{timeAgo(comment.created_at)}</span>
      </div>
      <p className="text-white/55 text-sm leading-relaxed pl-8">{comment.body}</p>
    </div>
  )
}

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [story, setStory] = useState<Story | null>(null)
  const [comments, setComments] = useState<StoryComment[]>([])
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [commenterName, setCommenterName] = useState('')
  const [fp, setFp] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)

  useEffect(() => {
    const fingerprint = getFingerprint()
    setFp(fingerprint)
    setCommenterName(localStorage.getItem('ks_author_name') || '')

    Promise.all([
      fetchStory(id),
      fetchComments(id),
      hasLiked(id, fingerprint),
    ]).then(([s, c, l]) => {
      setStory(s)
      setLikesCount(s?.likes_count || 0)
      setComments(c)
      setLiked(l)
      setLoading(false)
    })
  }, [id])

  const toggleLike = async () => {
    if (!fp) return
    const next = !liked
    setLiked(next)
    setLikesCount(c => next ? c + 1 : Math.max(0, c - 1))
    try {
      if (next) await likeStory(id, fp)
      else await unlikeStory(id, fp)
    } catch {
      setLiked(!next)
      setLikesCount(c => !next ? c + 1 : Math.max(0, c - 1))
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return
    setCommenting(true)
    try {
      const c = await addComment(id, fp, commenterName.trim() || 'Anonymous', commentBody.trim())
      setComments(prev => [...prev, c])
      setCommentBody('')
      if (commenterName.trim()) localStorage.setItem('ks_author_name', commenterName.trim())
      toast.success('Comment posted!')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setCommenting(false)
    }
  }

  const generateAudio = async () => {
    if (!story || generatingAudio) return
    setGeneratingAudio(true)
    try {
      const res = await fetch('/api/story-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'TTS failed')
      setAudioUrl(data.audioUrl)
      toast.success('Audio ready!')
    } catch (err: any) {
      toast.error(err.message || 'Could not generate audio')
    } finally {
      setGeneratingAudio(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: story?.title, text: story?.body.slice(0, 100) + '…', url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied!')
      }
    } catch {}
  }

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </div>
  )

  if (!story) return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4">
      <p className="text-white/40">Story not found</p>
      <Link href="/stories" className="text-gold text-sm hover:text-gold2 transition-colors">← All Stories</Link>
    </div>
  )

  const paragraphs = story.body.split(/\n\n+/).filter(Boolean)

  return (
    <div className="min-h-screen bg-void">
      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")" }} />

      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-void/90 backdrop-blur-xl border-b border-white/[0.05]">
        <Link href="/stories" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          <ArrowLeft size={15} /> <span className="hidden sm:inline">All Stories</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple to-gold flex items-center justify-center text-xs">🎧</div>
          <span className="font-serif font-bold text-sm text-white hidden sm:block">KadhaiSolai</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="text-white/35 hover:text-white transition-colors" title="Share">
            <Share2 size={16} />
          </button>
          <button onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-pink-400' : 'text-white/35 hover:text-pink-400'}`}>
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span className="font-mono text-xs">{likesCount}</span>
          </button>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 py-14">

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/[0.08] text-white/35">
              {GENRE_EMOJI[story.genre]} {story.genre}
            </span>
            {story.ai_assisted && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-gold/15 text-gold/45 flex items-center gap-1">
                <Sparkles size={8} /> AI Assisted
              </span>
            )}
          </div>
          <h1 className="font-serif font-bold text-white leading-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
            {story.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple/60 to-gold/40 flex items-center justify-center text-[9px] font-bold text-white">
                {story.author_name[0]?.toUpperCase() || 'A'}
              </div>
              {story.author_name}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {readTime(story.body)}</span>
            <span>·</span>
            <span>{timeAgo(story.created_at)}</span>
            <span>·</span>
            <span>{story.word_count || '?'} words</span>
          </div>
          <div className="h-px bg-gradient-to-r from-gold/20 via-white/[0.06] to-transparent mt-8" />
        </motion.header>

        {/* Body */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="prose prose-invert max-w-none">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-white/72 leading-[2.1] mb-6 font-serif text-[17px]">
              {para}
            </p>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="mt-14 pt-8 border-t border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={toggleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm ${
                  liked ? 'border-pink-400/40 bg-pink-400/10 text-pink-400' : 'border-white/[0.08] text-white/35 hover:border-pink-400/30 hover:text-pink-400'
                }`}>
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Liked' : 'Like'} · {likesCount}
              </button>
              <a href="#comments"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] text-white/35 hover:border-white/20 hover:text-white/55 transition-all text-sm">
                <MessageSquare size={14} /> {comments.length} Comments
              </a>
            </div>
            <button onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
              <Share2 size={12} /> Share
            </button>
          </div>

          {/* Listen to Story */}
          <div className="mt-8 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white/60 text-sm font-medium mb-0.5">🎧 Listen to this story</p>
                <p className="text-white/25 text-xs">AI narrates your story in Tamil</p>
              </div>
              {!audioUrl ? (
                <button onClick={generateAudio} disabled={generatingAudio}
                  className="flex items-center gap-2 bg-gold/10 border border-gold/25 text-gold px-4 py-2 rounded-full text-xs hover:bg-gold/20 transition-all disabled:opacity-50 shrink-0">
                  {generatingAudio ? <Loader2 size={11} className="animate-spin" /> : <Headphones size={11} />}
                  {generatingAudio ? 'Generating…' : 'Generate Audio'}
                </button>
              ) : null}
            </div>
            {audioUrl && (
              <div className="mt-4">
                <audio controls src={audioUrl} className="w-full h-10"
                  style={{ colorScheme: 'dark', accentColor: '#c9a84c' }} />
                <p className="text-white/20 text-[10px] mt-2 font-mono">
                  Narrated by Sarvam AI · Tamil TTS
                </p>
              </div>
            )}
          </div>

          {/* Watermark */}
          <div className="mt-6 flex items-center gap-2 text-[10px] text-white/15 font-mono">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-purple to-gold flex items-center justify-center text-[8px]">🎧</div>
            Created with KadhaiSolai
          </div>
        </div>

        {/* Comments */}
        <section id="comments" className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-5 bg-gold/40" />
            <p className="font-mono text-[9px] tracking-[0.35em] text-gold/55 uppercase">
              {comments.length} Comment{comments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Comment form */}
          <form onSubmit={handleComment} className="mb-8 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="mb-3">
              <input value={commenterName} onChange={e => setCommenterName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full bg-transparent border-b border-white/[0.08] pb-2 text-white text-sm placeholder-white/20 outline-none focus:border-gold/30 transition-colors" />
            </div>
            <textarea value={commentBody} onChange={e => setCommentBody(e.target.value)}
              placeholder="What did you think of this story…"
              rows={3}
              className="w-full bg-transparent text-white/75 text-sm placeholder-white/20 outline-none resize-none leading-relaxed mb-4 font-light" />
            <div className="flex justify-end">
              <button type="submit" disabled={commenting || !commentBody.trim()}
                className="flex items-center gap-2 bg-gold text-void font-semibold px-5 py-2 rounded-full text-xs hover:bg-gold2 transition-colors disabled:opacity-35 disabled:cursor-not-allowed">
                {commenting && <Loader2 size={11} className="animate-spin" />}
                Post Comment
              </button>
            </div>
          </form>

          {/* Comment list */}
          <div className="divide-y divide-white/[0.04]">
            {comments.length === 0 ? (
              <p className="text-white/20 text-sm py-6 text-center">No comments yet. Be the first!</p>
            ) : (
              comments.map(c => <CommentItem key={c.id} comment={c} />)
            )}
          </div>
        </section>

        {/* Related link */}
        <div className="mt-14 text-center">
          <Link href="/stories"
            className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors border border-white/[0.07] px-5 py-2.5 rounded-full hover:border-white/20">
            ← More Stories
          </Link>
        </div>
      </article>
    </div>
  )
}

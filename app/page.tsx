'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Upload, Headphones, Zap, BookOpen, Mic, Users, ArrowUpRight, Globe, Pencil } from 'lucide-react'
import { useEffect, useRef } from 'react'
import DemoSection from '@/components/DemoSection'
import AppNav from '@/components/AppNav'

// ─── Gold-only particles: tiny, slow, bottom → top ───────────────────────────
function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf: number

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    type P = { x: number; y: number; vy: number; vx: number; r: number; life: number; max: number; t: number }
    const make = (): P => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 8,
      vy: -(0.18 + Math.random() * 0.38),
      vx: (Math.random() - 0.5) * 0.12,
      r: 0.4 + Math.random() * 1.1,
      life: 0,
      max: 500 + Math.random() * 600,
      t: Math.random() * Math.PI * 2,
    })

    const ps: P[] = Array.from({ length: 120 }, () => {
      const p = make(); p.y = Math.random() * canvas.height; p.life = Math.random() * p.max; return p
    })

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      while (ps.length < 130) ps.push(make())
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life++; p.x += p.vx; p.y += p.vy; p.t += 0.025
        const ratio = p.life / p.max
        const fade = ratio < 0.18 ? ratio / 0.18 : ratio > 0.78 ? (1 - ratio) / 0.22 : 1
        const a = fade * (0.72 + 0.28 * Math.sin(p.t))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${(a * 0.52).toFixed(3)})`
        ctx.fill()
        if (p.life >= p.max || p.y < -10) ps.splice(i, 1)
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />
}

// ─── Scrolling marquee strip ──────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Tamil Literature', 'AI Narrated', 'Sarvam Bulbul v3', 'Upload & Publish',
  'Stream Anywhere', 'Free to Start', 'Author Dashboard', 'Native Tamil TTS',
  'Any Length Novel', 'Beautiful Player', 'Magic Links', 'Open Platform',
]
function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="overflow-hidden border-y border-white/[0.04] bg-white/[0.008] py-3.5">
      <motion.div className="flex gap-10 whitespace-nowrap w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, ease: 'linear', repeat: Infinity }}>
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 font-mono text-[9px] tracking-[0.32em] text-white/22 uppercase">
            {item} <span className="text-gold/25">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Animated audio waveform bars ────────────────────────────────────────────
const BAR_PEAKS = [38, 72, 54, 88, 32, 68, 92, 44, 76, 58, 36, 82, 50, 70, 42, 94, 56, 66, 78, 46]
function AudioBars() {
  return (
    <div className="flex items-end gap-[3px] h-10">
      {BAR_PEAKS.map((peak, i) => (
        <motion.div key={i} className="w-[3px] rounded-full bg-gold/30" style={{ height: '12%' }}
          animate={{ height: ['12%', `${peak}%`, '12%'] }}
          transition={{ duration: 1.1 + i * 0.04, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }} />
      ))}
    </div>
  )
}

// ─── Shared section label ─────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px w-8 bg-gold/40" />
      <p className="font-mono text-[10px] tracking-[0.35em] text-gold/55 uppercase">{children}</p>
    </div>
  )
}

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.95, ease: [0.16, 1, 0.3, 1] as any },
})

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-void overflow-x-hidden">

      {/* FILM GRAIN */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")" }} />

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <AppNav cta={{ label: 'Upload Book', href: '/author' }} showCredits />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-16 pt-28 pb-20 overflow-hidden">
        <GoldParticles />

        {/* Layered ambient glows */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          <div className="absolute w-[900px] h-[900px] rounded-full -top-64 -left-64 opacity-[0.18]"
            style={{ background: 'radial-gradient(circle, #4a2d8a 0%, transparent 55%)' }} />
          <div className="absolute w-[500px] h-[500px] rounded-full top-1/3 left-1/4 opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 55%)' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full -bottom-32 -right-32 opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #4a2d8a 0%, transparent 55%)' }} />
        </div>

        {/* Thin vertical accent line (right edge) */}
        <div className="absolute right-10 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent hidden lg:block" style={{ zIndex: 3 }} />

        <div className="relative max-w-7xl mx-auto w-full" style={{ zIndex: 10 }}>
          <div className="grid lg:grid-cols-[1fr,420px] gap-16 lg:gap-20 items-center">

            {/* ── Typography ── */}
            <div>
              <motion.div {...up(0.05)} className="inline-flex items-center gap-2.5 mb-10">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="font-mono text-[9px] tracking-[0.38em] text-white/28 uppercase">Tamil Audiobooks · AI Narrated · Free</span>
                <div className="h-px w-6 bg-white/[0.12]" />
              </motion.div>

              <div className="overflow-hidden mb-1">
                <motion.div initial={{ y: '108%' }} animate={{ y: 0 }}
                  transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}>
                  <h1 className="font-serif font-bold text-white tracking-tight leading-[0.83]"
                    style={{ fontSize: 'clamp(5rem, 14vw, 13rem)' }}>
                    Kadhai
                  </h1>
                </motion.div>
              </div>
              <div className="overflow-hidden mb-10">
                <motion.div initial={{ y: '108%' }} animate={{ y: 0 }}
                  transition={{ duration: 1.15, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}>
                  <h1 className="font-serif font-bold italic text-gold tracking-tight leading-[0.83]"
                    style={{ fontSize: 'clamp(5rem, 14vw, 13rem)' }}>
                    Solai
                  </h1>
                </motion.div>
              </div>

              <motion.p {...up(0.38)}
                className="text-white/36 text-base lg:text-[17px] leading-[1.7] max-w-[360px] mb-10 font-light">
                Upload your Tamil novel — our AI narrates it with a natural voice.
                Readers stream. Stories live forever.
              </motion.p>

              <motion.div {...up(0.48)} className="flex flex-wrap items-center gap-4 mb-16">
                <Link href="/author"
                  className="group flex items-center gap-2 bg-gold text-void font-semibold px-7 py-3.5 rounded-full hover:bg-gold2 transition-all text-[13px] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/20">
                  <Upload size={13} />
                  Upload Your Book
                </Link>
                <Link href="/listen"
                  className="group flex items-center gap-2 text-white/38 hover:text-white transition-colors text-[13px]">
                  Browse Library
                  <span className="w-7 h-7 rounded-full border border-white/[0.1] flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/[0.04] transition-all ml-1">
                    <ArrowUpRight size={11} />
                  </span>
                </Link>
              </motion.div>

              {/* Stats — slim data bar */}
              <motion.div {...up(0.58)}
                className="inline-flex items-stretch divide-x divide-white/[0.07] border border-white/[0.07] rounded-2xl overflow-hidden bg-white/[0.02]">
                {[
                  { val: 'Free', sub: 'To start' },
                  { val: 'Sarvam AI', sub: 'TTS engine' },
                  { val: '100%', sub: 'Tamil native' },
                ].map((s) => (
                  <div key={s.val} className="px-6 py-4">
                    <div className="font-serif font-bold text-white text-lg leading-tight">{s.val}</div>
                    <div className="text-white/25 text-[9px] font-mono tracking-widest uppercase mt-1">{s.sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Orb visual ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex flex-col items-center gap-8 relative">

              {/* Glow behind orb */}
              <div className="absolute w-72 h-72 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, #4a2d8a 0%, transparent 60%)' }} />

              <div className="relative w-80 h-80">
                {/* Orbit rings */}
                <div className="absolute inset-0 rounded-full border border-gold/[0.07] animate-spin-slow" />
                <div className="absolute inset-7 rounded-full border border-gold/[0.05] animate-spin-slow-r" />
                <div className="absolute inset-14 rounded-full border border-purple/[0.18] animate-spin-medium" />

                {/* Orbit dot */}
                <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ pointerEvents: 'none' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold/55 shadow-sm shadow-gold/60" />
                </div>
                <div className="absolute inset-7 rounded-full animate-spin-slow-r" style={{ pointerEvents: 'none' }}>
                  <div className="absolute bottom-0 right-4 w-1.5 h-1.5 rounded-full bg-purple/70 shadow-sm shadow-purple/50" />
                </div>

                {/* Center orb */}
                <div className="absolute inset-[76px] rounded-full bg-gradient-to-br from-[#2a1060] via-[#3d2278] to-[#1a0d42] flex items-center justify-center shadow-2xl shadow-purple/40 animate-float">
                  <span className="text-5xl select-none">🎧</span>
                </div>
              </div>

              <AudioBars />

              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gold/30" />
                <p className="font-mono text-[9px] tracking-[0.3em] text-white/18 uppercase">Live AI Processing</p>
                <div className="w-1 h-1 rounded-full bg-gold/30" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ zIndex: 10 }}>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-10 bg-gradient-to-b from-transparent via-white/[0.18] to-transparent" />
          <span className="font-mono text-[8px] tracking-[0.4em] text-white/15 uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── LIVE DEMO ─────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.04]">
        <DemoSection />
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
            <div>
              <SectionLabel>How it works</SectionLabel>
              <h2 className="font-serif font-bold text-white leading-[0.88]"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
                Three steps.<br /><em className="text-gold italic">That's it.</em>
              </h2>
            </div>
            <p className="text-white/25 text-sm max-w-xs leading-relaxed font-light lg:mb-2">
              From raw Tamil text to a published audiobook in minutes. No studio, no recording equipment, no technical knowledge needed.
            </p>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {[
              { n: '01', icon: <Upload size={16} />, title: 'Upload Tamil Text', desc: 'Drag & drop your .txt file in Tamil Unicode. Short story, full novel — any length works.' },
              { n: '02', icon: <Zap size={16} />, title: 'AI Narrates It', desc: "Sarvam Bulbul v3 — India's best Tamil TTS — converts your text to natural, human-quality audio automatically." },
              { n: '03', icon: <Headphones size={16} />, title: 'The World Listens', desc: 'Your audiobook publishes instantly. Readers stream from any device, anywhere on earth.' },
            ].map((step, i) => (
              <motion.div key={step.n}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-center gap-6 lg:gap-14 py-8 lg:py-10 hover:bg-white/[0.012] -mx-4 px-4 rounded-2xl transition-colors cursor-default">
                <div className="font-serif text-5xl lg:text-8xl font-bold text-white/[0.04] group-hover:text-white/[0.08] transition-colors shrink-0 w-14 lg:w-28 tabular-nums select-none">
                  {step.n}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/[0.06] border border-gold/[0.12] flex items-center justify-center text-gold shrink-0 group-hover:bg-gold/[0.13] group-hover:border-gold/25 group-hover:shadow-sm group-hover:shadow-gold/10 transition-all">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl lg:text-2xl text-white mb-1.5 group-hover:text-gold2 transition-colors duration-300">{step.title}</h3>
                  <p className="text-white/28 text-sm leading-relaxed max-w-lg">{step.desc}</p>
                </div>
                <div className="hidden lg:flex w-9 h-9 rounded-full border border-white/[0.06] items-center justify-center shrink-0 group-hover:border-gold/25 group-hover:bg-gold/[0.04] transition-all">
                  <ArrowUpRight size={12} className="text-white/15 group-hover:text-gold/55 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ───────────────────────────────────────────────────── */}
      <section className="py-8 pb-32 px-6 lg:px-16 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 pt-20">
            <div>
              <SectionLabel>Features</SectionLabel>
              <h2 className="font-serif font-bold text-white leading-[0.88]"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
                Built for Tamil<br /><em className="text-gold italic">literature.</em>
              </h2>
            </div>
            <p className="text-white/25 text-sm max-w-xs leading-relaxed font-light lg:mb-2">
              Every feature is designed around the specific needs of Tamil authors and listeners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">

            {/* Wide: Native Tamil TTS */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 relative p-8 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-purple/[0.1] via-purple/[0.04] to-transparent overflow-hidden group hover:border-purple/25 transition-all duration-300">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-25 group-hover:opacity-35 transition-opacity"
                style={{ background: 'radial-gradient(circle, #4a2d8a, transparent)' }} />
              {/* Corner label */}
              <div className="absolute top-6 right-6 font-mono text-[8px] tracking-widest text-white/15 uppercase">01 / 06</div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gold/[0.08] border border-gold/[0.15] flex items-center justify-center text-gold mb-6 group-hover:bg-gold/[0.15] group-hover:border-gold/25 transition-all">
                  <Mic size={16} />
                </div>
                <h3 className="font-serif text-2xl text-white mb-3 group-hover:text-gold2 transition-colors duration-300">Native Tamil TTS</h3>
                <p className="text-white/32 text-sm leading-relaxed max-w-md">
                  Sarvam Bulbul v3 — India's most advanced Tamil speech engine. Understands Tamil script, grammar, and pronunciation natively. Not transliteration. Not a workaround. Real Tamil.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/[0.05]" />
                  <span className="font-mono text-[8px] tracking-widest text-white/18 uppercase">Bulbul v3 · 8 Tamil Voices</span>
                </div>
              </div>
            </motion.div>

            {/* Fast Processing */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.08 }}
              className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-gold/20 transition-all duration-300 group">
              <div className="absolute top-6 right-6 font-mono text-[8px] tracking-widest text-white/10 uppercase">02 / 06</div>
              <div className="w-10 h-10 rounded-xl bg-gold/[0.08] border border-gold/[0.15] flex items-center justify-center text-gold mb-6 group-hover:bg-gold/[0.15] transition-all">
                <Zap size={16} />
              </div>
              <h3 className="font-serif text-xl text-white mb-2 group-hover:text-gold2 transition-colors duration-300">Fast Processing</h3>
              <p className="text-white/32 text-sm leading-relaxed">Most books done in under 5 minutes. Full novels under 20.</p>
              <div className="mt-6 space-y-2">
                {[['Short story', '~1 min', 95], ['Novel chapter', '~3 min', 72], ['Full novel', '~15 min', 38]].map(([l, t, w]) => (
                  <div key={String(l)} className="flex items-center gap-3">
                    <span className="font-mono text-[8px] text-white/22 w-24 shrink-0">{l}</span>
                    <div className="flex-1 h-[2px] rounded-full bg-white/[0.05]">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold/50 to-gold2/50 transition-all" style={{ width: `${w}%` }} />
                    </div>
                    <span className="font-mono text-[8px] text-gold/45 w-12 text-right shrink-0">{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Any Length */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.12 }}
              className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-gold/20 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-gold/[0.08] border border-gold/[0.15] flex items-center justify-center text-gold mb-6 group-hover:bg-gold/[0.15] transition-all">
                <BookOpen size={16} />
              </div>
              <h3 className="font-serif text-xl text-white mb-2 group-hover:text-gold2 transition-colors duration-300">Any Length Novel</h3>
              <p className="text-white/32 text-sm leading-relaxed">Auto-chunks your text at sentence boundaries and stitches seamlessly. No file size limit.</p>
            </motion.div>

            {/* Author Profiles */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.16 }}
              className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-gold/20 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-gold/[0.08] border border-gold/[0.15] flex items-center justify-center text-gold mb-6 group-hover:bg-gold/[0.15] transition-all">
                <Users size={16} />
              </div>
              <h3 className="font-serif text-xl text-white mb-2 group-hover:text-gold2 transition-colors duration-300">Author Profiles</h3>
              <p className="text-white/32 text-sm leading-relaxed">Your own page with all books, follower count, and bio. Build your Tamil literary presence.</p>
            </motion.div>

            {/* Wide: Player */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="lg:col-span-2 relative p-8 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gold/[0.04] via-transparent to-transparent overflow-hidden group hover:border-gold/20 transition-all duration-300">
              <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gold/[0.08] border border-gold/[0.15] flex items-center justify-center text-gold mb-6 group-hover:bg-gold/[0.15] transition-all">
                  <Headphones size={16} />
                </div>
                <h3 className="font-serif text-2xl text-white mb-3 group-hover:text-gold2 transition-colors duration-300">Cinematic Audio Player</h3>
                <p className="text-white/32 text-sm leading-relaxed max-w-md">
                  A player built for long listening. Progress tracking, playback speed control, offline support — and a UI as premium as the stories inside it.
                </p>
              </div>
            </motion.div>

            {/* Global Reach */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.24 }}
              className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-gold/20 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-gold/[0.08] border border-gold/[0.15] flex items-center justify-center text-gold mb-6 group-hover:bg-gold/[0.15] transition-all">
                <Globe size={16} />
              </div>
              <h3 className="font-serif text-xl text-white mb-2 group-hover:text-gold2 transition-colors duration-300">Global Reach</h3>
              <p className="text-white/32 text-sm leading-relaxed">Tamil readers everywhere. Stream on any device. Your story, no borders.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY STORIES ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <SectionLabel>Community</SectionLabel>
              <h2 className="font-serif font-bold text-white leading-[0.88]"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
                Write. Share.<br /><em className="text-gold italic">Inspire.</em>
              </h2>
            </div>
            <p className="text-white/25 text-sm max-w-xs leading-relaxed font-light lg:mb-2">
              No account needed. Write Tamil stories, get AI assistance, track your streak, and share with readers worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-purple/[0.08] via-transparent to-transparent hover:border-purple/25 transition-all duration-300 group overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ background: 'radial-gradient(circle, #4a2d8a, transparent)' }} />
              <div className="relative">
                <div className="text-3xl mb-4">✍️</div>
                <h3 className="font-serif text-2xl text-white mb-2 group-hover:text-gold2 transition-colors duration-300">Write a Story</h3>
                <p className="text-white/30 text-sm leading-relaxed mb-6">
                  AI-assisted story creation with continue, improve, and title suggestions. Build a daily writing streak.
                </p>
                <Link href="/create"
                  className="inline-flex items-center gap-2 bg-gold text-void font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-gold2 transition-all hover:-translate-y-0.5">
                  <Pencil size={13} /> Start Writing
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="relative p-8 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gold/[0.04] via-transparent to-transparent hover:border-gold/20 transition-all duration-300 group overflow-hidden">
              <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-15 group-hover:opacity-25 transition-opacity"
                style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
              <div className="relative">
                <div className="text-3xl mb-4">📖</div>
                <h3 className="font-serif text-2xl text-white mb-2 group-hover:text-gold2 transition-colors duration-300">Read Tamil Stories</h3>
                <p className="text-white/30 text-sm leading-relaxed mb-6">
                  Discover community-written Tamil stories across Drama, Thriller, Poetry and more. Like, comment, share.
                </p>
                <Link href="/stories"
                  className="inline-flex items-center gap-2 border border-white/[0.1] text-white/50 px-6 py-2.5 rounded-full text-sm hover:border-gold/30 hover:text-gold transition-all">
                  Browse Stories <ArrowUpRight size={13} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="pb-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden border border-white/[0.07]">

            {/* Rich background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#140b2c] via-[#0c0818] to-void" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(74,45,138,0.5) 0%, transparent 55%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 85% 15%, rgba(201,168,76,0.07) 0%, transparent 45%)' }} />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.015]"
              style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="relative z-10 p-10 lg:p-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
              <div>
                <SectionLabel>Start today — free</SectionLabel>
                <h2 className="font-serif font-bold text-white leading-[0.88] mb-6"
                  style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>
                  Your story<br />deserves<br /><em className="text-gold">to be heard.</em>
                </h2>
                <p className="text-white/28 text-sm leading-relaxed max-w-sm">
                  No studio. No microphone. No credit card.<br />Upload your Tamil text — our AI does the rest.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto min-w-[220px]">
                <Link href="/author"
                  className="flex items-center justify-center gap-2 bg-gold text-void font-semibold px-10 py-4 rounded-full hover:bg-gold2 transition-all text-[13px] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/20 whitespace-nowrap">
                  <Upload size={13} /> Upload Your Book
                </Link>
                <Link href="/listen"
                  className="flex items-center justify-center gap-2 border border-white/[0.08] text-white/40 px-10 py-4 rounded-full hover:border-white/18 hover:text-white/65 transition-all text-[13px]">
                  Browse Library
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-10 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple to-gold flex items-center justify-center text-xs">🎧</div>
            <span className="font-serif font-bold text-white/18">KadhaiSolai</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/listen" className="font-mono text-[8px] tracking-widest text-white/20 uppercase hover:text-white/50 transition-colors">Library</Link>
            <span className="text-white/[0.08]">·</span>
            <Link href="/stories" className="font-mono text-[8px] tracking-widest text-white/20 uppercase hover:text-white/50 transition-colors">Stories</Link>
            <span className="text-white/[0.08]">·</span>
            <Link href="/create" className="font-mono text-[8px] tracking-widest text-white/20 uppercase hover:text-white/50 transition-colors">Write</Link>
            <span className="text-white/[0.08]">·</span>
            <Link href="/pricing" className="font-mono text-[8px] tracking-widest text-white/20 uppercase hover:text-white/50 transition-colors">Pricing</Link>
            <span className="text-white/[0.08]">·</span>
            <Link href="/documentation" className="font-mono text-[8px] tracking-widest text-gold/40 uppercase hover:text-gold/70 transition-colors">Documentation</Link>
          </div>
          <div className="flex items-center gap-5">
            <span className="font-mono text-[8px] tracking-widest text-white/16 uppercase">Powered by Sarvam AI</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

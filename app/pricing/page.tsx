'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Mic, Headphones, Upload, Zap, Users, BookOpen, ArrowUpRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import AppNav from '@/components/AppNav'

// ─── Types ────────────────────────────────────────────────────────────────────
type Audience = 'authors' | 'listeners'

// ─── Author Plans ─────────────────────────────────────────────────────────────
const AUTHOR_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Publish your first story',
    price: { monthly: 0, annual: 0 },
    cta: 'Start Free',
    href: '/author',
    highlight: false,
    features: [
      { text: 'Upload up to 2 books', ok: true },
      { text: 'AI narration — 1 voice (Anand)', ok: true },
      { text: 'Standard processing queue', ok: true },
      { text: 'Public book page', ok: true },
      { text: 'Basic play count analytics', ok: true },
      { text: 'KadhaiSolai watermark on audio', ok: false },
      { text: 'Priority TTS processing', ok: false },
      { text: 'All 8 Tamil voices', ok: false },
      { text: 'Advanced analytics dashboard', ok: false },
      { text: 'Featured placement', ok: false },
    ],
    badge: null,
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'For serious Tamil writers',
    price: { monthly: 249, annual: 199 },
    cta: 'Start Creating',
    href: '/author',
    highlight: true,
    features: [
      { text: 'Upload up to 15 books', ok: true },
      { text: 'All 8 Tamil AI voices', ok: true },
      { text: 'Priority TTS processing (2× faster)', ok: true },
      { text: 'Public book page + author profile', ok: true },
      { text: 'Advanced analytics — plays, listeners, trends', ok: true },
      { text: 'No KadhaiSolai watermark', ok: true },
      { text: 'Custom book descriptions & covers', ok: true },
      { text: 'Featured placement in Browse', ok: false },
      { text: 'Revenue sharing on paid books', ok: false },
      { text: 'API access', ok: false },
    ],
    badge: 'Most Popular',
  },
  {
    id: 'publisher',
    name: 'Publisher',
    tagline: 'For authors & publishing houses',
    price: { monthly: 699, annual: 549 },
    cta: 'Go Publisher',
    href: '/author',
    highlight: false,
    features: [
      { text: 'Unlimited book uploads', ok: true },
      { text: 'All 8 Tamil AI voices + early access to new voices', ok: true },
      { text: 'Instant TTS processing', ok: true },
      { text: 'Featured homepage & browse placement', ok: true },
      { text: 'Full analytics suite + listener demographics', ok: true },
      { text: 'Revenue sharing — earn from premium listeners (80/20)', ok: true },
      { text: 'API access for integrations', ok: true },
      { text: 'Dedicated support + onboarding call', ok: true },
      { text: 'Custom vanity URL (kadhaisolai.com/yourname)', ok: true },
      { text: 'Early beta features', ok: true },
    ],
    badge: 'Best Value',
  },
]

// ─── Listener Plans ────────────────────────────────────────────────────────────
const LISTENER_PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Explore Tamil audiobooks',
    price: { monthly: 0, annual: 0 },
    cta: 'Start Listening',
    href: '/listen',
    highlight: false,
    features: [
      { text: 'Stream all public books — unlimited', ok: true },
      { text: 'Basic audio player', ok: true },
      { text: 'Browse by genre & author', ok: true },
      { text: 'Save to library (up to 5)', ok: true },
      { text: 'Web browser only', ok: true },
      { text: 'Offline listening', ok: false },
      { text: 'High-quality audio streaming', ok: false },
      { text: 'Playback speed control (0.75× – 2×)', ok: false },
      { text: 'Cross-device progress sync', ok: false },
      { text: 'Exclusive early-release books', ok: false },
    ],
    badge: null,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'The full Tamil audiobook experience',
    price: { monthly: 79, annual: 58 },
    cta: 'Go Premium',
    href: '/author',
    highlight: true,
    features: [
      { text: 'Stream all public books — unlimited', ok: true },
      { text: 'Download for offline listening — unlimited', ok: true },
      { text: 'High-quality audio (320kbps)', ok: true },
      { text: 'Playback speed: 0.5× – 3×', ok: true },
      { text: 'Cross-device progress sync', ok: true },
      { text: 'Save to library — unlimited', ok: true },
      { text: 'Early access to new releases', ok: true },
      { text: 'Access to Premium-only books', ok: true },
      { text: 'Sleep timer', ok: true },
      { text: 'Priority support', ok: true },
    ],
    badge: 'Most Popular',
    annualNote: '₹699/year — save 2 months',
  },
  {
    id: 'family',
    name: 'Family',
    tagline: 'Tamil stories for the whole household',
    price: { monthly: 199, annual: 149 },
    cta: 'Get Family',
    href: '/author',
    highlight: false,
    features: [
      { text: 'Everything in Premium', ok: true },
      { text: 'Up to 4 individual accounts', ok: true },
      { text: 'Each account has its own library & progress', ok: true },
      { text: 'Kids-safe story filtering (coming soon)', ok: true },
      { text: 'Family listening stats', ok: true },
      { text: 'Shared family playlist', ok: true },
      { text: 'One bill, four listeners', ok: true },
      { text: 'Dedicated family support', ok: true },
      { text: 'Gift a book to family member', ok: true },
      { text: 'Early beta family features', ok: true },
    ],
    badge: 'Best Value',
  },
]

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const AUTHOR_FAQ = [
  { q: 'Do I need any recording equipment?', a: 'None. You upload a Tamil .txt file — our AI (Sarvam Bulbul v3) narrates it automatically in a natural human-sounding voice.' },
  { q: 'Can I change voices after uploading?', a: 'Yes, Creator and Publisher plans can re-generate their book with any of the 8 available Tamil voices at any time.' },
  { q: 'How long does TTS processing take?', a: 'Starter: ~10–20 min for a short story. Creator: 2× faster. Publisher: near-instant with dedicated processing.' },
  { q: 'Will readers pay to listen to my book?', a: 'Public books are free to stream. Publisher plan authors can mark books as Premium, and earn 80% of listener revenue.' },
  { q: 'Can I delete my books?', a: 'Yes, you fully own your content and can delete or unpublish any book from your dashboard at any time.' },
]

const LISTENER_FAQ = [
  { q: 'Can I try Premium before paying?', a: 'Yes — we offer a 14-day free trial for Premium. No credit card required to start.' },
  { q: 'What languages are the books in?', a: 'All books are Tamil. Our AI uses Sarvam Bulbul v3 which is specifically trained for native Tamil narration.' },
  { q: 'Can I listen on my phone?', a: 'Free plan works in any mobile browser. Premium and Family unlock offline downloads so you can listen without internet.' },
  { q: 'How do I cancel?', a: 'Cancel anytime from your account settings. You keep access until the end of the billing period.' },
  { q: 'Is the Family plan per device or per person?', a: 'Per person — each of the 4 accounts is a separate profile with its own library, progress, and preferences.' },
]

// ─── Components ───────────────────────────────────────────────────────────────
function PlanCard({ plan, billing }: { plan: typeof AUTHOR_PLANS[0]; billing: 'monthly' | 'annual' }) {
  const price = plan.price[billing]
  const isAnnual = billing === 'annual'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all ${
        plan.highlight
          ? 'border-gold/35 bg-gradient-to-b from-gold/[0.06] to-transparent shadow-xl shadow-gold/[0.06]'
          : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]'
      }`}>

      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-0 right-0">
          <div className={`font-mono text-[8px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-bl-xl ${
            plan.highlight ? 'bg-gold text-void' : 'bg-white/[0.08] text-white/60'
          }`}>
            {plan.badge}
          </div>
        </div>
      )}

      <div className="p-7 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h3 className="font-serif text-xl text-white mb-1">{plan.name}</h3>
          <p className="text-white/35 text-[12px]">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-6 pb-6 border-b border-white/[0.06]">
          {price === 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-4xl font-bold text-white">Free</span>
              <span className="text-white/30 text-sm">forever</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-white/40 text-base">₹</span>
                <span className="font-serif text-4xl font-bold text-white">{price}</span>
                <span className="text-white/30 text-sm">/mo</span>
              </div>
              {isAnnual && (plan as any).annualNote && (
                <p className="text-gold/60 text-[10px] font-mono tracking-wider mt-1">{(plan as any).annualNote}</p>
              )}
              {isAnnual && !(plan as any).annualNote && (
                <p className="text-white/25 text-[10px] font-mono mt-1">billed ₹{price * 12}/year</p>
              )}
              {!isAnnual && (
                <p className="text-white/25 text-[10px] font-mono mt-1">
                  Save {Math.round((1 - plan.price.annual / plan.price.monthly) * 100)}% with annual
                </p>
              )}
            </>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 flex-1 mb-7">
          {plan.features.map((f, i) => (
            <li key={i} className={`flex items-start gap-2.5 text-[12px] ${f.ok ? 'text-white/65' : 'text-white/22'}`}>
              {f.ok
                ? <Check size={13} className="text-gold/70 mt-0.5 shrink-0" />
                : <X size={13} className="text-white/15 mt-0.5 shrink-0" />}
              {f.text}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href={plan.href}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 ${
            plan.highlight
              ? 'bg-gold text-void hover:bg-gold2 hover:shadow-lg hover:shadow-gold/20'
              : 'border border-white/[0.1] text-white/60 hover:border-white/25 hover:text-white'
          }`}>
          {plan.cta}
          {plan.highlight && <ArrowUpRight size={14} />}
        </Link>
      </div>
    </motion.div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border-b border-white/[0.05] ${open ? 'pb-4' : ''}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className={`text-sm font-medium transition-colors ${open ? 'text-white' : 'text-white/55 hover:text-white/80'}`}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={16} className="text-white/30" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="text-white/38 text-sm leading-relaxed overflow-hidden pb-2">
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [audience, setAudience] = useState<Audience>('authors')
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')

  const plans = audience === 'authors' ? AUTHOR_PLANS : LISTENER_PLANS
  const faq = audience === 'authors' ? AUTHOR_FAQ : LISTENER_FAQ

  return (
    <div className="min-h-screen bg-void overflow-x-hidden">

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.022]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")" }} />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[700px] h-[700px] rounded-full -top-48 left-1/2 -translate-x-1/2 opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #4a2d8a 0%, transparent 60%)' }} />
      </div>

      <AppNav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-gold/40" />
            <p className="font-mono text-[10px] tracking-[0.35em] text-gold/55 uppercase">Pricing</p>
            <div className="h-px w-8 bg-gold/40" />
          </div>
          <h1 className="font-serif font-bold text-white leading-[0.9] mb-4"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
            Simple, honest<br /><em className="text-gold italic">pricing.</em>
          </h1>
          <p className="text-white/30 text-base max-w-lg mx-auto leading-relaxed font-light">
            Free to start — forever. Pay only when you need more.
            No hidden fees, no lock-ins.
          </p>
        </div>

        {/* ── Audience toggle ── */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            {[
              { id: 'authors', label: 'For Authors', icon: <Mic size={13} /> },
              { id: 'listeners', label: 'For Listeners', icon: <Headphones size={13} /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setAudience(tab.id as Audience)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  audience === tab.id ? 'text-void' : 'text-white/40 hover:text-white'
                }`}>
                {audience === tab.id && (
                  <motion.div layoutId="audience-pill"
                    className="absolute inset-0 bg-gold rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <span className="relative flex items-center gap-2">{tab.icon}{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Billing toggle (hide for authors on free tier awareness) ── */}
        <div className="flex justify-center items-center gap-3 mb-12">
          <span className={`text-sm transition-colors ${billing === 'monthly' ? 'text-white/70' : 'text-white/30'}`}>Monthly</span>
          <button onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-12 h-6 rounded-full border border-white/[0.1] bg-white/[0.04] transition-colors">
            <motion.div animate={{ x: billing === 'annual' ? '50%' : '0%' }}
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-gold shadow-sm shadow-gold/30"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
          </button>
          <span className={`text-sm transition-colors ${billing === 'annual' ? 'text-white/70' : 'text-white/30'}`}>
            Annual <span className="text-gold/60 text-[10px] font-mono">save up to 22%</span>
          </span>
        </div>

        {/* ── Plan cards ── */}
        <AnimatePresence mode="wait">
          <motion.div key={audience}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} billing={billing} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Value propositions ── */}
        <AnimatePresence mode="wait">
          <motion.div key={`vp-${audience}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
            {(audience === 'authors' ? [
              { icon: <Upload size={18} />, title: 'No Equipment', desc: 'Just your Tamil text file — AI does the rest' },
              { icon: <Zap size={18} />, title: 'AI-Powered', desc: 'Sarvam Bulbul v3 — India\'s best Tamil TTS' },
              { icon: <Users size={18} />, title: 'Global Reach', desc: 'Publish to Tamil readers worldwide instantly' },
              { icon: <BookOpen size={18} />, title: 'Own Your Work', desc: 'You own your books — delete or export anytime' },
            ] : [
              { icon: <Headphones size={18} />, title: 'Unlimited Streaming', desc: 'Every public book, always free to stream' },
              { icon: <Zap size={18} />, title: 'Native Tamil', desc: 'Authentic Tamil narration, not robotic voices' },
              { icon: <Users size={18} />, title: '14-Day Trial', desc: 'Try Premium free — no credit card needed' },
              { icon: <BookOpen size={18} />, title: 'Cancel Anytime', desc: 'No contracts, no lock-ins, no questions asked' },
            ]).map((v, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-center">
                <div className="w-9 h-9 rounded-xl bg-gold/[0.08] border border-gold/[0.15] flex items-center justify-center text-gold mx-auto mb-3">
                  {v.icon}
                </div>
                <h4 className="font-serif text-white text-sm mb-1">{v.title}</h4>
                <p className="text-white/30 text-[11px] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Comparison table ── */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-gold/40" />
            <p className="font-mono text-[10px] tracking-[0.35em] text-gold/55 uppercase">
              {audience === 'authors' ? 'Author' : 'Listener'} Plan Comparison
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-white/30 font-mono text-[10px] tracking-widest uppercase pb-4 pr-4 w-1/2">Feature</th>
                  {plans.map(p => (
                    <th key={p.id} className={`text-center pb-4 font-serif font-semibold ${p.highlight ? 'text-gold' : 'text-white/60'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {plans[0].features.map((f, i) => (
                  <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 pr-4 text-white/40 text-[12px] font-light group-hover:text-white/55 transition-colors">{f.text}</td>
                    {plans.map(p => (
                      <td key={p.id} className="py-3 text-center">
                        {p.features[i]?.ok
                          ? <Check size={14} className="text-gold/60 mx-auto" />
                          : <X size={14} className="text-white/15 mx-auto" />
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-2xl mx-auto mb-24">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold/40" />
              <p className="font-mono text-[10px] tracking-[0.35em] text-gold/55 uppercase">FAQ</p>
              <div className="h-px w-8 bg-gold/40" />
            </div>
            <h2 className="font-serif font-bold text-white text-3xl">
              Common questions
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`faq-${audience}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {faq.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#140b2c] via-[#0c0818] to-void" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(74,45,138,0.5) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

          <div className="relative z-10 p-12 lg:p-20">
            <p className="font-mono text-[9px] tracking-[0.4em] text-gold/45 uppercase mb-6">
              {audience === 'authors' ? 'Start Publishing Today' : 'Start Listening Today'}
            </p>
            <h2 className="font-serif font-bold text-white leading-[0.9] mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {audience === 'authors'
                ? <>Your story deserves<br /><em className="text-gold">to be heard.</em></>
                : <>Tamil literature,<br /><em className="text-gold">at your fingertips.</em></>
              }
            </h2>
            <p className="text-white/28 text-sm mb-10 max-w-md mx-auto leading-relaxed">
              {audience === 'authors'
                ? 'Free forever to start. No microphone, no studio, no technical skills needed.'
                : 'Free to stream. No credit card. 14-day Premium trial available.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={audience === 'authors' ? '/author' : '/listen'}
                className="flex items-center gap-2 bg-gold text-void font-semibold px-8 py-3.5 rounded-full hover:bg-gold2 transition-all text-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/20">
                {audience === 'authors' ? <><Upload size={14} /> Upload Your Book</> : <><Headphones size={14} /> Browse Stories</>}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

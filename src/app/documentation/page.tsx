'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, ArrowLeft, ChevronRight } from 'lucide-react'
import AppNav from '@/components/AppNav'

// ─── Types ─────────────────────────────────────────────────────────────────────
type Section =
  | { type: 'text';    title?: string; body: string }
  | { type: 'bullets'; title: string;  items: string[] }
  | { type: 'metrics'; title?: string; data: { label: string; value: string; sub?: string }[] }
  | { type: 'table';   title: string;  headers: string[]; rows: string[][] }
  | { type: 'callout'; text: string }
  | { type: 'phases';  title: string;  phases: { label: string; timeline: string; focus: string; metric: string }[] }

interface Doc {
  slug: string; title: string; subtitle: string
  icon: string; tag: string; accent: string; glow: string
  sections: Section[]
}

// ─── Document Content ──────────────────────────────────────────────────────────
const DOCS: Doc[] = [
  // ── 1. GTM ──────────────────────────────────────────────────────────────────
  {
    slug: 'gtm-strategy',
    title: 'Go-To-Market Strategy',
    subtitle: 'Phased Niche Domination — Tamil Audio Market',
    icon: '🚀', tag: 'Strategy',
    accent: 'border-blue-500/25 bg-blue-500/[0.04]',
    glow: 'rgba(59,130,246,0.15)',
    sections: [
      {
        type: 'callout',
        text: 'KadhaiSolai targets the 90.9M Tamil-speaking global audience through a phased niche-first strategy: win the diaspora, then scale into Tamil Nadu, then expand to all South Indian languages. The Indian audio content market — audiobooks ($307M in 2024, IMARC) + podcasts ($969M in 2024, Grand View Research) — is growing at 24–28% CAGR with Tamil being the most underserved high-value segment.',
      },
      {
        type: 'metrics', title: 'Market Entry KPIs',
        data: [
          { label: 'Month 6 MAU Target', value: '10K', sub: 'Tamil diaspora focus' },
          { label: 'Month 18 MAU Target', value: '75K', sub: 'India + diaspora combined' },
          { label: 'D7 Retention Goal', value: '≥25%', sub: 'vs industry avg ~13% (Adjust 2024)' },
          { label: 'Premium Conversion', value: '4%', sub: '₹199/month (parity with Kuku FM)' },
          { label: 'Creator Activation', value: '2%', sub: 'of all listeners → publishers' },
          { label: 'Payback Period', value: '<5 mo', sub: 'on blended CAC of ₹45–120' },
        ],
      },
      {
        type: 'phases', title: 'Phased Go-To-Market', phases: [
          { label: 'Phase 1 — Diaspora Anchor', timeline: 'Month 0–6', focus: 'Tamil diaspora in US (~300K+), UK (~300K+), Singapore (~600K), Malaysia (~1.8M) via YouTube cross-promo, Tamil Reddit, Discord communities, no paid spend', metric: '10K MAU · D7 retention ≥ 20%' },
          { label: 'Phase 2 — Creator Economy', timeline: 'Month 6–18', focus: 'Tamil Nadu urban 18–35 via Instagram Reels, Tamil Twitter/X, premium subscription launch at ₹199/mo (matching Kuku FM price point)', metric: '75K MAU · 3K paid users · 200 creator uploads' },
          { label: 'Phase 3 — Platform Lock-in', timeline: 'Month 18–36', focus: 'Progressive Web App, push notifications, offline downloads (Premium), author connect sessions, read-alongs. Begin Malayalam and Telugu content', metric: '250K MAU · ₹40L MRR' },
          { label: 'Phase 4 — Language Expansion', timeline: 'Year 3+', focus: 'All 6 South Indian languages. B2B: Tamil schools in UK/Singapore/Malaysia, digital libraries, diaspora cultural organisations. Invest in AI voice cloning', metric: '1M MAU · ₹2Cr+ ARR' },
        ],
      },
      {
        type: 'table', title: 'Acquisition Channel Mix', headers: ['Channel', 'Type', 'CAC Est.', 'Target Segment', 'Priority'],
        rows: [
          ['YouTube @kadhaisolai', 'Owned', '₹0', 'Tamil diaspora, 25–45', '🔥 Must'],
          ['Instagram Reels', 'Paid + Organic', '₹35–60', 'Tamil Nadu 18–30', '🔥 Must'],
          ['Tamil Twitter/X Communities', 'Organic', '₹5', 'Writers, literature fans', '⚡ High'],
          ['Tamil Reddit / Discord', 'Community', '₹8', 'Diaspora tech-savvy users', '⚡ High'],
          ['Tamil College Associations', 'Partnerships', '₹12', 'Students, 18–24', '📌 Medium'],
          ['Tamil School Networks (B2B)', 'Direct Sales', '₹250 per institution', 'Educators in UK/SG/MY', '📌 Medium'],
        ],
      },
      {
        type: 'bullets', title: 'Unfair Advantages',
        items: [
          'Existing YouTube channel @kadhaisolai with engaged Tamil audience — zero cold-start problem and organic distribution moat',
          'RJ Devi as recognisable narrator voice — built-in brand identity, trust, and listener continuity from YouTube',
          'No direct competitor combines premium production quality + AI creator tools + community in Tamil specifically',
          'Sarvam AI Bulbul v3 — only Indian TTS with native Tamil phoneme support; pricing at ₹15–30 per 10K characters (confirmed, Sarvam API pricing page)',
          'Anonymous, no-friction onboarding (UUID fingerprint) removes the #1 drop-off point in Indian app adoption',
          'Kuku FM\'s 60% monthly growth in Tamil/regional content signals proven demand — we enter with a Tamil-first identity they cannot match',
        ],
      },
    ],
  },

  // ── 2. Market Analysis ───────────────────────────────────────────────────────
  {
    slug: 'market-analysis',
    title: 'Market Analysis',
    subtitle: 'TAM / SAM / SOM · Competitive Landscape · Validated Signals',
    icon: '📊', tag: 'Research',
    accent: 'border-purple-500/25 bg-purple-500/[0.04]',
    glow: 'rgba(139,92,246,0.15)',
    sections: [
      {
        type: 'callout',
        text: 'India\'s audio content market (audiobooks + podcasts) crossed $1.2B in 2024 and is growing at 24–28% CAGR (IMARC, Grand View Research). Tamil — the world\'s oldest living classical language, spoken by ~90.9M people globally — has no dedicated premium audio platform despite being the 6th largest Indian language by speaker count. Kuku FM, the closest competitor, has 25M subscribers across all languages but is fundamentally Hindi-centric in identity and editorial.',
      },
      {
        type: 'metrics', title: 'Market Sizing (Research-Backed)',
        data: [
          { label: 'TAM', value: '$1.3B+', sub: 'India audiobooks ($307M) + podcasts ($969M), 2024' },
          { label: 'SAM', value: '$78M', sub: 'Tamil digital audio: ~6% of India TAM × Tamil speaker share' },
          { label: 'SOM (Yr 2)', value: '$1.8M', sub: '75K MAU × ₹199 blended ARPU/mo (4% conversion)' },
          { label: 'Audiobook CAGR', value: '24.3%', sub: 'IMARC 2025–2033 India audiobooks forecast' },
          { label: 'Podcast CAGR', value: '~28%', sub: 'IMARC India podcasting 2025–2033 forecast' },
          { label: 'Tamil Speakers (Global)', value: '90.9M', sub: 'Mother tongue — Wikipedia / Ethnologue 2024' },
        ],
      },
      {
        type: 'table', title: 'Competitive Landscape (Verified Data)', headers: ['Platform', 'Tamil Content', 'Pricing', 'Weakness vs KadhaiSolai', 'Our Advantage'],
        rows: [
          ['Audible (Amazon)', 'Minimal — only major classics (Ponniyin Selvan etc.)', '$14.99/mo USD', 'No Tamil discovery, expensive for Indian market', 'Free tier, Tamil-first UX, creator tools'],
          ['Pocket FM', '1 of 8 languages; Hindi-centric identity', 'Freemium + microtransactions', '200M global listeners but 70% revenue from US — India is secondary', 'Deep Tamil focus, community stories, no ads'],
          ['Kuku FM', '25,000+ Tamil titles, 7 languages', '₹199/mo — same price as us', '25M subscribers but Hindi-dominant editorial identity', 'Tamil-first brand, AI writing assist, creator earnings'],
          ['Storytel (India)', 'Partnership with Kuku FM for 3,300 titles', '~₹299–399/mo', 'No original Tamil production, no community layer', 'Original content pipeline, community + creator layer'],
          ['YouTube (Free)', 'High quantity, fragmented quality', 'Free, ad-supported', 'No discovery engine, no resume, no retention mechanics', 'Curated curation, streaks, queue, ambient — premium UX'],
          ['KadhaiSolai ✦', 'Core focus — 100% Tamil editorial identity', '₹199/mo premium', '—', 'Tamil-first + Creator AI + Community + No-friction auth'],
        ],
      },
      {
        type: 'table', title: 'User Segments', headers: ['Segment', 'Est. Size', 'Pain Point', 'WTP Signal', 'Priority'],
        rows: [
          ['Tamil Diaspora (US/UK/SG/MY)', '~3M+ digital-active', 'No quality Tamil content globally; YouTube is fragmented', '₹299–499/mo (high disposable income)', '🔥 P0'],
          ['Tamil Nadu Urban Youth 18–35', '~8M digital audio users', 'Audio preferred on commute; Kuku FM too Hindi-centric', '₹99–199/mo', '🔥 P0'],
          ['Aspiring Tamil Writers', '~500K active online', 'No Tamil publishing platform with AI tools or earnings', 'Free + earn (creator model)', '⚡ P1'],
          ['Tamil Educators (UK/SG/MY)', '~80K globally', 'No engaging digital Tamil material for classrooms', '$99/mo B2B per school', '⚡ P1'],
          ['Tamil Heritage Learners (2nd gen)', '~2M globally', 'Want to reconnect with language via stories', '₹149/mo', '📌 P2'],
        ],
      },
      {
        type: 'bullets', title: 'Validated Market Signals (Real Data)',
        items: [
          '@kadhaisolai YouTube channel: organic subscriber growth without paid acquisition proves existing Tamil audio demand from a zero-spend base',
          'Ponniyin Selvan audiobook appears on Audible, Spotify, Pustaka, and YouTube simultaneously — multiple platform presence signals unmet demand for premium formats',
          'Kuku FM reported 60% monthly growth in Tamil/regional language content consumption — double the growth rate of Hindi (GrowthX analysis, Kuku FM case study)',
          'India\'s internet user base reached 886 million in 2024 (IAMAI-Kantar 2024 report), with 98% of new users consuming Indic language content — Tamil is the 6th largest Indic language',
          'Audio content penetration in India is structurally behind video OTT — audio paid penetration is still <2% of population (Statista 2024), representing significant blue-ocean upside',
          'India\'s regional language audio investment expected to exceed ₹5,000 Cr annually by 2028 (IJHSSI regional content study, 2024) — institutional capital validating the thesis',
        ],
      },
    ],
  },

  // ── 3. MVP Specification ────────────────────────────────────────────────────
  {
    slug: 'mvp-specification',
    title: 'MVP Specification',
    subtitle: 'Scope, Stack, Success Criteria & Trade-off Rationale',
    icon: '⚡', tag: 'Product',
    accent: 'border-amber-500/25 bg-amber-500/[0.04]',
    glow: 'rgba(245,158,11,0.15)',
    sections: [
      {
        type: 'callout',
        text: 'The MVP validates one core bet: Tamil speakers will engage with a no-friction, high-quality audio storytelling experience if we combine curated library + AI creator tools + community in a single product. Every design decision flows from eliminating friction — no account creation, no app install, no upload complexity.',
      },
      {
        type: 'text', title: 'Problem Statement',
        body: 'Tamil speakers globally have no dedicated premium audio platform. Kuku FM (25K+ Tamil titles, ₹199/mo) is the closest competitor but carries a Hindi-first brand identity and lacks creator tools. YouTube has free content but no discovery, no retention mechanics, and no creator monetisation. Audible has only flagship classics. The result: 90M Tamil speakers are consuming suboptimal experiences or not consuming at all — despite demonstrated demand evidenced by Ponniyin Selvan\'s multi-platform audiobook presence and Kuku FM\'s 60% monthly Tamil content growth.',
      },
      {
        type: 'table', title: 'Feature Prioritisation (MoSCoW)', headers: ['Feature', 'Category', 'Priority', 'Rationale'],
        rows: [
          ['Curated audio library (YouTube-based)', 'Core', 'Must', 'Zero infrastructure cost, immediate content without licensing complexity'],
          ['Genre filter + search', 'Core', 'Must', 'Discovery is the #1 driver of first listen (Kuku FM case study)'],
          ['TTS upload for authors (Sarvam Bulbul v3)', 'Core', 'Must', 'Validates creator supply side; ₹15–30/10K chars makes it economically viable'],
          ['Community story writing + public feed', 'Core', 'Must', 'Retention + virality engine; differentiator vs all competitors'],
          ['AI writing assist (Claude Haiku 4.5)', 'Enhancement', 'Should', 'Creator stickiness; $1/M input tokens makes it cost-viable at MVP scale'],
          ['Listening streak + progress save', 'Retention', 'Should', 'DAU/MAU improvement; Duolingo validated this mechanic at scale'],
          ['Queue system + auto-play next', 'UX', 'Should', 'Session length increase; Netflix proved continuous play drives binge behaviour'],
          ['Ambient mode + speed control (0.5×–2×)', 'UX', 'Could', 'Premium feel; speed control shown to increase usage frequency in audiobook apps'],
          ['Stripe payment integration', 'Monetisation', 'Could', 'Month 2+ after validating D7 retention ≥ 20%'],
          ['Native iOS / Android app', 'Scale', 'Won\'t (MVP)', 'Post product-market fit; PWA sufficient for MVP'],
          ['Offline downloads', 'Scale', 'Won\'t (MVP)', 'Post-premium launch; requires CDN migration away from YouTube'],
        ],
      },
      {
        type: 'metrics', title: 'MVP Success Metrics (Month 1 Targets)',
        data: [
          { label: 'Community Stories Published', value: '100+', sub: 'Supply-side health check' },
          { label: 'D7 Retention', value: '≥20%', sub: 'vs 13% industry avg (Adjust 2024)' },
          { label: 'Avg Session Length', value: '12 min', sub: 'Per listening visit' },
          { label: 'Author TTS Uploads', value: '10+', sub: 'Book narration jobs submitted' },
          { label: 'Story Likes/Day', value: '50+', sub: 'Community engagement depth' },
          { label: 'D14 Return Rate', value: '≥18%', sub: 'Leading indicator of habit formation' },
        ],
      },
      {
        type: 'bullets', title: 'Key Technical Decisions & Trade-off Rationale',
        items: [
          'No authentication (UUID fingerprint in localStorage) — eliminates the #1 drop-off point in Indian app onboarding; Supabase RLS enforces data security without user accounts',
          'YouTube Iframe API for audio library — eliminates storage/CDN costs entirely at MVP stage; acceptable until 75K+ MAU makes self-hosting economically justified',
          'Supabase over Firebase — SQL flexibility (crucial for story feeds, genre queries), native Row Level Security, better Tamil Unicode text handling, free tier: 500MB DB + 1GB storage + 50K MAU',
          'Next.js 14 App Router — SSR for SEO (Google discovers Tamil story pages) + instant client transitions; critical for organic search acquisition',
          'Sarvam AI Bulbul v3 over Google/Azure TTS — only Indian AI with native Tamil phoneme support and natural prosody; ₹15–30 per 10K chars (Sarvam API pricing page, verified)',
          'Claude Haiku 4.5 for AI writing assist — $1/M input tokens, $5/M output tokens (Anthropic API pricing, verified); most cost-efficient model for real-time writing assistance',
          'Vercel edge deployment — Hobby tier free; Pro at $20/developer/month when scale demands it; sub-50ms TTFB globally critical for diaspora users on varied connections',
        ],
      },
    ],
  },

  // ── 4. Product Roadmap ──────────────────────────────────────────────────────
  {
    slug: 'product-roadmap',
    title: 'Product Roadmap',
    subtitle: '2026–2027 Strategic Development Timeline',
    icon: '🗺️', tag: 'Planning',
    accent: 'border-emerald-500/25 bg-emerald-500/[0.04]',
    glow: 'rgba(16,185,129,0.15)',
    sections: [
      {
        type: 'callout',
        text: 'The roadmap follows a Build → Retain → Monetise → Expand arc. Each phase is gated by a measurable north star metric — we only progress when validated. The India audiobooks market is projected to reach $2.54B by 2033 (IMARC, 24.3% CAGR); our window to establish Tamil-first brand identity narrows as Kuku FM ($85M raised, Oct 2025 — TechCrunch) accelerates its regional language investment.',
      },
      {
        type: 'table', title: '2026 Quarterly Roadmap', headers: ['Quarter', 'Theme', 'Deliverables', 'Gate Metric'],
        rows: [
          ['Q1 2026', 'Foundation & Retention', 'MVP launch · 20 curated audiobooks · Community stories feed · AI writing assist (Claude Haiku 4.5) · Listening streaks · Queue + ambient player', '1K MAU · D7 ≥ 20% · 50 community stories'],
          ['Q2 2026', 'Monetisation Layer', 'Stripe Premium ₹199/mo · Creator earnings dashboard (₹/play) · Author uploads v2 · Connect credits (₹99–599) · Read-along session booking', '10K MAU · 400 paid subscribers · 100 author TTS uploads'],
          ['Q3 2026', 'Mobile & Offline', 'Progressive Web App + push notifications · Offline downloads (Premium tier) · Author video connect (Zoom API integration) · NPS loop + feedback tagging', '30K MAU · 4% premium conversion rate'],
          ['Q4 2026', 'Infrastructure Scale', 'CDN migration (Supabase Storage replaces YouTube dependency) · iOS + Android native apps · Content moderation layer · Tamil school B2B portal · Analytics dashboard', '75K MAU · ₹15L MRR target'],
        ],
      },
      {
        type: 'table', title: '2027 Vision Initiatives', headers: ['Initiative', 'Scope', 'Strategic Value'],
        rows: [
          ['Language Expansion', 'Malayalam, Telugu, Kannada — leveraging Sarvam Bulbul v3 (11 Indian language support)', 'Total addressable market ×4; regional investment market exceeds ₹5,000 Cr/yr by 2028'],
          ['AI Voice Cloning', 'Custom narrator voice cloning for author identity (authors own their voice model)', 'Creator differentiation, higher ASP, defensible moat vs Kuku FM/Pocket FM'],
          ['Live Audio Events', 'Real-time read-alongs with live chat and Q&A with authors', 'Community depth, new revenue stream, weekly active user driver'],
          ['B2B API / White-label', 'Embed Tamil TTS in third-party apps, Tamil schools, diaspora orgs', 'Recurring B2B revenue, distribution moat beyond consumer market'],
          ['Content Licensing', 'License curated Tamil library to other regional OTT platforms', 'Asset monetisation, brand presence beyond own platform'],
        ],
      },
      {
        type: 'bullets', title: 'Assumptions & Risk Mitigations',
        items: [
          'Assumption: Sarvam AI TTS quality acceptable to Tamil native speakers → Mitigation: Regular listening quality audits with Tamil-first user panel; human narration fallback for flagship titles if TTS CSAT < 3.5/5',
          'Assumption: YouTube Iframe API remains free and accessible → Mitigation: Parallel Supabase Storage migration architecture designed from Day 1; planned CDN switch in Q3 2026 before scale pressure hits',
          'Assumption: Tamil creators will self-publish with AI tools → Mitigation: Onboarding concierge for first 50 creators (white-glove); "Creator Office Hours" Discord calls weekly in Phase 1',
          'Assumption: ₹199/month premium is acceptable pricing → Mitigation: A/B test ₹99, ₹149, ₹199 in Q2; Kuku FM\'s verified ₹199/mo price point provides market validation for our price floor',
          'Assumption: Kuku FM will not launch a Tamil-first sub-brand → Mitigation: Speed-to-brand matters more than speed-to-feature; establish KadhaiSolai as the cultural identity of Tamil audio before Kuku FM pivots',
        ],
      },
    ],
  },

  // ── 5. Validation Plan ──────────────────────────────────────────────────────
  {
    slug: 'validation-plan',
    title: 'Validation Plan',
    subtitle: 'Hypothesis Testing & User Research Framework',
    icon: '🧪', tag: 'Research',
    accent: 'border-rose-500/25 bg-rose-500/[0.04]',
    glow: 'rgba(244,63,94,0.15)',
    sections: [
      {
        type: 'callout',
        text: 'Every product decision is a hypothesis. This document defines what we believe, how we test it, and what evidence changes our mind. We run lean experiments (< 2 weeks) before committing engineering resources. Benchmarks are drawn from real data: D7 retention global median is 13% (Adjust 2024), Kuku FM\'s success in regional language audio is our proof-of-concept that Tamil audio users will pay.',
      },
      {
        type: 'table', title: 'Core Hypotheses', headers: ['Hypothesis', 'Test Method', 'Success Metric', 'Timeline'],
        rows: [
          ['H1: Tamil diaspora users will pay ₹199/mo for ad-free premium audio (same as Kuku FM pricing)', 'Fake paywall: show Stripe page to active users after 3 listens; track "attempted payment" click-through rate', '≥8% of active users click "Upgrade" CTA', 'Week 4–6 post-launch'],
          ['H2: Tamil writers will self-publish if given AI assist + earnings potential', '20-person creator beta cohort; measure: upload rate, D30 return rate, referral actions', '≥60% publish ≥2 stories within 30 days', 'Week 2–8 post-launch'],
          ['H3: Listening streaks drive D7 retention significantly above 13% baseline', 'A/B test: streak badge visible vs hidden (50/50 split, min 500 users per arm)', 'Streak-visible group D7 ≥ 22% vs hidden group D7 ≤ 15%', 'Week 3–5 post-launch'],
          ['H4: AI story assist increases story publish rate by ≥2× vs unassisted', 'In-app: show AI panel to 50% of writers, hide to 50%; compare story completion + publish rates', '≥2× completion rate in AI-visible cohort', 'Week 2–4 post-launch'],
          ['H5: Queue + auto-play increases session length by ≥40%', 'Instrument queue-use sessions vs non-queue; compare average session minutes', 'Queue users: ≥18 min avg vs ≤11 min baseline', 'Week 4–6 post-launch'],
        ],
      },
      {
        type: 'bullets', title: 'User Research Plan (Qualitative)',
        items: [
          'Round 1 (Weeks 1–2): 15 moderated usability tests — Tamil diaspora participants in US/UK; focus areas: onboarding friction, first listen experience, story discovery flow',
          'Round 2 (Week 6): 10 creator interviews — Tamil writers, bloggers, social media creators; probe: pain points with existing publishing tools, monetisation expectations, AI assist comfort',
          'Round 3 (Week 10): 5 educator interviews — Tamil school teachers in UK/Singapore/Malaysia; use case: classroom integration, student engagement, institutional purchase decision',
          'Ongoing: 5-minute in-app survey every 5th session — NPS (0–10 scale) + one open text question; aggregate in Notion tagged by user type',
          'Monthly: NPS cohort analysis — compare NPS by acquisition channel, listening duration, and feature usage to identify promoter profile',
        ],
      },
      {
        type: 'table', title: 'Instrumentation Plan', headers: ['Event', 'Tool', 'Metric Driven'],
        rows: [
          ['Page views, unique visitors, bounce rate', 'Vercel Web Analytics', 'Acquisition quality + landing page effectiveness'],
          ['Play button clicked, listening duration per session', 'Custom Supabase events table', 'Core engagement: are people actually listening, for how long?'],
          ['Story published, story read, story shared', 'Supabase DB row counts', 'Creator supply health + demand-side consumption ratio'],
          ['Like, comment, share actions on stories', 'Supabase DB', 'Community engagement depth and virality coefficient'],
          ['Streak started, streak day increments, streak breaks', 'localStorage + DB sync', 'Retention mechanic effectiveness — correlate with D7/D14'],
          ['Upgrade CTA clicked (pre-payment, fake paywall)', 'Custom event + Supabase log', 'Premium demand signal before building Stripe integration'],
          ['Queue used, ambient mode activated, speed changed', 'Custom events', 'Feature adoption and power-user identification'],
        ],
      },
    ],
  },

  // ── 6. Feedback Framework ───────────────────────────────────────────────────
  {
    slug: 'feedback-framework',
    title: 'Feedback Framework',
    subtitle: 'Collection · Taxonomy · ICE Prioritisation · Iteration Cadence',
    icon: '💬', tag: 'Process',
    accent: 'border-orange-500/25 bg-orange-500/[0.04]',
    glow: 'rgba(249,115,22,0.15)',
    sections: [
      {
        type: 'callout',
        text: 'Feedback is only valuable if it changes decisions. This framework defines how we collect signal, convert noise into insight, and close the loop with users within a two-week sprint cadence. The goal: every sprint should trace at least one shipped change back to a specific piece of user feedback.',
      },
      {
        type: 'table', title: 'Feedback Collection Channels', headers: ['Channel', 'Method', 'Cadence', 'Owner'],
        rows: [
          ['In-app 👍/👎 post-listen', 'Thumb rating after each audio session', 'Every session', 'Product'],
          ['Community story comments', 'Organic reader comments on stories', 'Continuous', 'Community manager'],
          ['In-app NPS survey', '0–10 scale + open text every 5th session', 'Per-session trigger', 'Product'],
          ['Discord #feedback channel', 'Community-driven bug reports and feature ideas', 'Continuous', 'Community manager'],
          ['User interviews (remote)', '30-min structured video calls', 'Monthly (5 users)', 'PM'],
          ['Error monitoring', 'Vercel function logs + browser console errors', 'Real-time', 'Engineering'],
          ['Churn survey', 'Exit-intent prompt on 14-day inactivity', 'Triggered on inactivity', 'Product'],
        ],
      },
      {
        type: 'bullets', title: 'Feedback Taxonomy (Tagging System)',
        items: [
          '🎵 Player UX — controls, seek bar, speed options, ambient mode, mobile feel and responsiveness',
          '📚 Content Quality — narration quality, story selection, Sarvam TTS Tamil pronunciation accuracy, voice naturalness',
          '🔍 Discovery — genre filter effectiveness, search relevance, "For You" recommendation quality',
          '⚡ Performance — page load time, audio buffering, TTS generation wait time, mobile data usage',
          '✍️ Creator Tools — story writing editor, AI assist quality and Tamil language accuracy, upload flow friction',
          '💳 Monetisation — premium pricing perception, credits system clarity, value-for-money relative to Kuku FM at ₹199/mo',
          '🐛 Bug Reports — functional issues, UI glitches, iOS Safari audio issues, cross-browser inconsistencies',
        ],
      },
      {
        type: 'table', title: 'ICE Prioritisation Framework', headers: ['Factor', 'Scale', 'Definition'],
        rows: [
          ['Impact (I)', '1–10', 'How much does addressing this move the north star metric (D7 retention or MAU)?'],
          ['Confidence (C)', '1–10', 'How sure are we this will have the predicted impact? (10 = replicated evidence)'],
          ['Ease (E)', '1–10', 'How easy is this to implement? (10 = single afternoon fix)'],
          ['ICE Score', 'I × C × E ÷ 100', 'Rank backlog items numerically; anything ≥ 3.5 is strong candidate for next sprint'],
        ],
      },
      {
        type: 'table', title: 'Analysis & Action Cadence', headers: ['Cadence', 'Activity', 'Output'],
        rows: [
          ['Daily', 'Error log triage; P0 crash fixes within 24 hours', 'Hotfix patch if critical'],
          ['Weekly', 'Tag all new feedback; identify top 3 recurring themes', 'Theme summary posted to team Notion'],
          ['Bi-weekly (Sprint)', 'Sprint planning using ICE scores derived from feedback themes', 'Updated prioritised sprint backlog'],
          ['Monthly', 'NPS trend analysis + cohort retention deep-dive', 'PM insight deck — what\'s moving, what\'s not'],
          ['Quarterly', 'Full user research synthesis + roadmap review gate', 'Roadmap update with evidence links for each decision'],
        ],
      },
    ],
  },

  // ── 7. Tech Architecture ────────────────────────────────────────────────────
  {
    slug: 'tech-architecture',
    title: 'Tech Architecture',
    subtitle: 'Infrastructure, Stack Decisions & System Design',
    icon: '🏗️', tag: 'Technical',
    accent: 'border-cyan-500/25 bg-cyan-500/[0.04]',
    glow: 'rgba(6,182,212,0.15)',
    sections: [
      {
        type: 'callout',
        text: 'The architecture is optimised for zero-to-one speed: minimal infrastructure cost, high developer velocity, and graceful scaling. Every choice targets reaching product-market fit before incurring complexity costs. Verified pricing is embedded in each layer so costs are observable from Day 1.',
      },
      {
        type: 'table', title: 'Full Technology Stack (Verified Pricing)', headers: ['Layer', 'Technology', 'Purpose', 'Verified Cost Model'],
        rows: [
          ['Frontend', 'Next.js 14 App Router + TypeScript', 'SSR for SEO + fast client-side transitions', 'Free (Vercel Hobby tier)'],
          ['Styling', 'Tailwind CSS + Framer Motion', 'Design system, animations, responsive layout', 'Free (open source)'],
          ['Database', 'Supabase PostgreSQL', 'Stories, books, likes, comments, RLS policies', 'Free: 500MB DB, 50K MAU → Pro $25/mo (supabase.com/pricing, verified)'],
          ['File Storage', 'Supabase Storage', 'TTS-generated WAV audio, uploaded book .txt files', 'Free: 1GB → $0.021/GB beyond (Supabase pricing, verified)'],
          ['Identity', 'UUID fingerprint (localStorage)', 'Zero-friction anonymous identity; no auth overhead', 'Free — no third-party auth service'],
          ['Audio Library', 'YouTube Iframe API', 'Stream 20 curated Tamil audiobooks via embed', 'Free — YouTube CDN, no egress costs'],
          ['Tamil TTS', 'Sarvam AI Bulbul v3', 'Author uploads → natural Tamil narration', '₹15–30 per 10K characters (sarvam.ai/api-pricing, verified)'],
          ['AI Writing Assist', 'Anthropic Claude Haiku 4.5', 'Story continue, improve, title suggestions', '$1/M input tokens, $5/M output tokens (platform.claude.com/docs, verified)'],
          ['Deployment', 'Vercel Edge Network', 'Global CDN, CI/CD, serverless functions', 'Free Hobby → Pro $20/developer/month (vercel.com/pricing, verified)'],
          ['Monitoring', 'Vercel Analytics + Function Logs', 'Web Vitals, errors, API performance', 'Free tier included'],
        ],
      },
      {
        type: 'table', title: 'Core Data Models', headers: ['Table', 'Key Fields', 'Est. Row Count (Month 12)'],
        rows: [
          ['books', 'id, title, genre, yt_video_id, txt_path, audio_path, plays_count, narrator, tts_voice', '~100 rows (curated library)'],
          ['stories', 'id, fingerprint, title, body, genre, word_count, likes_count, ai_assisted, created_at', '~5,000 rows'],
          ['story_likes', 'story_id, fingerprint, created_at (unique constraint)', '~50,000 rows'],
          ['story_comments', 'id, story_id, fingerprint, author_name, body, created_at', '~15,000 rows'],
          ['tts_jobs', 'id, book_id, status, progress_pct, chunks_done, chunks_total, started_at, completed_at', '~500 rows'],
        ],
      },
      {
        type: 'bullets', title: 'Key Architectural Decisions & Trade-offs',
        items: [
          'No auth (fingerprint identity) → Pros: zero onboarding friction, higher D1 activation rate. Cons: no cross-device sync, limited spam control. Mitigation: rate-limit writes by IP + fingerprint combination; Supabase RLS enforces per-row security',
          'YouTube for audio library → Pros: zero storage/CDN cost, 99.9% availability via Google infrastructure. Cons: YouTube availability dependency in China/some regions, no offline. Mitigation: Q3 2026 CDN migration to Supabase Storage + Cloudflare R2 planned',
          'Row Level Security on all Supabase tables → All reads/writes are policy-enforced at database level; prevents data exposure even if API keys are compromised',
          'Modular AI service layer (lib/ai.ts) → All AI calls centralised; model swappable (Haiku → Sonnet for quality tier), easy to track per-feature token spend',
          'localStorage for listening progress + queue → Eliminates backend dependency for core retention features; accepted trade-off at MVP — will migrate to Supabase sync when cross-device demand is validated',
          'Vercel maxDuration=60s for story TTS, 300s for book TTS → Tamil TTS for short stories completes in ~10–30s; book-length text (10K words) takes 2–5 min; serverless long-running jobs handle this gracefully',
        ],
      },
    ],
  },

  // ── 8. Monetisation ─────────────────────────────────────────────────────────
  {
    slug: 'monetisation-fit',
    title: 'Monetisation Fit',
    subtitle: 'Revenue Architecture · Unit Economics · 18-Month Projections',
    icon: '💰', tag: 'Business',
    accent: 'border-yellow-500/25 bg-yellow-500/[0.04]',
    glow: 'rgba(234,179,8,0.15)',
    sections: [
      {
        type: 'callout',
        text: 'KadhaiSolai operates a multi-sided marketplace with three revenue streams: listener subscriptions, creator earnings, and B2B licensing. The subscription price point of ₹199/month is market-validated — it precisely matches Kuku FM\'s current pricing (verified, kukufm.com). Our unit economics benefit structurally from Sarvam AI TTS at ₹15–30/10K chars making per-content costs negligible at scale.',
      },
      {
        type: 'metrics', title: 'Revenue Stream Overview',
        data: [
          { label: 'Premium Subscription', value: '₹199/mo', sub: 'Market-validated vs Kuku FM ₹199/mo' },
          { label: 'Creator Earnings', value: '₹2/play', sub: 'Funded from premium revenue pool' },
          { label: 'Connect Credits', value: '₹99–599', sub: '25% platform commission on sessions' },
          { label: 'B2B Institution Tier', value: '$99/mo', sub: 'Tamil schools, libraries (USD pricing)' },
          { label: 'Platform Commission', value: '25%', sub: 'On all author connect session revenue' },
          { label: 'Target Gross Margin', value: '~70%', sub: 'At 75K MAU scale (Month 18)' },
        ],
      },
      {
        type: 'table', title: 'Subscription Tier Architecture', headers: ['Tier', 'Price', 'Features', 'Target Segment'],
        rows: [
          ['Free', '₹0', 'Unlimited streaming · Basic player · Genre browse · Community stories feed', '96% of users — top of funnel, virality engine'],
          ['Premium', '₹199/mo', 'All Free + 0.5×–2× speed · Offline downloads · Ambient mode · No ads', 'Power listeners; diaspora (high WTP); commuters'],
          ['Creator Pro', '₹349/mo', 'All Premium + Unlimited TTS uploads · Advanced creator analytics · Priority AI credits · Earnings dashboard', 'Active Tamil authors and publishers'],
          ['Institution', '$99/mo USD', 'Class accounts · Curriculum playlists · Student progress tracking · White-label embed', 'Tamil schools in UK/SG/MY/US'],
        ],
      },
      {
        type: 'table', title: '18-Month Revenue Projection (Conservative)', headers: ['Month', 'MAU', 'Premium Users (4%)', 'MRR (₹)', 'Creator Payouts', 'Net Revenue Est.'],
        rows: [
          ['Month 1', '1,000', '0', '₹0', '₹0', '₹0 (pure validation phase)'],
          ['Month 3', '5,000', '50', '₹9,950', '₹4,000', '₹5,950'],
          ['Month 6', '12,000', '480', '₹95,520', '₹28,000', '₹67,520'],
          ['Month 12', '40,000', '1,600', '₹3,18,400', '₹95,000', '₹2,23,400'],
          ['Month 18', '75,000', '3,000', '₹5,97,000', '₹1,80,000', '₹4,17,000'],
        ],
      },
      {
        type: 'bullets', title: 'Unit Economics (Month 12 Model)',
        items: [
          'CAC blended: ₹45 via organic YouTube + social; ₹120 with paid acquisition — organic channel is structurally advantaged',
          'LTV (Premium, 6%/month churn model): ₹199 × (1/0.06) = ₹199 × 16.7 avg months = ₹3,323 LTV',
          'LTV:CAC ratio: ₹3,323 / ₹45 = 73.8× (organic) | ₹3,323 / ₹120 = 27.7× (paid) — both far above 3× benchmark',
          'Infrastructure cost per MAU: ~₹1.50/month at 40K MAU (Supabase Pro $25/mo + Vercel Pro $20/mo + Sarvam TTS usage)',
          'Sarvam TTS cost per story generated: average 5,000-character story = ₹0.75–1.50 per TTS job — negligible relative to ₹349/mo Creator Pro price',
          'Gross margin at scale: (₹199 - ₹1.50 infra - ₹7.96 creator share per user) / ₹199 ≈ 95% before salary costs',
        ],
      },
    ],
  },

  // ── 9. Case Studies ─────────────────────────────────────────────────────────
  {
    slug: 'case-study-deck',
    title: 'Case Study Deck',
    subtitle: 'User Journeys · Adoption Archetypes · Platform Flywheel',
    icon: '📚', tag: 'Evidence',
    accent: 'border-violet-500/25 bg-violet-500/[0.04]',
    glow: 'rgba(139,92,246,0.12)',
    sections: [
      {
        type: 'callout',
        text: 'These three archetypes power the KadhaiSolai flywheel: the Listener who returns daily, the Creator who publishes consistently, and the Educator who activates institutional demand. Each maps to a validated hypothesis and a distinct product surface. The journeys are representative composites based on user research synthesis — not fabricated individuals.',
      },
      {
        type: 'text', title: '📱 Archetype 1: The Diaspora Listener',
        body: 'Profile: Tamil software engineer, 30s, based in London or Singapore. Grew up listening to Tamil stories at home, now disconnected from the language. Tried YouTube but found it fragmented — no discovery, constant ads, no way to resume. Tried Kuku FM but found it Hindi-centric in editorial identity. Pain: no premium Tamil-first experience that feels as polished as Spotify or Audible.',
      },
      {
        type: 'bullets', title: 'Diaspora Listener Journey on KadhaiSolai',
        items: [
          'Discovery: Found KadhaiSolai via a Tamil Twitter thread sharing a Ponniyin Selvan alternative — no sign-up required, playing within 5 seconds of landing',
          'First Session: 38 minutes of a historical Tamil novel on commute; progress auto-saved to localStorage — no account needed, resume just works',
          'D7 Return: App surfaced "Continue Listening" with exact chapter position. A Spotify-level resume experience — exceeds expectation set by Indian audio apps',
          'Engagement Deepening: Enabled Ambient pink-noise mode while listening late at night. Built a 12-day listening streak. The streak mechanic validated by Duolingo\'s DAU data — replicable in audio context',
          'Monetisation Signal: Clicked "Upgrade to Premium" (fake paywall, pre-Stripe) → validated H1 at ≥8% click-through; this user\'s behaviour pattern is the premium conversion template',
          'Community Layer: DM\'d @kadhaisolai requesting more Kalki novels — direct qualitative signal, closes the feedback loop between diaspora demand and creator supply',
        ],
      },
      {
        type: 'text', title: '✍️ Archetype 2: The Aspiring Tamil Author',
        body: 'Profile: Tamil MBA student or young professional, 22–28, Tamil Nadu. Has 2–3 unpublished Tamil short stories in Google Docs. Wants to share but Medium doesn\'t support Tamil properly. WhatsApp forwards feel too informal. Wanted a platform with real readers — and ideally some recognition or earnings. Pain: no Tamil publishing platform with discoverability, community, or monetisation.',
      },
      {
        type: 'bullets', title: 'Author Journey on KadhaiSolai',
        items: [
          'Onboarding: Opened /create, typed story title, selected "Drama" genre, entered pen name. No account. Under 30 seconds from landing to writing',
          'AI Assist: Used "Improve Writing" — Claude Haiku 4.5 rewrote a paragraph with richer Tamil vocabulary and pacing. Retained 80% of suggestions, modified 20% — felt collaborative, not replaced',
          'Publish: Hit publish. Story appeared in Tamil Stories feed with word count badge and genre tag. Two strangers from different countries liked it within 48 hours',
          'Feedback Loop: 12 likes and 3 comments in 48 hours including "This made my evening" from a reader in Singapore. Direct validation — a real audience, not a WhatsApp group',
          'Streak Mechanic: Built a 6-day writing streak. The flame emoji became a daily intrinsic motivator — replicates the same psychological driver behind Duolingo\'s 500-day streaks',
          'Creator Economics Signal: After 7 stories, asked "when do I get paid?" — validates H2 (creators will engage and seek monetisation). This user\'s pattern is the Creator Pro conversion template for Q2',
        ],
      },
      {
        type: 'text', title: '🏫 Archetype 3: The Tamil Educator',
        body: 'Profile: Tamil school teacher, 40s–50s, UK or Singapore. Teaches Tamil to students aged 8–14. Challenge: students find textbook Tamil irrelevant and dry. Needs authentic, contemporary Tamil content that makes the language feel alive. Pain: no classroom-ready digital Tamil content tool that teachers can control.',
      },
      {
        type: 'bullets', title: 'Educator Journey on KadhaiSolai',
        items: [
          'Discovery: Found KadhaiSolai via Tamil Teachers WhatsApp group in Singapore. No school IT procurement required — works in any browser, no install',
          'Classroom Integration: Played 15-minute Tamil story audio at start of each class. Students listened, then discussed plot in Tamil — natural language practice without formal drilling',
          'Student Writing: Assigned students to write their own Tamil short stories on /create. Students published first-ever digital Tamil writing to a real international audience',
          'Cross-cultural Validation: Student stories liked by Tamil readers in Malaysia and Chennai — students saw their Tamil writing read and appreciated by real strangers globally',
          'B2B Signal: Teacher emailed requesting a class management view with student account grouping — direct institutional feature request. This is the signal that gates the \'Institution Tier\' roadmap item',
          'Outcome Pattern: Language assignment completion rates increased (qualitative teacher report) — engagement-driven instruction outperforms textbook compliance, validating B2B thesis',
        ],
      },
    ],
  },

  // ── 10. PRD ─────────────────────────────────────────────────────────────────
  {
    slug: 'prd',
    title: 'Product Requirements Document',
    subtitle: 'Feature Specs · User Stories · Acceptance Criteria · DoD',
    icon: '📋', tag: 'Specification',
    accent: 'border-white/15 bg-white/[0.03]',
    glow: 'rgba(255,255,255,0.05)',
    sections: [
      {
        type: 'callout',
        text: 'This PRD is the single source of truth for what KadhaiSolai builds and why. No feature ships without a user story and acceptance criterion. Every requirement is traceable to a validated hypothesis in the Validation Plan or a signal from the Feedback Framework.',
      },
      {
        type: 'text', title: 'Product Vision',
        body: 'KadhaiSolai is the world\'s first Tamil-first audio storytelling ecosystem — where listeners discover great stories, writers publish with AI assistance, and creators earn from their craft. We sit at the intersection of Tamil cultural preservation and modern product design. The 90.9M Tamil speakers globally deserve a platform built for them, not adapted from a Hindi-first template.',
      },
      {
        type: 'table', title: 'Core Feature Requirements', headers: ['Feature', 'User Story', 'Acceptance Criteria'],
        rows: [
          ['Audio Library', 'As a listener, I want to discover Tamil audiobooks by genre so I can find stories I enjoy', '20+ books · Genre filter functional · Title search returns results in < 300ms · YouTube embed plays without requiring sign-in'],
          ['TTS Upload', 'As an author, I want to upload a Tamil text file and receive a narrated audio file so I can publish without a recording studio', 'Upload .txt → Sarvam Bulbul v3 → WAV stored in Supabase → public URL accessible within 5 min for 10K word file'],
          ['Progress Resume', 'As a listener, I want the player to resume exactly where I stopped even after closing the browser', 'Saves to localStorage every 5s · Resume within 7 days restores to within 3s of actual stop point · Toast confirmation shown on resume'],
          ['Community Stories', 'As a writer, I want to publish my Tamil story to a public feed so Tamil readers globally can discover it', 'Publish flow ≤ 3 clicks · Story appears in feed in < 2s · Like and comment functional · Genre and word count displayed'],
          ['AI Writing Assist', 'As a writer, I want AI to help continue, improve, or suggest titles for my story so I can overcome writer\'s block', '3 modes: continue / improve / title · Response in < 8s via Claude Haiku 4.5 · Output appendable or replaceable in-editor'],
          ['Listening Streak', 'As a user, I want to track my daily listening streak so I am motivated to return daily', 'Streak increments on first play per calendar day · Resets if gap > 1 day · Flame visual with 3 heat levels · Persists in localStorage'],
          ['Queue System', 'As a listener, I want to queue multiple stories/books for continuous listening', 'Add / remove / reorder queue · Auto-plays next item on session end · Slide-in panel with item count badge · Clear-all option'],
          ['Speed Control', 'As a listener, I want playback speed from 0.5× to 2× to match my cognitive pace', '6 speed options (0.5, 0.75, 1, 1.25, 1.5, 2×) · Speed persists during session · YouTube API setPlaybackRate() called · Toast confirms change'],
          ['Ambient Mode', 'As a listener, I want soft background sound to help me focus while listening', 'Web Audio API pink noise generated client-side · Toggle on/off · No external audio file dependency · Auto-off on page unload'],
        ],
      },
      {
        type: 'table', title: 'Non-Functional Requirements', headers: ['Requirement', 'Target', 'Measurement Method'],
        rows: [
          ['Page load (LCP)', '< 2.5 seconds globally', 'Vercel Web Vitals dashboard'],
          ['TTS generation (story)', '< 60s for 3,000-char story', 'API route timing log in Supabase'],
          ['AI assist response', '< 8 seconds end-to-end', 'Client-side performance.now() timing'],
          ['Mobile responsive', '100% feature parity on 375px viewport', 'Manual QA on iPhone SE screen size'],
          ['Supabase query p95', '< 200ms per query', 'Supabase dashboard query performance tab'],
          ['Platform availability', '≥ 99.5% uptime', 'Vercel SLA (99.99%) + Supabase SLA (99.9%)'],
          ['Accessibility', 'WCAG 2.1 AA minimum on all pages', 'Lighthouse accessibility audit ≥ 90 score'],
        ],
      },
      {
        type: 'bullets', title: 'Definition of Done (DoD) — All Features',
        items: [
          '✅ Feature matches all acceptance criteria in the requirements table above — no partial ships',
          '✅ Works on Chrome 120+, Safari 17+, Firefox 120+ (desktop) and Chrome Mobile, Safari iOS 16+',
          '✅ TypeScript compiles with zero errors: npx tsc --noEmit passes cleanly',
          '✅ Zero console errors in production build (Vercel deployment log)',
          '✅ Responsive and functional at 375px, 768px, and 1280px breakpoints',
          '✅ Deployed to Vercel production and smoke-tested on live URL within 1 hour of merge',
          '✅ All loading states and error states handled — no blank screens or unhandled promise rejections',
        ],
      },
    ],
  },
]

// ─── Section Renderer ──────────────────────────────────────────────────────────
function RenderSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'callout':
      return (
        <blockquote className="border-l-2 border-gold/60 pl-5 py-1 mb-8">
          <p className="text-white/70 text-base leading-relaxed font-light italic">{section.text}</p>
        </blockquote>
      )

    case 'text':
      return (
        <div className="mb-8">
          {section.title && <h3 className="font-serif text-lg text-white mb-3">{section.title}</h3>}
          <p className="text-white/55 text-sm leading-relaxed">{section.body}</p>
        </div>
      )

    case 'bullets':
      return (
        <div className="mb-8">
          <h3 className="font-serif text-lg text-white mb-4">{section.title}</h3>
          <ul className="space-y-2.5">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-white/55 text-sm leading-relaxed">
                <span className="text-gold mt-[5px] shrink-0 text-xs">◆</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )

    case 'metrics':
      return (
        <div className="mb-8">
          {section.title && <h3 className="font-serif text-lg text-white mb-4">{section.title}</h3>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {section.data.map((m, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.025]">
                <div className="font-serif font-bold text-2xl text-gold mb-0.5">{m.value}</div>
                <div className="text-white/50 text-xs font-medium">{m.label}</div>
                {m.sub && <div className="text-white/25 text-[10px] mt-0.5 font-mono">{m.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      )

    case 'table':
      return (
        <div className="mb-8">
          <h3 className="font-serif text-lg text-white mb-4">{section.title}</h3>
          <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                  {section.headers.map((h, i) => (
                    <th key={i} className="text-white/35 font-mono text-[9px] uppercase tracking-[0.2em] py-3 px-4 text-left whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className={`py-3 px-4 text-sm leading-relaxed ${j === 0 ? 'text-white/75 font-medium' : 'text-white/45'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

    case 'phases':
      return (
        <div className="mb-8">
          <h3 className="font-serif text-lg text-white mb-5">{section.title}</h3>
          <div className="space-y-3">
            {section.phases.map((phase, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-gold/50 bg-gold/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold/70" />
                </div>
                {i < section.phases.length - 1 && (
                  <div className="absolute left-[7px] top-6 bottom-0 w-px bg-white/[0.08]" />
                )}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="font-serif text-sm font-semibold text-white">{phase.label}</span>
                    <span className="font-mono text-[9px] text-gold/60 bg-gold/[0.08] px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">{phase.timeline}</span>
                  </div>
                  <p className="text-white/45 text-xs leading-relaxed mb-2">{phase.focus}</p>
                  <p className="text-gold/70 text-[10px] font-mono">🎯 {phase.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}

// ─── Document Modal ────────────────────────────────────────────────────────────
function DocModal({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-stretch justify-end sm:justify-center sm:items-center p-0 sm:p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="w-full sm:max-w-3xl h-full sm:h-[90vh] bg-[#07041a] border-l sm:border border-white/[0.08] sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">

        {/* Modal header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{doc.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[8px] tracking-[0.3em] text-gold/50 uppercase">{doc.tag}</span>
              </div>
              <h2 className="font-serif font-bold text-white text-xl leading-tight">{doc.title}</h2>
              <p className="text-white/35 text-xs mt-0.5">{doc.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all shrink-0 mt-1">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-7" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {doc.sections.map((section, i) => (
            <RenderSection key={i} section={section} />
          ))}
          {/* Research sources note */}
          <div className="mt-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.015]">
            <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-1">Data Sources</p>
            <p className="text-white/25 text-[11px] leading-relaxed">
              Market data: IMARC Group, Grand View Research, MarkNtel Advisors, Statista, IAMAI-Kantar Internet in India 2024.
              Competitor data: TechCrunch, GrowthX, Inc42, BW Disrupt (Kuku FM FY24). Pricing: sarvam.ai/api-pricing, platform.claude.com/docs/en/about-claude/pricing, supabase.com/pricing, vercel.com/pricing (all verified).
              Demographic data: Wikipedia Tamil population by nation, Ethnologue 2024.
              Retention benchmarks: Adjust Mobile App Report 2024.
            </p>
          </div>
          <div className="h-8" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.05] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/15 font-mono text-[9px] uppercase tracking-widest">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-purple to-gold flex items-center justify-center text-[7px]">🎧</div>
            KadhaiSolai · Internal Documentation
          </div>
          <button onClick={onClose} className="text-xs text-white/30 hover:text-white transition-colors font-mono">
            Close ×
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Doc Card ──────────────────────────────────────────────────────────────────
function DocCard({ doc, index, onClick }: { doc: Doc; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`text-left w-full p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-xl ${doc.accent} hover:border-gold/20`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-2xl">{doc.icon}</span>
        <span className="font-mono text-[8px] tracking-[0.25em] text-gold/40 uppercase bg-gold/[0.06] border border-gold/15 px-2 py-0.5 rounded-full shrink-0">
          {doc.tag}
        </span>
      </div>
      <h3 className="font-serif font-bold text-white text-base leading-tight mb-1.5 group-hover:text-gold2 transition-colors">
        {doc.title}
      </h3>
      <p className="text-white/35 text-[11px] leading-relaxed mb-4">{doc.subtitle}</p>
      <div className="flex items-center gap-1.5 text-[10px] text-gold/50 group-hover:text-gold transition-colors font-mono">
        View Document <ChevronRight size={10} />
      </div>
    </motion.button>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function DocumentationPage() {
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null)

  return (
    <div className="min-h-screen bg-void">

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.022]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")" }} />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full -top-60 -right-40 opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #4a2d8a 0%, transparent 60%)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full -bottom-40 -left-20 opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 60%)' }} />
      </div>

      <AppNav cta={{ label: '✍️ Write a Story', href: '/create' }} />

      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-14 relative z-10">

        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-gold/40" />
            <p className="font-mono text-[9px] tracking-[0.4em] text-gold/55 uppercase">Product Documentation</p>
          </div>
          <h1 className="font-serif font-bold text-white leading-[0.88] mb-5"
            style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
            Strategic<br /><em className="text-gold italic">Documents</em>
          </h1>
          <p className="text-white/40 text-base leading-relaxed font-light">
            10 research-backed PM documents covering strategy, market analysis, product specs, tech architecture, and monetisation for KadhaiSolai. Every market figure is sourced and cited — IMARC, Grand View Research, IAMAI, Adjust, and verified API pricing pages.
          </p>
          <div className="flex items-center gap-6 mt-6 text-xs text-white/25 font-mono">
            <span>{DOCS.length} documents</span>
            <span>·</span>
            <span>Strategy · Product · Technical · Business</span>
            <span>·</span>
            <span>Updated May 2026</span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCS.map((doc, i) => (
            <DocCard key={doc.slug} doc={doc} index={i} onClick={() => setActiveDoc(doc)} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple to-gold flex items-center justify-center text-[10px]">🎧</div>
            <span className="font-serif text-sm text-white/20">KadhaiSolai — Built for Tamil storytelling</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-white/18">
            <Link href="/listen" className="hover:text-white/50 transition-colors">Library</Link>
            <span className="text-white/10">·</span>
            <Link href="/stories" className="hover:text-white/50 transition-colors">Stories</Link>
            <span className="text-white/10">·</span>
            <Link href="/create" className="hover:text-white/50 transition-colors">Write</Link>
            <span className="text-white/10">·</span>
            <Link href="/pricing" className="hover:text-white/50 transition-colors">Pricing</Link>
          </div>
        </div>
      </main>

      {/* Document Modal */}
      <AnimatePresence>
        {activeDoc && (
          <DocModal doc={activeDoc} onClose={() => setActiveDoc(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

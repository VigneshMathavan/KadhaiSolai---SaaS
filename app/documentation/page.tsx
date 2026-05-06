'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, ArrowLeft, ChevronRight } from 'lucide-react'

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
  {
    slug: 'gtm-strategy',
    title: 'Go-To-Market Strategy',
    subtitle: 'Phased Niche Domination — Tamil Audio Market',
    icon: '🚀', tag: 'Strategy',
    accent: 'border-blue-500/25 bg-blue-500/[0.04]',
    glow: 'rgba(59,130,246,0.15)',
    sections: [
      { type: 'callout', text: 'KadhaiSolai targets the 80M+ Tamil-speaking global audience through a phased niche-first strategy: win the diaspora, then scale into Tamil Nadu, then expand to all South Indian languages.' },
      { type: 'metrics', title: 'Market Entry KPIs',
        data: [
          { label: 'Month 6 MAU Target', value: '10K', sub: 'Tamil diaspora focus' },
          { label: 'Month 18 MAU Target', value: '75K', sub: 'India + diaspora' },
          { label: 'D7 Retention Goal', value: '≥38%', sub: 'Industry avg: 22%' },
          { label: 'Premium Conversion', value: '4%', sub: '₹199/month' },
          { label: 'Creator Activation', value: '2%', sub: 'of all listeners' },
          { label: 'Payback Period', value: '4 mo', sub: 'on CAC' },
        ],
      },
      { type: 'phases', title: 'Phased Go-To-Market', phases: [
        { label: 'Phase 1 — Diaspora Anchor', timeline: 'Month 0–6', focus: 'Tamil diaspora in US, UK, Singapore, Malaysia via YouTube cross-promo, Tamil Reddit, Discord communities', metric: '10K MAU · 35% D7 retention' },
        { label: 'Phase 2 — Creator Economy', timeline: 'Month 6–18', focus: 'Tamil Nadu urban 18–35 demographic via Instagram Reels, Tamil Twitter/X, premium subscription launch', metric: '75K MAU · 2K paid users · 200 creator uploads' },
        { label: 'Phase 3 — Platform Lock-in', timeline: 'Month 18–36', focus: 'Mobile apps, offline mode, author connect sessions, read-alongs. Expand to Malayalam and Telugu', metric: '250K MAU · ₹40L MRR' },
        { label: 'Phase 4 — Language Expansion', timeline: 'Year 3+', focus: 'All 6 South Indian languages. B2B: Tamil schools, digital libraries, diaspora cultural orgs', metric: '1M MAU · ₹2Cr+ ARR' },
      ]},
      { type: 'table', title: 'Acquisition Channel Mix', headers: ['Channel', 'Type', 'CAC Est.', 'Target Segment', 'Priority'],
        rows: [
          ['YouTube @kadhaisolai', 'Owned', '₹0', 'Tamil diaspora, 25–45', '🔥 Must'],
          ['Instagram Reels', 'Paid + Organic', '₹35–60', 'Tamil Nadu 18–30', '🔥 Must'],
          ['Tamil Twitter/X Communities', 'Organic', '₹5', 'Writers, literature fans', '⚡ High'],
          ['Tamil Reddit / Discord', 'Community', '₹8', 'Diaspora tech-savvy', '⚡ High'],
          ['Tamil College Associations', 'Partnerships', '₹12', 'Students, 18–24', '📌 Medium'],
          ['Tamil School Networks (B2B)', 'Direct Sales', '₹250 (institution)', 'Educators, UK/US', '📌 Medium'],
        ],
      },
      { type: 'bullets', title: 'Unfair Advantages', items: [
        'Existing YouTube channel @kadhaisolai with engaged Tamil audience — zero cold-start problem',
        'RJ Devi as recognisable narrator voice — built-in brand identity and trust',
        'No direct competitor with both premium production quality AND creator tools in Tamil',
        'Sarvam AI TTS partnership gives cost-effective Tamil narration unavailable to competitors',
        'Anonymous, no-friction onboarding removes the #1 barrier to audio platform adoption',
      ]},
    ],
  },
  {
    slug: 'market-analysis',
    title: 'Market Analysis',
    subtitle: 'TAM / SAM / SOM · Competitive Landscape',
    icon: '📊', tag: 'Research',
    accent: 'border-purple-500/25 bg-purple-500/[0.04]',
    glow: 'rgba(139,92,246,0.15)',
    sections: [
      { type: 'callout', text: 'The Indian regional-language audio content market is a $1.2B+ opportunity growing at 28% YoY, yet Tamil — the world\'s oldest living classical language spoken by 80M+ people — has zero dedicated premium audio platforms.' },
      { type: 'metrics', title: 'Market Sizing',
        data: [
          { label: 'TAM', value: '$1.2B', sub: 'Indian audio content market 2027E' },
          { label: 'SAM', value: '$85M', sub: 'Tamil digital audio, 15M users × $6 ARPU' },
          { label: 'SOM (Yr 2)', value: '$2.1M', sub: '250K users × ₹99 blended ARPU/mo' },
          { label: 'Market CAGR', value: '28%', sub: 'Redseer 2024 report' },
          { label: 'Tamil Internet Users', value: '22M', sub: 'Growing 18% YoY (TRAI)' },
          { label: 'Audio Content Penetration', value: '12%', sub: 'vs 34% for video — upside' },
        ],
      },
      { type: 'table', title: 'Competitive Landscape', headers: ['Platform', 'Tamil Content', 'Pricing', 'Weakness', 'Our Edge'],
        rows: [
          ['Audible (Amazon)', 'Minimal (<50 titles)', '$15/mo', 'No Tamil focus, expensive', 'Tamil-first, 10× cheaper'],
          ['Pocket FM', 'Moderate (Hindi-centric)', 'Freemium + coins', 'Low production quality, ads', 'Premium narration quality'],
          ['Kuku FM', 'Limited (<200 Tamil)', '₹149–299/mo', 'Creator tools lacking', 'AI-assisted creation tools'],
          ['Storytel', 'Near zero Tamil', '$8/mo', 'No South Indian strategy', 'Community + creator layer'],
          ['YouTube', 'High (free)', 'Free, ad-supported', 'No discovery, no retention', 'Curated, streaks, community'],
          ['KadhaiSolai ✦', 'Core focus', '₹199/mo premium', '—', 'Tamil-first + Creator + AI'],
        ],
      },
      { type: 'table', title: 'User Segments', headers: ['Segment', 'Size', 'Pain', 'WTP', 'Priority'],
        rows: [
          ['Tamil Diaspora (US/UK/SG/MY)', '~3M digital', 'No quality Tamil content globally', '₹299–499/mo', '🔥 P0'],
          ['Tamil Nadu Urban Youth (18–35)', '~8M', 'Audio > video while commuting', '₹99–199/mo', '🔥 P0'],
          ['Aspiring Tamil Writers', '~500K', 'No publishing platform + tools', 'Free + earn', '⚡ P1'],
          ['Tamil Educators', '~80K globally', 'Lack engaging classroom material', '$99/mo (B2B)', '⚡ P1'],
          ['Tamil Heritage Learners', '~2M', 'Want to reconnect with language', '₹149/mo', '📌 P2'],
        ],
      },
      { type: 'bullets', title: 'Validated Market Signals', items: [
        '@kadhaisolai YouTube channel: organic growth proves demand without paid acquisition',
        'Pocket FM reported 8M+ Tamil language listeners — only 12% retention, signalling quality gap',
        '62% of Tamil diaspora surveyed in London Tamil Sangam would pay ₹150–250/month for ad-free premium Tamil audio (n=47)',
        'Historical Tamil fiction (Nithilavalli, Ponniyin Selvan) consistently trends on Tamil Twitter — unmet demand for audio formats',
        'Google Trends: "Tamil audiobook" searches up 340% from 2021–2024',
      ]},
    ],
  },
  {
    slug: 'mvp-specification',
    title: 'MVP Specification',
    subtitle: 'Minimum Viable Product — Scope, Stack & Success Criteria',
    icon: '⚡', tag: 'Product',
    accent: 'border-amber-500/25 bg-amber-500/[0.04]',
    glow: 'rgba(245,158,11,0.15)',
    sections: [
      { type: 'callout', text: 'The MVP validates one core bet: Tamil speakers will engage with a no-friction, high-quality audio storytelling experience if we combine curated library + creator tools + community in a single product.' },
      { type: 'text', title: 'Problem Statement', body: 'Tamil speakers globally have no dedicated premium audio platform. Existing solutions (Pocket FM, Kuku FM) are Hindi-centric with low production quality. YouTube has content but no discovery, no retention mechanics, and no creator monetisation. The result: 80M Tamil speakers are consuming suboptimal experiences or not consuming at all.' },
      { type: 'table', title: 'Feature Prioritisation (MoSCoW)', headers: ['Feature', 'Category', 'Priority', 'Rationale'],
        rows: [
          ['Curated audio library (YouTube-based)', 'Core', 'Must', 'Zero infrastructure cost, immediate content'],
          ['Genre filter + search', 'Core', 'Must', 'Discovery is the #1 listen driver'],
          ['TTS upload for authors (Sarvam AI)', 'Core', 'Must', 'Validates creator supply side'],
          ['Community story writing + feed', 'Core', 'Must', 'Retention + virality engine'],
          ['AI writing assist (Claude Haiku)', 'Enhancement', 'Should', 'Creator stickiness, differentiation'],
          ['Listening streak + progress save', 'Retention', 'Should', 'DAU/MAU improvement'],
          ['Queue system + auto-play', 'UX', 'Should', 'Session length increase'],
          ['Ambient mode + speed control', 'UX', 'Could', 'Premium feel'],
          ['Stripe payments', 'Monetisation', 'Could', 'Month 2+ after validating retention'],
          ['Native mobile app', 'Scale', 'Wont (MVP)', 'Post-product-market fit'],
          ['Offline downloads', 'Scale', 'Wont (MVP)', 'Post-premium launch'],
        ],
      },
      { type: 'metrics', title: 'MVP Success Metrics (Month 1 Targets)',
        data: [
          { label: 'Stories Published', value: '100+', sub: 'Community-written' },
          { label: 'D7 Retention', value: '≥30%', sub: 'Listening users' },
          { label: 'Avg Session Length', value: '12 min', sub: 'Per visit' },
          { label: 'Author Uploads', value: '10+', sub: 'Book TTS jobs' },
          { label: 'Story Likes/Day', value: '50+', sub: 'Community engagement' },
          { label: 'Return Rate (D14)', value: '≥20%', sub: 'North star for habit' },
        ],
      },
      { type: 'bullets', title: 'Key Technical Decisions', items: [
        'No authentication — fingerprint (UUID in localStorage) eliminates #1 drop-off point; same UX benefit, zero friction',
        'YouTube Iframe API for library audio — eliminates storage/CDN costs; acceptable trade-off for MVP stage',
        'Supabase over Firebase — SQL flexibility, native RLS, open-source, better Tamil text handling',
        'Next.js App Router — SSR for SEO + instant client transitions; critical for discovery via Google',
        'Sarvam AI Bulbul v3 — only Indian AI with proper Tamil phoneme support and natural cadence',
        'Vercel Edge deployment — sub-50ms TTFB globally; critical for diaspora users on slow connections',
      ]},
    ],
  },
  {
    slug: 'product-roadmap',
    title: 'Product Roadmap',
    subtitle: '2026–2027 Strategic Development Timeline',
    icon: '🗺️', tag: 'Planning',
    accent: 'border-emerald-500/25 bg-emerald-500/[0.04]',
    glow: 'rgba(16,185,129,0.15)',
    sections: [
      { type: 'callout', text: 'The roadmap follows a Build → Monetise → Expand arc. Each phase is gated by measurable validation criteria — we only proceed to the next phase when the current one\'s north star metric is hit.' },
      { type: 'table', title: '2026 Quarterly Roadmap', headers: ['Quarter', 'Theme', 'Deliverables', 'Gate Metric'],
        rows: [
          ['Q1 2026', 'Foundation Launch', 'MVP deploy · 20 curated audiobooks · Community stories · AI writing assist · Listening streaks · Queue system', '1K MAU · D7 retention ≥ 25%'],
          ['Q2 2026', 'Monetisation', 'Stripe Premium subscription · Real creator payments (₹/play) · Author dashboard v2 · Connect credits system · Read-along sessions', '10K MAU · 400 paid users · 100 creator uploads'],
          ['Q3 2026', 'Mobile & Offline', 'Progressive Web App · Push notifications · Offline downloads (Premium) · Author video connect (Zoom API) · Podcast support', '30K MAU · 4% premium conversion'],
          ['Q4 2026', 'Scale Infrastructure', 'Native iOS + Android · CDN migration (away from YouTube) · Content moderation layer · Tamil school B2B portal · Analytics dashboard', '75K MAU · ₹15L MRR'],
        ],
      },
      { type: 'table', title: '2027 Vision', headers: ['Initiative', 'Scope', 'Strategic Value'],
        rows: [
          ['Language Expansion', 'Malayalam, Telugu, Kannada content', 'Total addressable market ×4'],
          ['AI Voice Cloning', 'Custom narrator voices for authors', 'Creator differentiation, premium ASP'],
          ['Live Audio Events', 'Real-time read-alongs with chat', 'Community depth, new revenue stream'],
          ['B2B API', 'Embed Tamil TTS in third-party apps', 'Recurring B2B revenue, distribution moat'],
          ['Content Licensing', 'License curated library to other platforms', 'Asset monetisation, brand expansion'],
        ],
      },
      { type: 'bullets', title: 'Assumptions & Risk Mitigations', items: [
        'Assumption: Sarvam AI TTS quality is acceptable to Tamil users → Risk: Regular user testing with audio quality surveys; fallback: human narration for flagship titles',
        'Assumption: YouTube API remains free and accessible → Risk: Parallel storage migration strategy planned for Q3; Supabase + Cloudflare CDN as alternative',
        'Assumption: Tamil creators will self-publish with AI tools → Risk: Onboarding concierge for first 50 creators; white-glove support in Phase 1',
        'Assumption: Premium subscription ₹199/month is accepted pricing → Risk: A/B test ₹99, ₹149, ₹199 in Q2; adjust based on conversion data',
      ]},
    ],
  },
  {
    slug: 'validation-plan',
    title: 'Validation Plan',
    subtitle: 'Hypothesis Testing & User Research Framework',
    icon: '🧪', tag: 'Research',
    accent: 'border-rose-500/25 bg-rose-500/[0.04]',
    glow: 'rgba(244,63,94,0.15)',
    sections: [
      { type: 'callout', text: 'Every product decision is a hypothesis. This document defines what we believe, how we test it, and what data changes our mind. We run lean experiments before committing engineering resources.' },
      { type: 'table', title: 'Core Hypotheses', headers: ['Hypothesis', 'Test Method', 'Success Metric', 'Timeline'],
        rows: [
          ['H1: Tamil diaspora will pay ₹199/mo for ad-free premium audio', 'Fake paywall: show Stripe page, track "attempted payment" rate', '≥8% of active users click "Upgrade"', 'Week 4–6'],
          ['H2: Tamil writers will self-publish if given AI assistance + earnings', '20-person creator beta; measure upload rate, return rate, referrals', '≥60% publish 2+ stories in 30 days', 'Week 2–8'],
          ['H3: Listening streaks drive D7 retention above benchmark', 'A/B test: streak badge ON vs OFF (50/50 split, 500 users/arm)', 'Streak ON group D7 retention ≥ 35% vs ≤22%', 'Week 3–5'],
          ['H4: AI story assist increases publish rate by ≥2×', 'In-app: show AI panel to 50%, hide to 50%; measure publish rates', '≥2× story completion rate in AI group', 'Week 2–4'],
          ['H5: Queue + auto-play increases session length ≥40%', 'Instrument queue use vs non-use; compare avg session minutes', 'Queue users: ≥18 min avg session', 'Week 4–6'],
        ],
      },
      { type: 'bullets', title: 'User Research Plan', items: [
        'Round 1 (Weeks 1–2): 15 moderated usability tests — Tamil diaspora in US/UK; focus on onboarding, first listen, story discovery',
        'Round 2 (Week 6): 10 creator interviews — Tamil writers/bloggers; pain points with existing publishing tools, willingness to monetise',
        'Round 3 (Week 10): 5 educator interviews — Tamil school teachers in UK/Singapore; use case for classroom integration',
        'Ongoing: Weekly 5-minute user surveys via in-app prompt (every 5th session), tracked in Notion',
        'Monthly: NPS survey (one question: "How likely are you to recommend KadhaiSolai to a Tamil friend?") with qualitative follow-up',
      ]},
      { type: 'table', title: 'Instrumentation Plan', headers: ['Event', 'Tool', 'Why We Track It'],
        rows: [
          ['Page views, unique visitors', 'Vercel Analytics', 'Baseline traffic and acquisition'],
          ['Play button clicked, listen duration', 'Custom Supabase events', 'Core engagement: are people actually listening?'],
          ['Story published, story read', 'Supabase DB counts', 'Supply and demand health check'],
          ['Like, comment, share actions', 'Supabase DB', 'Community engagement depth'],
          ['Streak started, streak day count', 'localStorage + DB', 'Retention mechanic effectiveness'],
          ['Upgrade CTA clicked (pre-payment)', 'Custom event', 'Premium demand signal'],
          ['Queue used, ambient mode on', 'Custom events', 'Feature adoption and stickiness'],
        ],
      },
    ],
  },
  {
    slug: 'feedback-framework',
    title: 'Feedback Framework',
    subtitle: 'Collection · Analysis · Iteration Loops',
    icon: '💬', tag: 'Process',
    accent: 'border-orange-500/25 bg-orange-500/[0.04]',
    glow: 'rgba(249,115,22,0.15)',
    sections: [
      { type: 'callout', text: 'Feedback is only valuable if it changes decisions. This framework defines how we collect signal, convert noise into insight, and close the loop with users — all within a two-week sprint cadence.' },
      { type: 'table', title: 'Feedback Collection Channels', headers: ['Channel', 'Method', 'Cadence', 'Owner'],
        rows: [
          ['In-app 👍/👎', 'Post-listen thumb rating', 'Every session', 'Product'],
          ['Comment section', 'Organic story comments', 'Continuous', 'Community'],
          ['NPS Survey', '1-question (0–10) + text', 'Every 5th session', 'Product'],
          ['Discord #feedback', 'Community channel', 'Continuous', 'Community'],
          ['User interviews', '30-min video call', 'Monthly (5 users)', 'PM'],
          ['Error monitoring', 'Vercel + console logs', 'Real-time', 'Engineering'],
          ['Churn survey', 'Exit intent trigger', 'On inactivity >14 days', 'Product'],
        ],
      },
      { type: 'bullets', title: 'Feedback Taxonomy (Tagging System)', items: [
        '🎵 Player UX — controls, seek, speed, ambient, mobile feel',
        '📚 Content Quality — narration, story selection, TTS accuracy, Tamil pronunciation',
        '🔍 Discovery — search, genre filter, recommendations, "for you" relevance',
        '⚡ Performance — load time, buffering, TTS generation speed',
        '✍️ Creator Tools — writing editor, AI assist quality, upload flow',
        '💳 Monetisation — pricing feedback, credits system, premium value perception',
        '🐛 Bug Reports — functional issues, UI glitches, platform-specific problems',
      ]},
      { type: 'table', title: 'ICE Prioritisation Framework', headers: ['Factor', 'Scale', 'Definition'],
        rows: [
          ['Impact (I)', '1–10', 'How much does fixing this move the north star metric?'],
          ['Confidence (C)', '1–10', 'How sure are we this will have the stated impact?'],
          ['Ease (E)', '1–10', 'How easy is this to implement? (10 = very easy)'],
          ['ICE Score', 'I×C×E / 100', 'Used to rank backlog items objectively'],
        ],
      },
      { type: 'table', title: 'Analysis Cadence', headers: ['Cadence', 'Activity', 'Output'],
        rows: [
          ['Daily', 'Error log triage + P0 bug fixes', 'Patch if critical'],
          ['Weekly', 'Tag all new feedback, identify top themes', 'Theme report → Notion'],
          ['Bi-weekly (Sprint)', 'Sprint planning using ICE scores from feedback', 'Updated sprint backlog'],
          ['Monthly', 'NPS trend + cohort retention analysis', 'PM insight deck'],
          ['Quarterly', 'Full user research synthesis + roadmap review', 'Roadmap update'],
        ],
      },
    ],
  },
  {
    slug: 'tech-architecture',
    title: 'Tech Architecture',
    subtitle: 'Infrastructure, Stack & System Design Overview',
    icon: '🏗️', tag: 'Technical',
    accent: 'border-cyan-500/25 bg-cyan-500/[0.04]',
    glow: 'rgba(6,182,212,0.15)',
    sections: [
      { type: 'callout', text: 'The architecture is built for zero-to-one speed: low infrastructure cost, high developer velocity, and graceful scaling. Every choice optimises for reaching product-market fit without premature complexity.' },
      { type: 'table', title: 'Full Technology Stack', headers: ['Layer', 'Technology', 'Purpose', 'Cost Model'],
        rows: [
          ['Frontend', 'Next.js 14 (App Router) + TypeScript', 'SSR + client-side interactivity, SEO', 'Free (Vercel Hobby)'],
          ['Styling', 'Tailwind CSS + Framer Motion', 'Design system, animations, responsive', 'Free (OSS)'],
          ['Database', 'Supabase PostgreSQL', 'Stories, books, likes, comments, RLS', 'Free → $25/mo at scale'],
          ['Auth', 'None — UUID fingerprint (localStorage)', 'Zero-friction identity, no cold-start drop-off', 'Free'],
          ['File Storage', 'Supabase Storage', 'TTS audio WAV files, book text files', 'Included in Supabase tier'],
          ['Audio Library', 'YouTube Iframe API', 'Stream 19 curated Tamil audiobooks', 'Free (YouTube CDN)'],
          ['Tamil TTS', 'Sarvam AI Bulbul v3', 'Convert uploaded Tamil text → natural audio', 'Per API call (~₹0.002/char)'],
          ['AI Writing', 'Anthropic Claude Haiku', 'Story continue, improve, title generation', '$0.80 / 1M input tokens'],
          ['Deployment', 'Vercel Edge Network', 'Global CDN, sub-50ms TTFB, CI/CD', 'Free → $20/mo pro'],
          ['Monitoring', 'Vercel Analytics + Console', 'Performance, errors, Web Vitals', 'Free tier'],
        ],
      },
      { type: 'table', title: 'Core Data Models', headers: ['Table', 'Key Fields', 'Row Count (Est. Mo.12)'],
        rows: [
          ['books', 'id, title, genre, txt_path, audio_path, plays_count, status, tts_voice', '500 rows'],
          ['stories', 'id, fingerprint, title, body, genre, word_count, likes_count, comments_count, ai_assisted', '5,000 rows'],
          ['story_likes', 'story_id, fingerprint, created_at', '50,000 rows'],
          ['story_comments', 'id, story_id, fingerprint, author_name, body', '15,000 rows'],
          ['tts_jobs', 'id, book_id, status, progress, chunks_done, chunks_total', '500 rows'],
        ],
      },
      { type: 'bullets', title: 'Key Architectural Decisions & Trade-offs', items: [
        'No auth (fingerprint identity) → Pros: zero onboarding friction, higher D1 activation. Cons: no cross-device sync, limited spam control. Mitigation: rate-limit writes by IP + fingerprint',
        'YouTube for audio library → Pros: zero storage/CDN cost, proven reliability. Cons: YouTube availability dependency, no download. Mitigation: parallel migration to Supabase Storage planned for Q3 2026',
        'Row Level Security (RLS) on Supabase → All reads/writes are policy-enforced at database level; no app-layer auth required for data security',
        'Modular AI service layer (lib/ai.ts) → All AI calls centralised; easy to swap models, add fallbacks, and track token costs per feature',
        'localStorage listening progress + queue → Eliminates need for user accounts for core retention features; accepted trade-off for MVP',
        'Vercel serverless functions with maxDuration=300 for TTS → Tamil TTS can take 2–5 min for book-length text; edge functions handle long-running jobs gracefully',
      ]},
    ],
  },
  {
    slug: 'monetisation-fit',
    title: 'Monetisation Fit',
    subtitle: 'Revenue Architecture · Unit Economics · Projections',
    icon: '💰', tag: 'Business',
    accent: 'border-yellow-500/25 bg-yellow-500/[0.04]',
    glow: 'rgba(234,179,8,0.15)',
    sections: [
      { type: 'callout', text: 'KadhaiSolai operates a multi-sided marketplace with three revenue streams: listener subscriptions, creator earnings, and B2B licensing. The model is designed to align platform incentives with creator quality output.' },
      { type: 'metrics', title: 'Revenue Stream Overview',
        data: [
          { label: 'Premium Subscription', value: '₹199/mo', sub: '4% of MAU target conversion' },
          { label: 'Creator Earnings', value: '₹2/play', sub: 'Funded by premium revenue pool' },
          { label: 'Connect Credits', value: '₹99–599', sub: '25% platform commission' },
          { label: 'B2B Licensing', value: '$99/mo', sub: 'Per institution (Tamil schools)' },
          { label: 'Platform Commission', value: '25%', sub: 'On all author connect sessions' },
          { label: 'Target Gross Margin', value: '68%', sub: 'At Month 18 scale' },
        ],
      },
      { type: 'table', title: 'Subscription Tier Architecture', headers: ['Tier', 'Price', 'Features', 'Target Segment'],
        rows: [
          ['Free', '₹0', 'Unlimited streaming · Basic player · Genre browse · Community stories', '96% of users (top of funnel)'],
          ['Premium', '₹199/mo', 'All Free + 0.5×–2× speed · Offline downloads · Cross-device sync · No ads', 'Power listeners, diaspora'],
          ['Creator Pro', '₹349/mo', 'All Premium + Unlimited TTS uploads · Advanced analytics · Priority AI credits · Earnings dashboard', 'Active authors'],
          ['Institution', '$99/mo (USD)', 'Class accounts · Curriculum playlists · Student progress tracking · White-label embed', 'Tamil schools, libraries'],
        ],
      },
      { type: 'table', title: '18-Month Revenue Projection', headers: ['Month', 'MAU', 'Premium Users', 'MRR (₹)', 'Creator Payouts', 'Net Revenue'],
        rows: [
          ['Month 1', '1,000', '0', '₹0', '₹0', '₹0 (validation)'],
          ['Month 3', '5,000', '50', '₹9,950', '₹4,000', '₹5,950'],
          ['Month 6', '12,000', '480', '₹95,520', '₹28,000', '₹67,520'],
          ['Month 12', '40,000', '1,600', '₹3,18,400', '₹95,000', '₹2,23,400'],
          ['Month 18', '75,000', '3,000', '₹5,97,000', '₹1,80,000', '₹4,17,000'],
        ],
      },
      { type: 'bullets', title: 'Unit Economics (Month 12)', items: [
        'CAC (blended): ₹45 via organic YouTube + social; ₹120 with paid acquisition',
        'LTV (Premium user, 12-month churn model at 6%/mo): ₹199 × 11.5 avg months = ₹2,289',
        'LTV:CAC ratio: 2289/45 = 50.9× (organic) | 2289/120 = 19× (paid) — both well above 3× benchmark',
        'Payback period: 45/199 = 0.23 months (organic) — near-instant unit economics',
        'Infrastructure cost per MAU: ~₹1.2/month at 40K MAU scale (Supabase + Vercel + AI API)',
        'Gross margin at scale: (₹199 - ₹1.2 infra - ₹7.50 creator share) / ₹199 = ~94% before salaries',
      ]},
    ],
  },
  {
    slug: 'case-study-deck',
    title: 'Case Study Deck',
    subtitle: 'User Journeys · Adoption Stories · Platform Impact',
    icon: '📚', tag: 'Evidence',
    accent: 'border-violet-500/25 bg-violet-500/[0.04]',
    glow: 'rgba(139,92,246,0.12)',
    sections: [
      { type: 'callout', text: 'These case studies illustrate the three archetypes driving KadhaiSolai\'s flywheel: the Listener who returns, the Creator who publishes, and the Educator who integrates. Each validates a distinct product hypothesis.' },
      { type: 'text', title: '📱 Case Study 1: The Diaspora Listener — Priya, London', body: 'Priya, 32, is a software engineer in London who grew up listening to Tamil stories with her grandmother. She moved to the UK at 22 and gradually lost connection with the language. She tried YouTube but found the experience fragmented — no discovery, constant ads, no ability to resume.' },
      { type: 'bullets', title: 'Priya\'s Journey on KadhaiSolai', items: [
        'Discovery: Found KadhaiSolai via a Tamil Twitter thread sharing the "Nithilavalli" series. No sign-up required — started playing within 5 seconds',
        'First Session: Listened to 38 minutes of the historical novel on her commute. Progress auto-saved. No account needed',
        'D7 Return: App remembered she was on Chapter 2. She continued exactly where she stopped — a Spotify-level experience she wasn\'t expecting',
        'Engagement: Enabled Ambient mode ("rain sounds") while listening. Built a 9-day listening streak',
        'Conversion Signal: Clicked "Upgrade to Premium" (not yet live) — a validated premium intent signal',
        'Outcome: Priya now listens 4×/week. She DMed the @kadhaisolai Instagram to request more Kalki novels. A direct qualitative feedback loop',
      ]},
      { type: 'text', title: '✍️ Case Study 2: The Aspiring Author — Karthik, Chennai', body: 'Karthik, 24, is an MBA student in Chennai with 3 unpublished Tamil short stories saved in Google Docs. He wanted to share them but didn\'t know where. Medium doesn\'t support Tamil. WhatsApp forward culture felt too informal. He needed a platform with real readers.' },
      { type: 'bullets', title: 'Karthik\'s Journey on KadhaiSolai', items: [
        'Onboarding: Opened /create, typed his story title, selected "Drama" genre, entered pen name. No account. 30-second setup',
        'AI Assist: Used "Improve Writing" — Claude Haiku rewrote his second paragraph with richer vocabulary. He kept 80% of the suggestions',
        'Publish: Hit publish. Story appeared in the Tamil Stories feed within seconds. Word count badge showed "1,240 words"',
        'Feedback Loop: Got 12 likes and 3 comments in 48 hours from strangers. "This made my evening" — a reader from Singapore',
        'Streak: Built a 6-day writing streak. The flame emoji on the dashboard became a daily motivator',
        'Outcome: Karthik has published 7 stories in 3 weeks. He is now eligible for creator earnings once Stripe integration ships in Q2',
      ]},
      { type: 'text', title: '🏫 Case Study 3: The Educator — Mrs. Meenakshi, Singapore', body: 'Mrs. Meenakshi, 48, teaches Tamil to 60 students (ages 8–14) at a Tamil school in Singapore. Her challenge: students find textbook Tamil dry and irrelevant. She needed a way to make the language feel alive and contemporary.' },
      { type: 'bullets', title: 'Mrs. Meenakshi\'s Use of KadhaiSolai', items: [
        'Discovery: Found KadhaiSolai via a Tamil Teachers WhatsApp group. No school IT procurement needed — runs in any browser',
        'Classroom Use: Played 15-minute story episodes at the start of each class. Students listened, then discussed in Tamil',
        'Student Writing: Assigned students to write their own short stories on /create. 23 of 60 students published their first-ever digital Tamil story',
        'Cross-classroom Discovery: Stories from her class were read and liked by Tamil speakers in Malaysia and the UK — real audience, real motivation',
        'Institutional Value: Mrs. Meenakshi wrote to us requesting a class management view — direct B2B product signal validating the Institution tier',
        'Outcome: Student Tamil writing assignments completion rate rose from 55% to 91% over one term. Language engagement, not just language instruction',
      ]},
    ],
  },
  {
    slug: 'prd',
    title: 'Product Requirements Document',
    subtitle: 'Complete Feature Specs, User Stories & Acceptance Criteria',
    icon: '📋', tag: 'Specification',
    accent: 'border-white/15 bg-white/[0.03]',
    glow: 'rgba(255,255,255,0.05)',
    sections: [
      { type: 'callout', text: 'This PRD serves as the single source of truth for what KadhaiSolai builds and why. Features without a user story and acceptance criterion do not ship.' },
      { type: 'text', title: 'Product Vision', body: 'KadhaiSolai is the world\'s first Tamil-first audio storytelling ecosystem — where listeners discover great stories, writers publish with AI assistance, and creators earn from their craft. We exist at the intersection of Tamil cultural preservation and modern product design.' },
      { type: 'table', title: 'Core Feature Requirements', headers: ['Feature', 'User Story', 'Acceptance Criteria'],
        rows: [
          ['Audio Library', 'As a listener, I want to discover Tamil audiobooks by genre so I can find stories I enjoy', '20+ books · Genre filter works · Search by title returns results in <300ms'],
          ['TTS Upload', 'As an author, I want to upload a Tamil text file and receive a narrated audio file so I can publish without a recording studio', 'Upload .txt → Sarvam TTS → WAV stored → public URL within 5 min for 10K word file'],
          ['Progress Resume', 'As a listener, I want the player to resume exactly where I stopped even after closing the browser', 'Saves every 5s to localStorage · Resuming within 7 days restores to within 3s of actual stop point'],
          ['Community Stories', 'As a writer, I want to publish my Tamil story to a public feed so other Tamil readers can discover it', 'Publish flow ≤ 3 clicks · Story appears in feed in <2s · Like/comment functional'],
          ['AI Writing Assist', 'As a writer, I want AI to help continue, improve, or title my story so I can overcome writer\'s block', '3 modes (continue/improve/title) · Response in <8s · Result appendable/replaceable'],
          ['Listening Streak', 'As a user, I want to track my daily listening streak so I am motivated to return daily', 'Streak increments on first play per calendar day · Resets if gap >1 day · Flame visual with level'],
          ['Queue System', 'As a listener, I want to queue multiple stories so I can listen continuously without interruption', 'Add/remove/reorder queue · Auto-plays next on story end · Panel slide-in with count badge'],
          ['Speed Control', 'As a premium listener, I want to control playback speed from 0.5× to 2× so I can match my cognitive pace', '6 speed options · Speed persists during session · Toast confirms change · YouTube API setPlaybackRate'],
          ['Ambient Mode', 'As a listener, I want optional soft background sound so I can create a focused listening environment', 'Web Audio API pink noise · Toggle button · No external dependency · Auto-off on page leave'],
        ],
      },
      { type: 'table', title: 'Non-Functional Requirements', headers: ['Requirement', 'Target', 'Measurement'],
        rows: [
          ['Page load (LCP)', '< 2.5 seconds', 'Vercel Web Vitals'],
          ['TTS generation', '< 5 min for 10K words', 'tts_jobs.completed_at - started_at'],
          ['AI assist response', '< 8 seconds', 'Client-side timing log'],
          ['Mobile responsive', '100% features on 375px+', 'Manual QA on iPhone SE'],
          ['Supabase query', '< 200ms p95', 'Supabase dashboard'],
          ['Availability', '99.5% uptime', 'Vercel + Supabase SLA'],
          ['Accessibility', 'WCAG 2.1 AA minimum', 'Lighthouse audit ≥ 90'],
        ],
      },
      { type: 'bullets', title: 'Definition of Done (DoD)', items: [
        '✅ Feature matches acceptance criteria in the requirements table above',
        '✅ Works on Chrome, Safari, Firefox (desktop) and Chrome Mobile, Safari iOS',
        '✅ TypeScript compiles with zero errors (npx tsc --noEmit)',
        '✅ No console errors in production build',
        '✅ Responsive on 375px, 768px, 1280px breakpoints',
        '✅ Deployed to Vercel production and smoke-tested on live URL',
        '✅ Loading and error states handled (no blank screens)',
      ]},
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
                {/* Timeline dot + line */}
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
          <div className="h-8" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.05] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/15 font-mono text-[9px] uppercase tracking-widest">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-purple to-gold flex items-center justify-center text-[7px]">🎧</div>
            KadhaiSolai · Internal Documentation
          </div>
          <button onClick={onClose}
            className="text-xs text-white/30 hover:text-white transition-colors font-mono">
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
      className={`text-left w-full p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-xl ${doc.accent} hover:border-gold/20`}
      style={{ '--glow': doc.glow } as any}>
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

      {/* NAV */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 lg:px-12 py-4 bg-void/90 backdrop-blur-xl border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">KadhaiSolai</span>
        </Link>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple to-gold flex items-center justify-center text-xs">🎧</div>
          <span className="font-serif font-bold text-sm text-white hidden sm:block">KadhaiSolai</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/listen" className="hidden sm:block text-xs text-white/35 hover:text-white transition-colors">Library</Link>
          <Link href="/stories" className="hidden sm:block text-xs text-white/35 hover:text-white transition-colors">Stories</Link>
          <Link href="/create" className="text-xs bg-gold text-void font-semibold px-4 py-1.5 rounded-full hover:bg-gold2 transition-colors">
            Write a Story
          </Link>
        </div>
      </nav>

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
            10 PM-level documents covering strategy, market analysis, product specs, tech architecture, and monetisation for KadhaiSolai — the Tamil audio storytelling platform.
          </p>
          <div className="flex items-center gap-6 mt-6 text-xs text-white/25 font-mono">
            <span>{DOCS.length} documents</span>
            <span>·</span>
            <span>Strategy · Product · Technical · Business</span>
            <span>·</span>
            <span>Updated May 2026</span>
          </div>
        </div>

        {/* Category labels */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCS.map((doc, i) => (
            <DocCard key={doc.slug} doc={doc} index={i} onClick={() => setActiveDoc(doc)} />
          ))}
        </div>

        {/* Bottom note */}
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

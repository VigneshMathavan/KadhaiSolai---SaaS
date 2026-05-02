# KadhaiSolai — Tamil Audio Books SaaS

> Upload Tamil .txt files → AI narrates → Readers listen

Built with **Next.js 14** · **Supabase** · **Sarvam AI Bulbul v3** · Deploy on **Vercel**

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/kadhaisolai.git
cd kadhaisolai
npm install
```

---

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → Run
3. Go to **Storage** → Create 3 buckets:
   - `books-txt` (Private)
   - `books-audio` (Public)  
   - `covers` (Public)
4. Copy your credentials from **Settings → API**

---

### 3. Get Sarvam AI API Key (Free)

1. Go to [dashboard.sarvam.ai](https://dashboard.sarvam.ai)
2. Sign up — **no credit card needed**
3. You get **₹1,000 free credits** (enough for ~300,000 chars of Tamil audio)
4. Copy your API key from the dashboard

---

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

SARVAM_API_KEY=your-sarvam-api-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy to Vercel

### Option A: Via GitHub (Recommended)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kadhaisolai.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → Import repository
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Option B: Via Vercel CLI

```bash
npx vercel --prod
```

> **Note on Vercel timeout**: The TTS API route can take 2–10 min for long books.
> - **Free Vercel**: 60s limit → works for books up to ~50,000 chars
> - **Vercel Pro**: 300s limit → works for full novels
> - **Alternative**: Use Supabase Edge Functions for long processing

---

## 🎯 How TTS Works

```
Tamil .txt file
      ↓
 Read text content
      ↓
 Split into chunks (≤2400 chars each, at sentence boundaries)
      ↓
 Call Sarvam Bulbul v3 API for each chunk
 POST https://api.sarvam.ai/text-to-speech
 { target_language_code: "ta-IN", model: "bulbul:v3" }
      ↓
 Get base64 WAV audio per chunk
      ↓
 Stitch WAV buffers together (preserve header from first chunk)
      ↓
 Upload final .wav to Supabase Storage (books-audio bucket)
      ↓
 Update book status → "ready"
      ↓
 Listeners stream the public audio URL
```

---

## 📁 Project Structure

```
kadhaisolai/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Login / signup
│   ├── author/page.tsx       # Author dashboard (upload books)
│   ├── listen/page.tsx       # Browse all books
│   ├── listen/[id]/page.tsx  # Audio player
│   ├── api/
│   │   ├── tts/route.ts      # 🔥 Core TTS processing engine
│   │   └── books/route.ts    # Books API
│   └── globals.css
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── tts.ts                # Sarvam TTS utility (chunking + stitching)
├── supabase/
│   └── schema.sql            # Database schema + RLS policies
└── .env.local.example
```

---

## 🎙️ Available Tamil Voices (Sarvam Bulbul v3)

| Voice   | Style               | Best for         |
|---------|---------------------|------------------|
| anand   | Warm, storyteller   | Novels, fiction  |
| kavitha | Clear, professional | Drama, poetry    |
| vijay   | Dramatic, deep      | Thrillers        |
| shruti  | Gentle, soothing    | Romance          |
| mani    | Conversational      | Short stories    |
| gokul   | Energetic           | Action fiction   |

---

## 💰 Sarvam AI Pricing

| Plan    | Credits  | TTS Cost (Bulbul v3) | Approx. Audio |
|---------|----------|----------------------|---------------|
| Free    | ₹1,000   | ₹30 / 10K chars      | ~333K chars   |
| Starter | ₹10,000  | ₹30 / 10K chars      | ~3.3M chars   |

**Example**: A 100,000-character Tamil novel = ₹300 = ~3.5 hours of audio

---

## 🛠️ Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | Next.js 14, React, Tailwind |
| Backend  | Next.js API Routes      |
| Database | Supabase (PostgreSQL)   |
| Storage  | Supabase Storage        |
| Auth     | Supabase Auth           |
| TTS      | Sarvam AI Bulbul v3     |
| Deploy   | Vercel + GitHub         |

---

## 📝 Notes

- Tamil text must be in **Unicode** (UTF-8). Most modern Tamil documents are.
- Max .txt file size: **10MB** (~5M characters, ~50+ hours of audio)
- Audio is stored as **WAV** in Supabase Storage (public bucket)
- For very long novels on Vercel free tier, consider splitting into chapters

---

Made with ❤️ for Tamil literature

'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, Loader2, CheckCircle2, AlertCircle, Upload, FileText, X, Download } from 'lucide-react'

const DEFAULT_TEXT = `வாழ்க்கையில் நம்மைச் சுற்றியிருக்கும் இயற்கையின் அழகை நாம் தினமும் உணர வேண்டும். பறவைகளின் கீதமும், மலர்களின் மணமும், காற்றின் இதமும் நம் மனதை அமைதிப்படுத்துகின்றன. தமிழ் மொழி உலகின் பழமையான மொழிகளில் ஒன்று. இதன் இலக்கியம் ஆயிரக்கணக்கான ஆண்டுகளாக மக்கள் மனதில் இடம் பெற்றுள்ளது. நம் முன்னோர்கள் தமிழில் இயற்றிய கவிதைகளும் நூல்களும் இன்றும் நம்மை வழிநடத்துகின்றன.`

const MAX_CHARS = 500
const MAX_FILE_MB = 2

const VOICES = [
  { id: 'anand',    name: 'Anand',    gender: 'Male',   style: 'Storyteller',  emoji: '🧑‍🎤' },
  { id: 'kavitha',  name: 'Kavitha',  gender: 'Female', style: 'Warm & Clear', emoji: '👩‍🎤' },
  { id: 'vijay',    name: 'Vijay',    gender: 'Male',   style: 'Crisp',        emoji: '🎙️' },
  { id: 'shruti',   name: 'Shruti',   gender: 'Female', style: 'Expressive',   emoji: '🎤' },
  { id: 'priya',    name: 'Priya',    gender: 'Female', style: 'Gentle',       emoji: '🎵' },
  { id: 'pavithra', name: 'Pavithra', gender: 'Female', style: 'Classical',    emoji: '🎼' },
  { id: 'neel',     name: 'Neel',     gender: 'Male',   style: 'Deep',         emoji: '🎧' },
  { id: 'arvind',   name: 'Arvind',   gender: 'Male',   style: 'Natural',      emoji: '🔊' },
]

const LOADING_BARS = [42, 68, 55, 85, 30, 72, 90, 46, 78, 60, 38, 82, 52, 70, 44, 88, 58, 65, 75, 48, 80, 35, 92, 50]

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function DemoSection() {
  const [voice, setVoice] = useState('anand')
  const [text, setText] = useState(DEFAULT_TEXT)
  const [loading, setLoading] = useState(false)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevSrcRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const charCount = text.length
  const isOverLimit = charCount > MAX_CHARS
  const remaining = MAX_CHARS - charCount

  const generate = async () => {
    if (isOverLimit || text.trim().length === 0) return
    setLoading(true)
    setError(null)
    setAudioSrc(null)
    setPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)

    try {
      const res = await fetch('/api/demo-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice, text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      const bytes = atob(data.audio)
      const ab = new ArrayBuffer(bytes.length)
      const view = new Uint8Array(ab)
      for (let i = 0; i < bytes.length; i++) view[i] = bytes.charCodeAt(i)
      const blob = new Blob([ab], { type: 'audio/wav' })
      setAudioSrc(URL.createObjectURL(blob))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)

    if (!file.name.endsWith('.txt')) {
      setFileError('Only .txt files are supported')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_FILE_MB}MB`)
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = (ev.target?.result as string) || ''
      const trimmed = content.trim().slice(0, MAX_CHARS)
      setText(trimmed)
      setFileName(file.name)
      setAudioSrc(null)
      setError(null)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const clearFile = () => {
    setText(DEFAULT_TEXT)
    setFileName(null)
    setAudioSrc(null)
    setError(null)
    setFileError(null)
  }

  useEffect(() => {
    if (!audioSrc) return
    if (prevSrcRef.current) URL.revokeObjectURL(prevSrcRef.current)
    prevSrcRef.current = audioSrc

    const audio = new Audio(audioSrc)
    audioRef.current = audio
    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    audio.onended = () => { setPlaying(false); setProgress(100) }

    return () => { audio.pause(); audioRef.current = null }
  }, [audioSrc])

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play(); setPlaying(true) }
  }

  const restart = () => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    setProgress(0)
    setCurrentTime(0)
    a.play()
    setPlaying(true)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current
    if (!a || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  const activeVoice = VOICES.find(v => v.id === voice)

  return (
    <section className="py-20 pb-32 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-gold/40" />
              <p className="font-mono text-[10px] tracking-[0.35em] text-gold/55 uppercase">Live Demo</p>
            </div>
            <h2 className="font-serif font-bold text-white leading-[0.88]"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
              Hear it for<br /><em className="text-gold italic">yourself.</em>
            </h2>
          </div>
          <p className="text-white/28 text-sm max-w-xs leading-relaxed font-light lg:mb-2">
            Edit the Tamil text or upload your own .txt file — Sarvam Bulbul v3 narrates it live in your browser.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-6 items-start">

          {/* ── Left column ── */}
          <div className="space-y-5">

            {/* Text editor card */}
            <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden">
              {/* Decorative quote mark */}
              <div className="absolute -top-4 left-6 font-serif text-[8rem] leading-none text-gold/[0.04] select-none pointer-events-none">"</div>

              {/* Top bar */}
              <div className="flex items-center justify-between px-8 pt-6 pb-3">
                <span className="font-mono text-[8px] tracking-[0.3em] text-white/15 uppercase">Tamil · Editable Text</span>
                <div className="flex items-center gap-2">
                  {/* Download sample */}
                  <a
                    href="/sample-tamil.txt"
                    download="sample-tamil.txt"
                    className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.2em] text-gold/40 hover:text-gold/70 uppercase transition-colors px-2 py-1 rounded-lg hover:bg-gold/[0.05]">
                    <Download size={10} />
                    Sample .txt
                  </a>
                  {/* Upload button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.2em] text-white/25 hover:text-white/60 uppercase transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]">
                    <Upload size={10} />
                    Upload .txt
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* File pill */}
              <AnimatePresence>
                {fileName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-8 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/[0.06] border border-gold/[0.15] w-fit">
                      <FileText size={11} className="text-gold/60" />
                      <span className="font-mono text-[9px] text-gold/70 tracking-wider">{fileName}</span>
                      <button onClick={clearFile} className="text-gold/40 hover:text-gold/80 transition-colors ml-1">
                        <X size={10} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File error */}
              <AnimatePresence>
                {fileError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-8 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/[0.06] border border-red-500/[0.2] w-fit">
                      <AlertCircle size={11} className="text-red-400/70" />
                      <span className="font-mono text-[9px] text-red-400/70 tracking-wider">{fileError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Textarea */}
              <div className="relative px-8 pb-4">
                <textarea
                  value={text}
                  onChange={e => {
                    setText(e.target.value)
                    setAudioSrc(null)
                    setError(null)
                  }}
                  maxLength={MAX_CHARS + 50}
                  rows={6}
                  placeholder="தமிழ் உரையை இங்கே தட்டச்சு செய்யுங்கள்..."
                  className={`w-full bg-transparent resize-none text-[15px] leading-[2.0] font-light outline-none placeholder:text-white/15 transition-colors ${
                    isOverLimit ? 'text-red-400/70' : 'text-white/55'
                  }`}
                  style={{ fontFamily: "'Noto Sans Tamil', 'Latha', sans-serif" }}
                />
              </div>

              {/* Footer */}
              <div className="mx-8 mb-6 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-1 rounded-full ${isOverLimit ? 'bg-red-400/60' : 'bg-gold/35'}`} />
                  <span className="font-mono text-[9px] tracking-[0.25em] text-white/18 uppercase">
                    {charCount} characters · Max {MAX_CHARS} · Max {MAX_FILE_MB}MB file
                  </span>
                </div>
                {/* Character counter */}
                <span className={`font-mono text-[9px] tabular-nums transition-colors ${
                  isOverLimit ? 'text-red-400/70' : remaining < 50 ? 'text-gold/60' : 'text-white/20'
                }`}>
                  {isOverLimit ? `${Math.abs(remaining)} over` : `${remaining} left`}
                </span>
              </div>
            </div>

            {/* Voice grid */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-white/20 uppercase mb-3 px-1">Choose a voice</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VOICES.map(v => (
                  <button key={v.id} onClick={() => { setVoice(v.id); setAudioSrc(null); setError(null) }}
                    className={`relative p-4 rounded-xl border text-left transition-all duration-200 overflow-hidden group ${
                      voice === v.id
                        ? 'border-gold/40 bg-gold/[0.06]'
                        : 'border-white/[0.06] bg-white/[0.015] hover:border-white/[0.14] hover:bg-white/[0.03]'
                    }`}>
                    {voice === v.id && (
                      <motion.div layoutId="voice-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/[0.08] to-transparent border border-gold/[0.25]"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                    <div className="relative">
                      <div className="text-lg mb-2 leading-none">{v.emoji}</div>
                      <div className="font-serif text-[13px] text-white font-semibold leading-tight">{v.name}</div>
                      <div className="font-mono text-[8px] tracking-wider text-white/30 uppercase mt-1">
                        {v.gender} · {v.style}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">

            {/* Generate button */}
            <motion.button
              onClick={generate}
              disabled={loading || isOverLimit || text.trim().length === 0}
              whileHover={!loading && !isOverLimit ? { y: -2 } : {}}
              whileTap={!loading && !isOverLimit ? { scale: 0.98 } : {}}
              className="relative w-full py-5 rounded-2xl bg-gold text-void font-bold text-sm overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/10 hover:shadow-gold/25 hover:bg-gold2 transition-all">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span key="loading"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Generating with Sarvam AI…
                  </motion.span>
                ) : isOverLimit ? (
                  <motion.span key="over"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-center gap-2">
                    <AlertCircle size={15} />
                    Text too long — trim to {MAX_CHARS} chars
                  </motion.span>
                ) : audioSrc ? (
                  <motion.span key="regen"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-center gap-2">
                    <RotateCcw size={14} />
                    Regenerate · {activeVoice?.name}
                  </motion.span>
                ) : (
                  <motion.span key="idle"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-center gap-2">
                    <Volume2 size={15} />
                    Generate Audio · {activeVoice?.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Loading waveform */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col items-center gap-5">
                  <div className="flex items-end gap-[3px] h-14">
                    {LOADING_BARS.map((peak, i) => (
                      <motion.div key={i}
                        className="w-[3px] rounded-full bg-gold/40"
                        style={{ height: '12%' }}
                        animate={{ height: [`12%`, `${peak}%`, `12%`] }}
                        transition={{ duration: 0.7 + i * 0.03, repeat: Infinity, delay: i * 0.045, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase">Sarvam Bulbul v3 · Tamil</p>
                    <p className="font-mono text-[9px] tracking-[0.2em] text-white/18 uppercase mt-1">Processing voice: {activeVoice?.name}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error state */}
            <AnimatePresence>
              {error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl border border-red-500/20 bg-red-500/[0.04] flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-400/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400/80 text-xs font-medium">Generation failed</p>
                    <p className="text-red-400/50 text-[11px] mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audio player */}
            <AnimatePresence>
              {audioSrc && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="p-7 rounded-2xl border border-gold/[0.18] bg-gradient-to-br from-gold/[0.05] via-transparent to-purple/[0.04] overflow-hidden relative">

                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20"
                    style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />

                  <div className="relative">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                        <CheckCircle2 size={12} className="text-gold/60" />
                      </div>
                      <span className="font-mono text-[9px] tracking-[0.28em] text-gold/55 uppercase">
                        {activeVoice?.name} · Tamil · Sarvam AI
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="text-2xl">{activeVoice?.emoji}</div>
                      <div>
                        <div className="font-serif text-white text-sm">{activeVoice?.name}</div>
                        <div className="font-mono text-[9px] tracking-wider text-white/30 uppercase mt-0.5">
                          {activeVoice?.gender} · {activeVoice?.style}
                        </div>
                      </div>
                      <div className="ml-auto font-mono text-[10px] text-white/20">
                        {duration > 0 ? fmt(duration) : '--:--'}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-5 cursor-pointer group/seek" onClick={seek}>
                      <div className="h-[3px] rounded-full bg-white/[0.07] relative overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold via-gold2 to-gold rounded-full"
                          style={{ width: `${progress}%` }}
                          transition={{ type: 'tween', duration: 0.1 }}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold shadow-lg shadow-gold/50 opacity-0 group-hover/seek:opacity-100 transition-opacity"
                          style={{ left: `calc(${progress}% - 6px)` }} />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="font-mono text-[9px] text-white/22">{fmt(currentTime)}</span>
                        <span className="font-mono text-[9px] text-white/22">{duration > 0 ? fmt(duration) : '--:--'}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-5">
                      <button onClick={restart}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all">
                        <RotateCcw size={14} />
                      </button>
                      <motion.button onClick={togglePlay}
                        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-void shadow-xl shadow-gold/30 hover:bg-gold2 transition-colors">
                        <AnimatePresence mode="wait">
                          {playing
                            ? <motion.div key="pause" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Pause size={22} /></motion.div>
                            : <motion.div key="play" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Play size={22} className="ml-0.5" /></motion.div>
                          }
                        </AnimatePresence>
                      </motion.button>
                      <div className="w-9 h-9" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!audioSrc && !loading && !error && (
              <div className="flex flex-col items-center justify-center p-10 rounded-2xl border border-white/[0.05] border-dashed gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gold/[0.06] border border-gold/[0.12] flex items-center justify-center">
                  <Volume2 size={22} className="text-gold/40" />
                </div>
                <div className="text-center">
                  <p className="text-white/28 text-sm leading-relaxed">Select a voice & hit generate</p>
                  <p className="text-white/15 text-[11px] mt-1 font-mono tracking-wider uppercase">Powered by Sarvam Bulbul v3</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

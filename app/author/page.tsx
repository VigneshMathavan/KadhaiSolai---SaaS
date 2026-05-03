'use client'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, BookOpen, Loader2, CheckCircle, XCircle, Headphones } from 'lucide-react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  description: string
  genre: string
  tts_voice: string
  status: 'processing' | 'ready' | 'failed'
  created_at: string
  audio_path: string | null
  plays_count: number
}

interface TtsJob {
  book_id: string
  status: string
  progress: number
  chunks_done: number
  chunks_total: number
}

const VOICES = [
  { value: 'anand',   label: 'Anand — Male, warm storyteller' },
  { value: 'kavitha', label: 'Kavitha — Female, clear narrator' },
  { value: 'vijay',   label: 'Vijay — Male, dramatic' },
  { value: 'shruti',  label: 'Shruti — Female, gentle' },
  { value: 'mani',    label: 'Mani — Male, conversational' },
  { value: 'gokul',   label: 'Gokul — Male, energetic' },
]

export default function AuthorDashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [jobs, setJobs] = useState<TtsJob[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('Fiction')
  const [voice, setVoice] = useState('anand')
  const [pace, setPace] = useState(1.0)
  const [file, setFile] = useState<File | null>(null)

  // Load all books
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      setBooks(data || [])

      if (data?.length) {
        const processingIds = data.filter(b => b.status === 'processing').map(b => b.id)
        if (processingIds.length > 0) {
          const { data: jobData } = await supabase
            .from('tts_jobs')
            .select('*')
            .in('book_id', processingIds)
          setJobs(jobData || [])
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  // Poll processing books
  useEffect(() => {
    const processing = books.filter(b => b.status === 'processing')
    if (processing.length === 0) return

    const interval = setInterval(async () => {
      const { data: jobData } = await supabase
        .from('tts_jobs')
        .select('*')
        .in('book_id', processing.map(b => b.id))
      if (jobData) setJobs(jobData)

      const { data: bookData } = await supabase
        .from('books')
        .select('*')
        .in('id', processing.map(b => b.id))
      if (bookData) {
        setBooks(prev => prev.map(b => {
          const updated = bookData.find(nb => nb.id === b.id)
          return updated || b
        }))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [books])

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    if (!f.name.endsWith('.txt')) { toast.error('Only .txt files allowed'); return }
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return }
    setFile(f)
    if (!title) setTitle(f.name.replace('.txt', ''))
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/plain': ['.txt'] }, maxFiles: 1,
  })

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return
    if (!file.name.endsWith('.txt')) { toast.error('Please upload a .txt file'); return }

    setUploading(true)
    const tid = toast.loading('Uploading your Tamil book...')

    try {
      // 1. Upload .txt to Supabase Storage
      const txtPath = `public/${Date.now()}_${file.name}`
      const { error: storageErr } = await supabase.storage
        .from('books-txt')
        .upload(txtPath, file)
      if (storageErr) throw storageErr

      // 2. Create book record
      const { data: book, error: bookErr } = await supabase
        .from('books')
        .insert({
          title: title.trim(),
          description: description.trim(),
          genre,
          tts_voice: voice,
          tts_pace: pace,
          txt_path: txtPath,
          status: 'processing',
        })
        .select()
        .single()
      if (bookErr) throw bookErr

      toast.dismiss(tid)
      toast.loading('AI is narrating your book...', { id: 'tts', duration: 60000 })

      // 3. Trigger TTS processing
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      })

      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || 'TTS failed')
      }

      toast.dismiss('tts')
      toast.success('🎉 Audio book created successfully!')

      setBooks(prev => [book, ...prev])
      setShowUpload(false)
      setFile(null); setTitle(''); setDescription('')

      const { data: refreshed } = await supabase
        .from('books').select('*').eq('id', book.id).single()
      if (refreshed) setBooks(prev => prev.map(b => b.id === refreshed.id ? refreshed : b))

    } catch (err: any) {
      toast.dismiss(tid)
      toast.dismiss('tts')
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const getJobProgress = (bookId: string) => jobs.find(j => j.book_id === bookId)

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-void/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-gold flex items-center justify-center text-sm">🎧</div>
          <span className="font-serif font-bold text-white">KadhaiSolai</span>
          <span className="text-white/30 text-sm ml-2">/ Author Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1">
            Dashboard
          </Link>
          <Link href="/listen" className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1">
            <Headphones size={14} /> Browse
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif font-bold text-3xl text-white mb-1">
              Your Books
            </h1>
            <p className="text-white/45 text-sm">{books.length} book{books.length !== 1 ? 's' : ''} published</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 bg-gold text-void font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-gold2 transition-colors">
            <Upload size={15} /> Upload New Book
          </motion.button>
        </div>

        {/* Upload form */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-10">
              <form onSubmit={handleUpload}
                className="p-6 rounded-2xl border border-gold/20 bg-white/[0.02]">
                <h2 className="font-serif text-xl text-white mb-6">Upload Tamil Book</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-white/50 font-mono uppercase tracking-widest mb-1.5 block">Book Title *</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} required
                      placeholder="உங்கள் நாவலின் தலைப்பு"
                      className="w-full bg-surface border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-gold/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-mono uppercase tracking-widest mb-1.5 block">Genre</label>
                    <select value={genre} onChange={e => setGenre(e.target.value)}
                      className="w-full bg-surface border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-gold/40 transition-colors">
                      {['Fiction', 'Mystery', 'Romance', 'Historical', 'Thriller', 'Drama', 'Poetry'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-white/50 font-mono uppercase tracking-widest mb-1.5 block">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    placeholder="Brief description of your book..."
                    className="w-full bg-surface border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-gold/40 transition-colors resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-white/50 font-mono uppercase tracking-widest mb-1.5 block">Narrator Voice</label>
                    <select value={voice} onChange={e => setVoice(e.target.value)}
                      className="w-full bg-surface border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-gold/40 transition-colors">
                      {VOICES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-mono uppercase tracking-widest mb-1.5 block">
                      Narration Pace — {pace}x
                    </label>
                    <input type="range" min="0.7" max="1.4" step="0.1" value={pace}
                      onChange={e => setPace(parseFloat(e.target.value))}
                      className="w-full mt-1" />
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>Slow</span><span>Normal</span><span>Fast</span>
                    </div>
                  </div>
                </div>

                {/* Dropzone */}
                <div {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
                    isDragActive ? 'border-gold bg-gold/5' : file ? 'border-green-500/40 bg-green-500/5' : 'border-white/15 hover:border-gold/40 hover:bg-gold/5'
                  }`}>
                  <input {...getInputProps()} />
                  {file ? (
                    <div>
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-medium text-sm">{file.name}</p>
                      <p className="text-white/40 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className="text-white/60 text-sm mb-1">Drop your Tamil .txt file here</p>
                      <p className="text-white/30 text-xs mb-3">Only .txt files · Max 10MB · Tamil Unicode required</p>
                      <a href="/sample-tamil.txt" download
                        className="inline-flex items-center gap-1.5 text-[10px] text-gold/60 border border-gold/20 px-3 py-1.5 rounded-full hover:bg-gold/10 hover:text-gold transition-all"
                        onClick={e => e.stopPropagation()}>
                        ↓ Download Sample Tamil .txt
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={uploading || !file || !title}
                    className="flex items-center gap-2 bg-gold text-void font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-gold2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    {uploading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : <><Zap size={14} /> Generate Audio Book</>}
                  </button>
                  <button type="button" onClick={() => setShowUpload(false)}
                    className="text-white/40 hover:text-white text-sm transition-colors px-4 py-2.5">
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-white/30 mt-3">
                  ⚡ Most books process in 2–10 minutes depending on length.
                  Powered by <a href="https://sarvam.ai" target="_blank" rel="noopener" className="text-gold/60 hover:text-gold">Sarvam Bulbul v3</a> Tamil TTS.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Books grid */}
        {books.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-white/50 mb-2">No books yet</p>
            <p className="text-white/30 text-sm">Upload your first Tamil novel to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => {
              const job = getJobProgress(book.id)
              return (
                <motion.div key={book.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl border border-white/7 bg-white/[0.02] hover:border-gold/20 transition-all">

                  <div className="w-full aspect-[3/2] rounded-xl mb-4 flex items-center justify-center text-3xl"
                    style={{ background: 'linear-gradient(135deg, #2a1060, #4a0e2a)' }}>
                    📖
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-bold text-white text-sm leading-tight">{book.title}</h3>
                    <StatusBadge status={book.status} />
                  </div>

                  <p className="text-xs text-gold/70 mb-1">{book.genre}</p>

                  {book.status === 'processing' && job && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-white/40 mb-1">
                        <span>Narrating...</span>
                        <span>{job.chunks_done}/{job.chunks_total} chunks</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full transition-all duration-500"
                          style={{ width: `${job.progress || 0}%` }} />
                      </div>
                    </div>
                  )}

                  {book.status === 'processing' && !job && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                      <Loader2 size={12} className="animate-spin" /> Starting TTS...
                    </div>
                  )}

                  {book.status === 'ready' && (
                    <div className="flex items-center gap-2 mt-3">
                      <Link href={`/listen/${book.id}`}
                        className="flex items-center gap-1.5 bg-gold/15 text-gold border border-gold/25 px-3 py-1.5 rounded-full text-xs hover:bg-gold/25 transition-colors">
                        <Headphones size={11} /> Listen
                      </Link>
                      <span className="text-white/30 text-xs">{book.plays_count} plays</span>
                    </div>
                  )}

                  {book.status === 'failed' && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <XCircle size={12} /> Processing failed. Please retry.
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    processing: { icon: <Loader2 size={10} className="animate-spin" />, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', label: 'Processing' },
    ready:      { icon: <CheckCircle size={10} />, color: 'text-green-400 bg-green-400/10 border-green-400/20', label: 'Ready' },
    failed:     { icon: <XCircle size={10} />, color: 'text-red-400 bg-red-400/10 border-red-400/20', label: 'Failed' },
  }
  const s = map[status] || map.processing
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${s.color} whitespace-nowrap`}>
      {s.icon} {s.label}
    </span>
  )
}

function Zap({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>
}

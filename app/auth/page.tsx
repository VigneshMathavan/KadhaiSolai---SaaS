'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [mode, setMode] = useState<'listener' | 'author'>('listener')

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role: mode },
        },
      })
      if (error) throw error
      setSent(true)
      toast.success('Magic link sent! Check your email.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(74,45,138,0.4) 0%, transparent 65%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-gold flex items-center justify-center text-xl">🎧</div>
          </Link>
          <h1 className="font-serif font-bold text-2xl text-white">Welcome back</h1>
          <p className="text-white/45 text-sm mt-1">Sign in to KadhaiSolai</p>
        </div>

        {/* Role toggle */}
        <div className="flex rounded-xl border border-white/8 bg-white/[0.03] p-1 mb-6">
          {(['listener', 'author'] as const).map(r => (
            <button key={r} onClick={() => setMode(r)}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all capitalize ${
                mode === r ? 'bg-gold text-void' : 'text-white/50 hover:text-white'
              }`}>
              {r === 'author' ? '✍️ ' : '🎧 '}{r}
            </button>
          ))}
        </div>

        {!sent ? (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-gold/40 transition-colors"
            />
            <button type="submit" disabled={loading}
              className="w-full bg-gold text-void font-semibold py-3 rounded-xl text-sm hover:bg-gold2 transition-colors disabled:opacity-50">
              {loading ? 'Sending magic link...' : 'Continue with Email →'}
            </button>
          </form>
        ) : (
          <div className="text-center p-6 rounded-xl border border-gold/20 bg-gold/5">
            <div className="text-3xl mb-3">📬</div>
            <p className="text-white font-medium mb-1">Check your inbox</p>
            <p className="text-white/50 text-sm">We sent a magic link to <strong className="text-white/80">{email}</strong></p>
          </div>
        )}

        <div className="relative flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-white/30 text-xs">or</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 border border-white/8 bg-white/[0.03] text-white/80 py-3 rounded-xl text-sm hover:bg-white/[0.06] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-white/30 text-xs mt-6">
          By signing in, you agree to our{' '}
          <span className="text-gold/60 cursor-pointer hover:text-gold">Terms</span> &{' '}
          <span className="text-gold/60 cursor-pointer hover:text-gold">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  )
}

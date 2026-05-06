'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coins, Send, Loader2, ShoppingBag, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { getFingerprint } from '@/lib/stories'
import {
  MESSAGE_COST, AUTHOR_SHARE, CREDIT_PACKS,
  getCreditsData, sendMessage, purchaseCredits,
  creditsToRupees, typeLabel,
  type CreditTransaction,
} from '@/lib/credits'

interface ConnectModalProps {
  authorName: string
  authorFp: string
  storyId: string
  storyTitle: string
  onClose: () => void
}

export default function ConnectModal({
  authorName, authorFp, storyId, storyTitle, onClose,
}: ConnectModalProps) {
  const [tab, setTab] = useState<'message' | 'buy'>('message')
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [messageText, setMessageText] = useState('')
  const [senderName, setSenderName] = useState('')
  const [sending, setSending] = useState(false)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const fp = getFingerprint()

  useEffect(() => {
    setSenderName(localStorage.getItem('ks_author_name') || '')
    getCreditsData(fp).then(d => {
      setBalance(d.balance)
      setTransactions(d.transactions)
    })
  }, [fp])

  const handleSend = async () => {
    if (!messageText.trim()) return
    if (balance !== null && balance < MESSAGE_COST) {
      setTab('buy')
      toast.error('Not enough credits — top up below')
      return
    }
    setSending(true)
    try {
      const res = await sendMessage(fp, senderName || 'Anonymous', authorFp, storyId, messageText.trim())
      if (!res.success) throw new Error(res.error || 'Send failed')
      setBalance(res.newBalance)
      setSent(true)
      if (senderName.trim()) localStorage.setItem('ks_author_name', senderName.trim())
      toast.success('Message sent! Author will see it on their dashboard.')
    } catch (e: any) {
      toast.error(e.message || 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  const handleBuy = async (packId: string) => {
    setPurchasing(packId)
    try {
      const res = await purchaseCredits(fp, packId)
      if (!res.success) throw new Error(res.error || 'Purchase failed')
      setBalance(res.newBalance)
      toast.success(`Credits added! New balance: ${res.newBalance.toLocaleString()}`)
      // Refresh transactions
      getCreditsData(fp).then(d => setTransactions(d.transactions))
      setTab('message')
    } catch (e: any) {
      toast.error(e.message || 'Purchase failed')
    } finally {
      setPurchasing(null)
    }
  }

  const canSend = balance !== null && balance >= MESSAGE_COST

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="w-full sm:max-w-md bg-[#07041a] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
          <div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-gold/50 uppercase mb-0.5">Connect with Author</p>
            <h2 className="font-serif font-bold text-white text-base">{authorName}</h2>
            <p className="text-white/30 text-[11px] truncate max-w-[260px]">re: {storyTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {balance !== null && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-gold/70 border border-gold/20 bg-gold/[0.06] px-2.5 py-1 rounded-full">
                <Coins size={10} />
                <span>{balance.toLocaleString()}</span>
              </div>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {(['message', 'buy'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                tab === t ? 'text-gold border-b-2 border-gold' : 'text-white/30 hover:text-white/60'
              }`}>
              {t === 'message' ? '✉️ Send Message' : '🪙 Buy Credits'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Message tab ─────────────────────────────────────────────── */}
          {tab === 'message' && (
            <div>
              {sent ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center">
                    <Check size={24} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-serif text-lg mb-1">Message Sent!</p>
                    <p className="text-white/40 text-sm">
                      {authorName} will see your message on their dashboard. You spent{' '}
                      <span className="text-gold">{MESSAGE_COST} credits</span> ({creditsToRupees(MESSAGE_COST)}).
                    </p>
                    <p className="text-white/25 text-xs mt-2 font-mono">
                      Author earned {AUTHOR_SHARE} credits ({creditsToRupees(AUTHOR_SHARE)})
                    </p>
                  </div>
                  <button onClick={onClose}
                    className="bg-gold text-void font-semibold px-8 py-2 rounded-full text-sm hover:bg-gold2 transition-colors">
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Cost indicator */}
                  <div className="flex items-center justify-between mb-4 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div>
                      <p className="text-white/60 text-xs">Message cost</p>
                      <p className="font-serif font-bold text-white text-lg">{MESSAGE_COST} credits</p>
                      <p className="text-white/25 text-[10px] font-mono">{creditsToRupees(MESSAGE_COST)} · Author earns {creditsToRupees(AUTHOR_SHARE)}</p>
                    </div>
                    {balance !== null && (
                      <div className="text-right">
                        <p className="text-white/40 text-xs">Your balance</p>
                        <p className={`font-mono font-bold text-lg ${canSend ? 'text-gold' : 'text-red-400'}`}>
                          {balance.toLocaleString()}
                        </p>
                        {!canSend && (
                          <button onClick={() => setTab('buy')} className="text-[10px] text-gold/60 hover:text-gold underline">
                            Top up →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Your name */}
                  <div className="mb-3">
                    <input
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="w-full bg-transparent border-b border-white/[0.08] pb-2 text-white text-sm placeholder-white/20 outline-none focus:border-gold/30 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder={`Write to ${authorName}… share your thoughts, ask a question, or just say you loved their story.`}
                    rows={4}
                    className="w-full bg-white/[0.02] border border-white/[0.07] rounded-xl p-3 text-white/80 text-sm placeholder-white/20 outline-none focus:border-gold/20 transition-colors resize-none leading-relaxed mb-4"
                  />

                  <button
                    onClick={handleSend}
                    disabled={sending || !messageText.trim() || !canSend}
                    className="w-full flex items-center justify-center gap-2 bg-gold text-void font-semibold py-3 rounded-full text-sm hover:bg-gold2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sending ? 'Sending…' : `Send for ${MESSAGE_COST} credits`}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Buy Credits tab ──────────────────────────────────────────── */}
          {tab === 'buy' && (
            <div>
              <p className="text-white/50 text-xs mb-4 leading-relaxed">
                1 credit = ₹0.10 &nbsp;·&nbsp; Premium subscription includes{' '}
                <span className="text-gold">2,000 credits/month</span>
              </p>
              <div className="space-y-3 mb-5">
                {CREDIT_PACKS.map(pack => (
                  <button key={pack.id} onClick={() => handleBuy(pack.id)}
                    disabled={!!purchasing}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/[0.08] hover:border-gold/25 bg-white/[0.02] hover:bg-white/[0.04] transition-all group disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                        {purchasing === pack.id
                          ? <Loader2 size={12} className="animate-spin text-gold" />
                          : <ShoppingBag size={12} className="text-gold" />}
                      </div>
                      <div className="text-left">
                        <p className="text-white text-sm font-medium">{pack.label}</p>
                        <p className="text-white/30 text-[10px] font-mono">{pack.credits.toLocaleString()} credits</p>
                      </div>
                      {pack.badge && (
                        <span className="text-[8px] font-mono text-gold/70 border border-gold/20 px-2 py-0.5 rounded-full bg-gold/[0.06]">
                          {pack.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-serif font-bold text-gold">₹{pack.price}</p>
                      <p className="text-white/25 text-[9px] font-mono">
                        ₹{(pack.price / pack.credits * 10).toFixed(1)}/credit
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Recent transactions */}
              {transactions.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-2">Recent Activity</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {transactions.slice(0, 6).map(t => (
                      <div key={t.id} className="flex items-center justify-between text-xs">
                        <span className="text-white/40 truncate max-w-[200px]">{typeLabel(t.type)}</span>
                        <span className={`font-mono font-medium shrink-0 ${t.amount > 0 ? 'text-gold' : 'text-white/40'}`}>
                          {t.amount > 0 ? '+' : ''}{t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Coins } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AppNavProps {
  /** CTA override — defaults to Upload Book */
  cta?: { label: string; href: string }
  /** Show credits balance pill (listener-facing pages) */
  showCredits?: boolean
}

const NAV_LINKS = [
  { href: '/listen',        label: 'Browse'     },
  { href: '/stories',       label: 'Stories'    },
  { href: '/create',        label: 'Write'      },
  { href: '/dashboard',     label: 'Dashboard'  },
  { href: '/documentation', label: 'Docs'       },
]

export default function AppNav({ cta, showCredits }: AppNavProps) {
  const pathname = usePathname()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    if (!showCredits) return
    const fp = localStorage.getItem('ks_fp')
    if (!fp) return
    fetch(`/api/credits?fp=${fp}`)
      .then(r => r.json())
      .then(d => setCredits(d.balance ?? null))
      .catch(() => {})
  }, [showCredits])

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href + '/'))

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 lg:px-12 py-4 bg-void/90 backdrop-blur-xl border-b border-white/[0.05]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-purple to-gold flex items-center justify-center text-sm shadow-lg shadow-purple/30">
          🎧
        </div>
        <span className="font-serif font-bold text-[15px] text-white tracking-tight hidden sm:block">
          KadhaiSolai
        </span>
      </Link>

      {/* Centre pill nav */}
      <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-full px-2 py-1.5 backdrop-blur-xl">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`hidden sm:block text-xs transition-colors px-3 py-1.5 rounded-full whitespace-nowrap ${
              isActive(link.href)
                ? 'text-white bg-white/[0.1]'
                : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {link.label}
          </Link>
        ))}

        {/* CTA */}
        <Link
          href={cta?.href ?? '/author'}
          className="text-xs bg-gold text-void font-semibold px-4 py-1.5 rounded-full hover:bg-gold2 transition-colors ml-1 whitespace-nowrap"
        >
          {cta?.label ?? 'Upload Book'}
        </Link>
      </div>

      {/* Credits badge (optional) */}
      {showCredits && credits !== null && (
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-mono text-gold/70 border border-gold/20 bg-gold/[0.05] px-3 py-1.5 rounded-full hover:bg-gold/[0.1] transition-colors shrink-0"
        >
          <Coins size={11} />
          <span>{credits.toLocaleString()}</span>
        </Link>
      )}
    </nav>
  )
}

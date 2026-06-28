'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/chat',     emoji: '💬', label: 'Chat' },
  { href: '/discover', emoji: '🔍', label: 'Discover' },
  { href: '/profile',  emoji: '👤', label: 'Profile' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-800 border-t border-dark-400 flex">
      {tabs.map(t => {
        const active = path.startsWith(t.href)
        return (
          <Link key={t.href} href={t.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition ${active?'text-teal-400':'text-dark-300'}`}>
            <span className="text-xl leading-none">{t.emoji}</span>
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/papers', label: 'Paper Pipeline', icon: '📄' },
  { href: '/literature', label: 'Literature', icon: '📚' },
  { href: '/experiments', label: 'Experiments', icon: '🧪' },
  { href: '/deadlines', label: 'Deadlines', icon: '⏰' },
  { href: '/advisor', label: 'Advisor Hub', icon: '👨‍🏫' },
  { href: '/planner', label: 'Deep Work', icon: '📅' },
  { href: '/wins', label: 'Wins & Rejections', icon: '🏆' },
  { href: '/ideas', label: 'Idea Backburner', icon: '💡' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900/80 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-navy-900 font-bold text-sm">P</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">PhD Planner</div>
            <div className="text-slate-500 text-xs">Research Hub</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 bg-amber-500 rounded-full" />}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-900/10 transition-all duration-150"
        >
          <span className="text-base">→</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

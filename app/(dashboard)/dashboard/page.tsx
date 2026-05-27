'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Link from 'next/link'

interface Stats {
  papers: number
  literature: number
  experiments: number
  upcomingDeadlines: { title: string; deadline_date: string; type: string | null }[]
  recentWins: { title: string; type: string; date: string }[]
  ideas: number
}

export default function DashboardPage() {
  const supabase = createBrowserClient()
  const [stats, setStats] = useState<Stats>({
    papers: 0,
    literature: 0,
    experiments: 0,
    upcomingDeadlines: [],
    recentWins: [],
    ideas: 0,
  })
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [winStreak, setWinStreak] = useState(0)
  const today = new Date()
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const uid = user.id

      const [
        papersRes,
        litRes,
        expRes,
        deadlinesRes,
        winsRes,
        ideasRes,
        profileRes,
      ] = await Promise.all([
        supabase.from('papers').select('id', { count: 'exact' }).eq('user_id', uid),
        supabase.from('literature').select('id', { count: 'exact' }).eq('user_id', uid),
        supabase.from('experiments').select('id', { count: 'exact' }).eq('user_id', uid),
        supabase.from('deadlines')
          .select('title, deadline_date, type')
          .eq('user_id', uid)
          .gte('deadline_date', today.toISOString().split('T')[0])
          .order('deadline_date', { ascending: true })
          .limit(5),
        supabase.from('wins')
          .select('title, type, date')
          .eq('user_id', uid)
          .order('date', { ascending: false })
          .limit(3),
        supabase.from('ideas').select('id', { count: 'exact' }).eq('user_id', uid),
        supabase.from('profiles').select('name').eq('user_id', uid).single(),
      ])

      setStats({
        papers: papersRes.count ?? 0,
        literature: litRes.count ?? 0,
        experiments: expRes.count ?? 0,
        upcomingDeadlines: deadlinesRes.data ?? [],
        recentWins: winsRes.data ?? [],
        ideas: ideasRes.count ?? 0,
      })

      if (profileRes.data?.name) {
        setUserName(profileRes.data.name.split(' ')[0])
      } else {
        setUserName(user.email?.split('@')[0] ?? 'Researcher')
      }

      // Calculate win streak (simplified: count wins in consecutive days from today)
      const { data: allWins } = await supabase
        .from('wins')
        .select('date')
        .eq('user_id', uid)
        .order('date', { ascending: false })

      if (allWins && allWins.length > 0) {
        let streak = 0
        const uniqueDates = [...new Set(allWins.map(w => w.date))].sort().reverse()
        const todayStr = today.toISOString().split('T')[0]
        let checkDate = new Date(todayStr)
        for (const d of uniqueDates) {
          const checkStr = checkDate.toISOString().split('T')[0]
          if (d === checkStr) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else break
        }
        setWinStreak(streak)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  function daysUntil(dateStr: string): number {
    const deadline = new Date(dateStr)
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  function urgencyColor(days: number): string {
    if (days <= 3) return 'text-red-400'
    if (days <= 7) return 'text-amber-400'
    return 'text-emerald-400'
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Loading your hub...
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {greeting}, {userName} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Win streak */}
      {winStreak > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-amber-400 font-semibold">{winStreak}-day win streak!</div>
            <div className="text-amber-400/70 text-sm">Keep logging those wins</div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Papers', value: stats.papers, icon: '📄', href: '/papers', color: 'text-blue-400' },
          { label: 'Papers Read', value: stats.literature, icon: '📚', href: '/literature', color: 'text-purple-400' },
          { label: 'Experiments', value: stats.experiments, icon: '🧪', href: '/experiments', color: 'text-emerald-400' },
          { label: 'Ideas', value: stats.ideas, icon: '💡', href: '/ideas', color: 'text-amber-400' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="card-hover cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{stat.icon}</span>
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming deadlines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span>⏰</span> Upcoming Deadlines
            </h2>
            <Link href="/deadlines" className="text-xs text-amber-400 hover:text-amber-300">
              View all →
            </Link>
          </div>
          {stats.upcomingDeadlines.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">
              No upcoming deadlines.{' '}
              <Link href="/deadlines" className="text-amber-400 hover:underline">Add one</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.upcomingDeadlines.map((d, i) => {
                const days = daysUntil(d.deadline_date)
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{d.title}</div>
                      <div className="text-xs text-slate-500">{d.type ?? 'Deadline'}</div>
                    </div>
                    <div className={`text-sm font-semibold ${urgencyColor(days)}`}>
                      {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days}d`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent wins */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span>🏆</span> Recent Wins
            </h2>
            <Link href="/wins" className="text-xs text-amber-400 hover:text-amber-300">
              View all →
            </Link>
          </div>
          {stats.recentWins.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">
              No wins logged yet.{' '}
              <Link href="/wins" className="text-amber-400 hover:underline">Log your first win</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentWins.map((w, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-800 last:border-0">
                  <span className="text-lg mt-0.5">🎉</span>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{w.title}</div>
                    <div className="text-xs text-slate-500">{w.type} · {new Date(w.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Add paper', icon: '➕', href: '/papers', desc: 'Track a new paper' },
              { label: 'Log experiment', icon: '🧪', href: '/experiments', desc: 'Record an experiment' },
              { label: 'Add deadline', icon: '📅', href: '/deadlines', desc: 'Set a deadline' },
              { label: 'Capture idea', icon: '💡', href: '/ideas', desc: 'Quick idea capture' },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 hover:border-amber-500/20 rounded-xl p-4 text-center transition-all duration-200 cursor-pointer group">
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <div className="text-sm font-medium text-slate-300 group-hover:text-white">{action.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{action.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

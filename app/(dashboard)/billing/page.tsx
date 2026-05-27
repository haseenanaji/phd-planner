'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

export default function BillingPage() {
  const supabase = createBrowserClient()
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [managing, setManaging] = useState(false)

  useEffect(() => {
    async function fetchSubscription() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', user.id)
        .single()

      if (data?.plan === 'pro' && data?.status === 'active') {
        setPlan('pro')
        setPeriodEnd(data.current_period_end)
      }
      setLoading(false)
    }
    fetchSubscription()
  }, [])

  async function handleUpgrade() {
    setUpgrading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setUpgrading(false)
  }

  async function handleManage() {
    setManaging(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setManaging(false)
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Billing</h1>
      <p className="text-slate-400 mb-8">Manage your subscription and plan.</p>

      {/* Current plan */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Current Plan</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan === 'pro' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>
            {plan === 'pro' ? '⭐ Pro' : 'Free'}
          </span>
        </div>
        {plan === 'pro' && periodEnd && (
          <p className="text-slate-400 text-sm">
            Renews on {new Date(periodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        {plan === 'free' && (
          <p className="text-slate-400 text-sm">You&apos;re on the free plan. Upgrade to unlock unlimited features and AI.</p>
        )}
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`rounded-xl border p-5 ${plan === 'free' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800 bg-slate-900/40'}`}>
          <div className="font-semibold text-white mb-1">Free</div>
          <div className="text-2xl font-bold text-white mb-3">$0<span className="text-sm text-slate-400">/mo</span></div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>10 papers</li>
            <li>20 literature entries</li>
            <li>5 experiments</li>
            <li>Deadline tracker</li>
            <li className="line-through opacity-50">AI assistant</li>
          </ul>
        </div>
        <div className={`rounded-xl border p-5 ${plan === 'pro' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800 bg-slate-900/40'}`}>
          <div className="font-semibold text-amber-400 mb-1">Pro</div>
          <div className="text-2xl font-bold text-white mb-3">$9<span className="text-sm text-slate-400">/mo</span></div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Unlimited papers</li>
            <li>Unlimited literature</li>
            <li>Unlimited experiments</li>
            <li>Deadline reminders</li>
            <li>✨ AI assistant</li>
          </ul>
        </div>
      </div>

      {plan === 'free' ? (
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors"
        >
          {upgrading ? 'Redirecting to checkout...' : 'Upgrade to Pro — 7 days free'}
        </button>
      ) : (
        <button
          onClick={handleManage}
          disabled={managing}
          className="w-full border border-slate-700 hover:border-slate-500 text-slate-300 font-medium py-3 rounded-xl transition-colors"
        >
          {managing ? 'Opening portal...' : 'Manage subscription'}
        </button>
      )}
    </div>
  )
}

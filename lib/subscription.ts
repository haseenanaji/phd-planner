import { createBrowserClient } from '@/lib/supabase'

export type Plan = 'free' | 'pro'

export async function getUserPlan(): Promise<Plan> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', user.id)
    .single()

  if (data?.plan === 'pro' && data?.status === 'active') return 'pro'
  return 'free'
}

export const LIMITS = {
  free: { papers: 10, literature: 20, experiments: 5, ai: false },
  pro: { papers: Infinity, literature: Infinity, experiments: Infinity, ai: true },
}

import { NextRequest, NextResponse } from 'next/server'
import { sendDeadlineReminderEmail } from '@/lib/resend'
import { supabase } from '@/lib/supabase'

// This endpoint is called by a cron job (Vercel Cron or external)
// Protect it with a secret header
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    const in7Days = new Date(today)
    in7Days.setDate(today.getDate() + 7)

    // Get all users with deadlines in the next 7 days
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select('user_id, title, deadline_date, type')
      .gte('deadline_date', today.toISOString().split('T')[0])
      .lte('deadline_date', in7Days.toISOString().split('T')[0])
      .order('deadline_date', { ascending: true })

    if (!deadlines || deadlines.length === 0) {
      return NextResponse.json({ message: 'No reminders to send' })
    }

    // Group by user
    const byUser: Record<string, typeof deadlines> = {}
    for (const d of deadlines) {
      if (!byUser[d.user_id]) byUser[d.user_id] = []
      byUser[d.user_id].push(d)
    }

    let sent = 0
    for (const [userId, userDeadlines] of Object.entries(byUser)) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId)
      if (!user?.email) continue

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', userId)
        .single()

      const name = profile?.name ?? user.email.split('@')[0]

      await sendDeadlineReminderEmail(user.email, name, userDeadlines)
      sent++
    }

    return NextResponse.json({ message: `Sent ${sent} reminder emails` })
  } catch (error) {
    console.error('Reminder email error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}

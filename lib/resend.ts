import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: 'PhDPlanner <hello@phdplanner.app>',
    to: email,
    subject: 'Welcome to PhDPlanner 🎓',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #f59e0b; font-size: 28px; margin-bottom: 8px;">Welcome, ${name}! 🎓</h1>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
          You've just taken the first step toward a more organised PhD. Here's what to do next:
        </p>
        <div style="margin: 32px 0; space-y: 16px;">
          ${[
            ['📄', 'Add your first paper', 'Track it from idea to published'],
            ['⏰', 'Set your upcoming deadlines', 'Never miss a conference submission'],
            ['🤝', 'Log your next advisor meeting', 'Come prepared, leave with clear actions'],
            ['💡', 'Dump your backburner ideas', 'Capture them before they disappear'],
          ].map(([icon, title, desc]) => `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; padding: 16px; background: #1e293b; border-radius: 12px;">
              <span style="font-size: 24px;">${icon}</span>
              <div>
                <div style="font-weight: 600; color: #f1f5f9;">${title}</div>
                <div style="color: #94a3b8; font-size: 14px;">${desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <a href="https://phdplanner.app/dashboard" style="display: inline-block; background: #f59e0b; color: #000; font-weight: bold; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 16px;">
          Go to your dashboard →
        </a>
        <p style="color: #475569; font-size: 13px; margin-top: 32px;">
          You're on the free plan. <a href="https://phdplanner.app/billing" style="color: #f59e0b;">Upgrade to Pro</a> for unlimited features + AI assistant.
        </p>
      </div>
    `,
  })
}

export async function sendDeadlineReminderEmail(
  email: string,
  name: string,
  deadlines: { title: string; deadline_date: string; type: string | null }[]
) {
  const deadlineList = deadlines.map(d => {
    const days = Math.ceil((new Date(d.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return `
      <div style="padding: 12px 16px; background: #1e293b; border-radius: 10px; margin-bottom: 10px; border-left: 3px solid ${days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981'};">
        <div style="font-weight: 600; color: #f1f5f9;">${d.title}</div>
        <div style="color: #94a3b8; font-size: 13px;">${d.type ?? 'Deadline'} · ${days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days`}</div>
      </div>
    `
  }).join('')

  return resend.emails.send({
    from: 'PhDPlanner <reminders@phdplanner.app>',
    to: email,
    subject: `⏰ ${deadlines.length} upcoming deadline${deadlines.length > 1 ? 's' : ''} — PhDPlanner`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #f59e0b; font-size: 24px; margin-bottom: 8px;">Hey ${name}, heads up! ⏰</h1>
        <p style="color: #94a3b8; margin-bottom: 24px;">You have ${deadlines.length} upcoming deadline${deadlines.length > 1 ? 's' : ''} in the next 7 days.</p>
        ${deadlineList}
        <a href="https://phdplanner.app/deadlines" style="display: inline-block; margin-top: 24px; background: #f59e0b; color: #000; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
          View all deadlines →
        </a>
      </div>
    `,
  })
}

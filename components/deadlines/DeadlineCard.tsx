'use client'

interface Deadline {
  id: string
  title: string
  type: string | null
  deadline_date: string
  notes: string | null
  created_at: string
}

interface DeadlineCardProps {
  deadline: Deadline
  onEdit: (d: Deadline) => void
  onDelete: (id: string) => void
}

export default function DeadlineCard({ deadline, onEdit, onDelete }: DeadlineCardProps) {
  const now = new Date()
  const dDate = new Date(deadline.deadline_date)
  const daysLeft = Math.ceil((dDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const urgencyClass = daysLeft <= 0
    ? 'border-red-500/50 bg-red-900/10'
    : daysLeft <= 3
    ? 'border-red-500/30 bg-red-900/5'
    : daysLeft <= 7
    ? 'border-amber-500/30 bg-amber-900/5'
    : 'border-slate-700/50 bg-slate-800/30'

  const textClass = daysLeft <= 0
    ? 'text-red-400'
    : daysLeft <= 3
    ? 'text-red-400'
    : daysLeft <= 7
    ? 'text-amber-400'
    : 'text-emerald-400'

  const countdownText = daysLeft < 0
    ? `${Math.abs(daysLeft)}d overdue`
    : daysLeft === 0
    ? 'Due today!'
    : daysLeft === 1
    ? 'Tomorrow!'
    : `${daysLeft} days`

  return (
    <div
      className={`border rounded-xl p-5 cursor-pointer hover:scale-[1.01] transition-all duration-200 group ${urgencyClass}`}
      onClick={() => onEdit(deadline)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 text-sm mb-1">{deadline.title}</h3>
          {deadline.type && (
            <div className="text-xs text-slate-500 mb-2">{deadline.type}</div>
          )}
          {deadline.notes && (
            <div className="text-xs text-slate-500 italic line-clamp-2">{deadline.notes}</div>
          )}
          <div className="text-xs text-slate-500 mt-2">
            {dDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="ml-4 text-right shrink-0">
          <div className={`text-2xl font-bold tabular-nums ${textClass}`}>
            {daysLeft <= 0 ? (daysLeft === 0 ? '0d' : `${Math.abs(daysLeft)}d`) : `${daysLeft}d`}
          </div>
          <div className={`text-xs ${textClass}`}>{countdownText}</div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(deadline.id) }}
        className="opacity-0 group-hover:opacity-100 mt-2 text-xs text-slate-600 hover:text-red-400 transition-all"
      >
        Delete
      </button>
    </div>
  )
}

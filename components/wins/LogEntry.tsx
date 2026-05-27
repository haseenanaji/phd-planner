'use client'

interface Entry {
  id: string
  title: string
  type: string
  date: string
  notes: string | null
  created_at: string
}

interface LogEntryProps {
  entry: Entry
  variant: 'win' | 'rejection'
  onEdit: (e: Entry) => void
  onDelete: (id: string) => void
}

const winIcons: Record<string, string> = {
  'Paper Accepted': '📄',
  'Grant Funded': '💰',
  'Award': '🏅',
  'Presentation': '🎤',
  'Collaboration': '🤝',
  'Milestone': '🎯',
  'Other': '🎉',
}

const rejectionIcons: Record<string, string> = {
  'Paper Rejected': '📄',
  'Grant Rejected': '💰',
  'Application Rejected': '📋',
  'Other': '❌',
}

export default function LogEntry({ entry, variant, onEdit, onDelete }: LogEntryProps) {
  const isWin = variant === 'win'
  const icons = isWin ? winIcons : rejectionIcons
  const icon = icons[entry.type] ?? (isWin ? '🎉' : '❌')

  return (
    <div
      className={`card-hover cursor-pointer group border-l-4 ${
        isWin ? 'border-l-amber-500/60' : 'border-l-slate-600/50'
      }`}
      onClick={() => onEdit(entry)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-100 text-sm mb-0.5">{entry.title}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{entry.type}</span>
            <span>·</span>
            <span>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {entry.notes && (
            <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">{entry.notes}</p>
          )}
          {!isWin && (
            <div className="mt-2 text-xs text-slate-600 italic">
              &ldquo;Every rejection is one step closer to acceptance.&rdquo;
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs p-1 shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

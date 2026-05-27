'use client'

interface Meeting {
  id: string
  date: string
  agenda: string | null
  action_items: string | null
  notes: string | null
  created_at: string
}

interface MeetingNoteProps {
  meeting: Meeting
  onEdit: (m: Meeting) => void
  onDelete: (id: string) => void
}

export default function MeetingNote({ meeting, onEdit, onDelete }: MeetingNoteProps) {
  const dateFormatted = new Date(meeting.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const actionItems = meeting.action_items
    ? meeting.action_items.split('\n').filter(Boolean)
    : []

  return (
    <div
      className="card-hover cursor-pointer group"
      onClick={() => onEdit(meeting)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-1">Meeting</div>
          <div className="text-slate-200 font-semibold">{dateFormatted}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(meeting.id) }}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs p-1"
        >
          ✕
        </button>
      </div>

      {meeting.agenda && (
        <div className="mb-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Agenda</div>
          <p className="text-sm text-slate-300 line-clamp-2">{meeting.agenda}</p>
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Action Items</div>
          <ul className="space-y-1">
            {actionItems.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-amber-500 mt-0.5">•</span>
                <span className="line-clamp-1">{item.replace(/^[-•]\s*/, '')}</span>
              </li>
            ))}
            {actionItems.length > 3 && (
              <li className="text-xs text-slate-500">+{actionItems.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {meeting.notes && (
        <p className="text-xs text-slate-500 italic line-clamp-2">{meeting.notes}</p>
      )}
    </div>
  )
}

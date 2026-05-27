'use client'

import Badge from '@/components/ui/Badge'

type PaperStatus = 'idea' | 'writing' | 'submitted' | 'under_review' | 'published' | 'rejected'

interface Paper {
  id: string
  title: string
  venue: string | null
  status: PaperStatus
  deadline: string | null
  co_authors: string | null
  notes: string | null
  created_at: string
}

interface PaperCardProps {
  paper: Paper
  onEdit: (paper: Paper) => void
  onDelete: (id: string) => void
}

const statusColors: Record<PaperStatus, 'slate' | 'amber' | 'blue' | 'purple' | 'green' | 'red'> = {
  idea: 'slate',
  writing: 'amber',
  submitted: 'blue',
  under_review: 'purple',
  published: 'green',
  rejected: 'red',
}

export default function PaperCard({ paper, onEdit, onDelete }: PaperCardProps) {
  const daysUntilDeadline = paper.deadline
    ? Math.ceil((new Date(paper.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/20 transition-all duration-200 group cursor-pointer" onClick={() => onEdit(paper)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 flex-1">
          {paper.title}
        </h3>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(paper.id) }}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs p-1 shrink-0"
          title="Delete"
        >
          ✕
        </button>
      </div>

      {paper.venue && (
        <div className="text-xs text-amber-400/80 font-medium mb-2">{paper.venue}</div>
      )}

      {paper.co_authors && (
        <div className="text-xs text-slate-500 mb-2">
          👥 {paper.co_authors}
        </div>
      )}

      {paper.notes && (
        <div className="text-xs text-slate-500 line-clamp-2 mb-3 italic">
          {paper.notes}
        </div>
      )}

      {daysUntilDeadline !== null && (
        <div className={`text-xs font-medium mb-2 ${daysUntilDeadline <= 3 ? 'text-red-400' : daysUntilDeadline <= 7 ? 'text-amber-400' : 'text-slate-400'}`}>
          ⏰ {daysUntilDeadline <= 0 ? 'Overdue!' : daysUntilDeadline === 1 ? 'Due tomorrow' : `Due in ${daysUntilDeadline}d`}
        </div>
      )}

      <div className="mt-2">
        <Badge variant={statusColors[paper.status]}>
          {paper.status.replace('_', ' ')}
        </Badge>
      </div>
    </div>
  )
}

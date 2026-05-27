'use client'

import PaperCard from './PaperCard'

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

interface PaperKanbanProps {
  papers: Paper[]
  onEdit: (paper: Paper) => void
  onDelete: (id: string) => void
}

const columns: { id: PaperStatus; label: string; icon: string; accent: string }[] = [
  { id: 'idea', label: 'Idea', icon: '💡', accent: 'border-slate-600/50' },
  { id: 'writing', label: 'Writing', icon: '✍️', accent: 'border-amber-500/30' },
  { id: 'submitted', label: 'Submitted', icon: '📤', accent: 'border-blue-500/30' },
  { id: 'under_review', label: 'Under Review', icon: '🔍', accent: 'border-purple-500/30' },
  { id: 'published', label: 'Published', icon: '🎉', accent: 'border-emerald-500/30' },
  { id: 'rejected', label: 'Rejected', icon: '❌', accent: 'border-red-500/20' },
]

export default function PaperKanban({ papers, onEdit, onDelete }: PaperKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {columns.map((col) => {
        const colPapers = papers.filter((p) => p.status === col.id)
        return (
          <div key={col.id} className={`flex-shrink-0 w-64 bg-slate-900/50 border ${col.accent} rounded-xl p-3`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{col.icon}</span>
                <span className="text-sm font-semibold text-slate-300">{col.label}</span>
              </div>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {colPapers.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[100px]">
              {colPapers.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-xs">
                  No papers here
                </div>
              ) : (
                colPapers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

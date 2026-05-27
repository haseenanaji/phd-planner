'use client'

import Badge from '@/components/ui/Badge'

type LitStatus = 'to-read' | 'reading' | 'done'

interface Literature {
  id: string
  title: string
  authors: string | null
  doi_link: string | null
  status: LitStatus
  tags: string | null
  notes: string | null
  created_at: string
}

interface LiteratureTableProps {
  items: Literature[]
  onEdit: (item: Literature) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: LitStatus) => void
}

const statusBadge: Record<LitStatus, 'slate' | 'amber' | 'green'> = {
  'to-read': 'slate',
  'reading': 'amber',
  'done': 'green',
}

export default function LiteratureTable({ items, onEdit, onDelete, onStatusChange }: LiteratureTableProps) {
  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          No papers in your reading list yet. Add one above.
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="card-hover group flex items-start gap-4"
          >
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item)}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium text-slate-100 text-sm leading-snug mb-0.5">{item.title}</div>
                  {item.authors && (
                    <div className="text-xs text-slate-500 mb-2">{item.authors}</div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={statusBadge[item.status]}>{item.status}</Badge>
                    {item.tags && item.tags.split(',').map((tag) => (
                      <Badge key={tag.trim()} variant="blue">{tag.trim()}</Badge>
                    ))}
                    {item.doi_link && (
                      <a
                        href={item.doi_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-amber-400 hover:text-amber-300 underline"
                      >
                        arXiv/DOI →
                      </a>
                    )}
                  </div>
                  {item.notes && (
                    <div className="text-xs text-slate-500 mt-2 italic line-clamp-2">{item.notes}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                className="text-xs bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                value={item.status}
                onChange={(e) => onStatusChange(item.id, e.target.value as LitStatus)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="to-read">To-read</option>
                <option value="reading">Reading</option>
                <option value="done">Done</option>
              </select>
              <button
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs p-1"
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

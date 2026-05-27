'use client'

import Badge from '@/components/ui/Badge'

type ExpStatus = 'planned' | 'running' | 'done' | 'failed'

interface Experiment {
  id: string
  title: string
  hypothesis: string | null
  method: string | null
  status: ExpStatus
  outcome: string | null
  date: string | null
  created_at: string
}

interface ExperimentTableProps {
  experiments: Experiment[]
  onEdit: (exp: Experiment) => void
  onDelete: (id: string) => void
}

const statusBadge: Record<ExpStatus, 'blue' | 'amber' | 'green' | 'red'> = {
  planned: 'blue',
  running: 'amber',
  done: 'green',
  failed: 'red',
}

const statusIcon: Record<ExpStatus, string> = {
  planned: '📋',
  running: '⚡',
  done: '✅',
  failed: '❌',
}

export default function ExperimentTable({ experiments, onEdit, onDelete }: ExperimentTableProps) {
  if (experiments.length === 0) {
    return (
      <div className="card text-center py-12 text-slate-500">
        No experiments logged yet. Add your first one above.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Status</th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Title</th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Hypothesis</th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Method</th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Outcome</th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Date</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {experiments.map((exp) => (
            <tr
              key={exp.id}
              className="group hover:bg-slate-800/30 cursor-pointer transition-colors"
              onClick={() => onEdit(exp)}
            >
              <td className="py-3 pr-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span>{statusIcon[exp.status]}</span>
                  <Badge variant={statusBadge[exp.status]}>{exp.status}</Badge>
                </div>
              </td>
              <td className="py-3 pr-4 font-medium text-slate-200 max-w-[160px]">
                <div className="truncate">{exp.title}</div>
              </td>
              <td className="py-3 pr-4 text-slate-400 max-w-[200px]">
                <div className="truncate">{exp.hypothesis ?? '—'}</div>
              </td>
              <td className="py-3 pr-4 text-slate-400 max-w-[160px]">
                <div className="truncate">{exp.method ?? '—'}</div>
              </td>
              <td className="py-3 pr-4 text-slate-400 max-w-[160px]">
                <div className="truncate">{exp.outcome ?? '—'}</div>
              </td>
              <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                {exp.date ? new Date(exp.date).toLocaleDateString() : '—'}
              </td>
              <td className="py-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(exp.id) }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs p-1"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

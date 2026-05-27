'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import ExperimentTable from '@/components/experiments/ExperimentTable'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

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

const emptyForm = {
  title: '',
  hypothesis: '',
  method: '',
  status: 'planned' as ExpStatus,
  outcome: '',
  date: '',
}

export default function ExperimentsPage() {
  const supabase = createBrowserClient()
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [ideaText, setIdeaText] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ExpStatus | 'all'>('all')

  useEffect(() => { fetchExperiments() }, [])

  async function fetchExperiments() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('experiments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setExperiments(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(exp: Experiment) {
    setForm({
      title: exp.title,
      hypothesis: exp.hypothesis ?? '',
      method: exp.method ?? '',
      status: exp.status,
      outcome: exp.outcome ?? '',
      date: exp.date ?? '',
    })
    setEditingId(exp.id)
    setModalOpen(true)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    const payload = {
      title: form.title,
      hypothesis: form.hypothesis || null,
      method: form.method || null,
      status: form.status,
      outcome: form.outcome || null,
      date: form.date || null,
      user_id: user.id,
    }

    if (editingId) {
      await supabase.from('experiments').update(payload).eq('id', editingId)
    } else {
      await supabase.from('experiments').insert(payload)
    }

    setSaving(false)
    setModalOpen(false)
    fetchExperiments()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this experiment?')) return
    await supabase.from('experiments').delete().eq('id', id)
    fetchExperiments()
  }

  async function handleAI() {
    if (!ideaText.trim()) return
    setAiLoading(true)
    setAiResult('')
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'build_hypothesis', idea: ideaText }),
    })
    const data = await res.json()
    setAiResult(data.result ?? data.error ?? 'Error')
    setAiLoading(false)
  }

  const filtered = filterStatus === 'all'
    ? experiments
    : experiments.filter((e) => e.status === filterStatus)

  const counts = {
    all: experiments.length,
    planned: experiments.filter((e) => e.status === 'planned').length,
    running: experiments.filter((e) => e.status === 'running').length,
    done: experiments.filter((e) => e.status === 'done').length,
    failed: experiments.filter((e) => e.status === 'failed').length,
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🧪 Experiment Log</h1>
          <p className="page-subtitle">Track hypotheses, methods, and outcomes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setAiOpen(true)}>
            🤖 Hypothesis Builder
          </Button>
          <Button onClick={openCreate}>+ Log Experiment</Button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {(['all', 'planned', 'running', 'done', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              filterStatus === f
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {f} <span className="text-xs opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading...
        </div>
      ) : (
        <div className="card">
          <ExperimentTable experiments={filtered} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Experiment' : 'Log Experiment'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Experiment name"
            />
          </div>
          <div>
            <label className="label">Hypothesis</label>
            <textarea
              className="input-field h-20 resize-none"
              value={form.hypothesis}
              onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
              placeholder="If X then Y because Z..."
            />
          </div>
          <div>
            <label className="label">Method</label>
            <textarea
              className="input-field h-20 resize-none"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              placeholder="Experimental procedure..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ExpStatus })}
              >
                <option value="planned">Planned</option>
                <option value="running">Running</option>
                <option value="done">Done</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Outcome</label>
            <textarea
              className="input-field h-20 resize-none"
              value={form.outcome}
              onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              placeholder="Results, findings, what you learned..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.title.trim()}>
              {editingId ? 'Save Changes' : 'Log Experiment'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Modal */}
      <Modal isOpen={aiOpen} onClose={() => setAiOpen(false)} title="🤖 Hypothesis Builder" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Describe your vague research idea and Claude will turn it into a testable hypothesis with variables and methodology.</p>
          <div>
            <label className="label">Your idea</label>
            <textarea
              className="input-field h-32 resize-none"
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="I think that using larger batch sizes might improve training stability for transformers on small datasets..."
            />
          </div>
          <Button onClick={handleAI} loading={aiLoading} disabled={!ideaText.trim()}>
            Build Hypothesis with Claude
          </Button>
          {aiResult && (
            <div className="ai-result">
              <div
                dangerouslySetInnerHTML={{
                  __html: aiResult
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^### (.*)/gm, '<h3>$1</h3>')
                    .replace(/^## (.*)/gm, '<h2>$1</h2>')
                    .replace(/^# (.*)/gm, '<h1>$1</h1>')
                    .replace(/^- (.*)/gm, '<li>$1</li>')
                    .replace(/\n/g, '<br/>'),
                }}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

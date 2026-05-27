'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import DeadlineCard from '@/components/deadlines/DeadlineCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface Deadline {
  id: string
  title: string
  type: string | null
  deadline_date: string
  notes: string | null
  created_at: string
}

const emptyForm = {
  title: '',
  type: '',
  deadline_date: '',
  notes: '',
}

const DEADLINE_TYPES = ['Conference', 'Journal', 'Grant', 'Fellowship', 'Thesis', 'Exam', 'Meeting', 'Other']

export default function DeadlinesPage() {
  const supabase = createBrowserClient()
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMilestone, setAiMilestone] = useState('')
  const [aiContext, setAiContext] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showPast, setShowPast] = useState(false)

  useEffect(() => { fetchDeadlines() }, [])

  async function fetchDeadlines() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline_date', { ascending: true })
    setDeadlines(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(d: Deadline) {
    setForm({
      title: d.title,
      type: d.type ?? '',
      deadline_date: d.deadline_date,
      notes: d.notes ?? '',
    })
    setEditingId(d.id)
    setModalOpen(true)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    const payload = {
      title: form.title,
      type: form.type || null,
      deadline_date: form.deadline_date,
      notes: form.notes || null,
      user_id: user.id,
    }

    if (editingId) {
      await supabase.from('deadlines').update(payload).eq('id', editingId)
    } else {
      await supabase.from('deadlines').insert(payload)
    }

    setSaving(false)
    setModalOpen(false)
    fetchDeadlines()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deadline?')) return
    await supabase.from('deadlines').delete().eq('id', id)
    fetchDeadlines()
  }

  async function handleAI() {
    if (!aiMilestone.trim()) return
    setAiLoading(true)
    setAiResult('')
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'suggest_deadline', milestone: aiMilestone, context: aiContext }),
    })
    const data = await res.json()
    setAiResult(data.result ?? data.error ?? 'Error')
    setAiLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = deadlines.filter((d) => d.deadline_date >= today)
  const past = deadlines.filter((d) => d.deadline_date < today)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⏰ Deadlines</h1>
          <p className="page-subtitle">Conference, grant, and thesis deadlines</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setAiOpen(true)}>
            🤖 Suggest Deadline
          </Button>
          <Button onClick={openCreate}>+ Add Deadline</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading...
        </div>
      ) : (
        <>
          {upcoming.length === 0 && !showPast ? (
            <div className="card text-center py-12 text-slate-500">
              No upcoming deadlines. <button onClick={openCreate} className="text-amber-400 hover:underline ml-1">Add one</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((d) => (
                <DeadlineCard key={d.id} deadline={d} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowPast(!showPast)}
                className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-2 mb-4"
              >
                <span className={`transition-transform ${showPast ? 'rotate-90' : ''}`}>▶</span>
                Past deadlines ({past.length})
              </button>
              {showPast && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                  {past.map((d) => (
                    <DeadlineCard key={d.id} deadline={d} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Deadline' : 'Add Deadline'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. NeurIPS 2025 submission"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                className="input-field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">Select type</option>
                {DEADLINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Deadline Date *</label>
              <input
                type="date"
                className="input-field"
                value={form.deadline_date}
                onChange={(e) => setForm({ ...form, deadline_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field h-20 resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Submission requirements, links..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.title.trim() || !form.deadline_date}>
              {editingId ? 'Save Changes' : 'Add Deadline'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={aiOpen} onClose={() => setAiOpen(false)} title="🤖 AI Deadline Suggester" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Describe your milestone and Claude will suggest a realistic deadline with intermediate checkpoints.</p>
          <div>
            <label className="label">Milestone type</label>
            <input
              className="input-field"
              value={aiMilestone}
              onChange={(e) => setAiMilestone(e.target.value)}
              placeholder="e.g. Submit a conference paper, Complete thesis chapter 3"
            />
          </div>
          <div>
            <label className="label">Additional context</label>
            <textarea
              className="input-field h-20 resize-none"
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              placeholder="Current progress, team size, complexity..."
            />
          </div>
          <Button onClick={handleAI} loading={aiLoading} disabled={!aiMilestone.trim()}>
            Suggest Timeline with Claude
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

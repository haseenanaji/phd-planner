'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import MeetingNote from '@/components/advisor/MeetingNote'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface Meeting {
  id: string
  date: string
  agenda: string | null
  action_items: string | null
  notes: string | null
  created_at: string
}

const emptyForm = {
  date: '',
  agenda: '',
  action_items: '',
  notes: '',
}

export default function AdvisorPage() {
  const supabase = createBrowserClient()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [rawNotes, setRawNotes] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { fetchMeetings() }, [])

  async function fetchMeetings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setMeetings(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    const today = new Date().toISOString().split('T')[0]
    setForm({ ...emptyForm, date: today })
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(m: Meeting) {
    setForm({
      date: m.date,
      agenda: m.agenda ?? '',
      action_items: m.action_items ?? '',
      notes: m.notes ?? '',
    })
    setEditingId(m.id)
    setModalOpen(true)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    const payload = {
      date: form.date,
      agenda: form.agenda || null,
      action_items: form.action_items || null,
      notes: form.notes || null,
      user_id: user.id,
    }

    if (editingId) {
      await supabase.from('meetings').update(payload).eq('id', editingId)
    } else {
      await supabase.from('meetings').insert(payload)
    }

    setSaving(false)
    setModalOpen(false)
    fetchMeetings()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this meeting note?')) return
    await supabase.from('meetings').delete().eq('id', id)
    fetchMeetings()
  }

  async function handleAI() {
    if (!rawNotes.trim()) return
    setAiLoading(true)
    setAiResult('')
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'draft_advisor_update', notes: rawNotes }),
    })
    const data = await res.json()
    setAiResult(data.result ?? data.error ?? 'Error')
    setAiLoading(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">👨‍🏫 Advisor Hub</h1>
          <p className="page-subtitle">Meeting notes and weekly progress summaries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setAiOpen(true)}>
            🤖 Draft Weekly Update
          </Button>
          <Button onClick={openCreate}>+ Add Meeting</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading...
        </div>
      ) : meetings.length === 0 ? (
        <div className="card text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">👨‍🏫</div>
          <p className="mb-2">No meeting notes yet.</p>
          <button onClick={openCreate} className="text-amber-400 hover:underline text-sm">Add your first meeting note</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => (
            <MeetingNote key={m.id} meeting={m} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Meeting Note' : 'Add Meeting Note'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Meeting Date *</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Agenda</label>
            <textarea
              className="input-field h-24 resize-none"
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="What was discussed..."
            />
          </div>
          <div>
            <label className="label">Action Items (one per line)</label>
            <textarea
              className="input-field h-24 resize-none"
              value={form.action_items}
              onChange={(e) => setForm({ ...form, action_items: e.target.value })}
              placeholder="- Run baseline experiments&#10;- Read Smith et al. 2024&#10;- Send draft by Friday"
            />
          </div>
          <div>
            <label className="label">Additional Notes</label>
            <textarea
              className="input-field h-20 resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Feedback, ideas, concerns..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.date}>
              {editingId ? 'Save Changes' : 'Add Meeting'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={aiOpen} onClose={() => setAiOpen(false)} title="🤖 Draft Weekly Progress Update" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Dump your raw notes from the week and Claude will turn them into a polished advisor update email.</p>
          <div>
            <label className="label">Your raw notes from this week</label>
            <textarea
              className="input-field h-40 resize-none"
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Ran the transformer baseline, got 72% accuracy. Read the attention paper. Stuck on the data augmentation part. Need to talk to Prof about chapter 2 deadline. Wrote ~800 words of the related work section..."
            />
          </div>
          <Button onClick={handleAI} loading={aiLoading} disabled={!rawNotes.trim()}>
            Draft with Claude Sonnet
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
              <button
                onClick={() => navigator.clipboard.writeText(aiResult)}
                className="mt-4 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

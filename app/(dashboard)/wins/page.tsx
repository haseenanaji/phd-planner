'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import LogEntry from '@/components/wins/LogEntry'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface Entry {
  id: string
  title: string
  type: string
  date: string
  notes: string | null
  created_at: string
}

const WIN_TYPES = ['Paper Accepted', 'Grant Funded', 'Award', 'Presentation', 'Collaboration', 'Milestone', 'Other']
const REJECTION_TYPES = ['Paper Rejected', 'Grant Rejected', 'Application Rejected', 'Other']

const emptyWinForm = { title: '', type: 'Paper Accepted', date: '', notes: '' }
const emptyRejForm = { title: '', type: 'Paper Rejected', date: '', notes: '' }

export default function WinsPage() {
  const supabase = createBrowserClient()
  const [tab, setTab] = useState<'wins' | 'rejections'>('wins')
  const [wins, setWins] = useState<Entry[]>([])
  const [rejections, setRejections] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyWinForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [winsRes, rejRes] = await Promise.all([
      supabase.from('wins').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('rejections').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    ])

    setWins(winsRes.data ?? [])
    setRejections(rejRes.data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(tab === 'wins' ? { ...emptyWinForm, date: new Date().toISOString().split('T')[0] } : { ...emptyRejForm, date: new Date().toISOString().split('T')[0] })
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(e: Entry) {
    setForm({ title: e.title, type: e.type, date: e.date, notes: e.notes ?? '' })
    setEditingId(e.id)
    setModalOpen(true)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    const table = tab === 'wins' ? 'wins' : 'rejections'
    const payload = { title: form.title, type: form.type, date: form.date, notes: form.notes || null, user_id: user.id }

    if (editingId) {
      await supabase.from(table).update(payload).eq('id', editingId)
    } else {
      await supabase.from(table).insert(payload)
    }

    setSaving(false)
    setModalOpen(false)
    fetchAll()
  }

  async function handleDelete(id: string, isWin: boolean) {
    if (!confirm('Delete this entry?')) return
    await supabase.from(isWin ? 'wins' : 'rejections').delete().eq('id', id)
    fetchAll()
  }

  const types = tab === 'wins' ? WIN_TYPES : REJECTION_TYPES
  const entries = tab === 'wins' ? wins : rejections

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Wins & Rejections</h1>
          <p className="page-subtitle">Celebrate wins. Normalize rejections. Track your journey.</p>
        </div>
        <Button onClick={openCreate}>
          {tab === 'wins' ? '+ Log Win' : '+ Log Rejection'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-xs">
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-400">{wins.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Wins</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-slate-400">{rejections.length}</div>
          <div className="text-xs text-slate-500 mt-1">Rejections</div>
        </div>
      </div>

      {rejections.length > 0 && wins.length > 0 && (
        <div className="mb-5 text-sm text-slate-500">
          Acceptance rate: <span className="text-amber-400 font-semibold">
            {Math.round((wins.length / (wins.length + rejections.length)) * 100)}%
          </span>
          <span className="ml-2 text-slate-600">— You are resilient.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-900/50 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setTab('wins')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'wins'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🏆 Wins ({wins.length})
        </button>
        <button
          onClick={() => setTab('rejections')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'rejections'
              ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          ❌ Rejections ({rejections.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading...
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">{tab === 'wins' ? '🏆' : '💪'}</div>
          <p className="text-slate-500 mb-2">
            {tab === 'wins'
              ? 'No wins logged yet. You deserve to celebrate your progress!'
              : 'No rejections logged. Remember: rejections are proof you are trying.'}
          </p>
          <button onClick={openCreate} className="text-amber-400 hover:underline text-sm">
            Log your first {tab === 'wins' ? 'win' : 'rejection'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tab === 'rejections' && (
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-400 italic">
                &ldquo;Rejection is not failure. Failure is not trying. Every rejection means you put your work out there.&rdquo;
              </p>
            </div>
          )}
          {entries.map((e) => (
            <LogEntry
              key={e.id}
              entry={e}
              variant={tab === 'wins' ? 'win' : 'rejection'}
              onEdit={openEdit}
              onDelete={(id) => handleDelete(id, tab === 'wins')}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={tab === 'wins' ? (editingId ? 'Edit Win' : 'Log a Win') : (editingId ? 'Edit Rejection' : 'Log a Rejection')}
      >
        <div className="space-y-4">
          {tab === 'rejections' && !editingId && (
            <div className="text-sm text-slate-400 italic border-l-2 border-amber-500/40 pl-3">
              Logging a rejection takes courage. You put your work out there. That matters.
            </div>
          )}
          <div>
            <label className="label">Title *</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={tab === 'wins' ? 'Paper accepted at NeurIPS!' : 'Paper rejected from ICML'}
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
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field h-20 resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={tab === 'wins' ? 'How did it feel? Who helped you get here?' : 'Reviewer feedback, lessons learned, next steps...'}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.title.trim() || !form.date}>
              {editingId ? 'Save Changes' : tab === 'wins' ? 'Log Win' : 'Log Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import PaperKanban from '@/components/papers/PaperKanban'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

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

const emptyForm = {
  title: '',
  venue: '',
  status: 'idea' as PaperStatus,
  deadline: '',
  co_authors: '',
  notes: '',
}

export default function PapersPage() {
  const supabase = createBrowserClient()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [abstract, setAbstract] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { fetchPapers() }, [])

  async function fetchPapers() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('papers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPapers(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(paper: Paper) {
    setForm({
      title: paper.title,
      venue: paper.venue ?? '',
      status: paper.status,
      deadline: paper.deadline ?? '',
      co_authors: paper.co_authors ?? '',
      notes: paper.notes ?? '',
    })
    setEditingId(paper.id)
    setModalOpen(true)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    const payload = {
      title: form.title,
      venue: form.venue || null,
      status: form.status,
      deadline: form.deadline || null,
      co_authors: form.co_authors || null,
      notes: form.notes || null,
      user_id: user.id,
    }

    if (editingId) {
      await supabase.from('papers').update(payload).eq('id', editingId)
    } else {
      await supabase.from('papers').insert(payload)
    }

    setSaving(false)
    setModalOpen(false)
    fetchPapers()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this paper?')) return
    await supabase.from('papers').delete().eq('id', id)
    fetchPapers()
  }

  async function handleAI() {
    if (!abstract.trim()) return
    setAiLoading(true)
    setAiResult('')
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'summarize_paper', abstract }),
    })
    const data = await res.json()
    setAiResult(data.result ?? data.error ?? 'Error')
    setAiLoading(false)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📄 Paper Pipeline</h1>
          <p className="page-subtitle">Track your papers from idea to publication</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setAiOpen(true)}>
            🤖 AI Summarize
          </Button>
          <Button onClick={openCreate}>+ Add Paper</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading papers...
        </div>
      ) : (
        <PaperKanban papers={papers} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Paper' : 'Add Paper'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Paper title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Venue / Journal</label>
              <input
                className="input-field"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="NeurIPS, ICLR, etc."
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PaperStatus })}
              >
                <option value="idea">Idea</option>
                <option value="writing">Writing</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Deadline</label>
              <input
                type="date"
                className="input-field"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Co-authors</label>
              <input
                className="input-field"
                value={form.co_authors}
                onChange={(e) => setForm({ ...form, co_authors: e.target.value })}
                placeholder="Alice, Bob"
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field h-24 resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Key ideas, feedback, next steps..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.title.trim()}>
              {editingId ? 'Save Changes' : 'Add Paper'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Modal */}
      <Modal isOpen={aiOpen} onClose={() => setAiOpen(false)} title="🤖 AI Paper Summarizer" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Paste abstract</label>
            <textarea
              className="input-field h-40 resize-none"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Paste the paper abstract here..."
            />
          </div>
          <Button onClick={handleAI} loading={aiLoading} disabled={!abstract.trim()}>
            Summarize with Claude
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
                    .replace(/^(\d+)\. (.*)/gm, '<p><strong>$1.</strong> $2</p>')
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

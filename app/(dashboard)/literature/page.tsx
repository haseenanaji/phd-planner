'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import LiteratureTable from '@/components/literature/LiteratureTable'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
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

const emptyForm = {
  title: '',
  authors: '',
  doi_link: '',
  status: 'to-read' as LitStatus,
  tags: '',
  notes: '',
}

export default function LiteraturePage() {
  const supabase = createBrowserClient()
  const [items, setItems] = useState<Literature[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LitStatus | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('literature')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(item: Literature) {
    setForm({
      title: item.title,
      authors: item.authors ?? '',
      doi_link: item.doi_link ?? '',
      status: item.status,
      tags: item.tags ?? '',
      notes: item.notes ?? '',
    })
    setEditingId(item.id)
    setModalOpen(true)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    const payload = {
      title: form.title,
      authors: form.authors || null,
      doi_link: form.doi_link || null,
      status: form.status,
      tags: form.tags || null,
      notes: form.notes || null,
      user_id: user.id,
    }

    if (editingId) {
      await supabase.from('literature').update(payload).eq('id', editingId)
    } else {
      await supabase.from('literature').insert(payload)
    }

    setSaving(false)
    setModalOpen(false)
    fetchItems()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await supabase.from('literature').delete().eq('id', id)
    fetchItems()
  }

  async function handleStatusChange(id: string, status: LitStatus) {
    await supabase.from('literature').update({ status }).eq('id', id)
    fetchItems()
  }

  const filtered = items
    .filter((i) => filter === 'all' || i.status === filter)
    .filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()) || (i.authors ?? '').toLowerCase().includes(search.toLowerCase()))

  const counts = {
    all: items.length,
    'to-read': items.filter((i) => i.status === 'to-read').length,
    reading: items.filter((i) => i.status === 'reading').length,
    done: items.filter((i) => i.status === 'done').length,
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Literature Tracker</h1>
          <p className="page-subtitle">Manage your reading list</p>
        </div>
        <Button onClick={openCreate}>+ Add Paper</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {(['all', 'to-read', 'reading', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({counts[f]})</span>
          </button>
        ))}
        <input
          className="ml-auto input-field w-48"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading...
        </div>
      ) : (
        <LiteratureTable
          items={filtered}
          onEdit={openEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Entry' : 'Add to Reading List'}
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
          <div>
            <label className="label">Authors</label>
            <input
              className="input-field"
              value={form.authors}
              onChange={(e) => setForm({ ...form, authors: e.target.value })}
              placeholder="Author 1, Author 2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">arXiv / DOI Link</label>
              <input
                className="input-field"
                value={form.doi_link}
                onChange={(e) => setForm({ ...form, doi_link: e.target.value })}
                placeholder="https://arxiv.org/..."
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LitStatus })}
              >
                <option value="to-read">To-read</option>
                <option value="reading">Reading</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              className="input-field"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="ML, NLP, transformers"
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field h-24 resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Key takeaways, quotes, relevance..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.title.trim()}>
              {editingId ? 'Save Changes' : 'Add to List'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Idea {
  id: string
  title: string
  description: string | null
  tags: string | null
  created_at: string
}

const emptyForm = { title: '', description: '', tags: '' }

const CARD_COLORS = [
  'bg-amber-500/8 border-amber-500/20 hover:border-amber-500/40',
  'bg-blue-500/8 border-blue-500/20 hover:border-blue-500/40',
  'bg-emerald-500/8 border-emerald-500/20 hover:border-emerald-500/40',
  'bg-purple-500/8 border-purple-500/20 hover:border-purple-500/40',
  'bg-rose-500/8 border-rose-500/20 hover:border-rose-500/40',
]

function cardColor(id: string): string {
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) % CARD_COLORS.length
  return CARD_COLORS[hash]
}

export default function IdeasPage() {
  const supabase = createBrowserClient()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')

  useEffect(() => { fetchIdeas() }, [])

  async function fetchIdeas() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setIdeas(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(idea: Idea) {
    setForm({
      title: idea.title,
      description: idea.description ?? '',
      tags: idea.tags ?? '',
    })
    setEditingId(idea.id)
    setModalOpen(true)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    const payload = {
      title: form.title,
      description: form.description || null,
      tags: form.tags || null,
      user_id: user.id,
    }

    if (editingId) {
      await supabase.from('ideas').update(payload).eq('id', editingId)
    } else {
      await supabase.from('ideas').insert(payload)
    }

    setSaving(false)
    setModalOpen(false)
    fetchIdeas()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this idea?')) return
    await supabase.from('ideas').delete().eq('id', id)
    fetchIdeas()
  }

  // All unique tags
  const allTags = [...new Set(
    ideas.flatMap((i) => (i.tags ? i.tags.split(',').map((t) => t.trim()) : []))
  )].filter(Boolean)

  const filtered = ideas.filter((i) => {
    const matchSearch = !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchTag = !filterTag || (i.tags ?? '').includes(filterTag)
    return matchSearch && matchTag
  })

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">💡 Idea Backburner</h1>
          <p className="page-subtitle">Quick-capture stray research ideas before they slip away</p>
        </div>
        <Button onClick={openCreate}>+ Capture Idea</Button>
      </div>

      {/* Search and filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input
          className="input-field w-64"
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Tags:</span>
            <button
              onClick={() => setFilterTag('')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${!filterTag ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${filterTag === tag ? 'border-blue-500/40 text-blue-400 bg-blue-500/10' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">💡</div>
          <p className="text-slate-500 mb-2">
            {search || filterTag ? 'No ideas match your search.' : 'No ideas captured yet. Ideas are fleeting — catch them here!'}
          </p>
          {!search && !filterTag && (
            <button onClick={openCreate} className="text-amber-400 hover:underline text-sm">
              Capture your first idea
            </button>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((idea) => (
            <div
              key={idea.id}
              className={`break-inside-avoid border rounded-xl p-4 cursor-pointer transition-all duration-200 group ${cardColor(idea.id)}`}
              onClick={() => openEdit(idea)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-100 text-sm leading-snug">{idea.title}</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(idea.id) }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs p-1 shrink-0"
                >
                  ✕
                </button>
              </div>
              {idea.description && (
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{idea.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {idea.tags && idea.tags.split(',').map((tag) => (
                    <Badge key={tag.trim()} variant="blue" size="sm">{tag.trim()}</Badge>
                  ))}
                </div>
                <div className="text-xs text-slate-600">
                  {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Idea' : 'Capture Idea'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What's the idea?"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field h-32 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Expand on it... key insight, motivation, why it matters, related work..."
            />
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              className="input-field"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="ML, interpretability, NLP"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.title.trim()}>
              {editingId ? 'Save Changes' : 'Capture Idea'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

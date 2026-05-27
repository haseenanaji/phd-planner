'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import WeeklyPlanner from '@/components/planner/WeeklyPlanner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface FocusBlock {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  label: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_LABELS = [
  'Deep Writing', 'Coding / Experiments', 'Literature Review', 'Meetings', 'Admin',
  'Analysis', 'Paper Revision', 'Seminar', 'Office Hours',
]

export default function PlannerPage() {
  const supabase = createBrowserClient()
  const [blocks, setBlocks] = useState<FocusBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '11:00',
    label: 'Deep Writing',
  })
  const [saving, setSaving] = useState(false)
  const [dailyGoal, setDailyGoal] = useState({ words: '500', tasks: '3' })

  useEffect(() => { fetchBlocks() }, [])

  async function fetchBlocks() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('focus_blocks')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week')
      .order('start_time')
    setBlocks(data ?? [])
    setLoading(false)
  }

  function openAddBlock(day: number, startHour: number) {
    const padHour = (h: number) => String(h).padStart(2, '0')
    setForm({
      day_of_week: day,
      start_time: `${padHour(startHour)}:00`,
      end_time: `${padHour(startHour + 2)}:00`,
      label: 'Deep Writing',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    await supabase.from('focus_blocks').insert({
      user_id: user.id,
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      label: form.label,
    })

    setSaving(false)
    setModalOpen(false)
    fetchBlocks()
  }

  async function handleDeleteBlock(id: string) {
    await supabase.from('focus_blocks').delete().eq('id', id)
    fetchBlocks()
  }

  // Calculate total planned hours per day
  const hoursPerDay = DAYS.map((_, idx) => {
    const dayBlocks = blocks.filter((b) => b.day_of_week === idx)
    return dayBlocks.reduce((sum, b) => {
      const [sh, sm] = b.start_time.split(':').map(Number)
      const [eh, em] = b.end_time.split(':').map(Number)
      return sum + (eh + em / 60) - (sh + sm / 60)
    }, 0)
  })

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Deep Work Planner</h1>
          <p className="page-subtitle">Plan your focus blocks — click any cell to add a block</p>
        </div>
        <Button onClick={() => {
          setForm({ day_of_week: 0, start_time: '09:00', end_time: '11:00', label: 'Deep Writing' })
          setModalOpen(true)
        }}>
          + Add Block
        </Button>
      </div>

      {/* Daily goals */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
        <div className="card">
          <label className="label">Daily word goal</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input-field flex-1"
              value={dailyGoal.words}
              onChange={(e) => setDailyGoal({ ...dailyGoal, words: e.target.value })}
              min="0"
            />
            <span className="text-slate-500 text-sm">words</span>
          </div>
        </div>
        <div className="card">
          <label className="label">Daily task goal</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input-field flex-1"
              value={dailyGoal.tasks}
              onChange={(e) => setDailyGoal({ ...dailyGoal, tasks: e.target.value })}
              min="0"
            />
            <span className="text-slate-500 text-sm">tasks</span>
          </div>
        </div>
      </div>

      {/* Hours summary */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {DAYS.map((day, i) => (
          <div key={day} className="flex-shrink-0 text-center bg-slate-800/40 rounded-xl p-3 min-w-[70px]">
            <div className="text-xs text-slate-500 mb-1">{day.slice(0, 3)}</div>
            <div className={`text-lg font-bold ${hoursPerDay[i] > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
              {hoursPerDay[i].toFixed(1)}h
            </div>
          </div>
        ))}
        <div className="flex-shrink-0 text-center bg-slate-800/40 rounded-xl p-3 min-w-[70px] border border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">Total</div>
          <div className="text-lg font-bold text-slate-300">
            {hoursPerDay.reduce((a, b) => a + b, 0).toFixed(1)}h
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading...
        </div>
      ) : (
        <div className="card overflow-hidden">
          <WeeklyPlanner
            blocks={blocks}
            onAddBlock={openAddBlock}
            onDeleteBlock={handleDeleteBlock}
          />
        </div>
      )}

      <p className="text-xs text-slate-600 mt-3">Click any time cell to add a focus block. Click × on a block to remove it.</p>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Focus Block"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Day</label>
            <select
              className="input-field"
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: parseInt(e.target.value) })}
            >
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start time</label>
              <input
                type="time"
                className="input-field"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="label">End time</label>
              <input
                type="time"
                className="input-field"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Label</label>
            <input
              className="input-field"
              list="label-options"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="What is this block for?"
            />
            <datalist id="label-options">
              {DEFAULT_LABELS.map((l) => <option key={l} value={l} />)}
            </datalist>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.label.trim()}>
              Add Block
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

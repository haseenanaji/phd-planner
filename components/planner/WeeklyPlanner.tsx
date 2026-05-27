'use client'

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am to 8pm
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface FocusBlock {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  label: string
}

interface WeeklyPlannerProps {
  blocks: FocusBlock[]
  onAddBlock: (day: number, startHour: number) => void
  onDeleteBlock: (id: string) => void
}

function timeToDecimal(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h + m / 60
}

const BLOCK_COLORS = [
  'bg-amber-500/20 border-amber-500/40 text-amber-300',
  'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'bg-rose-500/20 border-rose-500/40 text-rose-300',
]

function colorForLabel(label: string): string {
  let hash = 0
  for (const c of label) hash = (hash * 31 + c.charCodeAt(0)) % BLOCK_COLORS.length
  return BLOCK_COLORS[hash]
}

export default function WeeklyPlanner({ blocks, onAddBlock, onDeleteBlock }: WeeklyPlannerProps) {
  const ROW_HEIGHT = 48 // px per hour

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-slate-800 mb-1">
          <div className="text-xs text-slate-600 py-2" />
          {DAY_ABBR.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-slate-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8" style={{ height: ROW_HEIGHT }}>
              <div className="text-xs text-slate-600 pr-2 pt-0.5 text-right select-none">
                {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
              </div>
              {DAYS.map((_, dayIdx) => {
                const dayBlocks = blocks.filter((b) => {
                  if (b.day_of_week !== dayIdx) return false
                  const start = timeToDecimal(b.start_time)
                  const end = timeToDecimal(b.end_time)
                  return start >= hour && start < hour + 1
                })

                return (
                  <div
                    key={dayIdx}
                    className="border-t border-l border-slate-800/50 relative cursor-pointer hover:bg-slate-800/20 transition-colors"
                    style={{ height: ROW_HEIGHT }}
                    onClick={() => onAddBlock(dayIdx, hour)}
                  >
                    {dayBlocks.map((block) => {
                      const startDec = timeToDecimal(block.start_time)
                      const endDec = timeToDecimal(block.end_time)
                      const topOffset = (startDec - hour) * ROW_HEIGHT
                      const height = Math.max((endDec - startDec) * ROW_HEIGHT - 2, 20)

                      return (
                        <div
                          key={block.id}
                          className={`absolute left-0.5 right-0.5 rounded border text-xs px-1 overflow-hidden group ${colorForLabel(block.label)}`}
                          style={{ top: topOffset, height }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="truncate block">{block.label}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id) }}
                            className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

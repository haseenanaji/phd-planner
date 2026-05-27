interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'amber' | 'green' | 'blue' | 'red' | 'purple' | 'slate'
  size?: 'sm' | 'md'
}

const variantClasses = {
  default: 'bg-slate-700/60 text-slate-300 border border-slate-600/50',
  amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  red: 'bg-red-500/15 text-red-400 border border-red-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  slate: 'bg-slate-600/40 text-slate-400 border border-slate-600/30',
}

export default function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant]} ${size === 'md' ? 'text-sm px-3 py-1' : ''}`}>
      {children}
    </span>
  )
}

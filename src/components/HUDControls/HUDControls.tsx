import type { ReactorState } from '../../lib/types'

interface HUDControlsProps {
  onSetState: (state: ReactorState) => void
}

const controls: { state: ReactorState; label: string; icon: string; color: string; bg: string }[] = [
  { state: 'listening', label: 'Simulate listening', icon: '◉', color: 'text-cyan-400', bg: 'bg-cyan-950/30 border-cyan-500/30 hover:bg-cyan-950/60' },
  { state: 'thinking', label: 'Simulate thinking', icon: '⟳', color: 'text-purple-400', bg: 'bg-purple-950/30 border-purple-500/30 hover:bg-purple-950/60' },
  { state: 'speaking', label: 'Simulate speaking', icon: '↕', color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-500/30 hover:bg-emerald-950/60' },
  { state: 'idle', label: 'Reset (Idle)', icon: '○', color: 'text-slate-400', bg: 'bg-slate-900/30 border-slate-700/30 hover:bg-slate-800/60' },
]

export default function HUDControls({ onSetState }: HUDControlsProps) {
  return (
    <div className="mt-8 flex gap-3 max-w-lg justify-center flex-wrap">
      {controls.map((c) => (
        <button
          key={c.state}
          onClick={() => onSetState(c.state)}
          className={`px-4 py-2 text-xs font-mono ${c.bg} ${c.color} rounded-md border transition-all flex items-center gap-1.5`}
        >
          <span className={c.state === 'listening' ? 'w-2 h-2 rounded-full bg-cyan-400 animate-ping' : c.state === 'thinking' ? 'w-2 h-2 rounded-full bg-purple-400 animate-spin' : c.state === 'speaking' ? 'w-2 h-2 rounded-full bg-emerald-400 animate-bounce' : 'w-2 h-2 rounded-full bg-slate-500'}></span>
          {c.label}
        </button>
      ))}
    </div>
  )
}

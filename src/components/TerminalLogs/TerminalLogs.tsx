import { useEffect, useRef, type ReactNode } from 'react'
import type { LogEntry } from '../../lib/types'

interface TerminalLogsProps {
  logs: LogEntry[]
  children?: ReactNode
  className?: string
}

const levelColors: Record<string, string> = {
  info: 'text-cyan-500',
  warn: 'text-amber-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
}

export default function TerminalLogs({ logs, children, className = '' }: TerminalLogsProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <div className={`w-full md:w-[420px] bg-[#03050a]/60 backdrop-blur-md p-6 flex flex-col overflow-hidden ${className}`}>
      <h3 className="text-xs uppercase font-bold tracking-widest text-cyan-500 font-mono mb-4 flex items-center justify-between">
        <span>Transmission Engine Logs</span>
        <span className="text-[9px] text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">SYSTEM NORMAL</span>
      </h3>

      <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl p-4 border border-[#1a2238] font-mono text-[11px] space-y-3 mb-4">
        {logs.map((log, i) => (
          <p key={i} className={levelColors[log.level]}>
            [{log.timestamp}] {log.message}
          </p>
        ))}
        <div ref={endRef} />
      </div>

      {children}
    </div>
  )
}

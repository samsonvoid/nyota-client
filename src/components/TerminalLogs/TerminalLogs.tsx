import { useEffect, useRef, type ReactNode } from 'react'
import type { LogEntry } from '../../lib/types'
import CodeCard from '../CodeCard/CodeCard'

interface TerminalLogsProps {
  logs: LogEntry[]
  children?: ReactNode
  className?: string
  onViewCode?: (filename: string, code: string, language: string, filePath?: string) => void
  onNotify?: (message: string, level: 'info' | 'warn' | 'error' | 'success') => void
}

const levelColors: Record<string, string> = {
  info: 'text-cyan-500',
  warn: 'text-amber-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
}

interface MessagePart {
  type: 'text' | 'code'
  content: string
  language?: string
}

function parseMessageParts(raw: string): MessagePart[] {
  if (!raw.includes('```')) {
    return [{ type: 'text', content: raw }]
  }

  const parts: MessagePart[] = []
  // Matches ```lang\ncode``` or unclosed ```lang\ncode at end of message
  const fenceRegex = /```([a-zA-Z0-9_-]*)\s*([\s\S]*?)(?:```|$)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = fenceRegex.exec(raw)) !== null) {
    const textBefore = raw.slice(lastIndex, match.index)
    if (textBefore.trim()) {
      parts.push({ type: 'text', content: textBefore })
    }
    const lang = match[1] || 'c'
    const code = match[2]
    if (code && code.trim()) {
      parts.push({ type: 'code', content: code.trim(), language: lang })
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < raw.length) {
    const remaining = raw.slice(lastIndex)
    if (remaining.trim()) {
      parts.push({ type: 'text', content: remaining })
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: raw }]
}

export default function TerminalLogs({
  logs,
  children,
  className = '',
  onViewCode,
  onNotify,
}: TerminalLogsProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <div className={`w-full md:w-[460px] lg:w-[500px] bg-[#03050a]/60 backdrop-blur-md p-6 flex flex-col overflow-hidden ${className}`}>
      <h3 className="text-xs uppercase font-bold tracking-widest text-cyan-500 font-mono mb-4 flex items-center justify-between">
        <span>Transmission Engine Logs</span>
        <span className="text-[9px] text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">SYSTEM NORMAL</span>
      </h3>

      <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl p-4 border border-[#1a2238] font-mono text-[11px] space-y-3 mb-4">
        {logs.map((log, i) => {
          const hasCode = log.message.includes('```')
          if (!hasCode) {
            return (
              <p key={i} className={`${levelColors[log.level]} whitespace-pre-wrap break-words leading-relaxed`}>
                [{log.timestamp}] {log.message}
              </p>
            )
          }

          const parts = parseMessageParts(log.message)
          const surroundingContext = parts.filter(p => p.type === 'text').map(p => p.content).join(' ')

          return (
            <div key={i} className="space-y-1.5">
              <span className={`text-[10px] opacity-70 ${levelColors[log.level]}`}>
                [{log.timestamp}]
              </span>
              {parts.map((part, pIdx) => {
                if (part.type === 'text') {
                  return (
                    <p key={pIdx} className={`${levelColors[log.level]} whitespace-pre-wrap break-words leading-relaxed`}>
                      {part.content}
                    </p>
                  )
                }
                return (
                  <CodeCard
                    key={pIdx}
                    code={part.content}
                    language={part.language}
                    surroundingContext={surroundingContext}
                    onViewCode={onViewCode}
                    onNotify={onNotify}
                  />
                )
              })}
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {children}
    </div>
  )
}

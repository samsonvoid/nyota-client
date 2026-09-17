import { useState } from 'react'

export interface CodeViewerModalProps {
  isOpen: boolean
  onClose: () => void
  filename: string
  code: string
  language?: string
  filePath?: string
}

export default function CodeViewerModal({
  isOpen,
  onClose,
  filename,
  code,
  language = 'plaintext',
  filePath,
}: CodeViewerModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy code:', e)
    }
  }

  const lines = code.split('\n')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#050914] border border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-950/50 overflow-hidden font-mono text-xs"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-cyan-500/20">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {language.toUpperCase()}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-100 truncate tracking-wide">
                {filename}
              </span>
              {filePath && (
                <span className="text-[10px] text-cyan-400/70 truncate" title={filePath}>
                  {filePath}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 border ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400'
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span> COPIED!
                </>
              ) : (
                <>
                  <span>📋</span> COPY CODE
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 transition-colors"
              title="Close viewer (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-auto p-4 bg-[#02040a] text-slate-200">
          <div className="grid grid-cols-[auto_1fr] gap-x-4">
            {/* Line numbers */}
            <div className="select-none text-right text-slate-600 font-mono pr-2 border-r border-slate-800/80">
              {lines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code lines */}
            <div className="overflow-x-auto">
              <pre className="font-mono text-[12px] leading-6 tab-size-4">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950 border-t border-slate-800/60 text-[10px] text-slate-400">
          <div className="flex items-center gap-4">
            <span>{lines.length} lines</span>
            <span>{code.length} characters</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400/80">
            <span>Press Esc or ✕ to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}

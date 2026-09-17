import { useState } from 'react'
import { api } from '../../lib/api'

export interface CodeCardProps {
  code: string
  language?: string
  surroundingContext?: string
  onViewCode?: (filename: string, code: string, language: string, filePath?: string) => void
  onNotify?: (message: string, level: 'info' | 'warn' | 'error' | 'success') => void
}

export function inferScriptFileName(code: string, language: string = '', surroundingContext: string = ''): string {
  // 1. Check if filename was explicitly indicated in markdown or code comments
  const fileMatch = surroundingContext.match(/(?:file|script|named|filename|save as)[\s:=`"']+([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)/i)
    || code.match(/(?:\/\/|#|\/\*)\s*(?:file|filename):?\s*([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)/i)
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1].trim()
  }

  // 2. Identify file extension based on language or syntax
  const lang = (language || '').toLowerCase().trim()
  let ext = 'txt'
  if (lang === 'c') ext = 'c'
  else if (lang === 'cpp' || lang === 'c++') ext = 'cpp'
  else if (lang === 'python' || lang === 'py') ext = 'py'
  else if (lang === 'javascript' || lang === 'js') ext = 'js'
  else if (lang === 'typescript' || lang === 'ts') ext = 'ts'
  else if (lang === 'html') ext = 'html'
  else if (lang === 'css') ext = 'css'
  else if (lang === 'rust' || lang === 'rs') ext = 'rs'
  else if (lang === 'go') ext = 'go'
  else if (lang === 'java') ext = 'java'
  else if (lang === 'csharp' || lang === 'cs') ext = 'cs'
  else if (lang === 'sh' || lang === 'bash') ext = 'sh'
  else if (lang === 'sql') ext = 'sql'
  else if (lang === 'json') ext = 'json'
  else if (code.includes('#include <stdio.h>') || code.includes('#include <stdlib.h>')) ext = 'c'
  else if (code.includes('def ') || code.includes('import os')) ext = 'py'

  // 3. Meaningful name based on keywords
  const combined = (surroundingContext + ' ' + code.slice(0, 300)).toLowerCase()
  let slug = 'program'
  if (combined.includes('fifo') || combined.includes('first in first out') || combined.includes('first-in-first-out')) {
    slug = 'fifo_queue'
  } else if (combined.includes('bubble sort') || combined.includes('bubblesort')) {
    slug = 'bubble_sort'
  } else if (combined.includes('binary search')) {
    slug = 'binary_search'
  } else if (combined.includes('queue')) {
    slug = 'queue_program'
  } else if (combined.includes('stack')) {
    slug = 'stack_program'
  } else if (combined.includes('linked list')) {
    slug = 'linked_list'
  } else if (combined.includes('calculator')) {
    slug = 'calculator'
  } else if (combined.includes('merge sort')) {
    slug = 'merge_sort'
  } else if (combined.includes('quick sort')) {
    slug = 'quick_sort'
  } else {
    slug = `${lang || 'script'}_program`
  }

  return `${slug}.${ext}`
}

export default function CodeCard({
  code,
  language = 'c',
  surroundingContext = '',
  onViewCode,
  onNotify,
}: CodeCardProps) {
  const initialName = inferScriptFileName(code, language, surroundingContext)
  const [filename, setFilename] = useState(initialName)
  const [isSaved, setIsSaved] = useState(false)
  const [savedPath, setSavedPath] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSavePrompt, setShowSavePrompt] = useState(true)
  const [copied, setCopied] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy code:', e)
    }
  }

  const handleSave = async () => {
    if (!filename.trim()) return
    setIsSaving(true)
    setSaveError(null)
    try {
      const res = await api.saveFile(filename.trim(), code)
      if (res.success) {
        setIsSaved(true)
        const path = res.file_path || filename
        setSavedPath(path)
        setShowSavePrompt(false)
        onNotify?.(`[SYSTEM]: File '${filename}' successfully saved to disk.`, 'success')
      } else {
        setSaveError(res.output || 'Save failed')
        onNotify?.(`[ERROR]: Failed to save '${filename}': ${res.output}`, 'error')
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error saving file')
      onNotify?.(`[ERROR]: Could not save file: ${err.message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenViewer = () => {
    onViewCode?.(filename, code, language, savedPath || undefined)
  }

  const lines = code.split('\n')
  const previewLines = lines.slice(0, 16)
  const isTruncated = lines.length > 16

  return (
    <div className="my-2.5 rounded-lg border border-cyan-500/30 bg-[#040814]/90 overflow-hidden font-mono text-xs shadow-lg shadow-cyan-950/30">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-900/90 border-b border-cyan-500/20 text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {language.toUpperCase() || 'CODE'}
          </span>

          {isSaved ? (
            <button
              onClick={handleOpenViewer}
              className="text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1.5 hover:underline truncate"
              title="Click to view full saved script"
            >
              <span>📂</span>
              <span className="truncate">{filename}</span>
              <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                SAVED
              </span>
            </button>
          ) : (
            <span className="text-slate-200 font-medium truncate">{filename}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 border ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10'
            }`}
          >
            {copied ? '✓ COPIED!' : '📋 COPY'}
          </button>

          {!isSaved && !showSavePrompt && (
            <button
              onClick={() => setShowSavePrompt(true)}
              className="px-2.5 py-1 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1"
            >
              💾 SAVE TO DISK
            </button>
          )}

          <button
            onClick={handleOpenViewer}
            className="px-2.5 py-1 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1"
            title="Open in full-screen code viewer"
          >
            🔍 VIEW FULL
          </button>
        </div>
      </div>

      {/* Save Confirmation Pop-out Prompt */}
      {showSavePrompt && !isSaved && (
        <div className="p-3 bg-amber-950/40 border-b border-amber-500/30 text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">💾</span>
              <div>
                <div className="font-bold text-[11px] uppercase tracking-wide text-amber-300">
                  Save this script to disk?
                </div>
                <div className="text-[10px] text-amber-200/80">
                  Save directly to your active project workspace.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="filename.ext"
                className="bg-black/60 border border-amber-500/40 px-2 py-1 text-slate-100 rounded text-[11px] font-mono focus:outline-none focus:border-amber-400 w-36"
              />

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 hover:bg-emerald-500/30 rounded font-bold text-[10px] tracking-wider transition-colors disabled:opacity-50"
              >
                {isSaving ? 'SAVING...' : 'YES, SAVE'}
              </button>

              <button
                onClick={() => setShowSavePrompt(false)}
                className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 rounded text-[10px] tracking-wider transition-colors"
              >
                IGNORE
              </button>
            </div>
          </div>

          {saveError && (
            <div className="mt-1.5 text-[10px] text-red-400 font-semibold">
              ⚠️ {saveError}
            </div>
          )}
        </div>
      )}

      {/* Saved Status Banner with Clickable File Link */}
      {isSaved && (
        <div className="px-3.5 py-1.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between text-[10px] text-emerald-300">
          <div className="flex items-center gap-2 truncate">
            <span>✓</span>
            <span className="font-semibold truncate">File saved on disk:</span>
            <span className="text-emerald-200/80 truncate">{savedPath || filename}</span>
          </div>
          <button
            onClick={handleOpenViewer}
            className="text-cyan-300 hover:text-white underline ml-2 shrink-0 font-bold"
          >
            Click to View Code →
          </button>
        </div>
      )}

      {/* Code Snippet Preview */}
      <div 
        onClick={handleOpenViewer}
        className="p-3 bg-[#020409] text-slate-200 overflow-x-auto cursor-pointer hover:bg-[#030612] transition-colors group relative"
        title="Click anywhere to inspect full code in viewer"
      >
        <pre className="font-mono text-[11px] leading-5 text-slate-300 selection:bg-cyan-500/30">
          <code>
            {previewLines.map((line, idx) => (
              <div key={idx} className="flex">
                <span className="select-none text-slate-600 w-7 text-right pr-2 shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>

        {isTruncated && (
          <div className="mt-2 text-center text-[10px] text-cyan-400/80 group-hover:text-cyan-300 font-bold pt-1 border-t border-slate-800/60">
            ... Click to view remaining {lines.length - 16} lines in Code Viewer ...
          </div>
        )}
      </div>
    </div>
  )
}

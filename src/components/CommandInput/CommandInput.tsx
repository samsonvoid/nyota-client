import { useState } from 'react'

interface CommandInputProps {
  onSubmit: (value: string) => void
}

export default function CommandInput({ onSubmit }: CommandInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Weka maelekezo ya kumtahini Jarvis..."
          className="flex-1 bg-slate-950/80 border border-[#1a2238] focus:border-cyan-400 rounded-lg px-3 py-2 text-xs outline-none text-slate-200 font-mono"
        />
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 font-mono"
        >
          Fire
        </button>
      </div>
      <p className="text-[9px] text-slate-500 text-center">
        Jaribio lolote hapa litaleta uandishi na mabadiliko ya sauti kwenye Jarvis visualizer!
      </p>
    </div>
  )
}

import type { ReactorState, ViewMode } from '../../lib/types'

interface HeaderProps {
  state: ReactorState
  systemMode: 'personal' | 'business'
  language: 'en' | 'sw'
  onLanguageChange: (lang: 'en' | 'sw') => void
  viewMode: ViewMode
  autoView: boolean
  onViewModeChange: (mode: ViewMode) => void
  onAutoViewChange: (enabled: boolean) => void
}

const viewModes: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'immersive', label: 'Voice', icon: 'MIC' },
  { id: 'split', label: 'Split', icon: 'SPLIT' },
  { id: 'chat', label: 'Chat', icon: 'CHAT' },
  { id: 'dashboard', label: 'Deck', icon: 'DECK' },
]

export default function Header({
  state,
  systemMode,
  language,
  onLanguageChange,
  viewMode,
  autoView,
  onViewModeChange,
  onAutoViewChange,
}: HeaderProps) {
  const statusColors: Record<ReactorState, string> = {
    idle: 'bg-cyan-400',
    listening: 'bg-cyan-400',
    thinking: 'bg-purple-400',
    speaking: 'bg-emerald-400',
  }

  return (
    <header className="bg-[#03050a]/90 backdrop-blur-md border-b border-[#1a2238] px-6 py-3.5 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        <svg className="w-8 h-8 text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        <div>
          <h1 className="text-sm font-extrabold tracking-widest text-slate-100 glow-blue">NYOTA ASSISTANT v2.5-JARVIS</h1>
          <p className="text-[10px] text-cyan-400 font-mono tracking-wider">WINDOWS NATIVE RUNTIME ENGINE</p>
        </div>
      </div>
      
      <div className="min-w-0 flex items-center gap-2 md:gap-4">
        <div className="hidden xl:flex items-center gap-1 rounded border border-[#1a2238] bg-[#03050a] p-0.5">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              title={`${mode.label} view`}
              onClick={() => onViewModeChange(mode.id)}
              className={`px-2 py-1.5 font-mono text-[8px] font-bold tracking-wider transition-colors ${
                viewMode === mode.id && !autoView
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-400/30'
                  : 'text-slate-500 hover:text-slate-200 border border-transparent'
              }`}
            >
              {mode.icon}
            </button>
          ))}
          <button
            type="button"
            title="Toggle automatic view mode"
            onClick={() => onAutoViewChange(!autoView)}
            className={`px-2 py-1.5 font-mono text-[8px] font-bold tracking-wider border-l border-[#1a2238] ${
              autoView ? 'text-amber-300' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {autoView ? 'AUTO' : 'LOCK'}
          </button>
        </div>
        {/* Language Toggle */}
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'sw' : 'en')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border font-mono text-[9px] font-extrabold tracking-wider transition-all duration-300 cursor-pointer ${
            language === 'sw'
              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:bg-emerald-500/20'
              : 'bg-cyan-950/30 text-cyan-400 border-cyan-500/25 shadow-[0_0_10px_rgba(6,182,212,0.05)] hover:bg-cyan-500/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${language === 'sw' ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
          LANG: {language === 'en' ? 'ENGLISH' : 'KISWAHILI'}
        </button>
        {/* Passive Telemetry Active Mode Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded border font-mono text-[9px] font-extrabold tracking-wider transition-all duration-300 ${
            systemMode === 'personal'
              ? 'bg-purple-950/30 text-purple-400 border-purple-500/25 shadow-[0_0_10px_rgba(168,85,247,0.05)]'
              : 'bg-cyan-950/30 text-cyan-400 border-cyan-500/25 shadow-[0_0_10px_rgba(6,182,212,0.05)]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${systemMode === 'personal' ? 'bg-purple-400' : 'bg-cyan-400'} animate-pulse`} />
          MODE: {systemMode === 'personal' ? 'PERSONAL (ADMIN)' : 'BUSINESS (CLIENT)'}
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-cyan-950/40 px-3 py-1.5 rounded border border-cyan-500/20">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[state]} animate-ping`}></span>
          <span className="text-cyan-300 uppercase">{state}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="bg-cyan-950/60 text-cyan-400 text-[10px] px-2.5 py-1 rounded border border-cyan-500/20 font-mono">Py-3.13 Global</span>
          <span className="bg-purple-950/60 text-purple-400 text-[10px] px-2.5 py-1 rounded border border-purple-500/20 font-mono">SAPI5-TTS</span>
        </div>
      </div>
    </header>
  )
}

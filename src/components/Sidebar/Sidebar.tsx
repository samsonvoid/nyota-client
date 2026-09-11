interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  systemMode: 'personal' | 'business'
  onSetMode: (mode: 'personal' | 'business') => void
}

const businessTabs = [
  { id: 'visualizer', label: 'Jarvis Arc Reactor' },
  { id: 'portfolio', label: 'Case Studies Portfolio' },
  { id: 'estimator', label: 'Project Estimator' },
]

const personalTabs = [
  { id: 'visualizer', label: 'Diagnostics Reactor' },
  { id: 'leads', label: 'Captured Leads' },
  { id: 'auditor', label: 'Vulnerability Auditor' },
  { id: 'setup', label: 'Windows CMD Setup' },
]

function getTabIcon(id: string) {
  if (id === 'visualizer') {
    return (
      <svg className="w-5 h-5 stroke-current shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    )
  }
  if (id === 'setup') {
    return (
      <svg className="w-5 h-5 stroke-current shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    )
  }
  if (id === 'portfolio') {
    return (
      <svg className="w-5 h-5 stroke-current shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    )
  }
  if (id === 'estimator') {
    return (
      <svg className="w-5 h-5 stroke-current shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  }
  if (id === 'leads') {
    return (
      <svg className="w-5 h-5 stroke-current shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (id === 'auditor') {
    return (
      <svg className="w-5 h-5 stroke-current shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  }
  return null
}

export default function Sidebar({ activeTab, onTabChange, systemMode, onSetMode }: SidebarProps) {
  const tabs = systemMode === 'personal' ? personalTabs : businessTabs

  return (
    <aside className="w-16 sm:w-20 lg:w-72 bg-[#05070e]/95 backdrop-blur-md border-r border-[#1a2238] flex flex-col shrink-0 z-10 transition-[width] duration-200">
      <div className="p-2 sm:p-3 lg:p-4 border-b border-[#1a2238] space-y-3">
        <span className="hidden lg:block text-[10px] uppercase font-bold tracking-widest text-cyan-500 font-mono">Core Command Deck</span>
        
        {/* Segmented Mode Switcher */}
        <div className="hidden lg:grid grid-cols-2 p-0.5 bg-[#03050a] border border-[#1a2238] rounded-lg">
          <button
            onClick={() => onSetMode('business')}
            className={`py-1.5 text-[9px] font-mono font-bold tracking-wider rounded-md transition-all duration-300 ${
              systemMode === 'business'
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-extrabold'
                : 'text-slate-400 border border-transparent hover:text-slate-200 cursor-pointer'
            }`}
          >
            BUSINESS
          </button>
          <button
            onClick={() => onSetMode('personal')}
            className={`py-1.5 text-[9px] font-mono font-bold tracking-wider rounded-md transition-all duration-300 ${
              systemMode === 'personal'
                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)] font-extrabold'
                : 'text-slate-400 border border-transparent hover:text-slate-200 cursor-pointer'
            }`}
          >
            PERSONAL
          </button>
        </div>
      </div>

      <nav className="flex-1 p-2 lg:p-3 space-y-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-100 border border-transparent'
              }`}
            >
              {getTabIcon(tab.id)}
              <span className="hidden lg:inline truncate">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <DiagnosticsPanel />
    </aside>
  )
}

function DiagnosticsPanel() {
  return (
    <div className="hidden lg:block p-4 border-t border-[#1a2238] bg-[#020409] text-xs font-mono space-y-2.5">
      <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider block">Diagnostics Console</span>
      <div className="space-y-1.5 text-slate-400 text-[11px]">
        <p className="flex justify-between"><span>SAPI5 Voice:</span> <span className="text-cyan-400">Microsoft David</span></p>
        <p className="flex justify-between"><span>Mic Channel:</span> <span className="text-cyan-400">DirectSound (0)</span></p>
        <p className="flex justify-between"><span>Gemini Stream:</span> <span className="text-emerald-400">1.5-Flash</span></p>
        <p className="flex justify-between"><span>Latency:</span> <span className="text-emerald-400">12ms (Localhost)</span></p>
      </div>
    </div>
  )
}

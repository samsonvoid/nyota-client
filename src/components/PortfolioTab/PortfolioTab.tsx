import { useState } from 'react'

interface Project {
  id: string
  title: string
  subtitle: string
  desc: string
  stack: string[]
  complexity: number
  budget: string
  challenge: string
  solution: string
}

const projects: Project[] = [
  {
    id: 'svs-credit',
    title: 'SVS Credit',
    subtitle: 'Corporate Credit & Loan Underwriting Engine',
    desc: 'Automated underwriting platform that evaluates corporate lending risk, analyzes balance sheets, and handles multi-tier credit approvals.',
    stack: ['React', 'Python (Django)', 'Supabase', 'PostgreSQL'],
    complexity: 92,
    budget: '$12,000 - $18,000',
    challenge: 'Analyzing unstructured financial statements and calculating debt service coverage ratios dynamically under high traffic.',
    solution: 'Built an asynchronous processing pipeline using Django channels and mapped rules to a PostgreSQL stored-procedure calculation matrix.',
  },
  {
    id: 'jirani-app',
    title: 'JiraniApp',
    subtitle: 'Microfinance & Group Savings Platform',
    desc: 'A social savings Chama application allowing community groups to pool savings, apply for peer-to-peer micro-loans, and track interest returns.',
    stack: ['Flutter', 'Node.js', 'PostgreSQL', 'Redis'],
    complexity: 78,
    budget: '$4,500 - $7,000',
    challenge: 'Preventing transaction race-conditions when multiple Chama members initiate loan bidding simultaneously.',
    solution: 'Implemented atomic transactional locking using Redis-based distributed locks to isolate loan ledger modifications.',
  },
]

export default function PortfolioTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeProject = projects.find((p) => p.id === selectedId)

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-y-auto p-4 sm:p-6 xl:p-8">
      <div className="w-full max-w-[1800px] mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 glow-blue">Dynamic Case Studies Browser</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-world projects executed by Samson, loaded dynamically with stack specifications and architectural insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`p-5 rounded-xl bg-[#03050a] border cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                selectedId === p.id
                  ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)] bg-cyan-950/5'
                  : 'border-[#1a2238] hover:border-cyan-500/50 hover:bg-[#070b14]/50'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-300" />
              
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 font-mono">Case Study</span>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5 group-hover:text-cyan-300 transition-colors">{p.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">{p.subtitle}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{p.desc}</p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {p.stack.map((s) => (
                    <span key={s} className="bg-cyan-950/40 text-cyan-400 text-[10px] px-2 py-0.5 rounded border border-cyan-500/10 font-mono">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="border-t border-[#1a2238] pt-3 flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">Complexity: <strong className="text-cyan-400">{p.complexity}%</strong></span>
                  <span className="text-slate-400">Budget: <strong className="text-emerald-400">{p.budget}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeProject && (
          <div className="p-6 rounded-xl bg-[#03050a] border border-cyan-400/40 bg-gradient-to-br from-[#03050a] to-[#070e1a]/40 shadow-[0_0_30px_rgba(0,240,255,0.08)] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#1a2238] pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Architectural Deep-Dive</span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">{activeProject.title} Core Details</h3>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-slate-400 hover:text-slate-200 border border-[#1a2238] px-2.5 py-1 rounded-md bg-[#070b14]/50 hover:bg-[#0c1220]"
              >
                Close details
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  Technical Challenge:
                </h4>
                <p className="text-slate-300 bg-red-950/10 p-3 rounded-lg border border-red-950/20">{activeProject.challenge}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Nyota Solution Engine:
                </h4>
                <p className="text-slate-300 bg-emerald-950/10 p-3 rounded-lg border border-emerald-950/20">{activeProject.solution}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

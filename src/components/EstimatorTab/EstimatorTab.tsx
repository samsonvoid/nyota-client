import { useState, useMemo } from 'react'

export default function EstimatorTab() {
  const [platform, setPlatform] = useState<'mobile' | 'web' | 'both'>('web')
  const [timeline, setTimeline] = useState<number>(3) // months
  const [features, setFeatures] = useState<string[]>(['dashboard'])
  const [security, setSecurity] = useState<'basic' | 'rls' | 'advanced'>('rls')

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const estimate = useMemo(() => {
    let basePrice = 2000
    let complexity = 30

    // Platform weights
    if (platform === 'mobile') {
      basePrice += 1500
      complexity += 15
    } else if (platform === 'both') {
      basePrice += 3000
      complexity += 35
    }

    // Timeline modifier (faster = higher complexity/cost)
    if (timeline === 1) {
      basePrice *= 1.3
      complexity += 15
    } else if (timeline === 2) {
      basePrice *= 1.15
      complexity += 8
    } else if (timeline >= 5) {
      basePrice *= 0.9 // discount for longer timeline
    }

    // Features cost mapping
    features.forEach((f) => {
      if (f === 'chat') {
        basePrice += 800
        complexity += 10
      }
      if (f === 'ai') {
        basePrice += 1800
        complexity += 20
      }
      if (f === 'payments') {
        basePrice += 1000
        complexity += 12
      }
      if (f === 'dashboard') {
        basePrice += 600
        complexity += 8
      }
    })

    // Security modifier
    if (security === 'rls') {
      basePrice += 500
      complexity += 8
    } else if (security === 'advanced') {
      basePrice += 2000
      complexity += 25
    }

    complexity = Math.min(99, complexity)

    return {
      complexity,
      minBudget: Math.round(basePrice * 0.9),
      maxBudget: Math.round(basePrice * 1.15),
    }
  }, [platform, timeline, features, security])

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-y-auto p-4 sm:p-6 xl:p-8">
      <div className="w-full max-w-[1800px] mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 glow-blue">Project Budget & Complexity Estimator</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your technical requirements to generate a real-time predictive score of budget scale and design complexity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Configurator Panel */}
          <div className="md:col-span-2 space-y-6 bg-[#03050a] border border-[#1a2238] p-5 rounded-xl">
            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">1. Select Target Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {(['web', 'mobile', 'both'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`py-2.5 rounded-lg text-xs font-mono font-bold capitalize border transition-all ${
                      platform === p
                        ? 'bg-cyan-950/40 text-cyan-400 border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.08)]'
                        : 'bg-transparent text-slate-400 border-[#1a2238] hover:border-slate-700'
                    }`}
                  >
                    {p === 'both' ? 'Web & Mobile' : `${p} App`}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                <span>2. Desired Timeline</span>
                <span className="text-cyan-400">{timeline} {timeline === 1 ? 'Month' : 'Months'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={timeline}
                onChange={(e) => setTimeline(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#0e1322] border border-[#1a2238] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>1 Month (Rush)</span>
                <span>3 Months (Standard)</span>
                <span>6 Months (Flexible)</span>
              </div>
            </div>

            {/* Features Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">3. Integrate Special Features</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { id: 'chat', label: 'Real-Time Chat Engine', desc: 'WebSockets log streams' },
                  { id: 'ai', label: 'Gemini LLM Assistant', desc: 'Structured outputs integrations' },
                  { id: 'payments', label: 'Stripe/M-Pesa Integration', desc: 'Secure webhooks ledger' },
                  { id: 'dashboard', label: 'Admin Analytics Panel', desc: 'Supabase real-time logs' },
                ].map((f) => (
                  <div
                    key={f.id}
                    onClick={() => toggleFeature(f.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      features.includes(f.id)
                        ? 'bg-cyan-950/30 border-cyan-400/50 text-slate-200'
                        : 'bg-transparent border-[#1a2238] text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${features.includes(f.id) ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold font-mono text-[9px]' : 'border-slate-600 bg-transparent'}`}>
                        {features.includes(f.id) && '✓'}
                      </span>
                      <span className="font-bold">{f.label}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5 ml-5">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">4. Security & Compliance Tier</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'basic', label: 'Standard', desc: 'Basic Auth' },
                  { id: 'rls', label: 'Supabase RLS', desc: 'Row-Level isolation' },
                  { id: 'advanced', label: 'Enterprise', desc: 'PG-Crypto & Audits' },
                ].map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSecurity(s.id as any)}
                    className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                      security === s.id
                        ? 'bg-cyan-950/40 border-cyan-400/50 text-slate-200'
                        : 'bg-transparent border-[#1a2238] text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono block">{s.label}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Diagnostic HUD */}
          <div className="bg-[#04070e] border border-cyan-500/20 p-6 rounded-xl flex flex-col justify-between shadow-[0_0_25px_rgba(0,240,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-cyan-400/30 animate-pulse" />
            
            <div className="space-y-6">
              <div className="border-b border-[#1a2238] pb-3 text-center">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block animate-pulse">Nyota Engine Evaluator</span>
                <span className="text-xs text-slate-400 font-mono">PROPOSAL METRICS</span>
              </div>

              {/* Complexity Score Ring */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-28 h-28 rounded-full border border-dashed border-cyan-400/20 flex flex-col items-center justify-center bg-[#03050a]/40 shadow-inner">
                  <div className="absolute inset-1.5 rounded-full border border-cyan-500/10" />
                  <span className="text-3xl font-extrabold text-cyan-400 glow-blue tracking-tight font-mono">{estimate.complexity}</span>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 mt-1">COMPLEXITY</span>
                </div>
              </div>

              {/* Cost Forecast */}
              <div className="space-y-2 bg-slate-950/40 p-4 rounded-lg border border-[#1a2238] text-center font-mono">
                <span className="text-[10px] uppercase text-slate-400 tracking-wider block">Estimated Budget Scale</span>
                <span className="text-xl font-bold text-emerald-400 glow-green">
                  {estimate.minBudget.toLocaleString()} - {estimate.maxBudget.toLocaleString()} USD
                </span>
                <span className="text-[8px] text-slate-500 block mt-1">(Real-time prediction based on stack selections)</span>
              </div>
            </div>

            <button
              onClick={() => alert('Proposal scope locks submitted to Nyota Admin Panel!')}
              className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-all uppercase tracking-widest font-mono shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              Submit Requirements
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

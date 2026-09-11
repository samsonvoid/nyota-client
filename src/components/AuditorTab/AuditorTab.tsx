export default function AuditorTab() {
  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 xl:p-8 animate-fadeIn">
      <div className="w-full max-w-[1800px] mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 glow-blue">Self-Auditing & Code Vulnerability Auditor</h2>
          <p className="text-xs text-slate-400 mt-1">
            Daemon-integrated auditing tool checking local scripts, rate limits, API credentials, and database policies.
          </p>
        </div>

        {/* Security Audit Checklist */}
        <div className="bg-[#03050a] border border-[#1a2238] rounded-xl overflow-hidden">
          <div className="bg-[#070b14] px-4 py-3 border-b border-[#1a2238] flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-red-400">Target: backend/nyota_engine.py</span>
            <span className="text-[9px] font-mono bg-red-950/40 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
              AUDIT COMPLETED: 1 WARNING
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Checks list */}
            <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-4 text-xs">
              {[
                { name: 'CORS Configuration', status: 'Passed', color: 'text-emerald-400', bg: 'bg-emerald-950/15 border-emerald-500/10' },
                { name: 'Rate Limiter (SlowAPI)', status: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-950/15 border-emerald-500/10' },
                { name: 'API Key Guardrails', status: 'Warning', color: 'text-amber-400', bg: 'bg-amber-950/15 border-amber-500/10' },
              ].map((c, i) => (
                <div key={i} className={`p-3 rounded-lg border font-mono ${c.bg} flex justify-between items-center`}>
                  <span className="text-slate-300 font-bold">{c.name}</span>
                  <span className={`font-extrabold uppercase text-[10px] ${c.color}`}>{c.status}</span>
                </div>
              ))}
            </div>

            {/* Warning explain card */}
            <div className="p-4 rounded-lg bg-amber-950/15 border border-amber-500/20 text-xs leading-relaxed space-y-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                Vulnerability Warning: Fallback Secret API Key Detected
              </h4>
              <p className="text-slate-300">
                Uchunguzi wa Nyota umegundua kuwa <code>nyota_engine.py</code> inaruhusu ufunguo wa siri wa 
                <code>"nyota-dev-key-change-in-production"</code> kama fallback usipowekwa kwenye mazingira ya <code>.env</code>. 
                Hii inahatarisha usalama ikiwa code itafunguliwa GitHub (Public Repository).
              </p>
            </div>

            {/* Recommendation Code Diff */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono block">Recommended Fix (Diff)</span>
              <div className="bg-slate-950 border border-[#1a2238] rounded-lg overflow-hidden font-mono text-[11px] p-4 text-slate-300 space-y-1">
                <p className="text-slate-500">// Modify lines 44-46 in nyota_engine.py</p>
                <p className="text-red-400 bg-red-950/20 px-2 py-0.5 rounded">- register_api_key(os.getenv("API_SECRET_KEY", "nyota-dev-key-change-in-production"))</p>
                <p className="text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">+ secret_key = os.getenv("API_SECRET_KEY")</p>
                <p className="text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">+ if not secret_key:</p>
                <p className="text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">+     raise RuntimeError("CRITICAL: API_SECRET_KEY environment variable is not defined!")</p>
                <p className="text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">+ register_api_key(secret_key)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

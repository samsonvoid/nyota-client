import { useEffect, useState } from 'react'
import { api, type Workspace } from '../../lib/api'

export default function SetupTab() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [path, setPath] = useState('')
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [status, setStatus] = useState('')

  const loadWorkspaces = async () => {
    try {
      const result = await api.listWorkspaces()
      setWorkspaces(result.workspaces)
    } catch {
      setStatus('Could not load workspace registry.')
    }
  }

  useEffect(() => {
    void loadWorkspaces()
  }, [])

  const addWorkspace = async () => {
    if (!path.trim()) return
    try {
      const result = await api.addWorkspace({ path: path.trim(), name: name.trim() || undefined, purpose: purpose.trim() || undefined })
      setWorkspaces(result.workspaces)
      setPath('')
      setName('')
      setPurpose('')
      setStatus('Workspace added.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not add workspace.')
    }
  }

  const removeWorkspace = async (workspacePath: string) => {
    try {
      const result = await api.removeWorkspace(workspacePath)
      setWorkspaces(result.workspaces)
      setStatus('Workspace removed.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not remove workspace.')
    }
  }

  const copyToClipboard = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    navigator.clipboard.writeText(el.innerText)
  }

  return (
    <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 xl:p-8">
      <div className="w-full max-w-[1800px] mx-auto space-y-6">
        <section className="bg-[#03050a] border border-cyan-400/30 rounded-xl overflow-hidden">
          <div className="bg-[#07131a] px-4 py-3 border-b border-cyan-400/20">
            <h2 className="text-sm font-mono font-bold text-cyan-300">Selected Workspace Access</h2>
            <p className="text-xs text-slate-400 mt-1">Nyota can inspect only the project folders listed here.</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <div key={workspace.path} className="min-w-0 flex items-start justify-between gap-3 border border-[#1a2238] p-3">
                <div className="min-w-0">
                  <div className="text-sm text-slate-100">{workspace.name}</div>
                  <div className="text-xs text-cyan-300 font-mono break-all">{workspace.path}</div>
                  <div className="text-xs text-slate-500 mt-1">{workspace.purpose}</div>
                </div>
                <button type="button" onClick={() => void removeWorkspace(workspace.path)} className="shrink-0 text-xs text-red-300 border border-red-400/40 px-2 py-1 hover:bg-red-400/10">Remove</button>
              </div>
            ))}
            </div>
            <div className="grid gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_auto]">
              <input value={path} onChange={(event) => setPath(event.target.value)} placeholder="F:\\Project\\My App" className="min-w-0 bg-[#070b14] border border-[#1a2238] px-3 py-2 text-xs text-slate-100" />
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name (optional)" className="bg-[#070b14] border border-[#1a2238] px-3 py-2 text-xs text-slate-100" />
              <input value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Purpose (optional)" className="bg-[#070b14] border border-[#1a2238] px-3 py-2 text-xs text-slate-100" />
              <button type="button" onClick={() => void addWorkspace()} className="whitespace-nowrap border border-cyan-400/50 px-4 py-2 text-xs text-cyan-300 hover:bg-cyan-400/10">Add workspace</button>
            </div>
            {status && <p className="text-xs text-amber-300">{status}</p>}
          </div>
        </section>
        <div>
          <h2 className="text-xl font-bold text-slate-100 glow-blue">Windows Native CMD Environment Setup (No VENV)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Njia fupi ya kurun Nyota Core globally kwenye Windows kwa kutumia python version 3.13 ili kuepuka migongano ya PyAudio.
          </p>
        </div>

        <div className="bg-[#03050a] border border-[#1a2238] rounded-xl overflow-hidden">
          <div className="bg-[#070b14] px-4 py-3 border-b border-[#1a2238] flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400">1. Global Library Installation (Execute in Windows CMD)</span>
            <button onClick={() => copyToClipboard('windows-installer-cmd')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg> Copy command
            </button>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Kwa kuwa mashine yako imeweka Python 3.14 kama chaguo-msingi, tunalazimisha installation kwenda Python 3.13 globally ili kuepuka matatizo ya setup ya pyaudio (ambayo bado haijapata pre-built windows wheels kwenye version 3.14).
            </p>
            <pre id="windows-installer-cmd" className="text-xs text-cyan-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`:: 🔍 Sakinisha maktaba zote za AI globally kwenye Python 3.13 pekee
py -3.13 -m pip install --upgrade pip
py -3.13 -m pip install fastapi uvicorn google-generativeai httpx supabase python-dotenv pyttsx3 pyaudio

:: 📝 Tengeneza faili la .env ukiwa kwenye CMD ili kusetup siri zako
echo GEMINI_API_KEY=weka_api_key_hapa > .env
echo SUPABASE_URL=weka_supabase_url_hapa >> .env
echo SUPABASE_KEY=weka_supabase_key_hapa >> .env`}
            </pre>
          </div>
        </div>

        <div className="bg-[#03050a] border border-[#1a2238] rounded-xl overflow-hidden">
          <div className="bg-[#070b14] px-4 py-3 border-b border-[#1a2238] flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400">2. run_nyota_hidden.vbs (Start Engine in background)</span>
            <button onClick={() => copyToClipboard('windows-vbs-setup')} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg> Copy script
            </button>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Hakuna sanduku la terminal tena! VBS Script hii inapiga amri ya uvicorn kimyakimya nyuma ya pazia kwa kutumia Python 3.13 bila screen ya Windows kujaa masanduku ya CMD.
            </p>
            <pre id="windows-vbs-setup" className="text-xs text-amber-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`' 🕵️ VBScript ya kuanzisha Nyota Engine kimyakimya kupitia CMD kwa kutumia Python 3.13
Set WshShell = CreateObject("WScript.Shell")

' Weka njia kamili ya folder lako la nyota hapa chini
strPath = "C:\\Users\\Samson\\nyota-backend"

WshShell.CurrentDirectory = strPath
' Inaficha kioo cha terminal cha CMD (0 inasababisha isionekane kabisa)
WshShell.Run "cmd /c py -3.13 -m uvicorn nyota_engine:app --host 127.0.0.1 --port 8000", 0, False

Set WshShell = Nothing`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

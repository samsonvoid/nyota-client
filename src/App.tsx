import { useState, useCallback, useRef, useEffect } from 'react'
import type { ReactorState, LogEntry, ViewMode } from './lib/types'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import ArcReactor from './components/ArcReactor/ArcReactor'
import TerminalLogs from './components/TerminalLogs/TerminalLogs'
import CommandInput from './components/CommandInput/CommandInput'
import SetupTab from './components/SetupTab/SetupTab'
import DiagramTab from './components/DiagramTab/DiagramTab'
import PortfolioTab from './components/PortfolioTab/PortfolioTab'
import EstimatorTab from './components/EstimatorTab/EstimatorTab'
import LeadsTab from './components/LeadsTab/LeadsTab'
import AuditorTab from './components/AuditorTab/AuditorTab'
import { api } from './lib/api'

export default function App() {
  const [systemMode, setSystemMode] = useState<'personal' | 'business'>('business')
  const [activeTab, setActiveTab] = useState('visualizer')
  const [state, setState] = useState<ReactorState>('idle')
  const [handsFree, setHandsFree] = useState(false)
  const [language, setLanguage] = useState<'en' | 'sw'>('en')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [autoView, setAutoView] = useState(false)
  const [pendingApproval, setPendingApproval] = useState<{ id: string; tool: string } | null>(null)
  
  const handsFreeRef = useRef(false)
  const lastActiveRef = useRef<number>(Date.now())
  const isLoopRunningRef = useRef(false)
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    handsFreeRef.current = handsFree
  }, [handsFree])

  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '03:25:01', message: 'Initializing Universal Python Daemon (Python 3.13.2)', level: 'info' },
    { timestamp: '03:25:02', message: 'Loading native SAPI5 Text-To-Speech engine...', level: 'info' },
    { timestamp: '03:25:02', message: 'Connected to default Windows Audio Output (DirectSound)', level: 'success' },
    { timestamp: '03:25:03', message: 'Integrating Supabase Cloud SQL context...', level: 'info' },
    { timestamp: '03:25:04', message: 'Executing: py -3.13 nyota_engine.py --host 127.0.0.1 --port 8000', level: 'info' },
    { timestamp: '03:25:04', message: 'JARVIS ENGINE IS LIVE AND LISTENING FOR COMMANDS...', level: 'info' },
  ])

  const [liveSubtitle, setLiveSubtitle] = useState<{ speaker: 'user' | 'nyota'; text: string } | null>(null)

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, { timestamp, message, level }])
  }, [])

  const handleSetState = useCallback((mode: ReactorState) => {
    setState(mode)

    if (mode === 'listening') {
      addLog(`[MIC]: Listening to voice input channel...`, 'info')
      playCyberSound('beep')
    } else if (mode === 'thinking') {
      addLog(`[AI]: Processing request...`, 'info')
    } else if (mode === 'speaking') {
      addLog(`[SAPI5]: Translating message response to voice output...`, 'success')
      playCyberSound('speak')
    } else {
      addLog(`[DAEMON]: Reactor returned to IDLE monitoring mode.`, 'info')
    }
  }, [addLog])

  const interruptSpeech = useCallback(async () => {
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current)
      speakingTimeoutRef.current = null
    }
    try {
      await api.interruptSpeech()
    } catch (e) {
      console.error("Failed to interrupt speech:", e)
    }
  }, [])

  const runVoiceLoop = useCallback(async () => {
    if (!handsFreeRef.current) {
      isLoopRunningRef.current = false
      return
    }
    if (isLoopRunningRef.current) return // Concurrency guard

    isLoopRunningRef.current = true
    await interruptSpeech() // Ensure any prior voice is silenced
    handleSetState('listening')
    
    // Switch to "thinking" mode after the recording window starts processing
    const thinkingTimeout = setTimeout(() => {
      if (handsFreeRef.current) {
        handleSetState('thinking')
      }
    }, 6000)
    
    try {
      const data = await api.voiceChat(undefined, language)

      clearTimeout(thinkingTimeout)

      if (!handsFreeRef.current) {
        isLoopRunningRef.current = false
        return
      }

      if (data.approval_id) {
        setPendingApproval({ id: data.approval_id, tool: 'requested tool' })
      }

      // Check if rate limited by backend
      if (data.is_rate_limited) {
        addLog(`[SYSTEM]: API Rate limit hit. Deactivating hands-free mode.`, 'warn')
        
        const replyToShow = data.reply.includes('|') ? data.reply.split('|')[0].trim() : data.reply
        addLog(`[NYOTA] (Voice): "${replyToShow}"`, 'success')
        
        const spokenText = data.reply.includes('|') ? data.reply.split('|')[1].trim() : data.reply
        const wordCount = spokenText.split(' ').length
        const speakingDuration = Math.max(2500, wordCount * 380 + 500)
        
        handleSetState('speaking')
        setHandsFree(false)
        isLoopRunningRef.current = false
        
        speakingTimeoutRef.current = setTimeout(() => {
          speakingTimeoutRef.current = null
          handleSetState('idle')
        }, speakingDuration)
        return
      }
      
      // Check if silence was detected by backend
      if (data.is_silence || (!data.user_query && !data.reply)) {
        const inactiveMs = Date.now() - lastActiveRef.current
        const sixtyMinutes = 60 * 60 * 1000
        
        if (inactiveMs > sixtyMinutes) {
          addLog(`[SYSTEM]: Inactivity timeout reached (60 min). Deactivating hands-free mode.`, 'info')
          setHandsFree(false)
          handleSetState('idle')
          isLoopRunningRef.current = false
          return
        }
        
        // Loop again after a brief pause
        isLoopRunningRef.current = false
        setTimeout(() => {
          if (handsFreeRef.current) {
            runVoiceLoop()
          }
        }, 300)
        return
      }

      // If user actually spoke, reset the inactivity timer
      lastActiveRef.current = Date.now()
      
      // Update logs with transcription and voice response
      addLog(`[USER] (Voice): "${data.user_query}"`, 'info')
      setLiveSubtitle({ speaker: 'user', text: data.user_query })
      
      const replyToShow = data.reply.includes('|') ? data.reply.split('|')[0].trim() : data.reply
      addLog(`[NYOTA] (Voice): "${replyToShow}"`, 'success')
      setLiveSubtitle({ speaker: 'nyota', text: replyToShow })
      
      // Calculate speaking duration dynamically based on spoken translation (English part after |)
      const spokenText = data.reply.includes('|') ? data.reply.split('|')[1].trim() : data.reply
      const wordCount = spokenText.split(' ').length
      const speakingDuration = Math.max(2500, wordCount * 380 + 500)
      
      handleSetState('speaking')
      
      isLoopRunningRef.current = false
      speakingTimeoutRef.current = setTimeout(() => {
        speakingTimeoutRef.current = null
        if (handsFreeRef.current) {
          runVoiceLoop()
        } else {
          handleSetState('idle')
        }
      }, speakingDuration)

    } catch {
      clearTimeout(thinkingTimeout)
      addLog(`[ERROR]: Failed to capture voice stream or query AI.`, 'error')
      
      isLoopRunningRef.current = false
      setTimeout(() => {
        if (handsFreeRef.current) {
          runVoiceLoop()
        } else {
          handleSetState('idle')
        }
      }, 3000)
    }
  }, [handleSetState, addLog, language, interruptSpeech])

  const handleTriggerVoice = useCallback(() => {
    if (state === 'speaking') {
      // User requested to interrupt Nyota's speaking segment
      interruptSpeech()
      addLog(`[SYSTEM]: Speech interrupted by user. Re-engaging mic...`, 'info')
      if (handsFreeRef.current) {
        // Run loop immediately to start capturing user speech
        setTimeout(() => {
          if (!isLoopRunningRef.current) {
            runVoiceLoop()
          }
        }, 100)
      } else {
        // Toggle hands-free on to listen
        setHandsFree(true)
        setTimeout(() => {
          if (!isLoopRunningRef.current) {
            runVoiceLoop()
          }
        }, 100)
      }
      return
    }

    if (handsFreeRef.current) {
      setHandsFree(false)
      interruptSpeech()
      handleSetState('idle')
      addLog(`[SYSTEM]: Hands-free conversation deactivated.`, 'info')
    } else {
      setHandsFree(true)
      lastActiveRef.current = Date.now()
      addLog(`[SYSTEM]: Hands-free conversation activated (60 min inactivity timeout).`, 'success')
      
      // Start loop on next tick if not already running
      setTimeout(() => {
        if (!isLoopRunningRef.current) {
          runVoiceLoop()
        }
      }, 50)
    }
  }, [runVoiceLoop, handleSetState, addLog, state, interruptSpeech])

  const handleSubmitPrompt = useCallback(async (value: string) => {
    addLog(`[USER]: "${value}"`, 'info')
    setLiveSubtitle({ speaker: 'user', text: value })
    await interruptSpeech() // Stop speaking if they submit a new query
    handleSetState('thinking')

    try {
      const data = await api.sendMessage(value, undefined, language)
      if (data.approval_id) {
        setPendingApproval({ id: data.approval_id, tool: 'requested tool' })
      }
      const replyToShow = data.reply.includes('|') ? data.reply.split('|')[0].trim() : data.reply
      addLog(`[NYOTA]: "${replyToShow}"`, 'success')
      setLiveSubtitle({ speaker: 'nyota', text: replyToShow })
      
      // Calculate speaking duration dynamically based on spoken translation (English part after |)
      const spokenText = data.reply.includes('|') ? data.reply.split('|')[1].trim() : data.reply
      const wordCount = spokenText.split(' ').length
      const speakingDuration = Math.max(2500, wordCount * 380 + 500)

      handleSetState('speaking')
      
      speakingTimeoutRef.current = setTimeout(() => {
        speakingTimeoutRef.current = null
        handleSetState('idle')
      }, speakingDuration)

    } catch {
      addLog(`[ERROR]: Failed to connect to Nyota core daemon.`, 'error')
      handleSetState('idle')
    }
  }, [addLog, handleSetState, language, interruptSpeech])

  const handleSetMode = useCallback((mode: 'personal' | 'business') => {
    setSystemMode(mode)
    setActiveTab('visualizer')
  }, [])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    if (mode === 'dashboard') {
      setActiveTab('setup')
    } else if (activeTab !== 'visualizer') {
      setActiveTab('visualizer')
    }
  }, [activeTab])

  const handleApproval = useCallback(async (approved: boolean) => {
    if (!pendingApproval) return
    try {
      const result = approved
        ? await api.approveTool(pendingApproval.id)
        : await api.rejectTool(pendingApproval.id)
      const status = result.status
      addLog(`[APPROVAL]: ${status.toUpperCase()} - ${pendingApproval.tool}`, approved ? 'success' : 'warn')
      setPendingApproval(null)
    } catch {
      addLog('[APPROVAL]: Unable to update approval request.', 'error')
    }
  }, [addLog, pendingApproval])

  return (
    <div className="h-screen flex flex-col overflow-hidden cyber-grid">
      <Header
        state={state}
        systemMode={systemMode}
        language={language}
        onLanguageChange={setLanguage}
        viewMode={viewMode}
        autoView={autoView}
        onViewModeChange={handleViewModeChange}
        onAutoViewChange={setAutoView}
      />

      <main className="flex-1 flex overflow-hidden">
        {viewMode !== 'immersive' && viewMode !== 'chat' && (
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            systemMode={systemMode}
            onSetMode={handleSetMode}
          />
        )}

        <section className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#04060b]">
          {activeTab === 'visualizer' && viewMode === 'immersive' && (
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              <ArcReactor
                state={state}
                onTriggerVoice={handleTriggerVoice}
                onSetState={handleSetState}
                handsFree={handsFree}
                liveSubtitle={liveSubtitle}
              />
              <ActionStream logs={logs} />
            </div>
          )}

          {activeTab === 'visualizer' && viewMode === 'split' && (
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
              <ArcReactor
                state={state}
                onTriggerVoice={handleTriggerVoice}
                onSetState={handleSetState}
                handsFree={handsFree}
                liveSubtitle={liveSubtitle}
              />
              <TerminalLogs logs={logs}>
                <ApprovalPanel pendingApproval={pendingApproval} onApproval={handleApproval} />
                <CommandInput onSubmit={handleSubmitPrompt} />
              </TerminalLogs>
            </div>
          )}

          {activeTab === 'visualizer' && viewMode === 'chat' && (
            <TerminalLogs logs={logs} className="!w-full flex-1 !p-6 lg:!p-10">
              <ApprovalPanel pendingApproval={pendingApproval} onApproval={handleApproval} />
              <CommandInput onSubmit={handleSubmitPrompt} />
            </TerminalLogs>
          )}

          {activeTab === 'portfolio' && <PortfolioTab />}
          {activeTab === 'estimator' && <EstimatorTab />}
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'auditor' && <AuditorTab />}
          {activeTab === 'setup' && <SetupTab />}
          {activeTab === 'diagram' && <DiagramTab />}
        </section>
      </main>
    </div>
  )
}

function ApprovalPanel({
  pendingApproval,
  onApproval,
}: {
  pendingApproval: { id: string; tool: string } | null
  onApproval: (approved: boolean) => void
}) {
  if (!pendingApproval) return null
  return (
    <div className="mb-3 border border-amber-400/40 bg-amber-950/30 p-3 text-xs text-amber-200">
      <div className="font-semibold uppercase tracking-wider">Approval required</div>
      <div className="mt-1 text-amber-100/80">Nyota is waiting for permission to run {pendingApproval.tool}.</div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => onApproval(true)} className="border border-emerald-400/50 px-3 py-1 text-emerald-300 hover:bg-emerald-400/10">YES, RUN</button>
        <button type="button" onClick={() => onApproval(false)} className="border border-red-400/50 px-3 py-1 text-red-300 hover:bg-red-400/10">NO, CANCEL</button>
      </div>
    </div>
  )
}

function ActionStream({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="absolute inset-x-4 bottom-4 mx-auto flex max-w-3xl flex-wrap justify-center gap-2 pointer-events-none">
      {logs.slice(-3).map((log, index) => (
        <span key={`${log.timestamp}-${index}`} className="border border-cyan-400/20 bg-[#03050a]/80 px-3 py-1.5 font-mono text-[10px] text-cyan-200 backdrop-blur-md">
          [{log.level.toUpperCase()}] {log.message}
        </span>
      ))}
    </div>
  )
}

function playCyberSound(type: 'beep' | 'speak') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const audioCtx = new AudioContext()

    if (type === 'beep') {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.15)
    } else if (type === 'speak') {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(150, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.4)
    }
  } catch {
    // Audio blocked by browser policy
  }
}

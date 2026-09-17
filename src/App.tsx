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
import CodeViewerModal from './components/CodeViewerModal/CodeViewerModal'
import { api } from './lib/api'

// Hologram background types
interface SnowParticle { x: number; y: number; size: number; speedY: number; driftX: number; opacity: number }
interface BeaconNode { x: number; y: number; size: number; offset: number }

function HologramBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const snowParticles: SnowParticle[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.8,
      speedY: Math.random() * 0.8 + 0.3,
      driftX: Math.sin(Math.random() * Math.PI) * 0.3,
      opacity: Math.random() * 0.6 + 0.2,
    }))
    const beaconNodes: BeaconNode[] = [
      { x: 0.15, y: 0.25, size: 3.5, offset: 0 },
      { x: 0.85, y: 0.20, size: 4.0, offset: 2 },
      { x: 0.10, y: 0.80, size: 3.0, offset: 4 },
      { x: 0.88, y: 0.75, size: 3.8, offset: 1 },
      { x: 0.50, y: 0.15, size: 4.5, offset: 3 },
    ]

    const handleMouseMove = (e: MouseEvent) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY }
    const handleMouseLeave = () => { mouseRef.current.x = -1000; mouseRef.current.y = -1000 }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    let step = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      step += 0.018

      // Ambient radial glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.5)
      grad.addColorStop(0, 'rgba(0, 255, 170, 0.03)')
      grad.addColorStop(0.7, 'rgba(0, 206, 209, 0.015)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Data snow
      snowParticles.forEach(p => {
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110) { p.x -= (dx / dist) * 5; p.y -= (dy / dist) * 5 }
        ctx.fillStyle = `rgba(0, 255, 170, ${p.opacity})`
        ctx.shadowBlur = 4
        ctx.shadowColor = 'rgba(0, 255, 170, 0.8)'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        p.y += p.speedY; p.x += Math.sin(step + p.y * 0.01) * p.driftX
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
      })

      // Mouse trail
      if (mouseRef.current.x > 0) {
        for (let i = 0; i < 2; i++) {
          const tp = { x: mouseRef.current.x + (Math.random() - 0.5) * 10, y: mouseRef.current.y + (Math.random() - 0.5) * 10, size: Math.random() * 2 + 1, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, life: 1.0, decay: Math.random() * 0.03 + 0.015 }
          ctx.fillStyle = `rgba(0, 255, 170, ${tp.life})`
          ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0, 255, 170, 1)'
          ctx.beginPath(); ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2); ctx.fill()
          tp.x += tp.vx; tp.y += tp.vy; tp.life -= tp.decay
        }
      }

      // Terrain accent
      ctx.shadowBlur = 0
      for (let l = 0; l < 5; l++) {
        const depth = l / 5
        ctx.strokeStyle = `rgba(0, 255, 170, ${0.03 + depth * 0.08})`
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let x = 0; x <= canvas.width; x += 25) {
          const y = canvas.height * 0.75 + l * 20 + Math.sin(x * 0.006 + step + l * 0.5) * (12 * depth)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // Helix strands
      const helixAmplitude = canvas.width < 768 ? 45 : 90
      ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0, 255, 170, 0.5)'
      ctx.strokeStyle = 'rgba(0, 255, 170, 0.45)'; ctx.lineWidth = 2
      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 8) {
        const y = cy - 35 + Math.sin(x * 0.004 + step) * helixAmplitude + Math.cos(x * 0.012 - step * 1.2) * 20
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowColor = 'rgba(0, 206, 209, 0.5)'; ctx.strokeStyle = 'rgba(0, 206, 209, 0.4)'; ctx.lineWidth = 1.8
      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 8) {
        const y = cy + 35 + Math.cos(x * 0.004 - step) * helixAmplitude + Math.sin(x * 0.01 + step * 1.2) * 20
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Beacon nodes
      beaconNodes.forEach(node => {
        const rx = node.x * canvas.width; const ry = node.y * canvas.height
        const pulse = (Math.sin(step * 2 + node.offset) + 1) / 2
        ctx.fillStyle = `rgba(0, 255, 170, ${(0.2 + pulse * 0.8) * 0.25})`
        ctx.beginPath(); ctx.arc(rx, ry, node.size * (1 + pulse * 2.5) * 3, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 15 * pulse; ctx.shadowColor = 'rgba(0, 255, 170, 1)'
        ctx.fillStyle = `rgba(0, 255, 170, ${0.2 + pulse * 0.8})`
        ctx.beginPath(); ctx.arc(rx, ry, node.size, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
      })

      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />
}

// Global reference for hardware/software echo cancellation stream
let globalAudioStream: MediaStream | null = null

async function ensureEchoCancellation(): Promise<void> {
  if (globalAudioStream && globalAudioStream.active) return
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      globalAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
    }
  } catch (err) {
    console.warn('[AEC]: Could not initialize echo cancellation stream:', err)
  }
}

// Probes backend /api/tts-status to wait for SAPI5 to finish speaking
async function waitForSpeechToFinish(maxWaitMs = 25000): Promise<void> {
  // Give SAPI5 450ms to initialize and start speaking on DirectSound
  await new Promise(r => setTimeout(r, 450))
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    try {
      const status = await api.getTtsStatus()
      if (!status.is_speaking) {
        break
      }
    } catch {
      break
    }
    await new Promise(r => setTimeout(r, 200))
  }
  // 500ms cooldown buffer for acoustic room reverberation to settle before turning mic on
  await new Promise(r => setTimeout(r, 500))
}

// Trap self-audio loopback (when speakers are loud and mic picks up Nyota's own words)
function isAcousticEcho(userQuery: string, lastAssistantReply: string): boolean {
  if (!userQuery || !lastAssistantReply) return false
  const cleanU = userQuery.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const cleanA = lastAssistantReply.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  if (!cleanU || !cleanA) return false

  // If user query is exact match or contained inside what Nyota just said
  if (cleanA.includes(cleanU) || cleanU.includes(cleanA)) return true

  const uWords = cleanU.split(/\s+/).filter(w => w.length > 2)
  if (uWords.length === 0) return false
  const aWords = new Set(cleanA.split(/\s+/).filter(w => w.length > 2))
  const overlap = uWords.filter(w => aWords.has(w)).length
  return overlap / uWords.length >= 0.7
}

// Browser Web Speech API — instant local STT, no server processing
function browserSpeechToText(language: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      reject(new Error('SpeechRecognition not supported'))
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'sw' ? 'sw-TZ' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.timeout = 15000

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      if (transcript && transcript.trim()) {
        resolve(transcript)
      } else {
        resolve('')
      }
    }
    recognition.onerror = (event: any) => {
      console.log(`[STT Error]: ${event.error}`)
      if (event.error === 'no-speech' || event.error === 'aborted') {
        resolve('')
      } else if (event.error === 'network') {
        reject(new Error('Network error'))
      } else {
        reject(new Error(event.error))
      }
    }
    recognition.onend = () => {}
    recognition.start()
  })
}

// Improved: retry with longer wait on empty results
async function captureVoice(language: string, retries: number = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await browserSpeechToText(language)
      if (result && result.trim()) {
        return result
      }
    } catch (e) {
      console.log(`[STT Capture attempt ${attempt + 1} failed]:`, e)
    }
    await new Promise(r => setTimeout(r, 2000))
  }
  return ''
}

export default function App() {
  const [systemMode, setSystemMode] = useState<'personal' | 'business'>('business')
  const [activeTab, setActiveTab] = useState('visualizer')
  const [state, setState] = useState<ReactorState>('idle')
  const [handsFree, setHandsFree] = useState(false)
  const [language, setLanguage] = useState<'en' | 'sw'>('en')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [autoView, setAutoView] = useState(false)
  const [pendingApproval, setPendingApproval] = useState<{ id: string; tool: string } | null>(null)
  const [codeViewer, setCodeViewer] = useState<{
    isOpen: boolean
    filename: string
    code: string
    language?: string
    filePath?: string
  }>({
    isOpen: false,
    filename: '',
    code: '',
    language: 'plaintext',
  })
  const handsFreeRef = useRef(false)
  const lastActiveRef = useRef<number>(Date.now())
  const isLoopRunningRef = useRef(false)
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastNyotaReplyRef = useRef<string>('')

  const handleOpenCodeViewer = useCallback((filename: string, code: string, language: string, filePath?: string) => {
    setCodeViewer({
      isOpen: true,
      filename,
      code,
      language,
      filePath,
    })
  }, [])

  const handleCloseCodeViewer = useCallback(() => {
    setCodeViewer((prev) => ({ ...prev, isOpen: false }))
  }, [])

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
      // Ensure browser acoustic echo cancellation is active
      await ensureEchoCancellation()

      // Use browser Web Speech API for instant STT (no server audio processing)
      const userQuery = await captureVoice(language)
      clearTimeout(thinkingTimeout)

      if (!handsFreeRef.current) {
        isLoopRunningRef.current = false
        return
      }
if (!userQuery || userQuery.trim() === '') {
        const inactiveMs = Date.now() - lastActiveRef.current
        const sixtyMinutes = 60 * 60 * 1000
        if (inactiveMs > sixtyMinutes) {
          addLog(`[SYSTEM]: Inactivity timeout reached (60 min). Deactivating hands-free mode.`, 'info')
          setHandsFree(false)
          handleSetState('idle')
          isLoopRunningRef.current = false
          return
        }
        addLog(`[STT]: No speech detected, retrying in 3s...`, 'warn')
        isLoopRunningRef.current = false
        setTimeout(() => {
          if (handsFreeRef.current) {
            runVoiceLoop()
          }
        }, 3000)
        return
      }

      // Check if captured audio is an acoustic echo of Nyota's own last reply
      if (lastNyotaReplyRef.current && isAcousticEcho(userQuery, lastNyotaReplyRef.current)) {
        addLog(`[VOICE]: Acoustic echo detected and filtered out.`, 'info')
        isLoopRunningRef.current = false
        setTimeout(() => {
          if (handsFreeRef.current) {
            runVoiceLoop()
          }
        }, 600)
        return
      }

      // Send text to /api/chat for AI response (Ollama/Gemini)
      const data = await api.sendMessage(userQuery, undefined, language)

      if (data.approval_id) {
        setPendingApproval({ id: data.approval_id, tool: 'requested tool' })
      }

      // Check if rate limited by backend
      if ((data as any).is_rate_limited || data.reply.includes('API quota limit')) {
        addLog(`[SYSTEM]: API Rate limit hit. Deactivating hands-free mode.`, 'warn')
        const replyToShow = data.reply.includes('|') ? data.reply.split('|')[0].trim() : data.reply
        addLog(`[NYOTA] (Voice): "${replyToShow}"`, 'success')
        lastNyotaReplyRef.current = replyToShow

        handleSetState('speaking')
        setHandsFree(false)
        await waitForSpeechToFinish()
        handleSetState('idle')
        isLoopRunningRef.current = false
        return
      }

      lastActiveRef.current = Date.now()

      addLog(`[USER] (Voice): "${userQuery}"`, 'info')
      setLiveSubtitle({ speaker: 'user', text: userQuery })

      const replyToShow = data.reply.includes('|') ? data.reply.split('|')[0].trim() : data.reply
      addLog(`[NYOTA] (Voice): "${replyToShow}"`, 'success')
      setLiveSubtitle({ speaker: 'nyota', text: replyToShow })
      lastNyotaReplyRef.current = replyToShow

      handleSetState('speaking')

      // Real-time synchronization: probe /api/tts-status until SAPI5 finishes speaking
      await waitForSpeechToFinish()

      isLoopRunningRef.current = false
      if (handsFreeRef.current) {
        runVoiceLoop()
      } else {
        handleSetState('idle')
      }

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
      <HologramBackground />
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

        <section className="flex-1 min-w-0 flex flex-col overflow-hidden relative z-10">
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
              <TerminalLogs logs={logs} onViewCode={handleOpenCodeViewer} onNotify={addLog}>
                <ApprovalPanel pendingApproval={pendingApproval} onApproval={handleApproval} />
                <CommandInput onSubmit={handleSubmitPrompt} />
              </TerminalLogs>
            </div>
          )}

          {activeTab === 'visualizer' && viewMode === 'chat' && (
            <TerminalLogs
              logs={logs}
              className="!w-full flex-1 !p-6 lg:!p-10"
              onViewCode={handleOpenCodeViewer}
              onNotify={addLog}
            >
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

      <CodeViewerModal
        isOpen={codeViewer.isOpen}
        onClose={handleCloseCodeViewer}
        filename={codeViewer.filename}
        code={codeViewer.code}
        language={codeViewer.language}
        filePath={codeViewer.filePath}
      />
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

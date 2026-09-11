import { useRef, useEffect } from 'react'
import type { ReactorState } from '../../lib/types'
import HUDControls from '../HUDControls/HUDControls'

interface ArcReactorProps {
  state: ReactorState
  onTriggerVoice: () => void
  onSetState: (state: ReactorState) => void
  handsFree?: boolean
}

const stateConfig = {
  idle: {
    icon: (
      <svg className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform duration-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    statusText: 'Talk to Nyota',
    statusClass: 'text-cyan-300',
    btnBorder: 'border-cyan-400/30 hover:border-cyan-400',
    btnShadow: 'shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:shadow-[0_0_50px_rgba(0,240,255,0.35)]',
    ringColor: 'border-cyan-400/25',
  },
  listening: {
    icon: (
      <svg className="w-12 h-12 text-cyan-400 animate-pulse shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="10" width="2" height="4" rx="1" />
        <rect x="6" y="6" width="2" height="12" rx="1" />
        <rect x="10" y="4" width="2" height="16" rx="1" />
        <rect x="14" y="8" width="2" height="8" rx="1" />
        <rect x="18" y="5" width="2" height="14" rx="1" />
        <rect x="22" y="10" width="2" height="4" rx="1" />
      </svg>
    ),
    statusText: 'Listening...',
    statusClass: 'text-cyan-400',
    btnBorder: 'border-cyan-400/50',
    btnShadow: 'shadow-[0_0_30px_rgba(0,240,255,0.25)]',
    ringColor: 'border-cyan-400/40',
  },
  thinking: {
    icon: (
      <svg className="w-12 h-12 text-purple-400 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </svg>
    ),
    statusText: 'Processing...',
    statusClass: 'text-purple-400',
    btnBorder: 'border-purple-400/50',
    btnShadow: 'shadow-[0_0_30px_rgba(189,0,255,0.25)]',
    ringColor: 'border-purple-400/40',
  },
  speaking: {
    icon: (
      <svg className="w-12 h-12 text-emerald-400 animate-bounce shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
    statusText: 'Speaking...',
    statusClass: 'text-emerald-400',
    btnBorder: 'border-emerald-400/50',
    btnShadow: 'shadow-[0_0_30px_rgba(57,255,20,0.25)]',
    ringColor: 'border-emerald-400/40',
  },
}

export default function ArcReactor({ state, onTriggerVoice, onSetState, handsFree = false }: ArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef(state)
  const timeRef = useRef(0)
  const frameRef = useRef<number>(0)

  stateRef.current = state

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      if (!canvas.parentElement) return
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      timeRef.current += 0.035

      const currentState = stateRef.current
      let waveCount = 3
      let glowColor = '0, 240, 255'

      if (currentState === 'idle') {
        waveCount = 2
        glowColor = '0, 240, 255'
      } else if (currentState === 'listening') {
        waveCount = 4
        glowColor = '0, 240, 255'
      } else if (currentState === 'thinking') {
        waveCount = 3
        glowColor = '189, 0, 255'
      } else if (currentState === 'speaking') {
        waveCount = 4
        glowColor = '57, 255, 20'
      }

      const radiusBase = Math.min(canvas.width, canvas.height) * 0.32

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath()
        let alpha = 0.7 - w * 0.18
        if (currentState === 'speaking') {
          // Dynamic voice flickering/blinking effect
          const voiceBlink = 0.6 + 0.4 * Math.sin(timeRef.current * 7.5) * Math.cos(timeRef.current * 3.2)
          alpha *= voiceBlink
        }
        ctx.strokeStyle = `rgba(${glowColor}, ${alpha})`
        ctx.shadowBlur = 10 + w * 5
        ctx.shadowColor = `rgba(${glowColor}, 0.5)`
        ctx.lineWidth = w === 0 ? 2 : 1

        const numPoints = 120
        const scaleMultiplier = 1 + w * 0.15

        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2
          let offset = 0

          if (currentState === 'idle') {
            offset = Math.sin(angle * 4 + timeRef.current + w) * 2.5
          } else if (currentState === 'listening') {
            // Rapid mic sensitivity simulation
            const micSens = 6 + Math.random() * 8
            offset = Math.sin(angle * 18 + timeRef.current * 14) * micSens
          } else if (currentState === 'thinking') {
            offset = Math.cos(angle * 6 - timeRef.current * 3 + w) * 4
          } else if (currentState === 'speaking') {
            // Speech waveform simulation: fast voice frequencies modulated by a word envelope
            const wordEnvelope = Math.max(0.1, Math.sin(timeRef.current * 2) * Math.cos(timeRef.current * 0.6) + 0.4)
            const speechWaves = Math.sin(angle * 12 + timeRef.current * 9) * 14 + Math.cos(angle * 28 - timeRef.current * 16) * 6
            offset = speechWaves * wordEnvelope
          }

          const radius = radiusBase * scaleMultiplier + offset
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }

      if (currentState === 'thinking') {
        ctx.shadowBlur = 15
        ctx.fillStyle = 'rgba(189, 0, 255, 0.9)'
        for (let p = 0; p < 8; p++) {
          const particleAngle = timeRef.current * 2 + p * (Math.PI / 4)
          const px = cx + Math.cos(particleAngle) * (radiusBase * 1.4)
          const py = cy + Math.sin(particleAngle) * (radiusBase * 1.4)
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, radiusBase * 1.5, 0, Math.PI * 2)
      ctx.stroke()

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const currentConfig = stateConfig[state]

  return (
    <div className="flex-1 flex flex-col p-6 items-center justify-center relative border-b md:border-b-0 md:border-r border-[#1a2238]">
      <div className="absolute top-4 left-6">
        <h2 className="text-md font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Arc Core Hologram
        </h2>
        <p className="text-[11px] text-cyan-400 font-mono">Interactive AI Soundwave feedback simulator</p>
      </div>

      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center bg-cyan-950/5 rounded-full border border-cyan-500/10 shadow-inner">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <button
          onClick={onTriggerVoice}
          className={`group relative w-36 h-36 rounded-full bg-[#050912] border-2 flex flex-col items-center justify-center transition-all duration-300 z-10 ${
            state === 'speaking' ? 'animate-pulse' : ''
          } ${currentConfig.btnBorder} ${currentConfig.btnShadow}`}
        >
          <div className={`absolute inset-2 rounded-full border border-dashed animate-spin ${currentConfig.ringColor}`} />
          <div className="flex items-center justify-center">
            {currentConfig.icon}
          </div>
          <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 font-mono ${currentConfig.statusClass}`}>
            {handsFree && state === 'idle' ? 'Hands-Free Live' : currentConfig.statusText}
          </span>
        </button>
      </div>

      {handsFree && (
        <div className="mt-4 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono tracking-wider animate-pulse flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          ⚡ HANDS-FREE LIVE (60 MIN AUTO-TIMEOUT)
        </div>
      )}

      <HUDControls onSetState={onSetState} />
    </div>
  )
}

import { useRef, useEffect } from 'react'
import type { ReactorState } from '../../lib/types'
import HUDControls from '../HUDControls/HUDControls'

interface ArcReactorProps {
  state: ReactorState
  onTriggerVoice: () => void
  onSetState: (state: ReactorState) => void
  handsFree?: boolean
  liveSubtitle?: { speaker: 'user' | 'nyota'; text: string } | null
}

interface StateStyle {
  icon: React.ReactNode
  statusText: string
  statusClass: string
  btnBorder: string
  btnShadow: string
  ringColor: string
  glowRgb: string
  glowSecondaryRgb: string
  waveCount: number
}

const stateConfig: Record<ReactorState, StateStyle> = {
  idle: {
    icon: (
      <svg className="w-12 h-12 text-emerald-300 group-hover:scale-110 transition-transform duration-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    statusText: 'Talk to Nyota',
    statusClass: 'text-emerald-300',
    btnBorder: 'border-emerald-400/40 hover:border-emerald-300',
    btnShadow: 'shadow-[0_0_35px_rgba(0,229,163,0.25)] hover:shadow-[0_0_55px_rgba(0,229,163,0.45)]',
    ringColor: 'border-emerald-400/30',
    glowRgb: '0, 229, 163',          // Natural Emerald
    glowSecondaryRgb: '0, 180, 216',  // Seafoam Teal
    waveCount: 3,
  },
  listening: {
    icon: (
      <svg className="w-12 h-12 text-amber-400 animate-pulse shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="10" width="2" height="4" rx="1" />
        <rect x="6" y="6" width="2" height="12" rx="1" />
        <rect x="10" y="4" width="2" height="16" rx="1" />
        <rect x="14" y="8" width="2" height="8" rx="1" />
        <rect x="18" y="5" width="2" height="14" rx="1" />
        <rect x="22" y="10" width="2" height="4" rx="1" />
      </svg>
    ),
    statusText: 'Listening...',
    statusClass: 'text-amber-300',
    btnBorder: 'border-amber-400/70',
    btnShadow: 'shadow-[0_0_50px_rgba(255,183,3,0.4)]',
    ringColor: 'border-amber-400/50',
    glowRgb: '255, 183, 3',           // Solar Warm Gold / Amber
    glowSecondaryRgb: '251, 133, 0',  // Warm Radiant Sunset
    waveCount: 5,
  },
  thinking: {
    icon: (
      <svg className="w-12 h-12 text-teal-300 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </svg>
    ),
    statusText: 'Processing...',
    statusClass: 'text-teal-300',
    btnBorder: 'border-teal-400/60',
    btnShadow: 'shadow-[0_0_50px_rgba(0,245,212,0.4)]',
    ringColor: 'border-teal-400/40',
    glowRgb: '0, 245, 212',           // Electric Cosmic Turquoise
    glowSecondaryRgb: '123, 44, 191', // Deep Violet Shimmer
    waveCount: 4,
  },
  speaking: {
    icon: (
      <svg className="w-12 h-12 text-emerald-300 animate-bounce shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
    statusText: 'Speaking...',
    statusClass: 'text-emerald-300',
    btnBorder: 'border-emerald-400/70',
    btnShadow: 'shadow-[0_0_65px_rgba(16,185,129,0.5)]',
    ringColor: 'border-emerald-400/50',
    glowRgb: '16, 185, 129',          // Vibrant Biomorphic Emerald
    glowSecondaryRgb: '52, 211, 153', // Luminous Lime Mint
    waveCount: 5,
  },
}

export default function ArcReactor({
  state,
  onTriggerVoice,
  onSetState,
  handsFree = false,
  liveSubtitle = null,
}: ArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef(state)
  const timeRef = useRef(0)
  const frameRef = useRef<number>(0)
  const handsFreeRef = useRef(handsFree)

  stateRef.current = state
  handsFreeRef.current = handsFree

  const isVoiceActive = handsFree || state !== 'idle'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      if (!canvas.parentElement) return
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      timeRef.current += 0.032

      const currentState = stateRef.current
      const config = stateConfig[currentState]
      const { glowRgb, glowSecondaryRgb, waveCount } = config

      // Scale base radius dynamically when in active voice mode
      const activeMultiplier = (handsFreeRef.current || currentState !== 'idle') ? 1.22 : 1.0
      const radiusBase = Math.min(canvas.width, canvas.height) * 0.30 * activeMultiplier

      // ── 1. Circular Audio Spectrum Equalizer Bars (48 radiating bars) ────────
      const numBars = 48
      ctx.save()
      for (let b = 0; b < numBars; b++) {
        const barAngle = (b / numBars) * Math.PI * 2 + (timeRef.current * 0.2)
        let barHeight = 4

        if (currentState === 'listening') {
          barHeight = 6 + Math.abs(Math.sin(b * 0.8 + timeRef.current * 8)) * 18
        } else if (currentState === 'speaking') {
          const envelope = Math.sin(timeRef.current * 3.5) * 0.5 + 0.5
          barHeight = 5 + (Math.sin(b * 1.2 + timeRef.current * 10) * 0.5 + 0.5) * 22 * envelope
        } else if (currentState === 'thinking') {
          barHeight = 4 + Math.sin(b * 0.5 + timeRef.current * 5) * 8
        } else {
          barHeight = 3 + Math.sin(b * 0.4 + timeRef.current * 2) * 3
        }

        const innerR = radiusBase * 1.32
        const outerR = innerR + barHeight

        const x1 = cx + Math.cos(barAngle) * innerR
        const y1 = cy + Math.sin(barAngle) * innerR
        const x2 = cx + Math.cos(barAngle) * outerR
        const y2 = cy + Math.sin(barAngle) * outerR

        ctx.strokeStyle = `rgba(${glowRgb}, ${currentState === 'idle' ? 0.35 : 0.75})`
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      ctx.restore()

      // ── 2. Harmonic Soundwave Rings ──────────────────────────────────────────
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath()
        let alpha = 0.75 - w * 0.14
        if (currentState === 'speaking') {
          const voiceBlink = 0.7 + 0.3 * Math.sin(timeRef.current * 8) * Math.cos(timeRef.current * 4)
          alpha *= voiceBlink
        }

        const waveColor = w % 2 === 0 ? glowRgb : glowSecondaryRgb
        ctx.strokeStyle = `rgba(${waveColor}, ${alpha})`
        ctx.shadowBlur = 12 + w * 6
        ctx.shadowColor = `rgba(${waveColor}, 0.6)`
        ctx.lineWidth = w === 0 ? 2.5 : 1.2

        const numPoints = 140
        const scaleMultiplier = 1 + w * 0.12

        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2
          let offset = 0

          if (currentState === 'idle') {
            offset = Math.sin(angle * 5 + timeRef.current * 1.5 + w) * 3.5
          } else if (currentState === 'listening') {
            const micPulse = 8 + Math.random() * 9
            offset = Math.sin(angle * 16 + timeRef.current * 12) * micPulse
          } else if (currentState === 'thinking') {
            offset = Math.cos(angle * 8 - timeRef.current * 5 + w) * 6
          } else if (currentState === 'speaking') {
            const wordEnvelope = Math.max(0.15, Math.sin(timeRef.current * 2.2) * Math.cos(timeRef.current * 0.8) + 0.5)
            const speechWaves = Math.sin(angle * 14 + timeRef.current * 10) * 16 + Math.cos(angle * 32 - timeRef.current * 18) * 8
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

      // ── 3. Orbiting Bio-Luminescent Energy Particles ────────────────────────
      const particleCount = currentState === 'thinking' ? 14 : 8
      ctx.shadowBlur = 15
      for (let p = 0; p < particleCount; p++) {
        const speed = currentState === 'thinking' ? 3.5 : 1.2
        const pAngle = timeRef.current * speed + p * ((Math.PI * 2) / particleCount)
        const pDist = radiusBase * (1.20 + (p % 3) * 0.12)
        const px = cx + Math.cos(pAngle) * pDist
        const py = cy + Math.sin(pAngle) * pDist

        ctx.fillStyle = `rgba(${p % 2 === 0 ? glowRgb : glowSecondaryRgb}, 0.85)`
        ctx.shadowColor = `rgba(${glowRgb}, 0.8)`
        ctx.beginPath()
        ctx.arc(px, py, currentState === 'thinking' ? 3.5 : 2.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── 4. Outer Rotating HUD Compass Reticle Ring ───────────────────────────
      ctx.shadowBlur = 0
      ctx.strokeStyle = `rgba(${glowRgb}, 0.18)`
      ctx.lineWidth = 1
      ctx.setLineDash([4, 8])
      ctx.beginPath()
      ctx.arc(cx, cy, radiusBase * 1.55, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Degree tick marks (0°, 90°, 180°, 270°)
      const tickAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]
      ctx.fillStyle = `rgba(${glowRgb}, 0.4)`
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const tickLabels = ['000°', '090°', '180°', '270°']
      tickAngles.forEach((a, idx) => {
        const tx = cx + Math.cos(a + timeRef.current * 0.05) * (radiusBase * 1.62)
        const ty = cy + Math.sin(a + timeRef.current * 0.05) * (radiusBase * 1.62)
        ctx.fillText(tickLabels[idx], tx, ty)
      })

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
    <div className="flex-1 flex flex-col p-6 items-center justify-center relative border-b md:border-b-0 md:border-r border-[#1a2238] overflow-hidden">
      {/* Top Holographic Header */}
      <div className="absolute top-4 left-6 z-20">
        <h2 className="text-md font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Arc Core Hologram
        </h2>
        <p className="text-[11px] text-emerald-400/80 font-mono">Natural Bio-Neural Acoustic Interface</p>
      </div>

      {/* Dynamic Sizing Container: Expands smoothly when Voice Mode is active */}
      <div
        className={`relative flex items-center justify-center rounded-full border transition-all duration-700 ease-out ${
          isVoiceActive
            ? 'w-80 h-80 md:w-[380px] md:h-[380px] lg:w-[430px] lg:h-[430px] bg-emerald-950/10 border-emerald-500/30 shadow-[0_0_70px_rgba(0,229,163,0.2)]'
            : 'w-72 h-72 md:w-80 md:h-80 bg-emerald-950/5 border-emerald-500/15 shadow-inner'
        }`}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Central Glowing Core Button */}
        <button
          onClick={onTriggerVoice}
          className={`group relative rounded-full bg-[#050912] border-2 flex flex-col items-center justify-center transition-all duration-500 z-10 ${
            isVoiceActive ? 'w-44 h-44 md:w-48 md:h-48' : 'w-36 h-36'
          } ${state === 'speaking' ? 'animate-pulse' : ''} ${currentConfig.btnBorder} ${currentConfig.btnShadow}`}
        >
          {/* Outer Dashed Orbit Spinner */}
          <div className={`absolute inset-2 rounded-full border border-dashed animate-spin ${currentConfig.ringColor}`} />
          
          {/* Core Icon */}
          <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            {currentConfig.icon}
          </div>

          {/* Status Label */}
          <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 font-mono ${currentConfig.statusClass}`}>
            {handsFree && state === 'idle' ? 'Hands-Free Live' : currentConfig.statusText}
          </span>
        </button>
      </div>

      {/* Floating Live Subtitle HUD: Displays spoken words & AI replies in real time */}
      {liveSubtitle && (
        <div className="mt-5 px-5 py-2 rounded-xl bg-[#070e1b]/85 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.6)] flex items-center gap-2.5 max-w-md animate-fadeIn z-20">
          <span className="text-xs">
            {liveSubtitle.speaker === 'user' ? '🎙️' : '✨'}
          </span>
          <p className="text-xs font-mono truncate text-slate-200">
            <span className={liveSubtitle.speaker === 'user' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {liveSubtitle.speaker === 'user' ? 'You: ' : 'Nyota: '}
            </span>
            "{liveSubtitle.text}"
          </p>
        </div>
      )}

      {/* Hands-Free Mode Indicator */}
      {handsFree && (
        <div className="mt-3 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono tracking-wider animate-pulse flex items-center gap-1.5 z-20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          ⚡ HANDS-FREE VOICE LIVE (60 MIN TIMEOUT)
        </div>
      )}

      {/* HUD Manual Simulation Controls */}
      <HUDControls onSetState={onSetState} />
    </div>
  )
}

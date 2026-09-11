export type ReactorState = 'idle' | 'listening' | 'thinking' | 'speaking'
export type ViewMode = 'immersive' | 'split' | 'chat' | 'dashboard'

export interface LogEntry {
  timestamp: string
  message: string
  level: 'info' | 'warn' | 'error' | 'success'
}

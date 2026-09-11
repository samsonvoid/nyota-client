const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_KEY = import.meta.env.VITE_API_SECRET_KEY

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  headers.set('Content-Type', 'application/json')
  if (API_KEY) {
    headers.set('Authorization', `Bearer ${API_KEY}`)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API ${res.status}: ${err}`)
  }

  return res.json()
}

export interface LogEntry {
  id: string
  level: string
  source: string
  message: string
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  status: string
  created_at: string
}

export interface ChatResponse {
  reply: string
  conversation_id: string
  approval_id?: string
  approval_status?: string
}

export interface VoiceChatResponse extends ChatResponse {
  user_query: string
  is_silence: boolean
  is_rate_limited: boolean
}

export interface Workspace {
  name: string
  path: string
  purpose: string
}

export interface AddWorkspaceRequest {
  path: string
  name?: string
  purpose?: string
}

export const api = {
  health: () => request<{ status: string; daemon: string }>('/health'),

  getLogs: (limit = 50) =>
    request<{ logs: LogEntry[] }>(`/api/logs?limit=${limit}`),

  getRecentLogs: () =>
    request<{ logs: LogEntry[] }>('/api/logs/recent'),

  listConversations: () =>
    request<{ conversations: Conversation[] }>('/api/conversations'),

  createConversation: () =>
    request<Conversation>('/api/conversations', { method: 'POST' }),

  interruptSpeech: () =>
    request<{ status: string }>('/api/interrupt', { method: 'POST' }),

  sendMessage: (message: string, conversationId?: string, language = 'en') =>
    request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId, language }),
    }),

  voiceChat: (conversationId?: string, language = 'en') =>
    request<VoiceChatResponse>('/api/voice-chat', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, language }),
    }),

  approveTool: (approvalId: string) =>
    request<{ status: string; result?: { success: boolean; output: string } }>(
      `/api/tools/approvals/${approvalId}/approve`,
      { method: 'POST' },
    ),

  rejectTool: (approvalId: string) =>
    request<{ status: string }>(`/api/tools/approvals/${approvalId}/reject`, {
      method: 'POST',
    }),

  listWorkspaces: () =>
    request<{ workspaces: Workspace[] }>('/api/tools/workspaces'),

  addWorkspace: (workspace: AddWorkspaceRequest) =>
    request<{ workspace: Workspace; workspaces: Workspace[] }>('/api/tools/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspace),
    }),

  removeWorkspace: (path: string) =>
    request<{ workspaces: Workspace[] }>('/api/tools/workspaces', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    }),
}

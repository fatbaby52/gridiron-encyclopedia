export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  articleContext?: string
  createdAt: number
}

export interface ChatRequest {
  message: string
  articleContext?: string
  history: ChatMessage[]
}

export interface ChatResponse {
  message: string
  error?: string
}

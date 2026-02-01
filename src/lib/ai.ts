import OpenAI from 'openai'
import type { ChatMessage } from '@/types'

const SYSTEM_PROMPT = `You are the Gridiron Encyclopedia AI assistant, an expert on American football strategy, rules, history, and coaching. You provide clear, accurate, educational answers.

Guidelines:
- Be authoritative but approachable
- Define jargon when first used
- Reference specific formations, plays, or rules by name
- Distinguish between high school, college, and NFL rules when relevant
- If you're unsure about something, say so
- Keep answers focused and concise
- When discussing plays, reference spatial relationships (left/right, inside/outside)

If article context is provided, prioritize information from that article in your response.`

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

export async function* streamChatResponse(
  messages: ChatMessage[],
  articleContext?: string,
): AsyncGenerator<string> {
  const client = getOpenAIClient()
  if (!client) {
    yield 'AI chat is not configured. Please set the OPENAI_API_KEY environment variable.'
    return
  }

  const systemContent = articleContext
    ? `${SYSTEM_PROMPT}\n\nCurrent article context:\n${articleContext}`
    : SYSTEM_PROMPT

  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
    ...messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
  ]

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: openaiMessages,
    stream: true,
    max_tokens: 1000,
    temperature: 0.7,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) yield content
  }
}

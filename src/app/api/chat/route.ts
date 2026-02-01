import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { streamChatResponse } from '@/lib/ai'
import { checkServerRateLimit, incrementServerCount } from '@/lib/rateLimit'
import type { ChatMessage } from '@/types'

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  articleContext: z.string().optional(),
  history: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        timestamp: z.number(),
      }),
    )
    .max(20),
})

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { allowed, remaining } = checkServerRateLimit(ip)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Daily query limit reached. Please try again tomorrow.' },
        { status: 429 },
      )
    }

    const body = await request.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 },
      )
    }

    const { message, articleContext, history } = parsed.data

    const messages: ChatMessage[] = [
      ...history,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      },
    ]

    incrementServerCount(ip)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChatResponse(messages, articleContext)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, remaining: remaining - 1 })}\n\n`,
            ),
          )
          controller.close()
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'An error occurred while generating the response.' })}\n\n`,
            ),
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import { ratelimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * POST /api/chatbot - Financial chatbot endpoint
 * 
 * Handles chat messages and returns AI-generated financial advice
 * using Mistral AI.
 */

// Initialize Mistral AI client
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? '',
})

// Get Mistral model from environment or use free tier default
// magistral-small-2509 is available on the FREE tier ($0/month)
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'magistral-small-2509'

// System prompt for financial assistant
const SYSTEM_PROMPT = `You are a professional AI Financial Assistant for a personal finance tracking application called PHPinancia. Your role is to provide helpful, accurate, and actionable financial advice to users.

Your expertise includes:
- Personal budgeting and expense management
- Savings strategies and tips
- Debt management and reduction
- Financial goal setting and planning
- Investment basics (general education only)
- Money-saving tips and tricks
- Understanding financial reports and metrics
- Philippine Peso (₱) currency and local financial context

Guidelines:
1. Be friendly, professional, and encouraging
2. Provide specific, actionable advice
3. Use Philippine Peso (₱) for currency examples
4. Keep responses concise but informative (2-4 paragraphs max)
5. Ask clarifying questions when needed
6. Never provide specific investment recommendations or tax advice
7. Always remind users to consult professionals for major financial decisions
8. Focus on practical tips users can implement immediately
9. Use simple language, avoid jargon
10. Be supportive and non-judgmental about financial situations

Remember: You're helping users manage their personal finances better through the PHPinancia app.`

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (write operations - chatbot is resource-intensive)
    const ip = getClientIp(request)
    const { success, limit: rateLimit, remaining, reset } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders({ success, limit: rateLimit, remaining, reset })
        }
      )
    }

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    // Validate API key
    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY not configured')
      return NextResponse.json(
        { error: 'Chatbot service not configured' },
        { status: 500 }
      )
    }

    // Filter out messages with empty content and prepare for Mistral AI
    const validMessages = messages.filter((msg: any) =>
      msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0
    )

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: 'No valid messages provided' },
        { status: 400 }
      )
    }

    const mistralMessages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT,
      },
      ...validMessages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content.trim(),
      })),
    ]

    // Call Mistral AI
    logger.info({
      model: MISTRAL_MODEL,
      messageCount: mistralMessages.length
    }, 'Calling Mistral AI')

    const response = await mistral.chat.complete({
      model: MISTRAL_MODEL,
      messages: mistralMessages,
      temperature: 0.7,
      maxTokens: 500, // Keep responses concise
    })

    // Extract response
    const messageContent = response.choices?.[0]?.message?.content
    
    // Handle both string and ContentChunk[] types
    let aiResponse = ''
    if (typeof messageContent === 'string') {
      aiResponse = messageContent
    } else if (Array.isArray(messageContent)) {
      aiResponse = messageContent
        .map((chunk: any) => chunk.text || '')
        .join('')
    }

    if (!aiResponse) {
      logger.error('Empty response from Mistral AI')
      throw new Error('Empty response from AI')
    }

    logger.info({ responseLength: aiResponse.length }, 'Mistral AI response received')

    return NextResponse.json({
      message: aiResponse,
    })
  } catch (error: any) {
    logger.error({
      error: error.message || error,
      errorType: error.constructor?.name,
      statusCode: error.statusCode,
      body: error.body
    }, 'Error in chatbot API')

    // Return user-friendly error message
    return NextResponse.json(
      {
        message: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
      },
      { status: 200 } // Return 200 to show error message in chat
    )
  }
}


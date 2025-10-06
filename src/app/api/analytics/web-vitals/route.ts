import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Web Vitals Analytics API
 * 
 * Collects Core Web Vitals metrics from the client and logs them
 * for analysis and monitoring.
 * 
 * Metrics collected:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) - deprecated
 * - INP (Interaction to Next Paint) - new
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

interface WebVitalsPayload {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  navigationType: string
  timestamp: number
  url: string
  userAgent: string
}

export async function POST(request: NextRequest) {
  try {
    const body: WebVitalsPayload = await request.json()

    // Validate payload
    if (!body.metric || typeof body.value !== 'number') {
      const response = NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      return response
    }

    // Log the metric
    logger.info({
      metric: body.metric,
      value: body.value,
      rating: body.rating,
      id: body.id,
      navigationType: body.navigationType,
      url: body.url,
      userAgent: body.userAgent,
      timestamp: body.timestamp,
    }, 'Web Vital Metric')

    // In production, you might want to:
    // 1. Store metrics in a database for analysis
    // 2. Send to a dedicated analytics service
    // 3. Aggregate metrics for dashboards
    // 4. Set up alerts for poor performance

    // Example: Store in database (commented out)
    /*
    const supabase = createSupabaseApiClient()
    await supabase.from('web_vitals').insert({
      metric: body.metric,
      value: body.value,
      rating: body.rating,
      metric_id: body.id,
      navigation_type: body.navigationType,
      url: body.url,
      user_agent: body.userAgent,
      created_at: new Date(body.timestamp).toISOString(),
    })
    */

    const response = NextResponse.json({ success: true }, { status: 200 })
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return response
  } catch (error) {
    logger.error({ error }, 'Error processing web vitals')
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    // Add CORS headers even for errors
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return response
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}


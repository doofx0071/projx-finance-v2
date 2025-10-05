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
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
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

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    logger.error({ error }, 'Error processing web vitals')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}


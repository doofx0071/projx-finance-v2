'use client'

import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs'

/**
 * Web Vitals Component
 * 
 * Tracks and reports Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity (deprecated, replaced by INP)
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Loading performance
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Interactivity (new metric)
 * 
 * Metrics are sent to:
 * 1. Sentry for performance monitoring
 * 2. Console in development mode
 * 3. Custom analytics endpoint (if configured)
 */

interface WebVitalsMetric {
  id: string
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender' | 'restore'
}

/**
 * Get performance rating based on metric thresholds
 * Based on Google's Core Web Vitals thresholds
 */
function getPerformanceRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  }

  const threshold = thresholds[name as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Send metric to custom analytics endpoint
 */
async function sendToAnalytics(metric: WebVitalsMetric) {
  try {
    // Only send in production
    if (process.env.NODE_ENV !== 'production') return

    // Send to custom analytics endpoint
    const body = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    })

    // Use sendBeacon for better reliability (doesn't block page unload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/web-vitals', body)
    } else {
      // Fallback to fetch with keepalive
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        body,
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((error) => {
        console.error('Failed to send web vitals:', error)
      })
    }
  } catch (error) {
    console.error('Error sending analytics:', error)
  }
}

/**
 * Send metric to Sentry for performance monitoring
 */
function sendToSentry(metric: WebVitalsMetric) {
  try {
    // Create a transaction for the metric
    const transaction = Sentry.startInactiveSpan({
      name: `Web Vital: ${metric.name}`,
      op: 'web-vital',
      attributes: {
        'web-vital.name': metric.name,
        'web-vital.value': metric.value,
        'web-vital.rating': metric.rating,
        'web-vital.id': metric.id,
        'web-vital.navigationType': metric.navigationType,
      },
    })

    // Set measurement
    Sentry.setMeasurement(metric.name, metric.value, 'millisecond')

    // Add breadcrumb
    Sentry.addBreadcrumb({
      category: 'web-vital',
      message: `${metric.name}: ${metric.value}ms (${metric.rating})`,
      level: metric.rating === 'poor' ? 'warning' : 'info',
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      },
    })

    transaction?.end()
  } catch (error) {
    console.error('Error sending to Sentry:', error)
  }
}

/**
 * Log metric to console in development
 */
function logToConsole(metric: WebVitalsMetric) {
  if (process.env.NODE_ENV !== 'development') return

  const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
  const color = metric.rating === 'good' ? 'color: green' : metric.rating === 'needs-improvement' ? 'color: orange' : 'color: red'

  console.group(`%c${emoji} Web Vital: ${metric.name}`, color)
  console.log('Value:', metric.value)
  console.log('Rating:', metric.rating)
  console.log('Delta:', metric.delta)
  console.log('Navigation Type:', metric.navigationType)
  console.log('ID:', metric.id)
  console.groupEnd()
}

/**
 * Web Vitals Component
 * Add this to your root layout to track performance metrics
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Add rating to metric
    const enhancedMetric: WebVitalsMetric = {
      ...metric,
      rating: getPerformanceRating(metric.name, metric.value),
    }

    // Log to console in development
    logToConsole(enhancedMetric)

    // Send to Sentry
    sendToSentry(enhancedMetric)

    // Send to custom analytics
    sendToAnalytics(enhancedMetric)

    // Send to Google Analytics if configured
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })

  return null
}

/**
 * Performance thresholds for reference
 * 
 * LCP (Largest Contentful Paint):
 * - Good: ≤ 2.5s
 * - Needs Improvement: 2.5s - 4.0s
 * - Poor: > 4.0s
 * 
 * FID (First Input Delay) - DEPRECATED:
 * - Good: ≤ 100ms
 * - Needs Improvement: 100ms - 300ms
 * - Poor: > 300ms
 * 
 * INP (Interaction to Next Paint) - NEW:
 * - Good: ≤ 200ms
 * - Needs Improvement: 200ms - 500ms
 * - Poor: > 500ms
 * 
 * CLS (Cumulative Layout Shift):
 * - Good: ≤ 0.1
 * - Needs Improvement: 0.1 - 0.25
 * - Poor: > 0.25
 * 
 * FCP (First Contentful Paint):
 * - Good: ≤ 1.8s
 * - Needs Improvement: 1.8s - 3.0s
 * - Poor: > 3.0s
 * 
 * TTFB (Time to First Byte):
 * - Good: ≤ 800ms
 * - Needs Improvement: 800ms - 1800ms
 * - Poor: > 1800ms
 */


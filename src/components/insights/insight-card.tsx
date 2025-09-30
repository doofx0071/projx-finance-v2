import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Info, TrendingUp, AlertTriangle } from 'lucide-react'
import type { FinancialInsight } from '@/lib/ai-insights'
import { getInsightIcon, getInsightColor } from '@/lib/ai-insights'

interface InsightCardProps {
  insight: FinancialInsight
  onLearnMore?: (insight: FinancialInsight) => void
}

/**
 * Get icon component based on severity
 */
function getSeverityIcon(severity: FinancialInsight['severity']) {
  switch (severity) {
    case 'success':
      return <CheckCircle className="h-5 w-5" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5" />
    case 'error':
      return <AlertCircle className="h-5 w-5" />
    case 'info':
    default:
      return <Info className="h-5 w-5" />
  }
}

/**
 * Get badge variant based on severity
 */
function getBadgeVariant(severity: FinancialInsight['severity']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (severity) {
    case 'success':
      return 'default'
    case 'warning':
      return 'secondary'
    case 'error':
      return 'destructive'
    case 'info':
    default:
      return 'outline'
  }
}

/**
 * Get type label
 */
function getTypeLabel(type: FinancialInsight['type']): string {
  switch (type) {
    case 'pattern':
      return 'Spending Pattern'
    case 'budget':
      return 'Budget Optimization'
    case 'savings':
      return 'Savings Opportunity'
    case 'alert':
      return 'Alert'
    case 'summary':
      return 'Financial Summary'
    default:
      return 'Insight'
  }
}

/**
 * InsightCard Component
 * 
 * Displays a single AI-generated financial insight with icon, title,
 * description, and optional recommendation.
 */
export function InsightCard({ insight, onLearnMore }: InsightCardProps) {
  const colorClasses = getInsightColor(insight.severity)
  const icon = getInsightIcon(insight.type)

  return (
    <Card className={`border-l-4 ${colorClasses}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant={getBadgeVariant(insight.severity)} className="cursor-pointer">
                  {getTypeLabel(insight.type)}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className={colorClasses}>
            {getSeverityIcon(insight.severity)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
        
        {insight.recommendation && (
          <div className="rounded-lg bg-muted p-3 border">
            <p className="text-sm font-medium mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recommendation
            </p>
            <p className="text-sm text-muted-foreground">
              {insight.recommendation}
            </p>
          </div>
        )}

        {insight.actionable && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onLearnMore?.(insight)}
            >
              Learn More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * InsightCardSkeleton Component
 * 
 * Loading skeleton for insight cards
 */
export function InsightCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-5 w-5 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-20 w-full bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  )
}

/**
 * EmptyInsights Component
 * 
 * Displayed when no insights are available
 */
export function EmptyInsights() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">💡</div>
        <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          Start adding transactions to get personalized financial insights and recommendations.
        </p>
        <Button variant="outline" className="cursor-pointer">
          Add Transaction
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * InsightError Component
 * 
 * Displayed when there's an error generating insights
 */
export function InsightError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to Generate Insights</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          We encountered an issue generating your financial insights. Please try again.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="cursor-pointer">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import { useState, useEffect, lazy, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Sparkles, TrendingUp, Calendar } from "lucide-react"
import { InsightCard, InsightCardSkeleton, EmptyInsights, InsightError } from "@/components/insights/insight-card"
import type { FinancialInsight } from "@/lib/ai-insights"

// Lazy load FinancialChatbot
const FinancialChatbot = lazy(() => import("@/components/financial-chatbot").then(mod => ({ default: mod.FinancialChatbot })))
import { formatCurrency } from "@/lib/utils"

interface InsightsData {
  insights: FinancialInsight[]
  metadata: {
    period: string
    dateRange: {
      start: string
      end: string
    }
    transactionCount: number
    budgetCount: number
    totalIncome: number
    totalExpenses: number
    netIncome: number
    generatedAt: string
  }
}

export default function InsightsPage() {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [refreshing, setRefreshing] = useState(false)
  const [chatbotMessage, setChatbotMessage] = useState<string>('')
  const [chatbotKey, setChatbotKey] = useState(0)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const fetchInsights = async (selectedPeriod: string = period) => {
    try {
      setError(false)
      const response = await fetch(`/api/insights?period=${selectedPeriod}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }

      const data = await response.json()
      setInsightsData(data.data)
    } catch (err) {
      console.error('Error fetching insights:', err)
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(ROUTES.LOGIN)
        return
      }

      fetchInsights()
    }

    checkUser()
  }, [router, supabase.auth]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchInsights()
  }

  const handlePeriodChange = async (newPeriod: 'week' | 'month' | 'quarter') => {
    setPeriod(newPeriod)
    setLoading(true)
    await fetchInsights(newPeriod)
  }

  const handleLearnMore = (insight: FinancialInsight) => {
    const question = `Tell me more about: ${insight.title}. ${insight.description}`
    setChatbotMessage(question)
    setChatbotKey(prev => prev + 1)  // Force re-render
  }

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case 'week':
        return 'Last 7 Days'
      case 'quarter':
        return 'Last 90 Days'
      case 'month':
      default:
        return 'Last 30 Days'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Financial Insights
            </h2>
            <p className="text-muted-foreground mt-1">
              Personalized recommendations powered by AI
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Loading Skeletons */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <InsightCardSkeleton />
            <InsightCardSkeleton />
            <InsightCardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Financial Insights
            </h2>
            <p className="text-muted-foreground mt-1">
              Personalized recommendations powered by AI
            </p>
          </div>
        </div>
        <InsightError onRetry={handleRefresh} />
      </div>
    )
  }

  const insights = insightsData?.insights || []
  const metadata = insightsData?.metadata

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Financial Insights
          </h2>
          <p className="text-muted-foreground mt-1">
            Personalized recommendations powered by AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={(value) => handlePeriodChange(value as 'week' | 'month' | 'quarter')}>
        <TabsList>
          <TabsTrigger value="week" className="cursor-pointer">
            <Calendar className="h-4 w-4 mr-2" />
            Week
          </TabsTrigger>
          <TabsTrigger value="month" className="cursor-pointer">
            <Calendar className="h-4 w-4 mr-2" />
            Month
          </TabsTrigger>
          <TabsTrigger value="quarter" className="cursor-pointer">
            <Calendar className="h-4 w-4 mr-2" />
            Quarter
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      {metadata && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPeriodLabel(metadata.period)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metadata.transactionCount} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metadata.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(metadata.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Net Income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metadata.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metadata.netIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metadata.netIncome >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Insights
            <Badge variant="secondary" className="cursor-pointer">{insights.length}</Badge>
          </h3>
        </div>

        {insights.length === 0 ? (
          <EmptyInsights />
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onLearnMore={handleLearnMore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Financial Chatbot */}
      <Suspense fallback={null}>
        <FinancialChatbot
          key={chatbotKey}
          initialMessage={chatbotMessage}
        />
      </Suspense>
    </div>
  )
}


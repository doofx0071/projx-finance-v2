"use client"

import { useState, useEffect, lazy, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, TrendingUp, TrendingDown, PieChart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ChartSkeleton, PieChartSkeleton, BarChartSkeleton } from "@/components/ui/chart-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy chart components for better performance
const CategoryPieChart = lazy(() => import("@/components/charts/category-pie-chart").then(mod => ({ default: mod.CategoryPieChart })))
const TrendsLineChart = lazy(() => import("@/components/charts/trends-line-chart").then(mod => ({ default: mod.TrendsLineChart })))
const CategoryBarChart = lazy(() => import("@/components/charts/category-bar-chart").then(mod => ({ default: mod.CategoryBarChart })))

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(ROUTES.LOGIN)
        return
      }

      // Fetch reports data
      try {
        const response = await fetch('/api/reports?period=month')
        if (response.ok) {
          const data = await response.json()
          setReportData(data.data?.report)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {/* Summary Cards Skeleton */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <PieChartSkeleton />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <BarChartSkeleton />
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <ChartSkeleton />
            </CardContent>
          </Card>

          {/* Category Breakdown Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-2 w-32 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.summary.totalIncome)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This {reportData.summary.period}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(reportData.summary.totalExpenses)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This {reportData.summary.period}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  <span className={`text-sm font-bold ${reportData.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>₱</span>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${reportData.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reportData.summary.netIncome)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Profit/Loss this {reportData.summary.period}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.summary.transactionCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Total transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Category Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of expenses by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<PieChartSkeleton />}>
                    <CategoryPieChart data={reportData.topSpendingCategories} />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Category Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Comparison</CardTitle>
                  <CardDescription>
                    Compare spending across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<BarChartSkeleton />}>
                    <CategoryBarChart data={reportData.topSpendingCategories} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            {/* Trends Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Trends</CardTitle>
                <CardDescription>
                  Income vs expenses over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <TrendsLineChart data={reportData.monthlyTrends} />
                </Suspense>
              </CardContent>
            </Card>

            {/* Top Spending Categories List */}
            <Card>
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>
                  Your highest expense categories this {reportData.summary.period}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topSpendingCategories.map((category: any, index: number) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color || '#6b7280' }}
                        />
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {category.icon || `${index + 1}`}
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">{formatCurrency(category.total)}</p>
                        <div className="w-24">
                          <Progress
                            value={(category.total / reportData.summary.totalExpenses) * 100}
                            className="h-2"
                            indicatorColor={category.color || '#ef4444'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {reportData.topSpendingCategories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No expense data available for this period.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>
                  Income vs expenses over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.monthlyTrends.slice(-6).map((trend: any) => (
                    <div key={trend.month} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="font-medium">{trend.month}</div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">+{formatCurrency(trend.income)}</span>
                        <span className="text-red-600">-{formatCurrency(trend.expenses)}</span>
                        <span className={`font-medium ${trend.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.net >= 0 ? '+' : ''}{formatCurrency(trend.net)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>
                Generate detailed reports of your financial activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Loading financial reports...
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
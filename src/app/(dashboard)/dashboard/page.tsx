"use client"

import { useState, useEffect, lazy, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RecentTransactions } from "@/components/recent-transactions"
import { formatCurrency } from "@/lib/utils"
import { Target } from "lucide-react"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy components
const Overview = lazy(() => import("@/components/overview").then(mod => ({ default: mod.Overview })))
const AddBudgetModal = lazy(() => import("@/components/modals/add-budget-modal").then(mod => ({ default: mod.AddBudgetModal })))
const EditBudgetModal = lazy(() => import("@/components/modals/edit-budget-modal").then(mod => ({ default: mod.EditBudgetModal })))
const DeleteBudgetDialog = lazy(() => import("@/components/ui/delete-confirmation-dialog").then(mod => ({ default: mod.DeleteBudgetDialog })))

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(ROUTES.LOGIN)
    }
  }

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100)

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError)
      } else {
        setTransactions(transactionsData || [])
      }

      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (budgetsError) {
        console.error('Error fetching budgets:', budgetsError)
      } else {
        setBudgets(budgetsData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetAdded = () => {
    fetchData() // Refresh all data
  }

  const handleBudgetUpdated = () => {
    fetchData() // Refresh all data
  }



  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="space-y-4">
          {/* Metric Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="pl-2">
                <ChartSkeleton />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budgets Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-2 w-20 rounded-full" />
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate metrics from real data
  const transactionList = transactions
  const totalIncome = transactionList
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const totalExpenses = transactionList
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const totalBalance = totalIncome - totalExpenses
  const transactionCount = transactionList.length

  // Calculate metrics for last month comparison
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get last month's date
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Filter transactions for current month
  const currentMonthTransactions = transactionList.filter((t: any) => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  })

  // Filter transactions for last month
  const lastMonthTransactions = transactionList.filter((t: any) => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === lastMonth && transactionDate.getFullYear() === lastMonthYear
  })

  // Calculate current month metrics
  const currentMonthIncome = currentMonthTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const currentMonthExpenses = currentMonthTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses
  const currentMonthTransactionCount = currentMonthTransactions.length

  // Calculate last month metrics
  const lastMonthIncome = lastMonthTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const lastMonthExpenses = lastMonthTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const lastMonthBalance = lastMonthIncome - lastMonthExpenses
  const lastMonthTransactionCount = lastMonthTransactions.length

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / Math.abs(previous)) * 100
  }

  const balanceChange = calculatePercentageChange(currentMonthBalance, lastMonthBalance)
  const incomeChange = calculatePercentageChange(currentMonthIncome, lastMonthIncome)
  const expenseChange = calculatePercentageChange(currentMonthExpenses, lastMonthExpenses)
  const transactionChange = calculatePercentageChange(currentMonthTransactionCount, lastMonthTransactionCount)

  // Format percentage display
  const formatPercentageChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}% from last month`
  }

  // Calculate spending for each budget
  const budgetsWithSpending = budgets.map(budget => {
    // Calculate spending for this budget's category in the current period
    const categoryTransactions = transactionList.filter((t: any) =>
      t.category_id === budget.category_id && t.type === 'expense'
    )

    const spent = categoryTransactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    const remaining = Math.max(0, budget.amount - spent)
    const percentage = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0

    return {
      ...budget,
      spent,
      remaining,
      percentage,
    }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentageChange(balanceChange)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentageChange(incomeChange)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentageChange(expenseChange)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactionCount}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentageChange(transactionChange)}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Suspense fallback={<ChartSkeleton />}>
                <Overview transactions={transactionList} />
              </Suspense>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                You made {transactionCount} transactions this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={transactionList} />
            </CardContent>
          </Card>
        </div>

        {/* Budgets Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budgets
            </CardTitle>
            <CardDescription>
              Track your spending limits and budget progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetsWithSpending.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No budgets set yet. Create your first budget to start tracking spending limits.
              </div>
            ) : (
              <div className="space-y-4">
                {budgetsWithSpending.map((budget) => (
                  <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: budget.categories?.color || '#gray' }}
                      />
                      <div>
                        <p className="font-medium">{budget.categories?.name || 'Unknown Category'}</p>
                        <p className="text-sm text-muted-foreground capitalize">{budget.period} budget</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(budget.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(budget.remaining)} remaining
                        </p>
                      </div>
                      <Progress
                        value={budget.percentage}
                        className="w-20"
                        indicatorColor={budget.categories?.color || '#3b82f6'}
                      />
                      <div className="flex gap-1">
                        <Suspense fallback={<Skeleton className="h-8 w-8" />}>
                          <EditBudgetModal
                            budget={budget}
                            onBudgetUpdated={handleBudgetUpdated}
                          />
                        </Suspense>
                        <Suspense fallback={<Skeleton className="h-8 w-8" />}>
                          <DeleteBudgetDialog
                            budgetId={budget.id}
                            categoryName={budget.categories?.name || 'Unknown Category'}
                            onDeleted={handleBudgetUpdated}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <AddBudgetModal onBudgetAdded={handleBudgetAdded} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
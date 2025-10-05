"use client"

import { useState, useMemo, lazy, Suspense } from 'react'
import { FileDown, FileSpreadsheet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TransactionFiltersComponent, type TransactionFilters } from "@/components/transaction-filters"
import { useTransactions } from "@/hooks/use-transactions"

// Lazy load heavy components
const AddTransactionModal = lazy(() => import("@/components/modals/add-transaction-modal").then(mod => ({ default: mod.AddTransactionModal })))
const TransactionsTable = lazy(() => import("@/components/transactions-table").then(mod => ({ default: mod.TransactionsTable })))
import { useCategories } from "@/hooks/use-categories"
import { exportTransactions } from "@/lib/export"
import type { TransactionWithCategory } from "@/types"

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({})

  // Fetch all transactions without filters (only initial load shows skeleton)
  const { data: allTransactions = [], isLoading: loading } = useTransactions()
  const { data: categories = [] } = useCategories()

  // Client-side filtering (no loading state when filtering)
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchLower) ||
        t.categories?.name?.toLowerCase().includes(searchLower)
      )
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Apply category filter
    if (filters.category_id) {
      filtered = filtered.filter(t => t.category_id === filters.category_id)
    }

    // Apply date range filters
    if (filters.start_date) {
      filtered = filtered.filter(t => t.date >= filters.start_date!)
    }
    if (filters.end_date) {
      filtered = filtered.filter(t => t.date <= filters.end_date!)
    }

    return filtered
  }, [allTransactions, filters])

  const transactions = filteredTransactions

  const handleTransactionAdded = () => {
    // React Query will automatically refetch due to cache invalidation
  }

  const handleTransactionUpdated = () => {
    // React Query will automatically refetch due to cache invalidation
  }

  const handleTransactionDeleted = () => {
    // React Query will automatically refetch due to cache invalidation
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    exportTransactions(transactions, format)
  }



  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-9 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter Skeletons */}
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            {/* Table Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleExport('csv')}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('pdf')}
                className="cursor-pointer"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Suspense fallback={<Skeleton className="h-10 w-40" />}>
            <AddTransactionModal onTransactionAdded={handleTransactionAdded} />
          </Suspense>
        </div>
      </div>
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <TransactionFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
        />

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            }>
              <TransactionsTable
                data={transactions}
                onTransactionUpdated={handleTransactionUpdated}
                onTransactionDeleted={handleTransactionDeleted}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
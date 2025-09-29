"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTransactionModal } from "@/components/modals/add-transaction-modal"
import { TransactionsTable } from "@/components/transactions-table"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
    fetchTransactions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(ROUTES.LOGIN)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching transactions:', error)
      } else {
        setTransactions(data || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionAdded = () => {
    fetchTransactions() // Refresh the transactions list
  }

  const handleTransactionUpdated = () => {
    fetchTransactions() // Refresh the transactions list
  }

  const handleTransactionDeleted = () => {
    fetchTransactions() // Refresh the transactions list
  }



  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        </div>
        <div className="text-center py-8">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center space-x-2">
          <AddTransactionModal onTransactionAdded={handleTransactionAdded} />
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              Manage your income and expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsTable
              data={transactions}
              onTransactionUpdated={handleTransactionUpdated}
              onTransactionDeleted={handleTransactionDeleted}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
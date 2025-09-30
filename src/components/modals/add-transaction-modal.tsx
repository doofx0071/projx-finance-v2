"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/forms/transaction-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import type { TransactionType } from "@/types"
import { useCreateTransaction } from "@/hooks/use-transactions"

interface TransactionFormData {
  amount: string
  description: string
  category: string
  type: TransactionType
  date: Date
}

interface AddTransactionModalProps {
  trigger?: React.ReactNode
  onTransactionAdded?: () => void
}

export function AddTransactionModal({ trigger, onTransactionAdded }: AddTransactionModalProps) {
  const [open, setOpen] = useState(false)
  const createTransaction = useCreateTransaction()

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      await createTransaction.mutateAsync({
        amount: parseFloat(data.amount),
        description: data.description,
        category_id: data.category,
        type: data.type,
        date: data.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      })

      console.log("Transaction added successfully")
      setOpen(false)
      onTransactionAdded?.()
    } catch (error: any) {
      console.error("Error adding transaction:", error)
      throw error // Re-throw to let the form handle the error
    }
  }

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Transaction
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl">Add New Transaction</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Record a new income or expense transaction
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          showCard={false}
        />
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/forms/transaction-form"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useState } from "react"

interface EditTransactionModalProps {
  transaction: {
    id: string
    amount: number
    description: string
    category_id: string
    type: 'income' | 'expense'
    date: string
  }
  trigger?: React.ReactNode
  onTransactionUpdated?: () => void
}

export function EditTransactionModal({ transaction, trigger, onTransactionUpdated }: EditTransactionModalProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          description: data.description,
          category_id: data.category,
          type: data.type,
          date: data.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update transaction')
      }

      const result = await response.json()
      console.log("Transaction updated:", result)
      setOpen(false)
      onTransactionUpdated?.()
    } catch (error: any) {
      console.error("Error updating transaction:", error)
      throw error // Re-throw to let the form handle the error
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-blue-50 hover:text-blue-600">
      <Edit className="h-4 w-4" />
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl">Edit Transaction</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Update the transaction details
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          showCard={false}
          initialData={{
            amount: transaction.amount.toString(),
            description: transaction.description,
            category: transaction.category_id,
            type: transaction.type,
            date: new Date(transaction.date),
          }}
          isEdit={true}
        />
      </DialogContent>
    </Dialog>
  )
}

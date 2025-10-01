"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { BudgetForm } from "@/components/forms/budget-form"
import type { BudgetPeriod } from "@/types"
import { formatDateForDB } from "@/lib/date-utils"
import { fetchWithCsrf } from "@/lib/csrf-client"

interface BudgetFormData {
  category_id: string
  amount: string
  period: BudgetPeriod
  start_date: Date
}

interface AddBudgetModalProps {
  trigger?: React.ReactNode
  onBudgetAdded?: () => void
}

export function AddBudgetModal({ trigger, onBudgetAdded }: AddBudgetModalProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      const response = await fetchWithCsrf('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: data.category_id,
          amount: parseFloat(data.amount),
          period: data.period,
          start_date: formatDateForDB(data.start_date), // Format without timezone conversion
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create budget')
      }

      const result = await response.json()
      console.log("Budget created:", result)

      setOpen(false)
      onBudgetAdded?.()
    } catch (error: any) {
      console.error("Error creating budget:", error)
      throw error // Re-throw to let BudgetForm handle the toast
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const defaultTrigger = (
    <Button className="w-full cursor-pointer">
      <Plus className="mr-2 h-4 w-4" />
      Add Budget
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[95vw] p-4 sm:p-6" showCloseButton={false}>
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="text-xl sm:text-2xl">Add New Budget</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Set a spending limit for a category to track your expenses
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          showCard={false}
        />
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit } from "lucide-react"
import { useState } from "react"
import { BudgetForm } from "@/components/forms/budget-form"
import type { Budget, BudgetPeriod } from "@/types"
import { formatDateForDB } from "@/lib/date-utils"
import { fetchWithCsrf } from "@/lib/csrf-client"

interface BudgetFormData {
  category_id: string
  amount: string
  period: BudgetPeriod
  start_date: Date
}

interface EditBudgetModalProps {
  budget: Budget
  trigger?: React.ReactNode
  onBudgetUpdated?: () => void
}

export function EditBudgetModal({ budget, trigger, onBudgetUpdated }: EditBudgetModalProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      const response = await fetchWithCsrf(`/api/budgets/${budget.id}`, {
        method: 'PUT',
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
        throw new Error(errorData.error || 'Failed to update budget')
      }

      const result = await response.json()
      console.log("Budget updated:", result)

      setOpen(false)
      onBudgetUpdated?.()
    } catch (error: any) {
      console.error("Error updating budget:", error)
      throw error // Re-throw to let BudgetForm handle the toast
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              {trigger || (
                <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-colors h-9 w-9">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit budget</p>
          </TooltipContent>
          <DialogContent className="max-w-2xl w-[95vw] p-4 sm:p-6" showCloseButton={false}>
            <DialogHeader className="pb-4 sm:pb-6">
              <DialogTitle className="text-xl sm:text-2xl">Edit Budget</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Update your budget details and spending limits
              </DialogDescription>
            </DialogHeader>
            <BudgetForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              showCard={false}
              isEdit={true}
              initialData={{
                category_id: budget.category_id || "",
                amount: budget.amount.toString(),
                period: budget.period,
                start_date: new Date(budget.start_date),
              }}
            />
          </DialogContent>
        </Dialog>
      </Tooltip>
    </TooltipProvider>
  )
}

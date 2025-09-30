"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trash2 } from "lucide-react"
import { LoadingButton } from "@/components/ui/loading-button"
import { toast } from "@/hooks/use-toast"
import { useDeleteTransaction } from "@/hooks/use-transactions"
import { useDeleteCategory } from "@/hooks/use-categories"

interface DeleteConfirmationDialogProps {
  trigger?: React.ReactNode
  title: string
  description: string
  itemName: string
  onConfirm: () => Promise<void> | void
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  trigger,
  title,
  description,
  itemName,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error("Error during deletion:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              {trigger || (
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors h-9 w-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                {title}
              </DialogTitle>
              <DialogDescription className="text-left">
                {description}
                <br />
                <br />
                <strong className="text-foreground">"{itemName}"</strong>
                <br />
                <br />
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isDeleting || isLoading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <LoadingButton
                variant="destructive"
                onClick={handleConfirm}
                loading={isDeleting || isLoading}
                className="cursor-pointer"
              >
                Delete
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tooltip>
    </TooltipProvider>
  )
}

// Specific delete dialog components for different entities
interface DeleteBudgetDialogProps {
  budgetId: string
  categoryName: string
  onDeleted: () => void
  trigger?: React.ReactNode
}

export function DeleteBudgetDialog({
  budgetId,
  categoryName,
  onDeleted,
  trigger,
}: DeleteBudgetDialogProps) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete budget')
      }

      toast.success({
        title: "Budget deleted",
        description: `Budget for ${categoryName} has been deleted successfully.`,
      })

      onDeleted()
    } catch (error: any) {
      console.error('Error deleting budget:', error)
      toast.error({
        title: "Error",
        description: error.message || "Failed to delete budget. Please try again.",
      })
      throw error // Re-throw to let the dialog handle loading state
    }
  }

  return (
    <DeleteConfirmationDialog
      trigger={trigger}
      title="Delete Budget"
      description="Are you sure you want to delete this budget?"
      itemName={`${categoryName} Budget`}
      onConfirm={handleDelete}
    />
  )
}

interface DeleteTransactionDialogProps {
  transactionId: string
  transactionDescription: string
  onDeleted: () => void
  trigger?: React.ReactNode
}

export function DeleteTransactionDialog({
  transactionId,
  transactionDescription,
  onDeleted,
  trigger,
}: DeleteTransactionDialogProps) {
  const deleteTransaction = useDeleteTransaction()

  const handleDelete = async () => {
    try {
      await deleteTransaction.mutateAsync(transactionId)

      toast.success({
        title: "Transaction deleted",
        description: `Transaction "${transactionDescription}" has been deleted successfully.`,
      })

      onDeleted()
    } catch (error: any) {
      console.error('Error deleting transaction:', error)
      toast.error({
        title: "Error",
        description: error.message || "Failed to delete transaction. Please try again.",
      })
      throw error // Re-throw to let the dialog handle loading state
    }
  }

  return (
    <DeleteConfirmationDialog
      trigger={trigger}
      title="Delete Transaction"
      description="Are you sure you want to delete this transaction?"
      itemName={transactionDescription || 'Transaction'}
      onConfirm={handleDelete}
    />
  )
}

interface DeleteCategoryDialogProps {
  categoryId: string
  categoryName: string
  onDeleted: () => void
  trigger?: React.ReactNode
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  onDeleted,
  trigger,
}: DeleteCategoryDialogProps) {
  const deleteCategory = useDeleteCategory()

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(categoryId)

      toast.success({
        title: "Category deleted",
        description: `Category "${categoryName}" has been deleted successfully.`,
      })

      onDeleted()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error({
        title: "Error",
        description: error.message || "Failed to delete category. Please try again.",
      })
      throw error // Re-throw to let the dialog handle loading state
    }
  }

  return (
    <DeleteConfirmationDialog
      trigger={trigger}
      title="Delete Category"
      description="Are you sure you want to delete this category? This will also delete all associated transactions and budgets."
      itemName={categoryName}
      onConfirm={handleDelete}
    />
  )
}

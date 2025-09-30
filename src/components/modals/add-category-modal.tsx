"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CategoryForm } from "@/components/forms/category-form"
import { Button } from "@/components/ui/button"
import { Plus, Tag } from "lucide-react"
import { useState } from "react"
import type { TransactionType } from "@/types"
import { useCreateCategory } from "@/hooks/use-categories"

interface CategoryFormData {
  name: string
  type: TransactionType
  color?: string
  icon?: string
}

interface AddCategoryModalProps {
  trigger?: React.ReactNode
  onCategoryAdded?: () => void
}

export function AddCategoryModal({ trigger, onCategoryAdded }: AddCategoryModalProps) {
  const [open, setOpen] = useState(false)
  const createCategory = useCreateCategory()

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await createCategory.mutateAsync({
        name: data.name,
        type: data.type,
        color: data.color || null,
        icon: data.icon || null,
      })

      console.log("Category created successfully")
      setOpen(false)
      onCategoryAdded?.()
    } catch (error: any) {
      console.error("Error creating category:", error)
      throw error // Re-throw to let the form handle the error
    }
  }

  const defaultTrigger = (
    <Button className="cursor-pointer">
      <Plus className="mr-2 h-4 w-4" />
      Add Category
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Create New Category
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Create a new category to organize your income and expense transactions
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          showCard={false}
        />
      </DialogContent>
    </Dialog>
  )
}

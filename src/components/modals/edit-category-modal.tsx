"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CategoryForm } from "@/components/forms/category-form"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit } from "lucide-react"
import { useState } from "react"
import type { Category, TransactionType } from "@/types"
import { useUpdateCategory } from "@/hooks/use-categories"

interface CategoryFormData {
  name: string
  type: TransactionType
  color?: string
  icon?: string
}

interface EditCategoryModalProps {
  category: Category
  trigger?: React.ReactNode
  onCategoryUpdated?: () => void
}

export function EditCategoryModal({ category, trigger, onCategoryUpdated }: EditCategoryModalProps) {
  const [open, setOpen] = useState(false)
  const updateCategory = useUpdateCategory()

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        category: {
          name: data.name,
          type: data.type,
          color: data.color || null,
          icon: data.icon || null,
        }
      })

      console.log("Category updated successfully")
      setOpen(false)
      onCategoryUpdated?.()
    } catch (error) {
      console.error("Error updating category:", error)
      throw error // Re-throw to let the form handle the error
    }
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
            <p>Edit category</p>
          </TooltipContent>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl sm:text-2xl">Edit Category</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Update the category details
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
              showCard={false}
              initialData={{
                name: category.name,
                type: category.type,
                color: category.color || '',
                icon: category.icon || '🏷️',
              }}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>
      </Tooltip>
    </TooltipProvider>
  )
}

"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CategoryForm } from "@/components/forms/category-form"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useState } from "react"

interface EditCategoryModalProps {
  category: {
    id: string
    name: string
    type: 'income' | 'expense'
    color?: string
    icon?: string
  }
  trigger?: React.ReactNode
  onCategoryUpdated?: () => void
}

export function EditCategoryModal({ category, trigger, onCategoryUpdated }: EditCategoryModalProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          color: data.color,
          icon: data.icon,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update category')
      }

      const result = await response.json()
      console.log("Category updated:", result)
      setOpen(false)
      onCategoryUpdated?.()
    } catch (error: any) {
      console.error("Error updating category:", error)
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
  )
}

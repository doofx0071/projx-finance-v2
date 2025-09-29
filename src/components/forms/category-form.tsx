"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tag, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  type: z.enum(["income", "expense"]),
  color: z.string().optional(),
  icon: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  onSubmit?: (data: CategoryFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<CategoryFormData>
  isEdit?: boolean
  showCard?: boolean
}

// Predefined colors for categories
const CATEGORY_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#64748b", // slate
  "#78716c", // stone
]

// Predefined icons for categories
const CATEGORY_ICONS = [
  "🏷️", "💰", "🏠", "🚗", "🍔", "🛒", "💊", "🎓", "🎮", "✈️",
  "📱", "💡", "🎵", "👕", "⛽", "🍕", "☕", "🎬", "📚", "💻"
]

export function CategoryForm({ onSubmit, onCancel, initialData, isEdit = false, showCard = true }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "expense",
      color: initialData?.color || CATEGORY_COLORS[0],
      icon: initialData?.icon || "🏷️",
    },
  })

  const handleSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(data)
      }

      toast.success({
        title: isEdit ? "Category updated" : "Category created",
        description: `${data.icon} ${data.name} (${data.type})`,
      })

      if (!isEdit) {
        form.reset()
      }
    } catch (error) {
      toast.error({
        title: "Error",
        description: isEdit ? "Failed to update category" : "Failed to create category",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
        {/* Name and Type Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  Category Name
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm text-white">Examples:</p>
                        <p className="text-xs text-white mt-1">
                          <strong>Income:</strong> Salary, Freelance, Business, Investments<br/>
                          <strong>Expense:</strong> Food, Transportation, Utilities, Entertainment, Shopping
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter category name..."
                    className="h-10 sm:h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">💰 Income</SelectItem>
                    <SelectItem value="expense">💸 Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Icon Selection */}
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Icon</FormLabel>
              <FormControl>
                <div className="grid grid-cols-10 gap-2">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => field.onChange(icon)}
                      className={`p-2 text-lg border rounded-md hover:bg-accent cursor-pointer transition-colors flex items-center justify-center ${
                        field.value === icon ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color Selection */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Color</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${
                        field.value === color ? 'border-foreground scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t">
          <LoadingButton 
            type="submit" 
            loading={isSubmitting} 
            className="w-full sm:flex-1 h-10 sm:h-11 cursor-pointer"
          >
            {isEdit ? "Update Category" : "Create Category"}
          </LoadingButton>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="w-full sm:flex-1 h-10 sm:h-11 cursor-pointer"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )

  if (showCard) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {isEdit ? "Edit Category" : "Create New Category"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isEdit ? "Update your category details" : "Create a new category to organize your transactions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {formContent}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      {formContent}
    </div>
  )
}

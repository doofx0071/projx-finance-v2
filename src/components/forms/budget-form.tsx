"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/use-categories"

const budgetSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  period: z.enum(["weekly", "monthly", "yearly"]),
  start_date: z.date({
    required_error: "Start date is required",
  }),
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  onSubmit?: (data: BudgetFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<BudgetFormData>
  isEdit?: boolean
  showCard?: boolean
}

export function BudgetForm({ onSubmit, onCancel, initialData, isEdit = false, showCard = true }: BudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: initialData?.category_id || "",
      amount: initialData?.amount || "",
      period: initialData?.period || "monthly",
      start_date: initialData?.start_date || new Date(),
    },
  })

  const handleSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(data)
      }

      toast.success({
        title: isEdit ? "Budget updated" : "Budget created",
        description: `₱${data.amount} budget for ${categories.find(c => c.id === data.category_id)?.name || 'category'} (${data.period})`,
      })

      if (!isEdit) {
        form.reset()
      }
    } catch (error) {
      toast.error({
        title: "Error",
        description: isEdit ? "Failed to update budget" : "Failed to create budget",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
        {/* Category and Amount Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={categoriesLoading}>
                  <FormControl>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Amount (₱)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    className="cursor-pointer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Period and Start Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weekly" className="cursor-pointer">Weekly</SelectItem>
                    <SelectItem value="monthly" className="cursor-pointer">Monthly</SelectItem>
                    <SelectItem value="yearly" className="cursor-pointer">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal cursor-pointer",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t">
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            className="w-full sm:flex-1 h-10 sm:h-11 cursor-pointer"
          >
            {isEdit ? "Update Budget" : "Create Budget"}
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

  if (!showCard) {
    return formContent
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl">{isEdit ? "Edit Budget" : "Create New Budget"}</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {isEdit ? "Update your budget details" : "Set a spending limit for a category"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {formContent}
        </CardContent>
      </Card>
    </div>
  )
}

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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LoadingButton } from "@/components/ui/loading-button"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useCategories } from "@/hooks/use-categories"
import { useScreenReaderAnnounce } from "@/hooks/use-accessibility"

const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  description: z.string().min(1, "Description is required").max(255, "Description is too long"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["income", "expense"]),
  date: z.date({
    required_error: "Date is required",
  }),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  onSubmit?: (data: TransactionFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<TransactionFormData>
  isEdit?: boolean
  showCard?: boolean // New prop to control card wrapper
}

export function TransactionForm({ onSubmit, onCancel, initialData, isEdit = false, showCard = true }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories()
  const announce = useScreenReaderAnnounce()

  // Transform categories for select options
  const categories = categoriesData.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: initialData?.amount || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      type: initialData?.type || "expense",
      date: initialData?.date || new Date(),
    },
  })

  const handleSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    announce("Submitting transaction...", "polite")

    try {
      if (onSubmit) {
        await onSubmit(data)
      }

      const successMessage = isEdit ? "Transaction updated successfully" : "Transaction added successfully"
      announce(successMessage, "polite")

      toast.success({
        title: isEdit ? "Transaction updated" : "Transaction added",
        description: `${data.type === "income" ? "+" : "-"}${data.amount} ${data.description}`,
      })

      if (!isEdit) {
        form.reset()
      }
    } catch (error) {
      const errorMessage = isEdit ? "Failed to update transaction" : "Failed to add transaction"
      announce(errorMessage, "assertive")

      toast.error({
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 sm:space-y-6"
        aria-busy={isSubmitting}
        aria-label={isEdit ? "Edit transaction form" : "Add transaction form"}
      >
        {/* Type and Amount Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 sm:top-3 text-sm text-muted-foreground font-medium">₱</span>
                    <Input
                      placeholder="0.00"
                      className="pl-9 h-10 sm:h-11 text-base sm:text-lg"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter transaction description..."
                  className="resize-none min-h-[60px] sm:min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : categories.length === 0
                            ? "No categories available"
                            : "Select category"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        <p className="mb-2">No categories available</p>
                        <p className="text-xs">Please create a category first</p>
                      </div>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 sm:h-11 pl-3 text-left font-normal cursor-pointer",
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
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(23, 59, 59, 999) // Set to end of today
                        return date > today || date < new Date("1900-01-01")
                      }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category Warning Message - Moved outside the grid */}
        {categories.length === 0 && !categoriesLoading && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800 mb-2">
              You need to create at least one category before adding transactions.
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
              onClick={() => window.location.href = '/categories'}
            >
              Go to Categories →
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t">
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            className="w-full sm:flex-1 h-10 sm:h-11 cursor-pointer"
          >
            {isEdit ? "Update Transaction" : "Add Transaction"}
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
            <CardTitle className="text-xl sm:text-2xl">{isEdit ? "Edit Transaction" : "Add New Transaction"}</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isEdit ? "Update your transaction details" : "Record a new income or expense"}
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
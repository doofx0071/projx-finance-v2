"use client"

import { useState } from "react"
import { CalendarIcon, FilterIcon, XIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"

export interface TransactionFilters {
  search?: string
  type?: 'income' | 'expense' | 'all'
  category_id?: string
  start_date?: string
  end_date?: string
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  categories?: Category[]
}

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  categories = [],
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.start_date ? new Date(filters.start_date) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.end_date ? new Date(filters.end_date) : undefined
  )

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as 'income' | 'expense'),
    })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category_id: value === 'all' ? undefined : value,
    })
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    onFiltersChange({
      ...filters,
      start_date: date ? format(date, 'yyyy-MM-dd') : undefined,
    })
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    onFiltersChange({
      ...filters,
      end_date: date ? format(date, 'yyyy-MM-dd') : undefined,
    })
  }

  const handleClearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onFiltersChange({})
  }

  const activeFiltersCount = [
    filters.search,
    filters.type,
    filters.category_id,
    filters.start_date,
    filters.end_date,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar - Always Visible */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10"
          />
        </div>
        <Button
          variant={isOpen ? "default" : "outline"}
          size="default"
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            className="cursor-pointer"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters - Collapsible */}
      {isOpen && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger id="type-filter" className="cursor-pointer">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All types</SelectItem>
                    <SelectItem value="income" className="cursor-pointer">Income</SelectItem>
                    <SelectItem value="expense" className="cursor-pointer">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select
                  value={filters.category_id || 'all'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category-filter" className="cursor-pointer">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="cursor-pointer"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date Filter */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal cursor-pointer",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      disabled={(date) =>
                        date > new Date() || (endDate ? date > endDate : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date Filter */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal cursor-pointer",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) =>
                        date > new Date() || (startDate ? date < startDate : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {filters.type && (
                      <Badge variant="secondary">
                        Type: {filters.type}
                      </Badge>
                    )}
                    {filters.category_id && (
                      <Badge variant="secondary">
                        Category: {categories.find(c => c.id === filters.category_id)?.name || 'Unknown'}
                      </Badge>
                    )}
                    {filters.start_date && (
                      <Badge variant="secondary">
                        From: {format(new Date(filters.start_date), 'PP')}
                      </Badge>
                    )}
                    {filters.end_date && (
                      <Badge variant="secondary">
                        To: {format(new Date(filters.end_date), 'PP')}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="cursor-pointer"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


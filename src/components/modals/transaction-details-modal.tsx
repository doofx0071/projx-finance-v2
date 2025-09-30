"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, FileText, Tag, Eye } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useState } from "react"
import type { TransactionWithCategory } from "@/types"

interface TransactionDetailsModalProps {
  transaction: TransactionWithCategory
  trigger?: React.ReactNode | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TransactionDetailsModal({
  transaction,
  trigger,
  open: controlledOpen,
  onOpenChange
}: TransactionDetailsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-blue-50 hover:text-blue-600">
      <Eye className="h-4 w-4" />
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6" showCloseButton={false}>
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Transaction Details
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Complete information about this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Main Transaction Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Amount
                  </span>
                  <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  {transaction.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>

            {/* Category */}
            {transaction.categories && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: transaction.categories.color || '#gray' }}
                    />
                    <span className="text-lg font-medium">
                      {transaction.categories.icon} {transaction.categories.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Date Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transaction Date:</span>
                  <span className="font-medium">{formatDate(transaction.date)}</span>
                </div>
                {transaction.created_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-sm">{formatDate(transaction.created_at)}</span>
                    </div>
                  </>
                )}
                {transaction.updated_at && transaction.updated_at !== transaction.created_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="text-sm">{formatDate(transaction.updated_at)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>


          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)} className="cursor-pointer">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

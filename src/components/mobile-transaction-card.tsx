"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EditTransactionModal } from "@/components/modals/edit-transaction-modal"
import { TransactionDetailsModal } from "@/components/modals/transaction-details-modal"
import { DeleteTransactionDialog } from "@/components/ui/delete-confirmation-dialog"
import type { TransactionWithCategory } from "@/types"

interface MobileTransactionCardProps {
  transaction: TransactionWithCategory
  onUpdate?: () => void
  onDelete?: () => void
}

export function MobileTransactionCard({
  transaction,
  onUpdate,
  onDelete,
}: MobileTransactionCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setShowDetailsModal(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left side - Category color and info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 mt-1"
                style={{
                  backgroundColor: transaction.categories?.color || "#6b7280",
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate">
                    {transaction.description}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {transaction.categories?.name || "Uncategorized"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={
                      transaction.type === "income" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {transaction.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Amount and actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div
                className={`text-lg font-bold ${
                  transaction.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Transaction actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDetailsModal(true)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <EditTransactionModal
                    transaction={transaction}
                    trigger={
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    }
                    onTransactionUpdated={onUpdate}
                  />
                  <DeleteTransactionDialog
                    transactionId={transaction.id}
                    transactionDescription={transaction.description || "Transaction"}
                    onDeleted={onDelete || (() => {})}
                    trigger={
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showDetailsModal && (
        <TransactionDetailsModal
          transaction={transaction}
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
        />
      )}
    </>
  )
}


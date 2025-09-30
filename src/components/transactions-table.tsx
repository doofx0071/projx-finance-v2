"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EditTransactionModal } from "@/components/modals/edit-transaction-modal"
import { TransactionDetailsModal } from "@/components/modals/transaction-details-modal"
import { DeleteTransactionDialog } from "@/components/ui/delete-confirmation-dialog"
import type { TransactionWithCategory } from "@/types"

const columns: ColumnDef<TransactionWithCategory>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => formatDate(row.getValue("date")),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "categories",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("categories") as TransactionWithCategory['categories']
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category?.color || '#6b7280' }}
          />
          <span>{category?.name || 'Uncategorized'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.getValue("type") === "income" ? "default" : "secondary"}>
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      const type = row.getValue("type") as string
      return (
        <div className={`font-medium ${type === "income" ? "text-green-600" : "text-red-600"}`}>
          {type === "income" ? "+" : "-"}
          {formatCurrency(amount)}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(transaction.id)}
            >
              Copy transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit transaction</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete transaction</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface TransactionsTableProps {
  data?: TransactionWithCategory[]
  onTransactionUpdated?: () => void
  onTransactionDeleted?: () => void
}

export function TransactionsTable({
  data = [],
  onTransactionUpdated,
  onTransactionDeleted
}: TransactionsTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithCategory | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const handleRowClick = (transaction: TransactionWithCategory) => {
    setSelectedTransaction(transaction)
    setDetailsModalOpen(true)
  }
  // Create columns with callback functions
  const columnsWithActions: ColumnDef<TransactionWithCategory>[] = [
    ...columns.slice(0, -1), // All columns except the last one (actions)
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <EditTransactionModal
                transaction={{
                  id: transaction.id,
                  amount: transaction.amount,
                  description: transaction.description || '',
                  category_id: transaction.categories?.id || '',
                  type: transaction.type,
                  date: transaction.date,
                }}
                onTransactionUpdated={onTransactionUpdated}
                trigger={
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-orange-50 hover:!text-orange-600 transition-colors"
                    onSelect={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Transaction
                  </DropdownMenuItem>
                }
              />
              <DeleteTransactionDialog
                transactionId={transaction.id}
                transactionDescription={transaction.description || 'Transaction'}
                onDeleted={() => onTransactionDeleted?.()}
                trigger={
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-red-50 hover:!text-red-600 transition-colors"
                    onSelect={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Transaction
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]



  return (
    <>
      <DataTable
        columns={columnsWithActions}
        data={data}
        searchKey="description"
        searchPlaceholder="Search transactions..."
        onRowClick={handleRowClick}
      />

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          open={detailsModalOpen}
          onOpenChange={(open) => {
            setDetailsModalOpen(open)
            if (!open) {
              setSelectedTransaction(null)
            }
          }}
        />
      )}
    </>
  )
}
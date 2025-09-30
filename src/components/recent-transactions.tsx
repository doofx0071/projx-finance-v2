import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import type { TransactionWithCategory } from "@/types"

interface RecentTransactionsProps {
  transactions?: TransactionWithCategory[]
}

export function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  // Get the 5 most recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {recentTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt="Transaction" />
            <AvatarFallback>
              {transaction.type === "income" ? "💰" : "💸"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.categories?.name || 'Uncategorized'}
            </p>
          </div>
          <div className={`ml-auto font-medium ${
            transaction.type === "income" ? "text-green-600" : "text-red-600"
          }`}>
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { sampleTransactions, formatCurrency, getCategoryName } from "@/lib/sample-data"

export function RecentTransactions() {
  // Get the 5 most recent transactions
  const recentTransactions = sampleTransactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
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
              {getCategoryName(transaction.category)}
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
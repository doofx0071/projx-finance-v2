export interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: "income" | "expense"
  date: Date
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: "income" | "expense"
}

// Sample transaction data
export const sampleTransactions: Transaction[] = [
  {
    id: "1",
    amount: 2500.00,
    description: "Monthly Salary",
    category: "salary",
    type: "income",
    date: new Date("2024-01-15"),
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    amount: 45.50,
    description: "Grocery Shopping",
    category: "food",
    type: "expense",
    date: new Date("2024-01-14"),
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    amount: 120.00,
    description: "Electric Bill",
    category: "bills",
    type: "expense",
    date: new Date("2024-01-13"),
    createdAt: new Date("2024-01-13"),
  },
  {
    id: "4",
    amount: 85.00,
    description: "Gas Station",
    category: "transport",
    type: "expense",
    date: new Date("2024-01-12"),
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    amount: 150.00,
    description: "Freelance Project",
    category: "freelance",
    type: "income",
    date: new Date("2024-01-11"),
    createdAt: new Date("2024-01-11"),
  },
  {
    id: "6",
    amount: 25.99,
    description: "Netflix Subscription",
    category: "entertainment",
    type: "expense",
    date: new Date("2024-01-10"),
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "7",
    amount: 75.00,
    description: "Doctor Visit",
    category: "healthcare",
    type: "expense",
    date: new Date("2024-01-09"),
    createdAt: new Date("2024-01-09"),
  },
  {
    id: "8",
    amount: 35.00,
    description: "Coffee Shop",
    category: "food",
    type: "expense",
    date: new Date("2024-01-08"),
    createdAt: new Date("2024-01-08"),
  },
]

// Sample category data
export const sampleCategories: Category[] = [
  { id: "1", name: "Food & Dining", color: "#FF6B6B", icon: "🍽️", type: "expense" },
  { id: "2", name: "Transportation", color: "#4ECDC4", icon: "🚗", type: "expense" },
  { id: "3", name: "Entertainment", color: "#45B7D1", icon: "🎬", type: "expense" },
  { id: "4", name: "Bills & Utilities", color: "#96CEB4", icon: "💡", type: "expense" },
  { id: "5", name: "Healthcare", color: "#FFEAA7", icon: "🏥", type: "expense" },
  { id: "6", name: "Education", color: "#DDA0DD", icon: "📚", type: "expense" },
  { id: "7", name: "Salary", color: "#98D8C8", icon: "💼", type: "income" },
  { id: "8", name: "Freelance", color: "#F7DC6F", icon: "💻", type: "income" },
  { id: "9", name: "Investment", color: "#BB8FCE", icon: "📈", type: "income" },
]

// Helper functions
export const getCategoryById = (id: string): Category | undefined => {
  return sampleCategories.find(cat => cat.id === id)
}

export const getCategoryName = (id: string): string => {
  return getCategoryById(id)?.name || "Unknown"
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
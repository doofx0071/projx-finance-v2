"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface OverviewProps {
  transactions?: Array<{
    amount: number
    type: 'income' | 'expense'
    date: string
  }>
}

export function Overview({ transactions = [] }: OverviewProps) {
  // Generate chart data from transactions
  const generateChartData = () => {
    const currentYear = new Date().getFullYear()
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    // Initialize data for all months
    const chartData = months.map((month) => ({
      name: month,
      income: 0,
      expense: 0,
      total: 0,
    }))

    // Process transactions
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      if (transactionDate.getFullYear() === currentYear) {
        const monthIndex = transactionDate.getMonth()
        const amount = Number(transaction.amount)

        if (transaction.type === 'income') {
          chartData[monthIndex].income += amount
        } else {
          chartData[monthIndex].expense += amount
        }

        // Calculate net total (income - expense)
        chartData[monthIndex].total = chartData[monthIndex].income - chartData[monthIndex].expense
      }
    })

    return chartData
  }

  const data = generateChartData()
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₱${value}`}
        />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
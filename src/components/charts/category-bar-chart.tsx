"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CategoryData {
  id: string
  name: string
  total: number
  count: number
  color?: string
  icon?: string
}

interface CategoryBarChartProps {
  data: CategoryData[]
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  // Prepare data for the bar chart
  const chartData = data.map((category) => ({
    name: category.name.length > 10 ? category.name.substring(0, 10) + '...' : category.name,
    fullName: category.name,
    total: category.total,
    count: category.count,
    color: category.color || '#3b82f6',
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">
            ₱{data.total.toLocaleString()} ({data.count} transactions)
          </p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No category data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}

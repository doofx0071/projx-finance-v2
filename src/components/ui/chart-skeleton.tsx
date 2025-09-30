import { Skeleton } from '@/components/ui/skeleton'

/**
 * ChartSkeleton Component
 * 
 * A loading skeleton for chart components that provides visual feedback
 * while data is being fetched. Improves perceived performance and UX.
 * 
 * @example
 * ```tsx
 * {isLoading ? (
 *   <ChartSkeleton />
 * ) : (
 *   <ResponsiveContainer>
 *     <BarChart data={data}>...</BarChart>
 *   </ResponsiveContainer>
 * )}
 * ```
 */
export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      {/* Main chart area */}
      <Skeleton className="h-[300px] w-full rounded-lg" />
      
      {/* Legend/labels area */}
      <div className="flex justify-between items-center px-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  )
}

/**
 * ChartSkeletonSmall Component
 * 
 * A smaller variant for compact chart displays (e.g., cards, widgets)
 */
export function ChartSkeletonSmall() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="flex justify-between items-center px-2">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  )
}

/**
 * ChartSkeletonLarge Component
 * 
 * A larger variant for full-page chart displays
 */
export function ChartSkeletonLarge() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[400px] w-full rounded-lg" />
      <div className="flex justify-between items-center px-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
    </div>
  )
}

/**
 * PieChartSkeleton Component
 * 
 * Specialized skeleton for pie/donut charts with circular shape
 */
export function PieChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Skeleton className="h-[300px] w-[300px] rounded-full" />
      </div>
      <div className="flex justify-center gap-4">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  )
}

/**
 * BarChartSkeleton Component
 * 
 * Specialized skeleton for bar charts with vertical bars
 */
export function BarChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-around h-[300px] gap-2 px-4">
        <Skeleton className="h-[60%] w-full rounded-t-lg" />
        <Skeleton className="h-[80%] w-full rounded-t-lg" />
        <Skeleton className="h-[45%] w-full rounded-t-lg" />
        <Skeleton className="h-[90%] w-full rounded-t-lg" />
        <Skeleton className="h-[70%] w-full rounded-t-lg" />
        <Skeleton className="h-[55%] w-full rounded-t-lg" />
      </div>
      <div className="flex justify-between items-center px-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  )
}

/**
 * LineChartSkeleton Component
 * 
 * Specialized skeleton for line charts with wave pattern
 */
export function LineChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="relative h-[300px] w-full">
        <Skeleton className="absolute inset-0 rounded-lg" />
        {/* Simulate line chart pattern */}
        <div className="absolute inset-0 flex items-center justify-around px-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-2 w-2 rounded-full" 
              style={{ 
                marginTop: `${Math.random() * 200}px` 
              }} 
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center px-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  )
}


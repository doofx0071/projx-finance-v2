import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  label?: string
}

function Skeleton({ className, label = "Loading content...", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      role="status"
      aria-busy="true"
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}

export { Skeleton }

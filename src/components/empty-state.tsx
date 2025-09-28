import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Receipt, Tag, FileText } from "lucide-react"

interface EmptyStateProps {
  iconName?: "receipt" | "tag" | "file-text"
  title: string
  description: string
  actionLabel?: string
  className?: string
}

export function EmptyState({
  iconName = "receipt",
  title,
  description,
  actionLabel,
  className = ""
}: EmptyStateProps) {
  const getIcon = () => {
    switch (iconName) {
      case "tag":
        return <Tag className="h-8 w-8 text-muted-foreground" />
      case "file-text":
        return <FileText className="h-8 w-8 text-muted-foreground" />
      default:
        return <Receipt className="h-8 w-8 text-muted-foreground" />
    }
  }

  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          {getIcon()}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
        {actionLabel && (
          <Button>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
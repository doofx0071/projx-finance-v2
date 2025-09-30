import { Metadata } from 'next'
import { TrashBinContent } from '@/components/trash/trash-bin-content'

export const metadata: Metadata = {
  title: 'Trash Bin | PHPinancia',
  description: 'View and restore deleted items',
}

export default function TrashPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trash Bin</h2>
          <p className="text-muted-foreground">
            View and restore deleted transactions, categories, and budgets
          </p>
        </div>
      </div>
      <TrashBinContent />
    </div>
  )
}


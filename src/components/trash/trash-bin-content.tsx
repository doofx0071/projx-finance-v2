'use client'

import { useState } from 'react'
import { useDeletedItems, useRestoreItem, usePermanentlyDeleteItem } from '@/hooks/use-trash'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from '@/hooks/use-toast'
import { Trash2, RotateCcw, AlertCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function TrashBinContent() {
  const { data, isLoading, error } = useDeletedItems()
  const restoreItem = useRestoreItem()
  const permanentlyDelete = usePermanentlyDeleteItem()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [itemToRestore, setItemToRestore] = useState<{ id: string; name: string } | null>(null)

  const handleRestoreConfirm = async () => {
    if (!itemToRestore) return

    try {
      await restoreItem.mutateAsync(itemToRestore.id)
      toast.success({
        title: 'Item restored',
        description: `"${itemToRestore.name}" has been restored successfully.`,
      })
      setRestoreDialogOpen(false)
      setItemToRestore(null)
    } catch (error: any) {
      console.error('Error restoring item:', error)
      toast.error({
        title: 'Error',
        description: error.message || 'Failed to restore item. Please try again.',
      })
    }
  }

  const openRestoreDialog = (id: string, name: string) => {
    setItemToRestore({ id, name })
    setRestoreDialogOpen(true)
  }

  const handlePermanentDelete = async () => {
    if (!itemToDelete) return

    try {
      await permanentlyDelete.mutateAsync(itemToDelete)
      toast.success({
        title: 'Item permanently deleted',
        description: 'The item has been permanently removed from the database.',
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error: any) {
      console.error('Error permanently deleting item:', error)
      toast.error({
        title: 'Error',
        description: error.message || 'Failed to delete item. Please try again.',
      })
    }
  }

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
            <TabsTrigger value="transactions" className="cursor-pointer">Transactions</TabsTrigger>
            <TabsTrigger value="categories" className="cursor-pointer">Categories</TabsTrigger>
            <TabsTrigger value="budgets" className="cursor-pointer">Budgets</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-64 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-9 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading trash</h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load deleted items'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalItems = data?.total || 0
  const transactions = data?.grouped.transactions || []
  const categories = data?.grouped.categories || []
  const budgets = data?.grouped.budgets || []

  if (totalItems === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
            <p className="text-muted-foreground">
              Deleted items will appear here and can be restored
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="cursor-pointer">
            All ({totalItems})
          </TabsTrigger>
          <TabsTrigger value="transactions" className="cursor-pointer">
            Transactions ({transactions.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="cursor-pointer">
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="budgets" className="cursor-pointer">
            Budgets ({budgets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deleted Transactions</CardTitle>
                <CardDescription>{transactions.length} items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.map((item) => (
                  <DeletedItemCard
                    key={item.id}
                    item={item}
                    onRestore={openRestoreDialog}
                    onDelete={openDeleteDialog}
                    isRestoring={restoreItem.isPending}
                    isDeleting={permanentlyDelete.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deleted Categories</CardTitle>
                <CardDescription>{categories.length} items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((item) => (
                  <DeletedItemCard
                    key={item.id}
                    item={item}
                    onRestore={openRestoreDialog}
                    onDelete={openDeleteDialog}
                    isRestoring={restoreItem.isPending}
                    isDeleting={permanentlyDelete.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {budgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deleted Budgets</CardTitle>
                <CardDescription>{budgets.length} items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {budgets.map((item) => (
                  <DeletedItemCard
                    key={item.id}
                    item={item}
                    onRestore={openRestoreDialog}
                    onDelete={openDeleteDialog}
                    isRestoring={restoreItem.isPending}
                    isDeleting={permanentlyDelete.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No deleted transactions
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-3 pt-6">
                {transactions.map((item) => (
                  <DeletedItemCard
                    key={item.id}
                    item={item}
                    onRestore={openRestoreDialog}
                    onDelete={openDeleteDialog}
                    isRestoring={restoreItem.isPending}
                    isDeleting={permanentlyDelete.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No deleted categories
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-3 pt-6">
                {categories.map((item) => (
                  <DeletedItemCard
                    key={item.id}
                    item={item}
                    onRestore={openRestoreDialog}
                    onDelete={openDeleteDialog}
                    isRestoring={restoreItem.isPending}
                    isDeleting={permanentlyDelete.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          {budgets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No deleted budgets
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-3 pt-6">
                {budgets.map((item) => (
                  <DeletedItemCard
                    key={item.id}
                    item={item}
                    onRestore={openRestoreDialog}
                    onDelete={openDeleteDialog}
                    isRestoring={restoreItem.isPending}
                    isDeleting={permanentlyDelete.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{itemToRestore?.name}"? This will move the item back to its original location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface DeletedItemCardProps {
  item: any
  onRestore: (id: string, name: string) => void
  onDelete: (id: string) => void
  isRestoring: boolean
  isDeleting: boolean
}

function DeletedItemCard({ item, onRestore, onDelete, isRestoring, isDeleting }: DeletedItemCardProps) {
  const getItemName = () => {
    if (item.table_name === 'transactions') {
      return item.record_data.description || 'Unnamed transaction'
    } else if (item.table_name === 'categories') {
      return item.record_data.name || 'Unnamed category'
    } else if (item.table_name === 'budgets') {
      return `Budget: ${item.record_data.amount || '0'}`
    }
    return 'Unknown item'
  }

  const getItemDetails = () => {
    if (item.table_name === 'transactions') {
      return `${item.record_data.type === 'income' ? '+' : '-'}₱${parseFloat(item.record_data.amount).toFixed(2)}`
    } else if (item.table_name === 'categories') {
      return item.record_data.type
    } else if (item.table_name === 'budgets') {
      return item.record_data.period
    }
    return ''
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium">{getItemName()}</p>
          <Badge variant="outline" className="text-xs">
            {item.table_name.slice(0, -1)}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{getItemDetails()}</span>
          <span>•</span>
          <span>Deleted: {new Date(item.deleted_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRestore(item.id, getItemName())}
                disabled={isRestoring || isDeleting}
                className="cursor-pointer hover:bg-green-50 hover:text-green-600 transition-colors h-9 w-9"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Restore</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(item.id)}
                disabled={isRestoring || isDeleting}
                className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors h-9 w-9"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Forever</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}


"use client"

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { EditCategoryModal } from "@/components/modals/edit-category-modal"
import { DeleteCategoryDialog } from "@/components/ui/delete-confirmation-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCategories } from "@/hooks/use-categories"

export default function CategoriesPage() {
  const router = useRouter()
  const { data: categories = [], isLoading: loading } = useCategories()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(ROUTES.LOGIN)
    }
  }

  // React Query automatically handles refetching
  const handleCategoryAdded = () => {
    // React Query will automatically refetch due to cache invalidation
  }





  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Categories</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <AddCategoryModal onCategoryAdded={handleCategoryAdded} />
        </div>
      </div>
      <div className="space-y-4">
        {categories.length === 0 ? (
          <EmptyState
            iconName="tag"
            title="No categories yet"
            description="Create categories to organize your transactions. Add income sources, expense types, and budget categories to better track your finances."
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category: any) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3">
                    <span className="text-2xl">{category.icon || '🏷️'}</span>
                    <span className="text-base">{category.name}</span>
                  </CardTitle>
                  <Badge variant={category.type === 'income' ? 'default' : 'secondary'} className="text-xs px-2 py-1">
                    {category.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: category.color || '#gray' }}
                      />
                      <span className="text-sm text-muted-foreground">Color</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EditCategoryModal
                        category={category}
                        onCategoryUpdated={handleCategoryAdded}
                      />
                      <DeleteCategoryDialog
                        categoryId={category.id}
                        categoryName={category.name}
                        onDeleted={handleCategoryAdded}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { AddCategoryModal } from "@/components/modals/add-category-modal"
import { EditCategoryModal } from "@/components/modals/edit-category-modal"
import { DeleteCategoryDialog } from "@/components/ui/delete-confirmation-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
    fetchCategories()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(ROUTES.LOGIN)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
      } else {
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryAdded = () => {
    fetchCategories() // Refresh the categories list
  }





  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        </div>
        <div className="text-center py-8">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <div className="flex items-center space-x-2">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <TooltipProvider>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <EditCategoryModal
                              category={category}
                              onCategoryUpdated={handleCategoryAdded}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-white">Edit category</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DeleteCategoryDialog
                              categoryId={category.id}
                              categoryName={category.name}
                              onDeleted={handleCategoryAdded}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-white">Delete category</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
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
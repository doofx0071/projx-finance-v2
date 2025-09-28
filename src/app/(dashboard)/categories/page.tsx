import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Plus, Tag } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { toast } from "@/hooks/use-toast"

export default async function CategoriesPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <div className="flex items-center space-x-2">
          <LoadingButton>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </LoadingButton>
        </div>
      </div>
      <div className="space-y-4">
        <EmptyState
          iconName="tag"
          title="No categories yet"
          description="Create categories to organize your transactions. Add income sources, expense types, and budget categories to better track your finances."
          actionLabel="Add Category"
        />
      </div>
    </div>
  )
}
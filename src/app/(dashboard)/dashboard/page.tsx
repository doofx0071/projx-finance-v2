import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { getCurrentUserFromDB, getUserFullName } from '@/lib/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"

export default async function DashboardPage() {
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

  const supabaseUser = await getCurrentUserFromDB()
  const displayName = supabaseUser ? getUserFullName(supabaseUser) : (user.user_metadata?.first_name || 'Guest')

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱0.00</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱0.00</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱0.00</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                +0 from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                You made 0 transactions this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
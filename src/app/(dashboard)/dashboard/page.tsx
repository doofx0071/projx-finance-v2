import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { getCurrentUserFromDB, getUserFullName } from '@/lib/user'

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with User Info and Logout */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to PHPinancia
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Hello, {displayName}! Here's your financial dashboard.
              </p>
              {supabaseUser && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  User ID: {supabaseUser.id} | Email: {supabaseUser.email}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Balance
            </h3>
            <p className="text-2xl font-bold text-green-600">₱0.00</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              This Month
            </h3>
            <p className="text-2xl font-bold text-blue-600">₱0.00</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Transactions
            </h3>
            <p className="text-2xl font-bold text-purple-600">0</p>
          </div>
        </div>

        {/* User Status */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Supabase Auth:</span>
              <span className="text-green-600 font-semibold">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database User:</span>
              <span className={supabaseUser ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {supabaseUser ? "✓ Synced" : "✗ Not Synced"}
              </span>
            </div>
            {supabaseUser && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  Your account is fully set up and ready to use!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No transactions yet. Start by adding your first transaction!
          </p>
        </div>
      </div>
    </div>
  )
}
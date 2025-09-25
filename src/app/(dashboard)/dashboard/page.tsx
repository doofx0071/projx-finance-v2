import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { UserButton } from '@clerk/nextjs'
import { getCurrentUserFromDB, getUserFullName } from '@/lib/user'
import { UserSyncTest } from '@/components/user-sync-test'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect(ROUTES.LOGIN)
  }

  const clerkUser = await currentUser()
  const supabaseUser = await getCurrentUserFromDB()
  const displayName = supabaseUser ? getUserFullName(supabaseUser) : (clerkUser?.firstName || 'Guest')

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
              <UserButton />
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

        {/* User Sync Status */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            User Sync Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Clerk Integration:</span>
              <span className="text-green-600 font-semibold">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Supabase Integration:</span>
              <span className={supabaseUser ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {supabaseUser ? "✓ Synced" : "✗ Not Synced"}
              </span>
            </div>
            {!supabaseUser && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Your user data is not synced with the database. This may happen if you registered before the integration was set up.
                </p>
                <a
                  href="/api/user/sync"
                  className="inline-block mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
                >
                  Sync User Data
                </a>
              </div>
            )}
            <div className="mt-4">
              <UserSyncTest />
            </div>
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
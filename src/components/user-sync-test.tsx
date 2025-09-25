'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface UserSyncResponse {
  message: string
  user?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
    createdAt: string
    updatedAt: string
  }
  clerkUser?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
  }
  error?: string
}

export function UserSyncTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UserSyncResponse | null>(null)

  const testSync = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/user/sync')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        message: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/user/sync', { method: 'POST' })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        message: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={testSync} disabled={loading}>
          {loading ? 'Testing...' : 'Test User Sync'}
        </Button>
        <Button onClick={forceRefresh} disabled={loading} variant="outline">
          {loading ? 'Refreshing...' : 'Force Refresh'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Sync Result:</h3>
          
          {result.error ? (
            <div className="text-red-600">
              <p><strong>Error:</strong> {result.error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Status:</strong> <span className="text-green-600">{result.message}</span></p>
              
              {result.user && (
                <div>
                  <h4 className="font-medium">Supabase User:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    <li>ID: {result.user.id}</li>
                    <li>Email: {result.user.email}</li>
                    <li>Name: {result.user.firstName} {result.user.lastName}</li>
                    <li>Avatar: {result.user.avatarUrl || 'None'}</li>
                    <li>Created: {new Date(result.user.createdAt).toLocaleString()}</li>
                    <li>Updated: {new Date(result.user.updatedAt).toLocaleString()}</li>
                  </ul>
                </div>
              )}

              {result.clerkUser && (
                <div>
                  <h4 className="font-medium">Clerk User:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                    <li>ID: {result.clerkUser.id}</li>
                    <li>Email: {result.clerkUser.email}</li>
                    <li>Name: {result.clerkUser.firstName} {result.clerkUser.lastName}</li>
                    <li>Image: {result.clerkUser.imageUrl || 'None'}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

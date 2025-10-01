import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccessResponse } from '@/types'
import { fetchWithCsrf } from '@/lib/csrf-client'

// Types
export interface DeletedItem {
  id: string
  table_name: 'transactions' | 'categories' | 'budgets'
  record_id: string
  user_id: string
  deleted_at: string
  record_data: any
  deletion_reason?: string
  created_at: string
}

export interface GroupedDeletedItems {
  transactions: DeletedItem[]
  categories: DeletedItem[]
  budgets: DeletedItem[]
}

export interface TrashResponse {
  deletedItems: DeletedItem[]
  grouped: GroupedDeletedItems
  total: number
}

// Query Keys
export const trashKeys = {
  all: ['trash'] as const,
  lists: () => [...trashKeys.all, 'list'] as const,
  list: (table?: string) => [...trashKeys.lists(), { table }] as const,
  details: () => [...trashKeys.all, 'detail'] as const,
  detail: (id: string) => [...trashKeys.details(), id] as const,
}

// API Functions
async function fetchDeletedItems(table?: string): Promise<TrashResponse> {
  const url = table ? `/api/trash?table=${table}` : '/api/trash'
  const response = await fetch(url)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch deleted items')
  }
  
  const data: ApiSuccessResponse<TrashResponse> = await response.json()
  if (!data.data) {
    throw new Error('Invalid response format')
  }
  
  return data.data
}

async function fetchDeletedItem(id: string): Promise<DeletedItem> {
  const response = await fetch(`/api/trash/${id}`)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch deleted item')
  }
  
  const data: ApiSuccessResponse<{ deletedItem: DeletedItem }> = await response.json()
  if (!data.data?.deletedItem) {
    throw new Error('Failed to fetch deleted item')
  }
  
  return data.data.deletedItem
}

async function restoreItem(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetchWithCsrf(`/api/trash/${id}`, {
    method: 'PUT',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to restore item')
  }

  return response.json()
}

async function permanentlyDeleteItem(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetchWithCsrf(`/api/trash/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to permanently delete item')
  }

  return response.json()
}

// Hooks
export function useDeletedItems(table?: string) {
  return useQuery({
    queryKey: trashKeys.list(table),
    queryFn: () => fetchDeletedItems(table),
  })
}

export function useDeletedItem(id: string) {
  return useQuery({
    queryKey: trashKeys.detail(id),
    queryFn: () => fetchDeletedItem(id),
    enabled: !!id,
  })
}

export function useRestoreItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: restoreItem,
    onSuccess: (_data, id) => {
      // Invalidate trash queries
      queryClient.invalidateQueries({ queryKey: trashKeys.lists() })
      queryClient.removeQueries({ queryKey: trashKeys.detail(id) })
      
      // Invalidate the original table queries
      // We don't know which table it was, so invalidate all
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function usePermanentlyDeleteItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: permanentlyDeleteItem,
    onSuccess: (_data, id) => {
      // Invalidate trash queries
      queryClient.invalidateQueries({ queryKey: trashKeys.lists() })
      queryClient.removeQueries({ queryKey: trashKeys.detail(id) })
    },
  })
}


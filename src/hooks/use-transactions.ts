import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Transaction,
  TransactionWithCategory,
  TransactionFilters,
  ApiSuccessResponse,
  ApiErrorResponse
} from '@/types'
import { fetchWithCsrf } from '@/lib/csrf-client'

/**
 * Query Keys for Transactions
 * Centralized query keys for consistency and type safety
 */
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
}

/**
 * Fetch all transactions with optional filters
 */
async function fetchTransactions(filters?: TransactionFilters): Promise<TransactionWithCategory[]> {
  const params = new URLSearchParams()
  
  if (filters?.type) params.append('type', filters.type)
  if (filters?.category_id) params.append('category_id', filters.category_id)
  if (filters?.start_date) params.append('start_date', filters.start_date)
  if (filters?.end_date) params.append('end_date', filters.end_date)
  if (filters?.search) params.append('search', filters.search)
  
  const queryString = params.toString()
  const url = `/api/transactions${queryString ? `?${queryString}` : ''}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to fetch transactions')
  }
  
  const data: ApiSuccessResponse<{ transactions: TransactionWithCategory[] }> = await response.json()
  return data.data?.transactions || []
}

/**
 * Fetch a single transaction by ID
 */
async function fetchTransaction(id: string): Promise<TransactionWithCategory> {
  const response = await fetch(`/api/transactions/${id}`)
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to fetch transaction')
  }
  
  const data: ApiSuccessResponse<{ transaction: TransactionWithCategory }> = await response.json()
  if (!data.data?.transaction) {
    throw new Error('Transaction not found')
  }
  
  return data.data.transaction
}

/**
 * Create a new transaction
 */
async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<TransactionWithCategory> {
  const response = await fetchWithCsrf('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  })

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to create transaction')
  }

  const data: ApiSuccessResponse<{ transaction: TransactionWithCategory }> = await response.json()
  if (!data.data?.transaction) {
    throw new Error('Failed to create transaction')
  }

  return data.data.transaction
}

/**
 * Update an existing transaction
 */
async function updateTransaction(params: {
  id: string
  transaction: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
}): Promise<TransactionWithCategory> {
  const response = await fetchWithCsrf(`/api/transactions/${params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params.transaction),
  })

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to update transaction')
  }

  const data: ApiSuccessResponse<{ transaction: TransactionWithCategory }> = await response.json()
  if (!data.data?.transaction) {
    throw new Error('Failed to update transaction')
  }

  return data.data.transaction
}

/**
 * Delete a transaction
 */
async function deleteTransaction(id: string): Promise<void> {
  const response = await fetchWithCsrf(`/api/transactions/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to delete transaction')
  }
}

/**
 * Hook to fetch all transactions with optional filters
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => fetchTransactions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch a single transaction by ID
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => fetchTransaction(id),
    enabled: !!id, // Only fetch if ID is provided
  })
}

/**
 * Hook to create a new transaction with optimistic updates
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate all transaction lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

/**
 * Hook to update an existing transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: (_data, variables) => {
      // Invalidate the specific transaction detail
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) })
      // Invalidate all transaction lists
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (_data, id) => {
      // Remove the specific transaction from cache
      queryClient.removeQueries({ queryKey: transactionKeys.detail(id) })
      // Invalidate all transaction lists
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}


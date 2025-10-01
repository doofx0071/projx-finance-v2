import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Budget,
  BudgetWithCategory,
  BudgetPeriod,
  ApiSuccessResponse,
  ApiErrorResponse
} from '@/types'
import { fetchWithCsrf } from '@/lib/csrf-client'

/**
 * Query Keys for Budgets
 * Centralized query keys for consistency and type safety
 */
export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (period?: BudgetPeriod) => [...budgetKeys.lists(), period] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
}

/**
 * Fetch all budgets with optional period filter
 */
async function fetchBudgets(period?: BudgetPeriod): Promise<BudgetWithCategory[]> {
  const params = new URLSearchParams()
  if (period) params.append('period', period)
  
  const queryString = params.toString()
  const url = `/api/budgets${queryString ? `?${queryString}` : ''}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to fetch budgets')
  }
  
  const data: ApiSuccessResponse<{ budgets: BudgetWithCategory[] }> = await response.json()
  return data.data?.budgets || []
}

/**
 * Fetch a single budget by ID
 */
async function fetchBudget(id: string): Promise<BudgetWithCategory> {
  const response = await fetch(`/api/budgets/${id}`)
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to fetch budget')
  }
  
  const data: ApiSuccessResponse<{ budget: BudgetWithCategory }> = await response.json()
  if (!data.data?.budget) {
    throw new Error('Budget not found')
  }
  
  return data.data.budget
}

/**
 * Create a new budget
 */
async function createBudget(
  budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<BudgetWithCategory> {
  const response = await fetchWithCsrf('/api/budgets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget),
  })

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to create budget')
  }

  const data: ApiSuccessResponse<{ budget: BudgetWithCategory }> = await response.json()
  if (!data.data?.budget) {
    throw new Error('Failed to create budget')
  }

  return data.data.budget
}

/**
 * Update an existing budget
 */
async function updateBudget(params: {
  id: string
  budget: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
}): Promise<BudgetWithCategory> {
  const response = await fetchWithCsrf(`/api/budgets/${params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params.budget),
  })

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to update budget')
  }

  const data: ApiSuccessResponse<{ budget: BudgetWithCategory }> = await response.json()
  if (!data.data?.budget) {
    throw new Error('Failed to update budget')
  }

  return data.data.budget
}

/**
 * Delete a budget
 */
async function deleteBudget(id: string): Promise<void> {
  const response = await fetchWithCsrf(`/api/budgets/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to delete budget')
  }
}

/**
 * Hook to fetch all budgets with optional period filter
 */
export function useBudgets(period?: BudgetPeriod) {
  return useQuery({
    queryKey: budgetKeys.list(period),
    queryFn: () => fetchBudgets(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single budget by ID
 */
export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => fetchBudget(id),
    enabled: !!id, // Only fetch if ID is provided
  })
}

/**
 * Hook to create a new budget
 */
export function useCreateBudget() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      // Invalidate and refetch all budget lists
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
    },
  })
}

/**
 * Hook to update an existing budget
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateBudget,
    onSuccess: (data, variables) => {
      // Invalidate the specific budget detail
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.id) })
      // Invalidate all budget lists
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
    },
  })
}

/**
 * Hook to delete a budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: (_data, id) => {
      // Remove the specific budget from cache
      queryClient.removeQueries({ queryKey: budgetKeys.detail(id) })
      // Invalidate all budget lists
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() })
    },
  })
}


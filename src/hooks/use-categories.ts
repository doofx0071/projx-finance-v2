import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { 
  Category, 
  TransactionType,
  ApiSuccessResponse,
  ApiErrorResponse 
} from '@/types'

/**
 * Query Keys for Categories
 * Centralized query keys for consistency and type safety
 */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (type?: TransactionType) => [...categoryKeys.lists(), type] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

/**
 * Fetch all categories with optional type filter
 */
async function fetchCategories(type?: TransactionType): Promise<Category[]> {
  const params = new URLSearchParams()
  if (type) params.append('type', type)
  
  const queryString = params.toString()
  const url = `/api/categories${queryString ? `?${queryString}` : ''}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to fetch categories')
  }
  
  const data: ApiSuccessResponse<{ categories: Category[] }> = await response.json()
  return data.data?.categories || []
}

/**
 * Fetch a single category by ID
 */
async function fetchCategory(id: string): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`)
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to fetch category')
  }
  
  const data: ApiSuccessResponse<{ category: Category }> = await response.json()
  if (!data.data?.category) {
    throw new Error('Category not found')
  }
  
  return data.data.category
}

/**
 * Create a new category
 */
async function createCategory(
  category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Category> {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  })
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to create category')
  }
  
  const data: ApiSuccessResponse<{ category: Category }> = await response.json()
  if (!data.data?.category) {
    throw new Error('Failed to create category')
  }
  
  return data.data.category
}

/**
 * Update an existing category
 */
async function updateCategory(params: {
  id: string
  category: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
}): Promise<Category> {
  const response = await fetch(`/api/categories/${params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params.category),
  })
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to update category')
  }
  
  const data: ApiSuccessResponse<{ category: Category }> = await response.json()
  if (!data.data?.category) {
    throw new Error('Failed to update category')
  }
  
  return data.data.category
}

/**
 * Delete a category
 */
async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to delete category')
  }
}

/**
 * Hook to fetch all categories with optional type filter
 */
export function useCategories(type?: TransactionType) {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: () => fetchCategories(type),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
  })
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategory(id),
    enabled: !!id, // Only fetch if ID is provided
  })
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Invalidate and refetch all category lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

/**
 * Hook to update an existing category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data, variables) => {
      // Invalidate the specific category detail
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) })
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_data, id) => {
      // Remove the specific category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) })
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}


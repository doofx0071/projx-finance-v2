import { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import {
  authenticateApiRequest,
  applyRateLimit,
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

// GET /api/trash/[id] - Get a specific deleted item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'read')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    const { data: deletedItem, error } = await supabase
      .from('deleted_items')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Deleted item not found', 404)
      }
      logger.error({ error, itemId: resolvedParams.id }, 'Error fetching deleted item')
      return createErrorResponse('Failed to fetch deleted item', 500)
    }

    return createSuccessResponse({ data: { deletedItem } })
  })
}

// PUT /api/trash/[id] - Restore a deleted item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    // 1. Get the deleted item
    const { data: deletedItem, error: fetchError } = await supabase
      .from('deleted_items')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !deletedItem) {
      logger.error({ error: fetchError, itemId: resolvedParams.id }, 'Error fetching deleted item')
      return createErrorResponse('Deleted item not found', 404)
    }

    // 2. Restore the full record back to original table
    // Remove deleted_at from record_data if it exists
    const recordData = { ...deletedItem.record_data }
    delete recordData.deleted_at

    const { error: restoreError } = await supabase
      .from(deletedItem.table_name)
      .insert(recordData)

    if (restoreError) {
      logger.error({ error: restoreError, itemId: resolvedParams.id }, 'Error restoring item')
      return createErrorResponse('Failed to restore item', 500)
    }

    // 3. Remove from deleted_items table
    const { error: deleteError } = await supabase
      .from('deleted_items')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (deleteError) {
      logger.warn({ error: deleteError, itemId: resolvedParams.id }, 'Error removing from deleted_items')
      // Item is restored, so this is not critical
    }

    return createSuccessResponse({
      success: true,
      message: `${deletedItem.table_name.slice(0, -1)} restored successfully`
    })
  })
}

// DELETE /api/trash/[id] - Permanently delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    await applyRateLimit(request, 'default')
    const { supabase, user } = await authenticateApiRequest()
    const resolvedParams = await params

    // 1. Get the deleted item
    const { data: deletedItem, error: fetchError } = await supabase
      .from('deleted_items')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !deletedItem) {
      logger.error({ error: fetchError, itemId: resolvedParams.id }, 'Error fetching deleted item')
      return createErrorResponse('Deleted item not found', 404)
    }

    // 2. Permanently delete from original table
    const { error: deleteOriginalError } = await supabase
      .from(deletedItem.table_name)
      .delete()
      .eq('id', deletedItem.record_id)
      .eq('user_id', user.id)

    if (deleteOriginalError) {
      logger.error({ error: deleteOriginalError, itemId: resolvedParams.id }, 'Error permanently deleting item')
      return createErrorResponse('Failed to permanently delete item', 500)
    }

    // 3. Remove from deleted_items table
    const { error: deleteTrashError } = await supabase
      .from('deleted_items')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (deleteTrashError) {
      logger.warn({ error: deleteTrashError, itemId: resolvedParams.id }, 'Error removing from deleted_items')
      // Item is deleted from original table, so this is not critical
    }

    return createSuccessResponse({
      success: true,
      message: `${deletedItem.table_name.slice(0, -1)} permanently deleted`
    })
  })
}


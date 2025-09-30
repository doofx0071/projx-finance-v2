import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET /api/trash/[id] - Get a specific deleted item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const resolvedParams = await params
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: deletedItem, error } = await supabase
      .from('deleted_items')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Deleted item not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching deleted item:', error)
      return NextResponse.json(
        { error: 'Failed to fetch deleted item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { deletedItem } })
  } catch (error) {
    console.error('Unexpected error in GET /api/trash/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/trash/[id] - Restore a deleted item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const resolvedParams = await params
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 1. Get the deleted item
    const { data: deletedItem, error: fetchError } = await supabase
      .from('deleted_items')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !deletedItem) {
      console.error('Error fetching deleted item:', fetchError)
      return NextResponse.json(
        { error: 'Deleted item not found' },
        { status: 404 }
      )
    }

    // 2. Restore the full record back to original table
    // Remove deleted_at from record_data if it exists
    const recordData = { ...deletedItem.record_data }
    delete recordData.deleted_at

    const { error: restoreError } = await supabase
      .from(deletedItem.table_name)
      .insert(recordData)

    if (restoreError) {
      console.error('Error restoring item:', restoreError)
      return NextResponse.json(
        { error: 'Failed to restore item' },
        { status: 500 }
      )
    }

    // 3. Remove from deleted_items table
    const { error: deleteError } = await supabase
      .from('deleted_items')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error removing from deleted_items:', deleteError)
      // Item is restored, so this is not critical
    }

    return NextResponse.json({ 
      success: true,
      message: `${deletedItem.table_name.slice(0, -1)} restored successfully`
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/trash/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/trash/[id] - Permanently delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const resolvedParams = await params
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 1. Get the deleted item
    const { data: deletedItem, error: fetchError } = await supabase
      .from('deleted_items')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !deletedItem) {
      console.error('Error fetching deleted item:', fetchError)
      return NextResponse.json(
        { error: 'Deleted item not found' },
        { status: 404 }
      )
    }

    // 2. Permanently delete from original table
    const { error: deleteOriginalError } = await supabase
      .from(deletedItem.table_name)
      .delete()
      .eq('id', deletedItem.record_id)
      .eq('user_id', user.id)

    if (deleteOriginalError) {
      console.error('Error permanently deleting item:', deleteOriginalError)
      return NextResponse.json(
        { error: 'Failed to permanently delete item' },
        { status: 500 }
      )
    }

    // 3. Remove from deleted_items table
    const { error: deleteTrashError } = await supabase
      .from('deleted_items')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (deleteTrashError) {
      console.error('Error removing from deleted_items:', deleteTrashError)
      // Item is deleted from original table, so this is not critical
    }

    return NextResponse.json({ 
      success: true,
      message: `${deletedItem.table_name.slice(0, -1)} permanently deleted`
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/trash/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


import { supabaseAdmin } from './supabase'

/**
 * Upload a file to Supabase storage (server-side only)
 */
export async function uploadFileToStorage(
  bucketName: string,
  filePath: string,
  file: File | Buffer,
  options?: {
    contentType?: string
    cacheControl?: string
    upsert?: boolean
  }
) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || true,
      })

    if (error) {
      console.error('Error uploading file:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get public URL for a file in Supabase storage (server-side)
 */
export function getStoragePublicUrl(bucketName: string, filePath: string): string {
  const { data } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Delete a file from Supabase storage (server-side only)
 */
export async function deleteFileFromStorage(bucketName: string, filePath: string) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * List files in a storage bucket (server-side only)
 */
export async function listStorageFiles(bucketName: string, folderPath?: string) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        offset: 0,
      })

    if (error) {
      console.error('Error listing files:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error listing files:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

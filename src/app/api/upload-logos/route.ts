import { readFileSync } from 'fs'
import { join } from 'path'
import { uploadFileToStorage, getStoragePublicUrl } from '@/lib/storage-server'
import {
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-helpers'

/**
 * POST /api/upload-logos
 * Upload logos from public/logos to Supabase storage
 */
export async function POST() {
  return withErrorHandling(async () => {
    const publicDir = join(process.cwd(), 'public', 'logos')
    
    const logoFiles = [
      {
        filename: 'PHPinancia-light-updated.png',
        storagePath: 'logos/PHPinancia-light.png',
        contentType: 'image/png'
      },
      {
        filename: 'PHPinancia-dark-updated.png',
        storagePath: 'logos/PHPinancia-dark.png',
        contentType: 'image/png'
      },
      {
        filename: 'PHPinancia-light-logo-only-updated.png',
        storagePath: 'logos/PHPinancia-light-logo-only.png',
        contentType: 'image/png'
      },
      {
        filename: 'PHPinancia-dark-logo-only-updated.png',
        storagePath: 'logos/PHPinancia-dark-logo-only.png',
        contentType: 'image/png'
      }
    ]

    const results = []

    for (const logo of logoFiles) {
      try {
        // Read file from public directory
        const filePath = join(publicDir, logo.filename)
        const fileBuffer = readFileSync(filePath)

        // Upload to Supabase storage
        const uploadResult = await uploadFileToStorage(
          'frontend',
          logo.storagePath,
          fileBuffer,
          {
            contentType: logo.contentType,
            cacheControl: '31536000', // 1 year cache
            upsert: true
          }
        )

        if (uploadResult.success) {
          const publicUrl = getStoragePublicUrl('frontend', logo.storagePath)
          results.push({
            filename: logo.filename,
            storagePath: logo.storagePath,
            publicUrl,
            status: 'success'
          })
        } else {
          results.push({
            filename: logo.filename,
            storagePath: logo.storagePath,
            status: 'error',
            error: uploadResult.error
          })
        }
      } catch (error) {
        results.push({
          filename: logo.filename,
          storagePath: logo.storagePath,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return createSuccessResponse({
      message: `Upload completed: ${successCount} successful, ${errorCount} failed`,
      results,
      summary: {
        total: logoFiles.length,
        successful: successCount,
        failed: errorCount
      }
    })
  })
}

/**
 * GET /api/upload-logos
 * Check current logo URLs and storage status
 */
export async function GET() {
  return withErrorHandling(async () => {
    const logoUrls = {
      light: getStoragePublicUrl('frontend', 'logos/PHPinancia-light.png'),
      dark: getStoragePublicUrl('frontend', 'logos/PHPinancia-dark.png'),
      lightLogoOnly: getStoragePublicUrl('frontend', 'logos/PHPinancia-light-logo-only.png'),
      darkLogoOnly: getStoragePublicUrl('frontend', 'logos/PHPinancia-dark-logo-only.png'),
    }

    return createSuccessResponse({
      message: 'Current logo URLs from Supabase storage',
      logoUrls,
      bucketName: 'frontend',
      folderPath: 'logos/'
    })
  })
}

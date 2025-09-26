/**
 * Application constants and configuration
 */

/**
 * Get Supabase storage public URL (client-safe)
 */
function getStoragePublicUrl(bucketName: string, filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`
}

/**
 * Logo URLs from Supabase storage
 */
export const LOGO_URLS = {
  light: getStoragePublicUrl('frontend', 'logos/PHPinancia-light.png'),
  dark: getStoragePublicUrl('frontend', 'logos/PHPinancia-dark.png'),
  lightLogoOnly: getStoragePublicUrl('frontend', 'logos/PHPinancia-light-logo-only.png'),
  darkLogoOnly: getStoragePublicUrl('frontend', 'logos/PHPinancia-dark-logo-only.png'),
} as const

/**
 * Get logo URL by type and theme
 */
export function getLogoUrl(type: 'full' | 'logo-only' = 'full', theme: 'light' | 'dark' = 'light'): string {
  if (type === 'logo-only') {
    return theme === 'light' ? LOGO_URLS.lightLogoOnly : LOGO_URLS.darkLogoOnly
  }
  return theme === 'light' ? LOGO_URLS.light : LOGO_URLS.dark
}

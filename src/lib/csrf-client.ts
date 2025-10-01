/**
 * Client-Side CSRF Token Management
 * 
 * Provides utilities for fetching and including CSRF tokens in API requests.
 * Tokens are cached in memory and automatically refreshed when needed.
 */

let cachedToken: string | null = null
let tokenPromise: Promise<string> | null = null

/**
 * Fetch CSRF token from the server
 * Uses in-memory caching to avoid unnecessary requests
 * 
 * @returns Promise resolving to CSRF token
 */
export async function fetchCsrfToken(): Promise<string> {
  // Return cached token if available
  if (cachedToken) {
    return cachedToken
  }

  // Return existing promise if fetch is in progress
  if (tokenPromise) {
    return tokenPromise
  }

  // Fetch new token
  tokenPromise = fetch('/api/csrf-token', {
    method: 'GET',
    credentials: 'include', // Include cookies
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token')
      }
      const data = await response.json()
      cachedToken = data.token
      tokenPromise = null
      return data.token
    })
    .catch((error) => {
      tokenPromise = null
      throw error
    })

  return tokenPromise
}

/**
 * Clear cached CSRF token
 * Call this when token becomes invalid (e.g., 403 response)
 */
export function clearCsrfToken(): void {
  cachedToken = null
  tokenPromise = null
}

/**
 * Get headers with CSRF token
 * 
 * @param additionalHeaders - Additional headers to include
 * @returns Promise resolving to headers object
 */
export async function getCsrfHeaders(
  additionalHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = await fetchCsrfToken()
  
  return {
    'X-CSRF-Token': token,
    ...additionalHeaders,
  }
}

/**
 * Make a fetch request with CSRF token
 * 
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Promise resolving to Response
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET'
  
  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const token = await fetchCsrfToken()
    
    options.headers = {
      ...options.headers,
      'X-CSRF-Token': token,
    }
  }

  // Include credentials for cookies
  options.credentials = options.credentials || 'include'

  const response = await fetch(url, options)

  // Clear token if we get 403 (invalid token)
  if (response.status === 403) {
    const data = await response.clone().json().catch(() => ({}))
    if (data.error?.includes('CSRF')) {
      clearCsrfToken()
    }
  }

  return response
}


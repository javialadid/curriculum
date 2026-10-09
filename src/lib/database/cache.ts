import { unstable_cache } from 'next/cache'

/**
 * Get cache duration from environment variables
 */
export function getCacheDuration(defaultSeconds: number = 30): number {
  return parseInt(process.env.SUPABASE_CACHE_DURATION_SECONDS || defaultSeconds.toString(), 10)
}

/**
 * Create a cached database operation at module scope
 *
 * IMPORTANT: This function should be called at module scope to create cached functions.
 * Do not call it inside async functions or methods.
 *
 * @param operation The database operation to cache. Call arguments are part of
 *   the cache key, so e.g. a version argument yields per-version entries.
 * @param cacheKey Unique cache key array
 * @param duration Cache duration in seconds (default: from env or 30)
 * @param tags Cache tags for invalidation
 * @returns Cached function that can be called at runtime
 */
export function createCachedDatabaseOperation<T, A extends unknown[] = []>(
  operation: (...args: A) => Promise<T>,
  cacheKey: string[],
  duration: number = getCacheDuration(),
  tags: string[] = []
) {
  return unstable_cache(
    operation,
    cacheKey,
    {
      revalidate: duration,
      tags
    }
  )
}

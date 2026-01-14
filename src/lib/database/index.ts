// Database abstraction exports
export { databaseClient } from './supabase-client'
export { createCachedDatabaseOperation, getCacheDuration } from './cache'
export type { DatabaseClient, TableOperations, DatabaseResult } from './types'

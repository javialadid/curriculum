import { supabase } from '@/lib/supabase'
import type { DatabaseClient, TableOperations, DatabaseResult } from './types'

// Define the query type more precisely by extracting it from Supabase client
type SupabaseQuery = ReturnType<typeof supabase.from<any, any>>
type SupabaseFilter = ReturnType<SupabaseQuery['select']>

class SupabaseTableOperations<T> implements TableOperations<T> {
  // Use a union type for the query to handle both initial query builder and filter builder
  private query: SupabaseQuery | SupabaseFilter

  constructor(table: string) {
    this.query = supabase.from(table)
  }

  select(columns?: string): TableOperations<T> {
    // When calling select, we transition to a filter builder
    this.query = (this.query as SupabaseQuery).select(columns)
    return this
  }

  eq(column: string, value: unknown): TableOperations<T> {
    // Both types might not have 'eq', but we know we've transitioned or will cast
    this.query = (this.query as SupabaseFilter).eq(column, value)
    return this
  }

  limit(count: number): TableOperations<T> {
    this.query = (this.query as SupabaseFilter).limit(count)
    return this
  }

  async single(): Promise<DatabaseResult<T>> {
    const { data, error } = await (this.query as SupabaseFilter).single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as T, error: null }
  }

  async execute(): Promise<DatabaseResult<T[]>> {
    const { data, error } = await (this.query as SupabaseFilter)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as T[], error: null }
  }
}

export class SupabaseDatabaseClient implements DatabaseClient {
  from<T = Record<string, unknown>>(table: string): TableOperations<T> {
    return new SupabaseTableOperations<T>(table)
  }
}

// Export singleton instance
export const databaseClient = new SupabaseDatabaseClient()

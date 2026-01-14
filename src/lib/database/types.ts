export interface DatabaseResult<T> {
  data: T | null
  error: string | null
}

export interface QueryOptions {
  select?: string
  eq?: Record<string, unknown>
  limit?: number
  single?: boolean
}

export interface DatabaseClient {
  from<T = Record<string, unknown>>(table: string): TableOperations<T>
}

export interface TableOperations<T> {
  select(columns?: string): TableOperations<T>
  eq(column: string, value: unknown): TableOperations<T>
  limit(count: number): TableOperations<T>
  single(): Promise<DatabaseResult<T>>
  execute(): Promise<DatabaseResult<T[]>>
}

import { PostgrestError } from '@supabase/supabase-js'

interface ResumeErrorProps {
  error: PostgrestError | null
}

export function ResumeError({ error }: ResumeErrorProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Error Loading Resume</h2>
        <p className="text-lg mb-4">
          {error ? `Error: ${error.message}` : 'No resume data found.'}
        </p>
        <details className="text-sm text-muted-foreground">
          <summary>Full Error Details (if any)</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-md mx-auto">
            {error ? JSON.stringify(error, null, 2) : 'No error object available.'}
          </pre>
        </details>
      </div>
    </div>
  )
}

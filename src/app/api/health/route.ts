import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Simple query to check database connection and keep it alive
    // Try to select from the resumes table to verify our application tables are accessible
    const { error } = await supabase
      .from('resumes')
      .select('count')
      .limit(1)
      .single()

    if (error) {
      // If that fails, try a different approach - just check if we can connect
      // by attempting to get auth user (this tests the connection without requiring specific tables)
      const { error: authError } = await supabase.auth.getUser()

      // We don't care about the auth result, just whether the connection works
      // Auth errors are expected if not logged in, but connection errors are what we want to catch
      if ((authError && authError.message.includes('connection')) || (authError && authError.message.includes('network'))) {
        throw authError
      }
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

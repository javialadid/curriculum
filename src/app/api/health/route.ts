import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const startTime = Date.now()
  console.log('🏥 Health check initiated at', new Date().toISOString())

  try {
    // Query actual resume data to verify database connection and show sample data
    console.log('🔍 Checking database connection and retrieving sample resume data...')
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('name, slug, summary')
      .limit(1)
      .single()

    if (error) {
      console.warn('⚠️  Database query error:', error.message)
      const { error: authError } = await supabase.auth.getUser()

      if ((authError && authError.message.includes('connection')) || (authError && authError.message.includes('network'))) {
        console.error('🚫 Auth connection error:', authError.message)
        throw authError
      }
    } else {
      console.log('✅ Database connection successful')
      if (resume) {
        console.log('📋 Sample resume data retrieved:', {
          name: resume.name,
          slug: resume.slug,
          summaryPreview: resume.summary ? resume.summary.substring(0, 100) + (resume.summary.length > 100 ? '...' : '') : 'No summary available',
          summaryLength: resume.summary?.length || 0
        })
      } else {
        console.warn('⚠️  Database query succeeded but returned no data')
      }
    }

    const responseTime = Date.now() - startTime
    console.log(`🎉 Health check completed successfully in ${responseTime}ms`)

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      responseTime: `${responseTime}ms`
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('💥 Health check failed after', responseTime + 'ms:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`
    }, { status: 503 })
  }
}

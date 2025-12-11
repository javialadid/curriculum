import { supabase } from '@/lib/supabase'
import type { Resume } from '@/types/resume'

interface UseResumeOptions {
  slug?: string // If provided, fetch by slug; otherwise fetch default
}

interface UseResumeResult {
  resume: Resume | null
  error: string | null
  isLoading: boolean
}

export async function fetchResume({ slug }: UseResumeOptions = {}): Promise<UseResumeResult> {
  const startTime = Date.now()
  console.log(`📄 Fetching resume${slug ? ` with slug: ${slug}` : ' (default)'} at ${new Date().toISOString()}`)

  try {
    const query = supabase.from('resumes').select('*')

    if (slug) {
      // Fetch by slug
      console.log('🔍 Querying database for resume by slug...')
      const { data: resumes, error } = await query.eq('slug', slug)
      if (error) throw error

      if (!resumes || resumes.length === 0) {
        console.warn(`⚠️  No resume found for slug: ${slug}`)
        return {
          resume: null,
          error: 'Resume not found',
          isLoading: false
        }
      }

      console.log(`✅ Found resume for slug: ${slug}, name: ${resumes[0].name}`)
      const responseTime = Date.now() - startTime
      console.log(`⏱️  Resume fetch completed in ${responseTime}ms`)

      return {
        resume: resumes[0],
        error: null,
        isLoading: false
      }
    } else {
      // Fetch default (first) resume
      console.log('🔍 Querying database for default resume...')
      const { data: resume, error } = await query.limit(1).single()
      if (error) throw error

      console.log(`✅ Found default resume, name: ${resume.name}`)
      const responseTime = Date.now() - startTime
      console.log(`⏱️  Resume fetch completed in ${responseTime}ms`)

      return {
        resume,
        error: null,
        isLoading: false
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`💥 Resume fetch failed after ${responseTime}ms:`, error)
    return {
      resume: null,
      error: error instanceof Error ? error.message : 'An error occurred',
      isLoading: false
    }
  }
}

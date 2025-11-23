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
  try {
    const query = supabase.from('resumes').select('*')

    if (slug) {
      // Fetch by slug
      const { data: resumes, error } = await query.eq('slug', slug)
      if (error) throw error

      if (!resumes || resumes.length === 0) {
        return {
          resume: null,
          error: 'Resume not found',
          isLoading: false
        }
      }

      return {
        resume: resumes[0],
        error: null,
        isLoading: false
      }
    } else {
      // Fetch default (first) resume
      const { data: resume, error } = await query.limit(1).single()
      if (error) throw error

      return {
        resume,
        error: null,
        isLoading: false
      }
    }
  } catch (error) {
    console.error('Error fetching resume:', error)
    return {
      resume: null,
      error: error instanceof Error ? error.message : 'An error occurred',
      isLoading: false
    }
  }
}

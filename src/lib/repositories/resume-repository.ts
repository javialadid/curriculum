import { databaseClient, createCachedDatabaseOperation, getCacheDuration } from '@/lib/database'
import type { Resume } from '@/types/resume'

interface ResumeQueryOptions {
  slug?: string // If provided, fetch by slug; otherwise fetch default
}

interface ResumeQueryResult {
  resume: Resume | null
  error: string | null
}

/**
 * Cached database operation for fetching default resume
 */
const fetchDefaultResumeFromDatabase = createCachedDatabaseOperation(
  async () => {
    const result = await databaseClient
      .from<Resume>('resumes')
      .select('*')
      .limit(1)
      .single()

    return result
  },
  ['resume', 'default'],
  getCacheDuration(),
  ['resume']
)

/**
 * Resume repository for data access operations
 */
export class ResumeRepository {
  /**
   * Fetches resume data with caching for default, direct query for slugs
   */
  async getResume({ slug }: ResumeQueryOptions = {}): Promise<ResumeQueryResult> {
    try {
      if (slug) {
        return await this.getResumeBySlug(slug)
      } else {
        return await this.getDefaultResume()
      }
    } catch (error) {
      return {
        resume: null,
        error: error instanceof Error ? error.message : 'An error occurred'
      }
    }
  }

  private async getResumeBySlug(slug: string): Promise<ResumeQueryResult> {
    // Slug-based queries are not cached since they are dynamic
    const result = await databaseClient
      .from<Resume>('resumes')
      .select('*')
      .eq('slug', slug)
      .execute()

    if (result.error) {
      console.error(`Failed to fetch resume for slug ${slug}:`, result.error)
      return {
        resume: null,
        error: result.error
      }
    }

    if (!result.data || result.data.length === 0) {
      return {
        resume: null,
        error: 'Resume not found'
      }
    }

    return {
      resume: result.data[0],
      error: null
    }
  }

  private async getDefaultResume(): Promise<ResumeQueryResult> {
    const result = await fetchDefaultResumeFromDatabase()

    if (result.error || !result.data) {
      console.error('Failed to fetch default resume:', result.error)
      return {
        resume: null,
        error: result.error || 'No data'
      }
    }

    return {
      resume: result.data,
      error: null
    }
  }
}

// Export singleton instance
export const resumeRepository = new ResumeRepository()

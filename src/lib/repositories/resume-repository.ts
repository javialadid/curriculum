import { databaseClient, createCachedDatabaseOperation, getCacheDuration } from '@/lib/database'
import type { DatabaseResult } from '@/lib/database'
import { FALLBACK_CV_VERSION, getCvVersion } from '@/lib/cv-version'
import type { Resume } from '@/types/resume'

interface ResumeQueryOptions {
  slug?: string // If provided, fetch by slug; otherwise fetch default
}

interface ResumeQueryResult {
  resume: Resume | null
  error: string | null
}

/**
 * Cached database operation for fetching the default resume of one content version.
 * The version argument is part of the cache key.
 */
const fetchDefaultResumeFromDatabase = createCachedDatabaseOperation(
  async (version: string) => {
    const result = await databaseClient
      .from<Resume>('resumes')
      .select('*')
      .eq('version', version)
      .limit(1)
      .execute()

    return result
  },
  ['resume', 'default', 'cv-versioned'],
  getCacheDuration(),
  ['resume']
)

function isEmpty(result: DatabaseResult<Resume[]>): boolean {
  return !result.error && (!result.data || result.data.length === 0)
}

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

  private async queryBySlug(slug: string, version: string): Promise<DatabaseResult<Resume[]>> {
    return databaseClient
      .from<Resume>('resumes')
      .select('*')
      .eq('slug', slug)
      .eq('version', version)
      .execute()
  }

  private async getResumeBySlug(slug: string): Promise<ResumeQueryResult> {
    // Slug-based queries are not cached since they are dynamic
    const version = getCvVersion()
    let result = await this.queryBySlug(slug, version)

    if (isEmpty(result) && version !== FALLBACK_CV_VERSION) {
      result = await this.queryBySlug(slug, FALLBACK_CV_VERSION)
    }

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
    const version = getCvVersion()
    let result = await fetchDefaultResumeFromDatabase(version)

    if (isEmpty(result) && version !== FALLBACK_CV_VERSION) {
      console.warn(`No resume for content version ${version}; falling back to ${FALLBACK_CV_VERSION}`)
      result = await fetchDefaultResumeFromDatabase(FALLBACK_CV_VERSION)
    }

    const resume = result.data?.[0]

    if (result.error || !resume) {
      console.error('Failed to fetch default resume:', result.error)
      return {
        resume: null,
        error: result.error || 'No data'
      }
    }

    return {
      resume,
      error: null
    }
  }
}

// Export singleton instance
export const resumeRepository = new ResumeRepository()

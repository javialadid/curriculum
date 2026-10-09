import { databaseClient, createCachedDatabaseOperation, getCacheDuration } from '@/lib/database'
import { FALLBACK_CV_VERSION, getCvVersion } from '@/lib/cv-version'

export interface ChatbotData {
  bio: string
  prompt: string
}

/**
 * Cached database operation for fetching chatbot data of one content version.
 * The version argument is part of the cache key.
 */
const fetchChatbotDataFromDatabase = createCachedDatabaseOperation(
  async (version: string) => {
    const result = await databaseClient
      .from<ChatbotData>('chatbot')
      .select('bio, prompt')
      .eq('version', version)
      .limit(1)
      .execute()

    return result
  },
  ['chatbot-data', 'cv-versioned'],
  getCacheDuration(),
  ['chatbot']
)

/**
 * Chatbot repository for data access operations
 */
export class ChatbotRepository {
  /** Versions for which a missing-row fallback warn has already been emitted. */
  private fallbackWarnedVersions = new Set<string>()

  private warnFallbackOnce(version: string, message: string): void {
    if (this.fallbackWarnedVersions.has(version)) return
    this.fallbackWarnedVersions.add(version)
    console.warn(message)
  }

  /**
   * Fetches chatbot data for the active content version (with caching).
   * Falls back to the baseline version when the active version has no row.
   */
  async getChatbotData(): Promise<ChatbotData | null> {
    try {
      const version = getCvVersion()
      let result = await fetchChatbotDataFromDatabase(version)

      if (!result.error && (!result.data || result.data.length === 0) && version !== FALLBACK_CV_VERSION) {
        this.warnFallbackOnce(
          version,
          `No chatbot data for content version ${version}; falling back to ${FALLBACK_CV_VERSION}`
        )
        result = await fetchChatbotDataFromDatabase(FALLBACK_CV_VERSION)
      }

      const data = result.data?.[0]

      if (result.error || !data) {
        console.error('Failed to fetch chatbot data:', result.error)
        return null
      }

      // Validate data structure
      if (!this.isValidChatbotData(data)) {
        console.error('Invalid chatbot data structure')
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching chatbot data:', error)
      return null
    }
  }

  private isValidChatbotData(data: unknown): data is ChatbotData {
    const obj = data as Record<string, unknown>
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.bio === 'string' &&
      typeof obj.prompt === 'string' &&
      obj.bio.trim().length > 0 &&
      obj.prompt.trim().length > 0
    )
  }
}

// Export singleton instance
export const chatbotRepository = new ChatbotRepository()

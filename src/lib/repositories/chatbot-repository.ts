import { databaseClient, createCachedDatabaseOperation, getCacheDuration } from '@/lib/database'

export interface ChatbotData {
  bio: string
  prompt: string
}

/**
 * Cached database operation for fetching chatbot data
 */
const fetchChatbotDataFromDatabase = createCachedDatabaseOperation(
  async () => {
    const result = await databaseClient
      .from<ChatbotData>('chatbot')
      .select('bio, prompt')
      .limit(1)
      .single()

    return result
  },
  ['chatbot-data'],
  getCacheDuration(),
  ['chatbot']
)

/**
 * Chatbot repository for data access operations
 */
export class ChatbotRepository {
  /**
   * Fetches chatbot data with caching
   */
  async getChatbotData(): Promise<ChatbotData | null> {
    try {
      const result = await fetchChatbotDataFromDatabase()

      if (result.error || !result.data) {
        console.error('Failed to fetch chatbot data:', result.error)
        return null
      }

      // Validate data structure
      if (!this.isValidChatbotData(result.data)) {
        console.error('Invalid chatbot data structure')
        return null
      }

      return result.data
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

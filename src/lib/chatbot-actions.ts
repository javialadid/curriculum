'use server'

import { supabase } from '@/lib/supabase'
import Groq from 'groq-sdk'

export interface ChatbotData {
  bio: string
  prompt: string
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function fetchChatbotData(): Promise<ChatbotData | null> {
  console.log('🤖 Chatbot: [SERVER] Starting to load chatbot data from Supabase...')
  console.log('🤖 Chatbot: [SERVER] Supabase configuration check:', {
    hasUrl: !!process.env.SUPABASE_URL,
    hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
    urlLength: process.env.SUPABASE_URL?.length || 0,
    keyLength: process.env.SUPABASE_ANON_KEY?.length || 0,
    table: 'chatbot',
    columns: ['bio', 'prompt'],
    operation: 'SELECT LIMIT 1',
    timestamp: new Date().toISOString()
  })

  try {
    console.log('🔄 Chatbot: [SERVER] Executing Supabase query...')
    const startTime = Date.now()
    const { data, error } = await supabase
      .from('chatbot')
      .select('bio, prompt')
      .limit(1)
      .single()
    const queryTime = Date.now() - startTime

    console.log('🔍 Chatbot: [SERVER] Supabase query completed', {
      queryTimeMs: queryTime,
      hasData: !!data,
      hasError: !!error,
      dataKeys: data ? Object.keys(data) : null,
      timestamp: new Date().toISOString()
    })

    if (error) {
      console.error('❌ Chatbot: [SERVER] SUPABASE QUERY FAILED - Root cause analysis:')
      console.error('❌ Chatbot: [SERVER] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        table: 'chatbot',
        operation: 'SELECT bio, prompt LIMIT 1',
        timestamp: new Date().toISOString()
      })

      // Specific error type analysis for root cause identification
      if (error.code === 'PGRST116') {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - No rows found in "chatbot" table')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Insert a row with bio and prompt columns into the chatbot table')
      } else if (error.code === '42P01') {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Table "chatbot" does not exist in database')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Create the chatbot table with bio and prompt columns')
      } else if (error.code?.startsWith('PGRST')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - PostgREST API error (Supabase middleware)')
        console.error('❌ Chatbot: [SERVER] POSSIBLE CAUSES - Invalid table permissions, RLS policies, or API configuration')
      } else if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Authentication error with Supabase')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Check NEXT_PUBLIC_SUPABASE_ANON_KEY configuration')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Network connectivity error to Supabase')
        console.error('❌ Chatbot: [SERVER] POSSIBLE CAUSES - Server-side network issues, DNS, or Supabase service status')
      } else if (error.code === 'PGRST301') {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Row Level Security (RLS) blocking access to chatbot table')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Configure RLS policies to allow anonymous read access')
      } else {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Unknown Supabase error (see error details above)')
      }

      return null
    }

    if (!data) {
      console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Query succeeded but returned null/undefined data')
      console.error('❌ Chatbot: [SERVER] This should not happen with .single() - check Supabase configuration')
      return null
    }

    // Validate data structure
    if (!data.bio || !data.prompt) {
      console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Missing required fields in chatbot data')
      console.error('❌ Chatbot: [SERVER] Data validation failed:', {
        hasBio: !!data.bio,
        hasPrompt: !!data.prompt,
        bioType: typeof data.bio,
        promptType: typeof data.prompt,
        dataKeys: Object.keys(data),
        dataValues: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? `${v.substring(0, 50)}...` : v])
        ),
        timestamp: new Date().toISOString()
      })
      console.error('❌ Chatbot: [SERVER] SOLUTION - Ensure the chatbot table has both "bio" and "prompt" columns with valid data')
      return null
    }

    console.log('✅ Chatbot: [SERVER] Successfully loaded and validated chatbot data:', {
      bioLength: data.bio.length,
      promptLength: data.prompt.length,
      bioPreview: data.bio.substring(0, 100) + (data.bio.length > 100 ? '...' : ''),
      promptPreview: data.prompt.substring(0, 100) + (data.prompt.length > 100 ? '...' : ''),
      dataStructureValid: true,
      timestamp: new Date().toISOString()
    })

    return data
  } catch (error) {
    console.error('💥 Chatbot: [SERVER] CRITICAL ERROR - Unexpected exception during Supabase data loading')
    console.error('💥 Chatbot: [SERVER] Root cause analysis:', {
      errorType: error instanceof Error ? 'Error' : typeof error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    })

    // Specific error type analysis for unexpected errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('💥 Chatbot: [SERVER] ROOT CAUSE - Network/Fetch error, possibly server-side connectivity issue')
      console.error('💥 Chatbot: [SERVER] SOLUTION - Check server network configuration and Supabase connectivity')
    } else if (error instanceof SyntaxError) {
      console.error('💥 Chatbot: [SERVER] ROOT CAUSE - JSON parsing error, possibly malformed Supabase response')
      console.error('💥 Chatbot: [SERVER] SOLUTION - Check Supabase service status and response format')
    } else if (error instanceof ReferenceError) {
      console.error('💥 Chatbot: [SERVER] ROOT CAUSE - Code error, possibly missing Supabase client or environment variables')
      console.error('💥 Chatbot: [SERVER] SOLUTION - Ensure @supabase/supabase-js is installed and NEXT_PUBLIC_SUPABASE_* vars are set')
    } else if (error instanceof Error && error.message.includes('import')) {
      console.error('💥 Chatbot: [SERVER] ROOT CAUSE - Module import error')
      console.error('💥 Chatbot: [SERVER] SOLUTION - Check if Supabase dependency is properly installed')
    } else {
      console.error('💥 Chatbot: [SERVER] ROOT CAUSE - Unknown error (see error details above)')
      console.error('💥 Chatbot: [SERVER] RECOMMENDATION - Check server logs, network configuration, and Supabase dashboard')
    }

    if (error instanceof Error && error.stack) {
      console.error('💥 Chatbot: [SERVER] Stack trace:', error.stack.split('\n').slice(0, 10))
    }

    return null
  }
}

// Security constants
const MAX_MESSAGE_LENGTH = 1000

export async function sendChatMessage(
  systemMessage: string,
  messages: Message[],
  model: string,
  chatId?: string
): Promise<string | null> {
  const groqApiKey = process.env.GROQ_API_KEY

  if (!groqApiKey) {
    console.error('❌ Chatbot: [SERVER] ROOT CAUSE - GROQ_API_KEY environment variable not set')
    console.error('❌ Chatbot: [SERVER] SOLUTION - Set GROQ_API_KEY in your server environment (not NEXT_PUBLIC)')
    return null
  }

  // Security: Validate and sanitize inputs
  if (!messages || messages.length === 0) {
    console.error('❌ Chatbot: [SERVER] SECURITY - No messages provided')
    return 'Sorry, I need a message to respond to.'
  }


  // Security: Validate and sanitize each message
  const sanitizedMessages = messages.map(msg => {
    if (!msg.content || typeof msg.content !== 'string') {
      console.error('❌ Chatbot: [SERVER] SECURITY - Invalid message format')
      return null
    }

    // Security: Check message length
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      console.error('❌ Chatbot: [SERVER] SECURITY - Message too long:', msg.content.length)
      return null
    }

    // Security: Basic HTML/script tag removal
    const sanitizedContent = msg.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()

    if (!sanitizedContent) {
      console.error('❌ Chatbot: [SERVER] SECURITY - Message empty after sanitization')
      return null
    }

    return {
      role: msg.role,
      content: sanitizedContent
    }
  }).filter(Boolean) as Message[]

  if (sanitizedMessages.length !== messages.length) {
    console.error('❌ Chatbot: [SERVER] SECURITY - Some messages failed validation')
    return 'Sorry, there was an issue with your message. Please try again.'
  }

  // Security: Validate system message (allow larger size for resume context)
  if (!systemMessage || typeof systemMessage !== 'string' || systemMessage.length > 50000) {
    console.error('❌ Chatbot: [SERVER] SECURITY - Invalid system message')
    return 'Sorry, there was a configuration error. Please try again later.'
  }

  console.log('📤 Chatbot: [SERVER] Incoming chat message request', {
    systemMessageLength: systemMessage.length,
    conversationLength: sanitizedMessages.length,
    model,
    chatId: chatId || 'unknown',
    timestamp: new Date().toISOString()
  })

  const fullMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemMessage },
    ...sanitizedMessages
  ]

  const logMessages = fullMessages.map(({ role }) => ({ role }))

  console.log('📤 Chatbot: [SERVER] Full messages being sent to Groq (chatId: ' + (chatId || 'unknown') + '):', JSON.stringify(logMessages, null, 2))

  try {
    console.log('🔄 Chatbot: [SERVER] Initializing GROQ client and making API request...')
    const startTime = Date.now()
    const groq = new Groq({ apiKey: groqApiKey })

    const completion = await groq.chat.completions.create({
      messages: fullMessages,
      model,
    })
    const responseTime = Date.now() - startTime

    const responseContent = completion.choices[0]?.message?.content

    console.log('✅ Chatbot: [SERVER] GROQ API response received successfully', {
      responseTimeMs: responseTime,
      responseLength: responseContent?.length || 0,
      hasResponse: !!responseContent,
      chatId: chatId || 'unknown',
      modelUsed: completion.model,
      finishReason: completion.choices[0]?.finish_reason,
      tokenUsage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      } : null,
      timestamp: new Date().toISOString()
    })

    if (!responseContent) {
      console.error('❌ Chatbot: [SERVER] ROOT CAUSE - GROQ API returned empty response content')
      console.error('❌ Chatbot: [SERVER] Response analysis:', {
        hasChoices: !!completion.choices && completion.choices.length > 0,
        choiceCount: completion.choices?.length || 0,
        finishReason: completion.choices[0]?.finish_reason,
        messageContentType: typeof completion.choices[0]?.message?.content
      })
      return 'Sorry, I couldn\'t generate a response.'
    }

    return responseContent
  } catch (error) {
    console.error('❌ Chatbot: [SERVER] GROQ API CALL FAILED - Root cause analysis (chatId: ' + (chatId || 'unknown') + '):')
    console.error('❌ Chatbot: [SERVER] Error details:', {
      errorType: error instanceof Error ? 'Error' : typeof error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    })

    // Specific error type analysis for GROQ API errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Invalid GROQ API key')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Verify GROQ_API_KEY is correct and has credits')
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - GROQ API access forbidden (account/plan issue)')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Check GROQ account status and plan limits')
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - GROQ API rate limit exceeded')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Wait for rate limit reset or upgrade plan')
      } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - GROQ API server error')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Retry later or check GROQ status page')
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Network connectivity issue with GROQ API')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Check server network and firewall settings')
      } else if (error.message.includes('model') && error.message.includes('not found')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Invalid model name:', model)
        console.error('❌ Chatbot: [SERVER] SOLUTION - Use a valid GROQ model like "llama3-70b-8192"')
      } else if (error.message.includes('timeout')) {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - GROQ API request timeout')
        console.error('❌ Chatbot: [SERVER] SOLUTION - Retry with shorter prompt or check network latency')
      } else {
        console.error('❌ Chatbot: [SERVER] ROOT CAUSE - Unknown GROQ API error (see details above)')
      }

      if (error.stack) {
        console.error('❌ Chatbot: [SERVER] Stack trace:', error.stack.split('\n').slice(0, 10))
      }
    }

    return 'Sorry, there was an error processing your message. Please try again.'
  }
}

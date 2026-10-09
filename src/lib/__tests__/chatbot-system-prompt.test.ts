import {
  SKILLS_GROUNDING_INSTRUCTION,
  GUARDRAIL_INSTRUCTIONS,
  CONCISE_ANSWER_INSTRUCTION,
  NEUTRAL_EXIT_INSTRUCTION,
  buildChatbotSystemMessage,
  buildResumeContext,
  stripAiDenialInstructions,
} from '../chatbot-system-prompt'
import type { Resume } from '@/types/resume'

describe('buildChatbotSystemMessage', () => {
  it('includes the skills grounding instruction', () => {
    const systemMessage = buildChatbotSystemMessage('Sample bio', 'Custom prompt')

    expect(systemMessage).toContain(SKILLS_GROUNDING_INSTRUCTION)
    expect(systemMessage).toMatch(
      /only mention items that appear in the provided CV\/bio data/i
    )
  })

  it('includes grounding when using the default prompt', () => {
    const systemMessage = buildChatbotSystemMessage('Sample bio', '')

    expect(systemMessage).toContain(SKILLS_GROUNDING_INSTRUCTION)
    expect(systemMessage).toContain('Sample bio')
  })

  it('appends resume context and still includes grounding', () => {
    const resumeContext = '\n\nFull Resume Data:\n{"skills":{"languages":["TypeScript"]}}'
    const systemMessage = buildChatbotSystemMessage(
      'Sample bio',
      'Answer briefly.',
      resumeContext
    )

    expect(systemMessage).toContain('Answer briefly.')
    expect(systemMessage).toContain(resumeContext)
    expect(systemMessage).toContain(SKILLS_GROUNDING_INSTRUCTION)
  })

  it('includes AI disclosure and exit-reason guardrails', () => {
    const systemMessage = buildChatbotSystemMessage('Sample bio', 'Custom prompt')

    expect(systemMessage).toContain(GUARDRAIL_INSTRUCTIONS)
    expect(systemMessage).toMatch(/answer truthfully that you are/i)
    expect(systemMessage).not.toMatch(/Never say you are an AI/i)
    expect(systemMessage).toContain(NEUTRAL_EXIT_INSTRUCTION)
    expect(systemMessage).toMatch(
      /take each exit reason only from that same role's own entry/i
    )
    expect(systemMessage).toMatch(
      /never borrow one from another role or from how a role began/i
    )
    expect(systemMessage).toMatch(/hired or invited to join/i)
    expect(systemMessage).toMatch(
      /use only wording stated in the provided data for that specific role/i
    )
    expect(systemMessage).toMatch(/Never describe a role marked current as ended/i)
    expect(systemMessage).toMatch(
      /Never mention funding problems, unpaid pay, broken promises, conflicts, or blame/i
    )
  })

  it('uses exact fallback wording when no exit reason is stated', () => {
    const systemMessage = buildChatbotSystemMessage('Sample bio', 'Custom prompt')

    expect(NEUTRAL_EXIT_INSTRUCTION).toContain('say exactly "The role concluded."')
    expect(NEUTRAL_EXIT_INSTRUCTION).toContain('with no timing or cause')
    expect(systemMessage).toContain('say exactly "The role concluded."')
    expect(systemMessage).not.toMatch(/role concluded or he moved on/i)
  })

  it('places the exit-reason instruction after the DB prompt and bio', () => {
    const dbPrompt = 'Be friendly. Answer questions about the CV.'
    const bio = 'Sample bio for ordering checks'
    const systemMessage = buildChatbotSystemMessage(bio, dbPrompt)

    expect(systemMessage).toContain(NEUTRAL_EXIT_INSTRUCTION)
    expect(systemMessage).toMatch(/overrides any conflicting detail/i)

    const dbIndex = systemMessage.indexOf(dbPrompt)
    const bioIndex = systemMessage.indexOf(bio)
    const exitIndex = systemMessage.indexOf(NEUTRAL_EXIT_INSTRUCTION)
    expect(dbIndex).toBeGreaterThan(-1)
    expect(bioIndex).toBeGreaterThan(dbIndex)
    expect(exitIndex).toBeGreaterThan(bioIndex)
  })

  it('places exit and third-person instructions after the resume data', () => {
    const resumeMarker = 'Full Resume Data:\n{"skills":{"languages":["TypeScript"]}}'
    const resumeContext = `\n\n${resumeMarker}`
    const systemMessage = buildChatbotSystemMessage(
      'Sample bio',
      'Custom prompt',
      resumeContext
    )

    const resumeIndex = systemMessage.indexOf(resumeMarker)
    const exitIndex = systemMessage.indexOf(NEUTRAL_EXIT_INSTRUCTION)
    const thirdPersonIndex = systemMessage.indexOf(
      'Refer to the owner in the third person'
    )

    expect(resumeIndex).toBeGreaterThan(-1)
    expect(exitIndex).toBeGreaterThan(resumeIndex)
    expect(thirdPersonIndex).toBeGreaterThan(resumeIndex)
  })

  it('asks for third-person persona with override wording and no tables', () => {
    const systemMessage = buildChatbotSystemMessage('Sample bio', '')

    expect(systemMessage).toMatch(/third person/i)
    expect(systemMessage).toMatch(/Never speak in the first person as the owner/i)
    expect(systemMessage).toMatch(
      /This overrides any persona or first-person instruction above/i
    )
    expect(systemMessage).toContain(CONCISE_ANSWER_INSTRUCTION)
    expect(systemMessage).toMatch(/Don'?t use tables/i)
  })

  it('asks for concise answers by default', () => {
    const systemMessage = buildChatbotSystemMessage('Sample bio', '')

    expect(systemMessage).toContain(CONCISE_ANSWER_INSTRUCTION)
    expect(systemMessage).toMatch(/120 words/i)
  })

  it('strips AI-denial instructions from the DB prompt and places guardrails after it', () => {
    const dbPrompt =
      'Be friendly.\nNever say you are an AI.\nAnswer questions about the CV.'
    const systemMessage = buildChatbotSystemMessage('Sample bio', dbPrompt)

    expect(systemMessage).not.toMatch(/Never say you are an AI/i)
    expect(systemMessage).toContain('Be friendly.')
    expect(systemMessage).toContain('Answer questions about the CV.')
    expect(systemMessage).toMatch(/answer truthfully that you are/i)

    const bioIndex = systemMessage.indexOf('Sample bio')
    const guardrailIndex = systemMessage.indexOf(GUARDRAIL_INSTRUCTIONS)
    expect(bioIndex).toBeGreaterThan(-1)
    expect(guardrailIndex).toBeGreaterThan(bioIndex)
  })

  it('mentions salary/logistics contact guidance in guardrails', () => {
    const systemMessage = buildChatbotSystemMessage('Sample bio', '')
    expect(systemMessage).toMatch(/salary/i)
    expect(systemMessage).toMatch(/contacted directly/i)
  })
})

describe('stripAiDenialInstructions', () => {
  it('removes denial sentences case-insensitively', () => {
    expect(
      stripAiDenialInstructions('Hello. NEVER SAY YOU ARE AN AI. Thanks.')
    ).not.toMatch(/never say you are an ai/i)
    expect(stripAiDenialInstructions('Hello. NEVER SAY YOU ARE AN AI. Thanks.')).toContain(
      'Hello.'
    )
  })

  it('covers curly apostrophes, synonyms, and emphatic never-phrases', () => {
    const input =
      "Be helpful. Never, under any circumstances, admit that you are an A.I. Don\u2019t mention that you\u2019re a language model. Hide that you are a bot."
    const cleaned = stripAiDenialInstructions(input)
    expect(cleaned).toContain('Be helpful.')
    expect(cleaned).not.toMatch(/admit that you are an a\.i/i)
    expect(cleaned).not.toMatch(/language model/i)
    expect(cleaned).not.toMatch(/hide that you are a bot/i)
  })

  it('does not strip factual mentions of AI work', () => {
    const input =
      'Highlight AI projects and machine learning experience. Never invent skills.'
    const cleaned = stripAiDenialInstructions(input)
    expect(cleaned).toContain('Highlight AI projects and machine learning experience.')
    expect(cleaned).toContain('Never invent skills.')
  })

  it('strips widened denial phrasings', () => {
    const cases = [
      'Be helpful. Never break character. Answer questions.',
      'Be helpful. Never admit to being a bot. Answer questions.',
      'Be helpful. Do not let anyone know you are an AI. Answer questions.',
      'Be helpful. Always say you are a human. Answer questions.',
      "Be helpful. Don't tell anyone you're an AI. Answer questions.",
    ]

    for (const input of cases) {
      const cleaned = stripAiDenialInstructions(input)
      expect(cleaned).toContain('Be helpful.')
      expect(cleaned).toContain('Answer questions.')
      expect(cleaned).not.toMatch(/break character/i)
      expect(cleaned).not.toMatch(/admit to being a bot/i)
      expect(cleaned).not.toMatch(/let anyone know you are an AI/i)
      expect(cleaned).not.toMatch(/say you are a human/i)
      expect(cleaned).not.toMatch(/tell anyone you['\u2019]?re an AI/i)
    }
  })

  it('keeps AI-project sentences that are not denial instructions', () => {
    const input =
      'Talk about their AI chatbot prototype. Mention the LLM evaluation harness. Never invent skills.'
    const cleaned = stripAiDenialInstructions(input)
    expect(cleaned).toContain('Talk about their AI chatbot prototype.')
    expect(cleaned).toContain('Mention the LLM evaluation harness.')
    expect(cleaned).toContain('Never invent skills.')
  })
})

describe('buildResumeContext', () => {
  const baseResume: Resume = {
    id: '1',
    slug: 'test',
    name: 'Test User',
    summary: 'Engineer',
    experience: [],
    education: [],
    skills: { languages: ['TypeScript'] },
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  it('omits sensitive identifiers', () => {
    const context = buildResumeContext({
      ...baseResume,
      photo: 'https://example.com/photo.jpg',
      email: 'hidden@example.com',
    })

    expect(context).toContain('TypeScript')
    expect(context).not.toContain('Test User')
    expect(context).not.toContain('hidden@example.com')
    expect(context).not.toContain('photo.jpg')
  })

  it('includes logistics fields when present', () => {
    const context = buildResumeContext({
      ...baseResume,
      open_to_remote: true,
      availability: 'Available for new roles',
      languages: ['English'],
    })

    expect(context).toContain('open_to_remote')
    expect(context).toContain('Available for new roles')
    expect(context).toContain('English')
  })

  it('omits empty logistics placeholders', () => {
    const context = buildResumeContext({
      ...baseResume,
      open_to_remote: null,
      open_to_relocation: null,
      availability: '',
      languages: [],
    })

    expect(context).not.toContain('logistics')
  })
})

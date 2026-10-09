import {
  SKILLS_GROUNDING_INSTRUCTION,
  GUARDRAIL_INSTRUCTIONS,
  buildChatbotSystemMessage,
  buildResumeContext,
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

  it('includes AI disclosure and neutral-employer guardrails', () => {
    const systemMessage = buildChatbotSystemMessage('Sample bio', 'Custom prompt')

    expect(systemMessage).toContain(GUARDRAIL_INSTRUCTIONS)
    expect(systemMessage).toMatch(/answer truthfully that you are/i)
    expect(systemMessage).not.toMatch(/Never say you are an AI/i)
    expect(systemMessage).toMatch(/neutrally and briefly/i)
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

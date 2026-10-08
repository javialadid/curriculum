import {
  SKILLS_GROUNDING_INSTRUCTION,
  buildChatbotSystemMessage,
} from '../chatbot-system-prompt'

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
})

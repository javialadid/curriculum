import {
  extractAssistantText,
  finalizeAssistantContent,
} from '../chatbot-response'

describe('finalizeAssistantContent', () => {
  it('returns trimmed content when finish_reason is not length', () => {
    expect(finalizeAssistantContent('  Hello world.  ', 'stop')).toBe('Hello world.')
    expect(finalizeAssistantContent('Hello world.', null)).toBe('Hello world.')
  })

  it('trims to the last complete sentence and appends a note when finish_reason is length', () => {
    const truncated =
      'They have strong experience with TypeScript and React. They also worked on APIs and testi'
    expect(finalizeAssistantContent(truncated, 'length')).toBe(
      'They have strong experience with TypeScript and React. (reply shortened)'
    )
  })

  it('appends the note even when no sentence boundary exists', () => {
    expect(finalizeAssistantContent('Incomplete mid-thought without end', 'length')).toBe(
      'Incomplete mid-thought without end (reply shortened)'
    )
  })
})

describe('extractAssistantText', () => {
  it('returns only content and ignores reasoning', () => {
    expect(
      extractAssistantText({
        content: 'Visible answer.',
        reasoning: 'Secret chain of thought that must not leak.',
      })
    ).toBe('Visible answer.')
  })

  it('returns empty string when content is missing even if reasoning exists', () => {
    expect(
      extractAssistantText({
        content: null,
        reasoning: 'Only reasoning here.',
      })
    ).toBe('')
  })
})

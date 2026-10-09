import {
  extractAssistantText,
  finalizeAssistantContent,
  findLastSentenceEnd,
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

  it('does not treat dots inside tokens like Next.js as sentence ends', () => {
    const truncated = 'They use Next.js and TypeScript for fron'
    expect(finalizeAssistantContent(truncated, 'length')).toBe(
      'They use Next.js and TypeScript for fron (reply shortened)'
    )
  })

  it('skips common abbreviations when finding the last sentence end', () => {
    const truncated = 'Experience includes APIs, e.g. REST and GraphQL, plus more cut'
    expect(finalizeAssistantContent(truncated, 'length')).toBe(
      'Experience includes APIs, e.g. REST and GraphQL, plus more cut (reply shortened)'
    )
    expect(findLastSentenceEnd('See tools (e.g. linters). Then more')).toBe(
      'See tools (e.g. linters).'.length - 1
    )
  })

  it('treats etc. at end of text or before a capitalised sentence as a sentence end', () => {
    expect(findLastSentenceEnd('Skills include React, Node, etc.')).toBe(
      'Skills include React, Node, etc.'.length - 1
    )
    expect(
      findLastSentenceEnd('Skills include React, Node, etc. They also know Python and more cut')
    ).toBe('Skills include React, Node, etc.'.length - 1)

    // Mid-clause etc. before lowercase is still an abbreviation
    expect(
      findLastSentenceEnd('Skills include React, Node, etc. and more cut off text')
    ).toBe(-1)

    expect(
      finalizeAssistantContent(
        'Skills include React, Node, etc. They also worked on testi',
        'length'
      )
    ).toBe('Skills include React, Node, etc. (reply shortened)')
  })

  it('treats etc. followed by a newline as a sentence end', () => {
    const withNewline = 'Skills include React, Node, etc.\nThey also worked on testi'
    expect(findLastSentenceEnd(withNewline)).toBe(
      'Skills include React, Node, etc.'.length - 1
    )
    expect(finalizeAssistantContent(withNewline, 'length')).toBe(
      'Skills include React, Node, etc. (reply shortened)'
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

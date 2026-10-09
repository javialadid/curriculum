/**
 * Repository tests with a mocked Supabase client holding rows for several
 * content versions. The mock implements select/eq/limit/execute/single.
 */
type Row = Record<string, unknown>

const mockTables: Record<string, Row[]> = { resumes: [], chatbot: [] }
const mockQueries: Array<{ table: string; filters: Array<[string, unknown]> }> = []

jest.mock('@/lib/supabase', () => {
  const makeQuery = (table: string) => {
    const filters: Array<[string, unknown]> = []
    let max = Infinity
    mockQueries.push({ table, filters })
    const rows = () =>
      (mockTables[table] ?? []).filter((r) => filters.every(([k, v]) => r[k] === v)).slice(0, max)
    const query = {
      select: () => query,
      eq: (column: string, value: unknown) => {
        filters.push([column, value])
        return query
      },
      limit: (n: number) => {
        max = n
        return query
      },
      single: () => {
        const r = rows()
        return Promise.resolve(
          r.length === 1 ? { data: r[0], error: null } : { data: null, error: 'expected one row' }
        )
      },
      then: (resolve: (v: { data: Row[]; error: null }) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve({ data: rows(), error: null }).then(resolve, reject),
    }
    return query
  }
  return { supabase: { from: (table: string) => makeQuery(table) } }
})

import { ResumeRepository, resumeRepository } from '../resume-repository'
import { ChatbotRepository, chatbotRepository } from '../chatbot-repository'
import { unstable_cache } from 'next/cache'

type WithFallbackWarnSet = { fallbackWarnedVersions: Set<string> }

const resumeRow = (version: string) => ({
  slug: 'owner',
  version,
  name: 'Test Owner',
  summary: `summary ${version}`,
  experience: [],
  education: [],
  skills: {},
})
const chatbotRow = (version: string) => ({ version, bio: `bio ${version}`, prompt: `prompt ${version}` })

const originalVersion = process.env.CV_VERSION

beforeEach(() => {
  mockQueries.length = 0
  mockTables.resumes = [resumeRow('v1'), resumeRow('v2')]
  mockTables.chatbot = [chatbotRow('v1'), chatbotRow('v2')]
  delete process.env.CV_VERSION
  ;(resumeRepository as unknown as WithFallbackWarnSet).fallbackWarnedVersions.clear()
  ;(chatbotRepository as unknown as WithFallbackWarnSet).fallbackWarnedVersions.clear()
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
  if (originalVersion === undefined) delete process.env.CV_VERSION
  else process.env.CV_VERSION = originalVersion
})

describe('cache keys', () => {
  it('use versioned static key parts so pre-versioning entries are never reused', () => {
    const keys = jest.mocked(unstable_cache).mock.calls.map((call) => call[1])
    expect(keys).toContainEqual(['resume', 'default', 'cv-versioned'])
    expect(keys).toContainEqual(['chatbot-data', 'cv-versioned'])
  })
})

describe('resumeRepository', () => {
  it('serves v2 by default and filters by version', async () => {
    const { resume, error } = await resumeRepository.getResume()
    expect(error).toBeNull()
    expect(resume?.summary).toBe('summary v2')
    expect(mockQueries[0]).toEqual({ table: 'resumes', filters: [['version', 'v2']] })
  })

  it('serves v1 when CV_VERSION=v1', async () => {
    process.env.CV_VERSION = 'v1'
    const { resume } = await resumeRepository.getResume()
    expect(resume?.summary).toBe('summary v1')
  })

  it('falls back to v1 when the requested version has no row', async () => {
    mockTables.resumes = [resumeRow('v1')]
    const { resume, error } = await resumeRepository.getResume()
    expect(error).toBeNull()
    expect(resume?.summary).toBe('summary v1')
    expect(mockQueries.map((q) => q.filters)).toEqual([[['version', 'v2']], [['version', 'v1']]])
    expect(console.warn).toHaveBeenCalledWith(
      'No resume for content version v2; falling back to v1'
    )
  })

  it('filters slug lookups by slug and version', async () => {
    process.env.CV_VERSION = 'v2'
    const { resume } = await resumeRepository.getResume({ slug: 'owner' })
    expect(resume?.summary).toBe('summary v2')
    expect(mockQueries[0].filters).toEqual([
      ['slug', 'owner'],
      ['version', 'v2'],
    ])
  })

  it('falls back to v1 for slug lookups and still 404s unknown slugs', async () => {
    process.env.CV_VERSION = 'v3'
    expect((await resumeRepository.getResume({ slug: 'owner' })).resume?.summary).toBe('summary v1')
    expect(console.warn).toHaveBeenCalledWith(
      'No resume for content version v3; falling back to v1'
    )
    const missing = await resumeRepository.getResume({ slug: 'nobody' })
    expect(missing).toEqual({ resume: null, error: 'Resume not found' })
    // Second fallback for the same version does not warn again
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('warns at most once per missing version per instance', async () => {
    mockTables.resumes = [resumeRow('v1')]
    const repo = new ResumeRepository()
    await repo.getResume()
    await repo.getResume()
    await repo.getResume({ slug: 'owner' })
    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenCalledWith(
      'No resume for content version v2; falling back to v1'
    )
  })
})

describe('chatbotRepository', () => {
  it('serves the active version and filters by version', async () => {
    expect(await chatbotRepository.getChatbotData()).toEqual(chatbotRow('v2'))
    expect(mockQueries[0]).toEqual({ table: 'chatbot', filters: [['version', 'v2']] })

    process.env.CV_VERSION = 'v1'
    expect((await chatbotRepository.getChatbotData())?.bio).toBe('bio v1')
  })

  it('falls back to v1 when the requested version has no row', async () => {
    mockTables.chatbot = [chatbotRow('v1')]
    expect((await chatbotRepository.getChatbotData())?.prompt).toBe('prompt v1')
    expect(console.warn).toHaveBeenCalledWith(
      'No chatbot data for content version v2; falling back to v1'
    )
  })

  it('warns at most once per missing version per instance', async () => {
    mockTables.chatbot = [chatbotRow('v1')]
    const repo = new ChatbotRepository()
    await repo.getChatbotData()
    await repo.getChatbotData()
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('returns null when no version has data', async () => {
    mockTables.chatbot = []
    expect(await chatbotRepository.getChatbotData()).toBeNull()
  })
})

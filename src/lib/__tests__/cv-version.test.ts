import { DEFAULT_CV_VERSION, FALLBACK_CV_VERSION, getCvVersion, parseCvVersion } from '../cv-version'

describe('parseCvVersion', () => {
  it.each([
    ['v1', 'v1'],
    ['v2', 'v2'],
    ['V2', 'v2'],
    ['  v12 ', 'v12'],
    ['v999', 'v999'],
  ])('accepts %p as %p', (raw, expected) => {
    expect(parseCvVersion(raw)).toBe(expected)
  })

  it.each([undefined, null, '', '2', 'v', 'v1000', 'v1.0', 'version2', 'v2;drop', 'latest'])(
    'rejects %p',
    (raw) => {
      expect(parseCvVersion(raw as string | undefined | null)).toBeNull()
    }
  )
})

describe('getCvVersion', () => {
  const original = process.env.CV_VERSION

  afterEach(() => {
    if (original === undefined) delete process.env.CV_VERSION
    else process.env.CV_VERSION = original
  })

  it('defaults to v2 when unset', () => {
    delete process.env.CV_VERSION
    expect(DEFAULT_CV_VERSION).toBe('v2')
    expect(getCvVersion()).toBe('v2')
  })

  it('uses a valid CV_VERSION (case-insensitive)', () => {
    process.env.CV_VERSION = 'V1'
    expect(getCvVersion()).toBe('v1')
  })

  it('falls back to the code default for invalid values', () => {
    process.env.CV_VERSION = 'two'
    expect(getCvVersion()).toBe(DEFAULT_CV_VERSION)
  })

  it('keeps v1 as the data fallback version', () => {
    expect(FALLBACK_CV_VERSION).toBe('v1')
  })
})

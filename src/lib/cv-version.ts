import 'server-only'

/**
 * CV content versioning.
 *
 * Every row in the `resumes` and `chatbot` tables carries a `version` value
 * (for example `v1`, `v2`). The active version is chosen on the server with the
 * `CV_VERSION` environment variable. Server-only: do not expose it via
 * `NEXT_PUBLIC_*`.
 */

/** Version served when `CV_VERSION` is unset or invalid. */
export const DEFAULT_CV_VERSION = 'v2'

/** Version used when no row exists for the requested version. */
export const FALLBACK_CV_VERSION = 'v1'

const CV_VERSION_PATTERN = /^v\d{1,3}$/

/**
 * Normalises a raw version value. Returns the lower-cased value when it matches
 * `v<1-3 digits>`, otherwise `null`.
 */
export function parseCvVersion(raw: string | undefined | null): string | null {
  if (typeof raw !== 'string') return null
  const value = raw.trim().toLowerCase()
  return CV_VERSION_PATTERN.test(value) ? value : null
}

/**
 * Returns the active CV content version (server-side only).
 * Invalid or missing values resolve to the code default; never throws.
 */
export function getCvVersion(): string {
  return parseCvVersion(process.env.CV_VERSION) ?? DEFAULT_CV_VERSION
}

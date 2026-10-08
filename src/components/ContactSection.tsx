import type { ReactNode } from 'react'

interface ContactSectionProps {
  location?: string
  email?: string
  phone?: string
  linkedin?: string
  website?: string
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

export function ContactSection({
  location,
  email,
  phone,
  linkedin,
  website,
}: ContactSectionProps) {
  const websiteValue = website?.trim() || ''
  const hasAny =
    Boolean(location) ||
    Boolean(email) ||
    Boolean(phone) ||
    Boolean(linkedin) ||
    Boolean(websiteValue)

  if (!hasAny) return null

  const parts: ReactNode[] = []

  const pushPart = (node: ReactNode) => {
    if (parts.length > 0) {
      parts.push(
        <span key={`sep-${parts.length}`} aria-hidden="true">
          {' | '}
        </span>
      )
    }
    parts.push(node)
  }

  if (location) {
    pushPart(
      <span key="location">
        <span className="font-semibold text-foreground">Location: </span>
        {location}
      </span>
    )
  }

  if (email) {
    pushPart(
      <span key="email">
        <span className="font-semibold text-foreground">Email: </span>
        <a href={`mailto:${email}`} className="text-blue underline">
          {email}
        </a>
      </span>
    )
  }

  if (phone) {
    pushPart(
      <span key="phone">
        <span className="font-semibold text-foreground">Phone: </span>
        <a href={`tel:${phone}`} className="text-blue underline">
          {phone}
        </a>
      </span>
    )
  }

  if (linkedin) {
    pushPart(
      <span key="linkedin">
        <span className="font-semibold text-foreground">LinkedIn: </span>
        <a
          href={linkedin}
          className="text-blue underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {displayUrl(linkedin)}
        </a>
      </span>
    )
  }

  if (websiteValue) {
    pushPart(
      <span key="website">
        <span className="font-semibold text-foreground">Website: </span>
        <a href={websiteValue} className="text-blue underline">
          {displayUrl(websiteValue)}
        </a>
      </span>
    )
  }

  return (
    <section
      className="hidden print:block print-contact print-keep-together"
      aria-labelledby="contact-heading"
    >
      <h2 id="contact-heading" className="print-section-heading">
        Contact
      </h2>
      <p className="print-contact-line">{parts}</p>
    </section>
  )
}

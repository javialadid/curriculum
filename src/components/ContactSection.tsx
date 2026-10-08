interface ContactSectionProps {
  location?: string
  email?: string
  phone?: string
  linkedin?: string
  website?: string
}

export function ContactSection({
  location,
  email,
  phone,
  linkedin,
  website,
}: ContactSectionProps) {
  const hasContact = location || email || phone || linkedin || website

  if (!hasContact) return null

  return (
    <section className="mb-8 print:mb-3 print-keep-together" aria-labelledby="contact-heading">
      <h2
        id="contact-heading"
        className="text-xl font-semibold mb-4 pb-2 border-b border-border print:text-black flex items-center print:mb-2 print:text-sm"
      >
        <span className="mr-3 text-lg print:hidden" aria-hidden="true">
          📬
        </span>
        Contact
      </h2>
      <ul className="list-none space-y-1 text-sm sm:text-base text-muted-foreground print:text-xs print:space-y-0.5">
        {location && (
          <li>
            <span className="font-medium text-foreground print:font-bold">Location: </span>
            {location}
          </li>
        )}
        {email && (
          <li>
            <span className="font-medium text-foreground print:font-bold">Email: </span>
            <a href={`mailto:${email}`} className="text-blue hover:underline print:text-inherit print:underline">
              {email}
            </a>
          </li>
        )}
        {phone && (
          <li>
            <span className="font-medium text-foreground print:font-bold">Phone: </span>
            <a href={`tel:${phone}`} className="text-blue hover:underline print:text-inherit print:underline">
              {phone}
            </a>
          </li>
        )}
        {linkedin && (
          <li>
            <span className="font-medium text-foreground print:font-bold">LinkedIn: </span>
            <a
              href={linkedin}
              className="text-blue hover:underline break-all print:text-inherit print:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkedin}
            </a>
          </li>
        )}
        {website && (
          <li>
            <span className="font-medium text-foreground print:font-bold">Website: </span>
            <a
              href={website}
              className="text-blue hover:underline break-all print:text-inherit print:underline"
            >
              {website}
            </a>
          </li>
        )}
      </ul>
    </section>
  )
}

interface EducationItem {
  institution: string
  degree: string
  date: string
}

interface EducationSectionProps {
  education: EducationItem[]
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section className="mb-8 print:mb-4" aria-labelledby="education-heading">
      <div className="print-keep-together">
        <h2
          id="education-heading"
          className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center print:mb-2"
        >
          <span className="mr-3 text-lg print:hidden" aria-hidden="true">
            🎓
          </span>
          Education
        </h2>
        {education[0] && (
          <article className="mb-4 print:mb-1 print-keep-together">
            <h3 className="font-medium text-foreground text-base mb-1 print:mb-0 print:font-semibold">
              {education[0].degree}
            </h3>
            <p className="text-sm italic text-muted-foreground print:not-italic">
              {education[0].institution} ({education[0].date})
            </p>
          </article>
        )}
      </div>
      <div className="space-y-4 print:space-y-1">
        {education.slice(1).map((edu, idx) => (
          <article key={idx + 1} className="mb-4 print:mb-1 print-keep-together">
            <h3 className="font-medium text-foreground text-base mb-1 print:mb-0 print:font-semibold">
              {edu.degree}
            </h3>
            <p className="text-sm italic text-muted-foreground print:not-italic">
              {edu.institution} ({edu.date})
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

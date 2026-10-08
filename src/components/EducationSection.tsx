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
    <section className="mb-8 print:mb-4 print-keep-together" aria-labelledby="education-heading">
      <h2
        id="education-heading"
        className="text-xl font-semibold mb-6 pb-2 border-b border-border print:text-black flex items-center print:mb-2 print:text-sm"
      >
        <span className="mr-3 text-lg print:hidden" aria-hidden="true">
          🎓
        </span>
        Education
      </h2>
      <div className="space-y-4 print:space-y-1">
        {education.map((edu, idx) => (
          <article key={idx} className="mb-4 print:mb-1">
            <h3 className="font-medium text-foreground text-base mb-1 print:text-xs print:mb-0.5 print:font-bold">
              {edu.degree}
            </h3>
            <p className="text-sm italic text-muted-foreground print:text-xs print:not-italic">
              {edu.institution} ({edu.date})
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

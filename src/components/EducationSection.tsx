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
    <section className="mb-8 print:mb-4 print-keep-together">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border print:text-black flex items-center print:mb-2 print:text-sm">
        <span className="mr-3 text-lg print:hidden">🎓</span> Education
      </h2>
      <div className="space-y-4 print:space-y-1">
        {education.map((edu, idx) => (
          <div key={idx} className="mb-4 print:mb-1">
            <div className="font-medium text-foreground text-base mb-1 print:text-xs print:mb-0.5">{edu.degree}</div>
            <div className="text-sm italic text-muted-foreground print:text-xs print:not-italic">{edu.institution} ({edu.date})</div>
          </div>
        ))}
      </div>
    </section>
  )
}

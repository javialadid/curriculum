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
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center">
        <span className="mr-3 text-lg">🎓</span> Education & Certifications
      </h2>
      <div className="space-y-4">
        {education.map((edu, idx) => (
          <div key={idx} className="mb-4">
            <div className="font-medium text-foreground text-base mb-1">{edu.degree}</div>
            <div className="text-sm italic text-muted-foreground">{edu.institution} ({edu.date})</div>
          </div>
        ))}
      </div>
    </section>
  )
}

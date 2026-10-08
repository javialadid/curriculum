interface SkillsSectionProps {
  skills: { [key: string]: string[] }
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section className="mb-8 print:mb-4 print-keep-together" aria-labelledby="skills-heading">
      <h2
        id="skills-heading"
        className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center print:mb-2"
      >
        <span className="mr-3 text-lg print:hidden" aria-hidden="true">
          🛠️
        </span>
        <span className="print:hidden">Core Competencies</span>
        <span className="hidden print:inline">Skills</span>
      </h2>
      <div className="bg-muted p-4 rounded border border-border print:border-0 print:bg-transparent print:p-0">
        <div className="space-y-3 print:space-y-0.5">
          {Object.entries(skills).map(
            ([category, categorySkills]) =>
              categorySkills.length > 0 && (
                <div
                  key={category}
                  className="pb-3 border-b border-border print:border-b-0 last:border-b-0 last:pb-0 print:pb-0.5"
                >
                  <span className="font-medium text-foreground mr-1 print:block print:mb-0 print:font-semibold">
                    {category}:
                  </span>
                  <span className="text-muted-foreground">{categorySkills.join(', ')}</span>
                </div>
              )
          )}
        </div>
      </div>
    </section>
  )
}

interface SkillsSectionProps {
  skills: { [key: string]: string[] }
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section className="mb-8 print:mb-4 print-keep-together">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center print:mb-2 print:text-sm">
        <span className="mr-3 text-lg print:hidden">🛠️</span> Core Competencies
      </h2>
      <div className="bg-muted p-4 rounded border border-border print:border-0 print:bg-transparent print:p-0">
        <div className="space-y-3 print:space-y-1">
          {Object.entries(skills).map(([category, categorySkills]) => (
            categorySkills.length > 0 && (
              <div key={category} className="pb-3 border-b border-border print:border-b-0 last:border-b-0 last:pb-0 print:pb-1">
                <span className="font-medium text-foreground mr-1 print:text-xs print:block print:mb-0.5">{category}:</span>
                <span className="text-muted-foreground print:text-xs">{categorySkills.join(', ')}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  )
}

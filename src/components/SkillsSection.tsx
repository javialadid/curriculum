interface SkillsSectionProps {
  skills: { [key: string]: string[] }
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border flex items-center">
        <span className="mr-3 text-lg">🛠️</span> Core Competencies
      </h2>
      <div className="bg-muted p-4 rounded border border-border">
        <div className="space-y-3">
          {Object.entries(skills).map(([category, categorySkills]) => (
            categorySkills.length > 0 && (
              <div key={category} className="pb-3 border-b border-border last:border-b-0 last:pb-0">
                <span className="font-medium text-foreground mr-2 min-w-[80px] inline-block">{category}:</span>
                <span className="text-muted-foreground">{categorySkills.join(', ')}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  )
}

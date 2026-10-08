import Link from 'next/link'
import { ThemeToggle } from '../ThemeToggle'
import { PrintButton } from '../PrintButton'
import { ExperienceSection } from '../ExperienceSection'
import { ResumeHeader } from '../ResumeHeader'
import { ContactSection } from '../ContactSection'
import { ProfessionalSummary } from '../ProfessionalSummary'
import { SkillsSection } from '../SkillsSection'
import { SideProjects } from '../SideProjects'
import { EducationSection } from '../EducationSection'
import Chatbot from '../Chatbot'
import type { Resume, ExperienceItem, EducationItem, SideProjectItem } from '@/types/resume'

interface ResumeDisplayProps {
  resume: Resume
}

export function ResumeDisplay({ resume }: ResumeDisplayProps) {
  const experiences: ExperienceItem[] = resume.experience || []
  const educations: EducationItem[] = resume.education || []
  const skills: { [key: string]: string[] } = resume.skills || {}

  const sideProjects: SideProjectItem[] = resume.side_projects
    ? Array.isArray(resume.side_projects)
      ? resume.side_projects
      : [resume.side_projects]
    : []

  const mainExperience = experiences

  return (
    <div className="min-h-screen print:min-h-0 bg-background text-foreground relative">
      {/* Theme toggle stays in the same spot as main; print button is absolutely placed to its left */}
      <div className="absolute top-4 right-[max(0rem,calc((100vw-64rem)/2))] z-10">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 right-[calc(max(0rem,calc((100vw-64rem)/2))+2.75rem)] z-10 no-print">
        <PrintButton />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 print-container">
        <ResumeHeader
          name={resume.name}
          photo={resume.photo}
          tagLine={resume.tag_line}
          currentLocation={resume.current_location}
        />

        <ContactSection
          location={resume.current_location}
          email={resume.email}
          phone={resume.phone}
          linkedin={resume.linkedin}
          website={resume.website}
        />

        {/* Screen: two columns. Print: single column, linear DOM order. */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 print:flex-col print:gap-0">
          <div className="w-full lg:flex-2 print:w-full">
            <ProfessionalSummary summary={resume.summary} />
            <ExperienceSection mainExperience={mainExperience} />
          </div>

          <div className="w-full lg:flex-1 lg:mt-0 mt-8 bg-muted/30 lg:p-4 lg:rounded-lg print:w-full print:mt-0 print:p-0 print:bg-transparent print:rounded-none">
            <SkillsSection skills={skills} />
            <SideProjects projects={sideProjects} />
            <EducationSection education={educations} />
          </div>
        </div>
      </div>

      <div className="print:hidden max-w-5xl mx-auto px-4 sm:px-8 pb-4">
        <div className="text-xs text-muted-foreground text-center border-t border-border pt-4">
          <p>
            This portfolio uses AI to answer questions about professional background.
            {' '}
            <Link
              href="/privacy"
              className="underline hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <div className="no-print">
        <Chatbot resume={resume} />
      </div>
    </div>
  )
}

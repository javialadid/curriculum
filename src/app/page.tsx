import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from '../components/ThemeToggle'
import { ExperienceSection } from '../components/ExperienceSection'
import { ResumeHeader } from '../components/ResumeHeader'
import { ProfessionalSummary } from '../components/ProfessionalSummary'
import { SkillsSection } from '../components/SkillsSection'
import { SideProjects } from '../components/SideProjects'
import { EducationSection } from '../components/EducationSection'
import Chatbot from '../components/Chatbot'

interface ExperienceItem {
  company: string
  location: string
  title: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  links?: string[]
  highlights?: string[]
  technologies?: string[]
}

interface EducationItem {
  institution: string
  degree: string
  date: string
}

interface SideProjectItem {
  links: { [key: string]: string }
  title: string
  summary: string
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data: resume } = await supabase
      .from('resumes')
      .select('name')
      .limit(1)
      .single()

    if (resume) {
      return {
        title: `${resume.name} - Resume`,
        description: `Professional resume for ${resume.name}`
      }
    }
  } catch {
    // Ignore errors and fall back to default
  }

  return {
    title: 'Resume'
  }
}

export default async function Home() {
  const { data: resume, error } = await supabase
    .from('resumes')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Data</h2>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Data</h2>
        </div>
      </div>
    )
  }

  const experiences: ExperienceItem[] = resume.experience || []
  const educations: EducationItem[] = resume.education || []
  const skills: { [key: string]: string[] } = resume.skills || {}

  // Handle side_projects - can be a single object or array
  const sideProjects: SideProjectItem[] = resume.side_projects
    ? Array.isArray(resume.side_projects)
      ? resume.side_projects
      : [resume.side_projects]
    : []

  const mainExperience = experiences

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <ResumeHeader
          name={resume.name}
          photo={resume.photo}
          tagLine={resume.tag_line}
          currentLocation={resume.current_location}
        />

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Experience */}
          <div className="w-full lg:flex-2">
            <ProfessionalSummary summary={resume.summary} />

            <ExperienceSection mainExperience={mainExperience} />
          </div>

          {/* Right Column - Skills, Education, Projects */}
          <div className="w-full lg:flex-1 lg:mt-0 mt-8">
            <SkillsSection skills={skills} />

            <SideProjects projects={sideProjects} />

            <EducationSection education={educations} />
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot resume={resume} />
    </div>
  )
}

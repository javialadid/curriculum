export interface Message {
  role: 'user' | 'assistant'
  content: string
  /** Shown in the UI but omitted from model history (failed / rate-limited turns). */
  excludeFromHistory?: boolean
}

export interface ExperienceItem {
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

export interface EducationItem {
  institution: string
  degree: string
  date: string
}

export interface SideProjectItem {
  links: { [key: string]: string }
  title: string
  summary: string
}

export interface Resume {
  id: string
  slug: string
  name: string
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: { [key: string]: string[] }
  side_projects?: SideProjectItem | SideProjectItem[]
  photo?: string
  tag_line?: string
  current_location?: string
  open_to_remote?: boolean | null
  open_to_relocation?: boolean | null
  availability?: string | null
  languages?: string[] | null
  created_at: string
  updated_at: string
}

export interface ChatbotProps {
  resume?: Resume
}

/** Generic suggested questions for the empty chat state. */
export const CHATBOT_SUGGESTED_QUESTIONS = [
  'What are their core skills?',
  'Summarize recent experience',
  'Are they open to remote work?',
] as const

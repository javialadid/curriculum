export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatbotData {
  bio: string
  prompt: string
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
  created_at: string
  updated_at: string
}

export interface ChatbotProps {
  resume?: Resume
}

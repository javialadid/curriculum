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
  email?: string
  phone?: string
  linkedin?: string
  website?: string
  /** Optional logistics — leave empty for the owner to fill; never invent values. */
  open_to_remote?: boolean | null
  open_to_relocation?: boolean | null
  availability?: string | null
  languages?: string[] | null
  created_at: string
  updated_at: string
}

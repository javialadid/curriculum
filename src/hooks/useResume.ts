import { resumeRepository } from '@/lib/repositories'
import type { Resume } from '@/types/resume'

interface UseResumeOptions {
  slug?: string // If provided, fetch by slug; otherwise fetch default
}

interface UseResumeResult {
  resume: Resume | null
  error: string | null
  isLoading: boolean
}

export async function fetchResume({ slug }: UseResumeOptions = {}): Promise<UseResumeResult> {
  const result = await resumeRepository.getResume({ slug })

  return {
    ...result,
    isLoading: false
  }
}

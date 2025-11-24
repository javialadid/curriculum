import type { Metadata } from 'next'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PrivacyContent } from '@/components/PrivacyContent'

export const metadata: Metadata = {
  title: 'Privacy Policy - Portfolio',
  description: 'Privacy policy for this personal portfolio website',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <PrivacyContent />

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  )
}

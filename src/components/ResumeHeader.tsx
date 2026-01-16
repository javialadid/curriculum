'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface ResumeHeaderProps {
  name: string
  photo?: string
  tagLine?: string
  currentLocation?: string
}

export function ResumeHeader({ name, photo, tagLine, currentLocation }: ResumeHeaderProps) {
  const pathname = usePathname()
  const [currentUrl, setCurrentUrl] = useState('')

  // Set the current URL after component mounts to avoid hydration mismatch
  useEffect(() => {
    setCurrentUrl(window.location.origin + pathname)
  }, [pathname])

  return (
    <header className="text-center pb-6 sm:pb-8 mb-6 sm:mb-8 border-b-4 border-blue print:pb-2 print:mb-3 print:border-b-2 print:border-blue">

      {photo && (
        <div className="flex justify-center mb-6 print:hidden">
          <Image
            src={photo}
            alt={`${name} profile picture`}
            width={128}
            height={128}
            className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-lg"
          />
        </div>
      )}
      <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-foreground print:text-black print:text-xl print:mb-1">{name}</h1>
      {tagLine && (
        <div className="text-lg sm:text-xl font-light text-muted-foreground mb-2 print:text-xs print:mb-1">{tagLine}</div>
      )}
      {currentLocation && (
        <div className="text-sm sm:text-base text-muted-foreground print:text-xs">{currentLocation}</div>
      )}

      {/* Print-only URL underneath location */}
      <div className="hidden print:block text-center text-xs text-muted-foreground mt-1">
        Please check out the interactive version with chatbot:{' '}
        <a href={currentUrl} className="text-blue underline">
          {currentUrl}
        </a>
      </div>
    </header>
  )
}

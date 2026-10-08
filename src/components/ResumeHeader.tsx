'use client'

import Image from 'next/image'

interface ResumeHeaderProps {
  name: string
  photo?: string
  tagLine?: string
  currentLocation?: string
}

export function ResumeHeader({ name, photo, tagLine, currentLocation }: ResumeHeaderProps) {
  return (
    <header className="text-center pb-6 sm:pb-8 mb-6 sm:mb-8 border-b-4 border-blue print:pb-2 print:mb-3 print:border-b-[1.5pt] print:border-blue">
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
      <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-foreground print:mb-0.5">
        {name}
      </h1>
      {tagLine && (
        <p className="text-lg sm:text-xl font-light text-muted-foreground mb-2 print:mb-0.5">
          {tagLine}
        </p>
      )}
      {currentLocation && (
        <div className="text-sm sm:text-base text-muted-foreground print:hidden">
          {currentLocation}
        </div>
      )}
    </header>
  )
}

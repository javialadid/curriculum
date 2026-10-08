'use client'

import Image from 'next/image'

interface ResumeHeaderProps {
  name: string
  photo?: string
  tagLine?: string
}

export function ResumeHeader({ name, photo, tagLine }: ResumeHeaderProps) {
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
      <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-foreground print:text-black print:text-xl print:mb-1">
        {name}
      </h1>
      {tagLine && (
        <p className="text-lg sm:text-xl font-light text-muted-foreground mb-0 print:text-xs">
          {tagLine}
        </p>
      )}
    </header>
  )
}

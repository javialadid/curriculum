import Image from 'next/image'

interface ResumeHeaderProps {
  name: string
  photo?: string
  tagLine?: string
  currentLocation?: string
}

export function ResumeHeader({ name, photo, tagLine, currentLocation }: ResumeHeaderProps) {
  return (
    <header className="text-center pb-6 sm:pb-8 mb-6 sm:mb-8 border-b-4 border-blue">
      {photo && (
        <div className="flex justify-center mb-6">
          <Image
            src={photo}
            alt={`${name} profile picture`}
            width={128}
            height={128}
            className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-lg"
          />
        </div>
      )}
      <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-foreground">{name}</h1>
      {tagLine && (
        <div className="text-lg sm:text-xl font-light text-muted-foreground mb-2">{tagLine}</div>
      )}
      {currentLocation && (
        <div className="text-sm sm:text-base text-muted-foreground">{currentLocation}</div>
      )}
    </header>
  )
}

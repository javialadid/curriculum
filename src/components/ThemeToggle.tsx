'use client';

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'no-print relative h-9 w-9 rounded-full p-0 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
        'bg-background shadow-lg border border-border',
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className={cn(
        'h-5 w-5 absolute inset-0 m-auto transition-all duration-200',
        theme === 'dark' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      )} />
      <Moon className={cn(
        'h-5 w-5 absolute inset-0 m-auto transition-all duration-200',
        theme === 'dark' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      )} />
    </button>
  )
}

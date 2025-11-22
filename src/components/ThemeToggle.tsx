'use client';

import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Use resolvedTheme for display, fallback to theme, then default to 'light'
  const currentTheme = resolvedTheme || theme || 'light'

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'no-print relative h-9 w-9 rounded-full p-0 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
        'bg-background shadow-lg border border-border',
        className
      )}
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className={cn(
        'h-5 w-5 absolute inset-0 m-auto transition-all duration-200',
        currentTheme === 'light' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      )} />
      <Moon className={cn(
        'h-5 w-5 absolute inset-0 m-auto transition-all duration-200',
        currentTheme === 'light' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      )} />
    </button>
  )
}

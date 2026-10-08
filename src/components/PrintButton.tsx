'use client'

import { useEffect } from 'react'
import { Printer } from 'lucide-react'
import { cn, sendGAEvent } from '@/lib/utils'

interface PrintButtonProps {
  className?: string
}

function warmPrintFonts() {
  if (typeof document === 'undefined' || !document.fonts?.load) return

  const family = getComputedStyle(document.body)
    .getPropertyValue('--font-geist-print')
    .trim()
    .replace(/['"]/g, '')
    .split(',')[0]
    ?.trim()

  if (!family) return

  void document.fonts.load(`400 1em ${family}`)
  void document.fonts.load(`500 1em ${family}`)
  void document.fonts.load(`600 1em ${family}`)
  void document.fonts.load(`700 1em ${family}`)
}

export function PrintButton({ className }: PrintButtonProps) {
  useEffect(() => {
    warmPrintFonts()
  }, [])

  return (
    <button
      type="button"
      data-print-button
      onClick={() => {
        sendGAEvent('print_cv', {})
        window.print()
      }}
      className={cn(
        'no-print inline-flex items-center justify-center rounded-full text-sm font-medium',
        // Icon-only below sm so the control does not cover the header photo on narrow viewports
        'h-9 w-9 p-0 gap-0 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2',
        'bg-background shadow-lg border border-border',
        'hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      aria-label="Download PDF or Print"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Download PDF / Print</span>
    </button>
  )
}

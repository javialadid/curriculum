import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Type for Google Analytics gtag function
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sendGAEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    // Check if user has consented to analytics
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') {
      window.gtag('event', event, params);
    }
  }
}

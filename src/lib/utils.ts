import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sendGAEvent(event: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // Check if user has consented to analytics
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') {
      (window as any).gtag('event', event, params);
    }
  }
}

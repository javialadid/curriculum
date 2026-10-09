'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'

interface CookieConsentProps {
  gaEnabled?: boolean
}

export function CookieConsent({ gaEnabled = false }: CookieConsentProps) {
  // Defer localStorage/sessionStorage reads until after mount to avoid
  // React hydration mismatch (#418) for returning visitors.
  const [showBanner, setShowBanner] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)
  const [isReturnVisitor, setIsReturnVisitor] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!gaEnabled) {
      setReady(true)
      return
    }

    const sessionDismissed = sessionStorage.getItem('cookie-banner-dismissed')
    const consent = localStorage.getItem('cookie-consent')

    setHasConsented(consent === 'accepted')
    setIsReturnVisitor(consent === 'declined')
    setShowBanner(
      !sessionDismissed && (!consent || consent === 'declined')
    )
    setReady(true)
  }, [gaEnabled])

  // Only use effect for GA initialization when consent changes
  useEffect(() => {
    if (hasConsented && typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }, [hasConsented])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    sessionStorage.setItem('cookie-banner-dismissed', 'true')
    setShowBanner(false)
    setHasConsented(true)

    // Enable GA tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined')
    sessionStorage.setItem('cookie-banner-dismissed', 'true')
    setShowBanner(false)

    // Disable GA tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  const dismissBanner = () => {
    // Hide the banner for this session only
    sessionStorage.setItem('cookie-banner-dismissed', 'true')
    setShowBanner(false)
  }

  if (!ready || !showBanner || hasConsented) return null

  return (
    <div className="fixed bottom-0 left-2 sm:left-1/2 sm:-translate-x-1/2 z-50 bg-background border border-border rounded-lg p-2 shadow-lg print:hidden">
      <div className="flex items-center gap-3">
        <Cookie className="w-4 h-4 text-muted-foreground" />

        <p className="text-xs font-medium whitespace-nowrap">
          Enable Analytics?
        </p>

        {isReturnVisitor && (
          <button
            onClick={dismissBanner}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Dismiss for now"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={declineCookies}
          className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Decline
        </button>

        <button
          onClick={acceptCookies}
          className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors"
        >
          Enable
        </button>
      </div>
    </div>
  )
}

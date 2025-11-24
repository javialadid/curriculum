'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'

interface CookieConsentProps {
  gaEnabled?: boolean
}

export function CookieConsent({ gaEnabled = false }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)
  const [isReturnVisitor, setIsReturnVisitor] = useState(false)

  useEffect(() => {
    // Only show banner if GA is enabled
    const consent = localStorage.getItem('cookie-consent')
    const sessionDismissed = sessionStorage.getItem('cookie-banner-dismissed')

    if (gaEnabled && !sessionDismissed) {
      if (!consent) {
        // First time visitor - show banner
        setShowBanner(true)
      } else if (consent === 'declined') {
        // Return visitor who previously declined - show banner again
        setShowBanner(true)
        setIsReturnVisitor(true)
      } else if (consent === 'accepted') {
        setHasConsented(true)
      }
    }
  }, [gaEnabled])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    sessionStorage.setItem('cookie-banner-dismissed', 'true')
    setShowBanner(false)
    setHasConsented(true)

    // Enable GA tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined')
    sessionStorage.setItem('cookie-banner-dismissed', 'true')
    setShowBanner(false)

    // Disable GA tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  const dismissBanner = () => {
    // Hide the banner for this session only
    sessionStorage.setItem('cookie-banner-dismissed', 'true')
    setShowBanner(false)
  }

  if (!showBanner || hasConsented) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">
              Enable Google Analytics?
            </p>
            <p className="text-muted-foreground">
              {isReturnVisitor
                ? 'Opt into Google Analytics for detailed insights about user behavior and interactions.'
                : 'Enable Google Analytics to track detailed visitor interactions and behavior patterns.'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isReturnVisitor && (
            <button
              onClick={dismissBanner}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Dismiss for now"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={declineCookies}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  )
}

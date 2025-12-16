import { useState, useEffect } from 'react'

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [swRegistration, setSwRegistration] = useState(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', registration.scope)
      setSwRegistration(registration)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true)
          }
        })
      })

      // Check for updates every hour
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const installApp = async () => {
    if (!deferredPrompt) {
      return false
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      } else {
        console.log('User dismissed the install prompt')
        return false
      }
    } catch (error) {
      console.error('Error during install prompt:', error)
      return false
    }
  }

  const updateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const unregisterServiceWorker = async () => {
    if (swRegistration) {
      const success = await swRegistration.unregister()
      if (success) {
        console.log('Service Worker unregistered')
        setSwRegistration(null)
      }
      return success
    }
    return false
  }

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      console.log('Cache cleared')
      return true
    }
    return false
  }

  return {
    isInstallable,
    isInstalled,
    installApp,
    updateAvailable,
    updateApp,
    swRegistration,
    unregisterServiceWorker,
    clearCache
  }
}

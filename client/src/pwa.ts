import { registerSW } from 'virtual:pwa-register'

export function registerPWA(): void {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration)
    },
    onRegisterError(error) {
      console.error('Service Worker registration failed:', error)
    }
  })
} 
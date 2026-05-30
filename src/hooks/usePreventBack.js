import { useEffect } from 'react'

function usePreventBack() {
  useEffect(() => {
    // Push 50 state palsu di awal — back harus ditekan 50x untuk menembus
    for (let i = 0; i < 50; i++) {
      window.history.pushState(null, '', window.location.pathname)
    }

    const handlePopState = () => {
      // Setiap kali back ditekan, langsung push lagi
      window.history.pushState(null, '', window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
}

export default usePreventBack
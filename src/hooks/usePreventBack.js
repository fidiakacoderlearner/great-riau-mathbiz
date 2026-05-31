import { useEffect } from 'react'

function usePreventBack() {
  useEffect(() => {
    // Berikan 3 bantalan state. Aman dari warning Chrome, tapi tebal menahan spam klik.
    window.history.pushState(null, '', window.location.href)
    window.history.pushState(null, '', window.location.href)
    window.history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      // Setiap kali pertahanan dijebol 1 lapis, langsung tambal 1 lapis lagi
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])
}

export default usePreventBack
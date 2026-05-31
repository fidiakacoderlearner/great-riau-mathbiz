import { useEffect } from 'react'

function usePreventRefresh(isActive = true) {
  useEffect(() => {
    if (!isActive) return

    const handleBeforeUnload = (e) => {
      // Ini adalah standar browser untuk memicu popup konfirmasi refresh/close tab
      e.preventDefault()
      e.returnValue = '' 
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isActive])
}

export default usePreventRefresh
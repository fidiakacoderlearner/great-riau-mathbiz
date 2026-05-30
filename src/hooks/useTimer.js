import { useState, useEffect, useRef } from 'react'

function useTimer(onHabis, started = true) {
  const [detikSisa, setDetikSisa] = useState(300)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Hanya mulai kalau started === true
    if (!started) return

    intervalRef.current = setInterval(() => {
      setDetikSisa(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onHabis()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [started]) // re-run ketika started berubah

  return detikSisa
}

export default useTimer
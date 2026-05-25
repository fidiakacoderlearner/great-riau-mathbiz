import { useState, useEffect } from 'react'

function Timer({ onHabis }) {
  const [detik, setDetik] = useState(300)

  useEffect(() => {
    const interval = setInterval(() => {
      setDetik(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          if (onHabis) onHabis()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const menit = Math.floor(detik / 60)
  const sisaDetik = detik % 60
  const menipis = detik <= 60

  return (
    <div className={`px-4 py-1 rounded-xl border-2 font-black text-sm
                     ${menipis ? 'animate-pulse' : ''}`}
      style={{
        borderColor: menipis ? '#C0392B' : '#333',
        color: menipis ? '#C0392B' : '#333'
      }}>
      ⏱ {menit}:{sisaDetik.toString().padStart(2, '0')}
    </div>
  )
}

export default Timer
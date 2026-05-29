import { useEffect, useState } from 'react'

function TransisiPage({ judul, emoji, warna, onLanjut }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const durasi    = 4000   // 4 detik
    const tick      = 50     // update tiap 50ms
    const increment = (tick / durasi) * 100

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(interval)
          onLanjut()
          return 100
        }
        return next
      })
    }, tick)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: warna }}>

      <div className="text-8xl mb-6" style={{ animation: 'pulse 1s infinite' }}>
        {emoji}
      </div>

      <h1 className="text-3xl font-black text-white text-center mb-2">
        {judul}
      </h1>

      <p className="text-white font-semibold mb-10 opacity-70">
        Bersiap...
      </p>

      {/* Progress bar */}
      <div className="w-56 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: 'white',
            transition: 'width 50ms linear'
          }} />
      </div>

      {/* Titik-titik animasi */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <div key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'white',
              opacity: 0.4 + (progress / 100) * 0.6,
              transform: `scale(${0.8 + Math.sin((progress / 100 * Math.PI * 3) + i) * 0.3})`,
              transition: 'all 0.1s'
            }} />
        ))}
      </div>

    </div>
  )
}

export default TransisiPage
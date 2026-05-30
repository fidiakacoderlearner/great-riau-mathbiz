import { useEffect, useState } from 'react'

function TransisiPage({ judul, emoji, warna, onLanjut }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const durasi    = 4000
    const tick      = 50
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
    <div style={{
      height: '100dvh',
      backgroundColor: warna,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>{emoji}</div>

      <h1 style={{
        fontSize: '2rem',
        fontWeight: 900,
        color: 'white',
        textAlign: 'center',
        marginBottom: '0.5rem'
      }}>
        {judul}
      </h1>

      <p style={{
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 600,
        marginBottom: '2.5rem'
      }}>
        Bersiap...
      </p>

      {/* Progress bar */}
      <div style={{
        width: '14rem',
        height: '0.5rem',
        borderRadius: '9999px',
        backgroundColor: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'white',
          borderRadius: '9999px',
          transition: 'width 50ms linear'
        }} />
      </div>

      {/* Titik animasi */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '9999px',
            backgroundColor: 'white',
            opacity: 0.4 + (progress / 100) * 0.6,
            transition: 'all 0.1s'
          }} />
        ))}
      </div>
    </div>
  )
}

export default TransisiPage
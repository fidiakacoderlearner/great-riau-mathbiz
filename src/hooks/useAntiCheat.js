import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Variabel in-memory ini HANYA bertahan selama tidak di-refresh.
// Saat pemain menekan F5/Reload, variabel ini otomatis kembali menjadi false.
let isSessionValid = false

export function setSessionValid() {
  isSessionValid = true
}

function useAntiCheat() {
  const navigate = useNavigate()

  useEffect(() => {
    // Jika nilainya false, berarti pemain masuk ke halaman ini secara ilegal 
    // (entah lewat refresh, mengetik URL langsung, atau makro back/forward)
    if (!isSessionValid) {
      navigate('/', { replace: true })
    }
  }, [navigate])
}

export default useAntiCheat
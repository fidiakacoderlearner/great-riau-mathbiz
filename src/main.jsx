import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { supabase } from './lib/supabase'

// Test koneksi — hapus setelah berhasil
supabase.from('produk').select('count').then(({ data, error }) => {
  if (error) console.error('Supabase error:', error)
  else console.log('Supabase terhubung ✅')
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)
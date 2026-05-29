import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

function LandingPage() {
  const navigate = useNavigate()
  const { user, logout } = useGame()

  return (
    // flex-1 supaya mengisi sisa tinggi dari Layout (antara dua stripe)
    <div className="flex-1 flex flex-col md:flex-row"
      style={{ backgroundColor: '#FDFBE4' }}>

      {/* ── Panel Merah: Logo & Judul ── */}
      <div className="flex-1 md:w-1/2 flex flex-col items-center justify-center
                      py-10 px-6"
        style={{ backgroundColor: '#C0392B' }}>
        <div className="text-center">
          <div className="text-7xl md:text-9xl mb-5">🍰</div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            The Great Riau
          </h1>
          <h2 className="text-xl md:text-3xl font-bold mb-4"
            style={{ color: '#F1C40F' }}>
            Math-Biz Mania
          </h2>

          {/* Stripe dekorasi kecil */}
          <div className="w-40 h-2 mx-auto rounded-full"
            style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />
        </div>
      </div>

      {/* ── Panel Krem: Deskripsi & Tombol ── */}
      <div className="flex-1 md:w-1/2 flex flex-col items-center justify-center
                      py-10 px-6">
        <div className="w-full max-w-xs">
          <p className="text-gray-600 font-semibold mb-8 text-center leading-relaxed
                        text-base md:text-lg">
            Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu
            sambil membangun usaha yang menguntungkan.
          </p>

          {/* Belum login */}
          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-2xl font-bold text-lg shadow
                         active:scale-95 transition-transform"
              style={{ backgroundColor: '#F1C40F', color: '#333' }}>
              👤 Masuk
            </button>
          )}

          {/* Sudah login sebagai siswa */}
          {user && user.role === 'siswa' && (
            <div className="flex flex-col gap-4">
              <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
                style={{ backgroundColor: '#D5F5E3', color: '#1E8449' }}>
                Halo, {user.email}! 👋
              </div>
              <button onClick={() => navigate('/eksplorasi')}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg
                           shadow-lg active:scale-95 transition-transform"
                style={{ backgroundColor: '#C0392B' }}>
                🗺️ Eksplorasi
              </button>
              <button onClick={() => navigate('/tantangan')}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg
                           shadow-lg active:scale-95 transition-transform"
                style={{ backgroundColor: '#1E8449' }}>
                🚣 Tantangan
              </button>
              <button onClick={logout}
                className="w-full py-3 rounded-2xl font-bold text-sm
                           active:scale-95 transition-transform"
                style={{ backgroundColor: '#eee', color: '#666' }}>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default LandingPage
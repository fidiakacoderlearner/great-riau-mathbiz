import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

function LandingPage() {
  const navigate = useNavigate()
  const { user, logout } = useGame()

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col md:flex-row"
      style={{ backgroundColor: '#FDFBE4' }}>

      {/* Stripe atas — mobile only */}
      <div className="md:hidden w-full h-3"
        style={{ background: 'repeating-linear-gradient(90deg,#C0392B 0px,#C0392B 20px,#F1C40F 20px,#F1C40F 40px,#1E8449 40px,#1E8449 60px)' }} />

      {/* ── Panel Kiri (desktop) / Atas (mobile) ── */}
      <div className="md:w-1/2 flex flex-col items-center justify-center px-8 py-12"
        style={{ backgroundColor: '#C0392B' }}>
        <div className="text-center">
          <div className="text-8xl md:text-9xl mb-6">🍰</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            The Great Riau
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-6"
            style={{ color: '#F1C40F' }}>
            Math-Biz Mania
          </h2>
          {/* Stripe dekorasi */}
          <div className="w-48 h-2 mx-auto rounded-full"
            style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />
        </div>
      </div>

      {/* ── Panel Kanan (desktop) / Bawah (mobile) ── */}
      <div className="md:w-1/2 flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-sm">

          <p className="text-gray-600 text-base md:text-lg font-semibold mb-8
                        text-center md:text-left leading-relaxed">
            Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu
            sambil membangun usaha yang menguntungkan.
          </p>

          {/* Belum login */}
          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 px-8 rounded-2xl font-bold text-lg shadow
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
              <button
                onClick={() => navigate('/eksplorasi')}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg
                           shadow-lg active:scale-95 transition-transform"
                style={{ backgroundColor: '#C0392B' }}>
                🗺️ Eksplorasi
              </button>
              <button
                onClick={() => navigate('/tantangan')}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg
                           shadow-lg active:scale-95 transition-transform"
                style={{ backgroundColor: '#1E8449' }}>
                🚣 Tantangan
              </button>
              <button
                onClick={logout}
                className="w-full py-3 rounded-2xl font-bold text-sm
                           active:scale-95 transition-transform"
                style={{ backgroundColor: '#eee', color: '#666' }}>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stripe bawah — mobile only */}
      <div className="md:hidden w-full h-3"
        style={{ background: 'repeating-linear-gradient(90deg,#1E8449 0px,#1E8449 20px,#F1C40F 20px,#F1C40F 40px,#C0392B 40px,#C0392B 60px)' }} />

    </div>
  )
}

export default LandingPage
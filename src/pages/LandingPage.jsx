import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { produkList } from '../data/soalData'

const PHASE_LABEL = {
  rancangan: { label: 'Rancangan Usaha',  path: '/eksplorasi/rancangan-usaha' },
  dapur:     { label: 'Dapur Produksi',   path: '/eksplorasi/dapur-produksi'  },
  pembeli:   { label: 'Bertemu Pembeli',  path: '/eksplorasi/bertemu-pembeli' },
}

function LandingPage() {
  const navigate = useNavigate()
  const {
    user, logout,
    xp, allDoneIds,
    gamePhase,
    tantanganUnlocked,
    resetAll
  } = useGame()

  const phaseInfo = gamePhase ? PHASE_LABEL[gamePhase] : null

  function handleReset() {
    if (window.confirm(
      'Reset semua progress? XP, semua produk yang sudah diselesaikan, dan status Tantangan akan dihapus.'
    )) {
      resetAll()
    }
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden"
        style={{ backgroundColor: '#FDFBE4' }}>

        {/* Panel Merah */}
        <div className="flex-1 md:w-1/2 flex flex-col items-center justify-center
                        py-8 px-6"
          style={{ backgroundColor: '#C0392B' }}>
          <div className="text-center">
            <div className="text-7xl md:text-9xl mb-4">🍰</div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-1">
              The Great Riau
            </h1>
            <h2 className="text-xl md:text-3xl font-bold mb-4"
              style={{ color: '#F1C40F' }}>
              Math-Biz Mania
            </h2>
            <div className="w-40 h-2 mx-auto rounded-full"
              style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />

            {/* Progress all-time */}
            {user && (
              <div className="mt-4 px-4 py-2 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                ⭐ {xp} XP &nbsp;|&nbsp;
                📦 {allDoneIds.length}/{produkList.length} produk selesai
              </div>
            )}
          </div>
        </div>

        {/* Panel Krem */}
        <div className="flex-1 md:w-1/2 flex flex-col items-center justify-center
                        py-8 px-6">
          <div className="w-full max-w-xs flex flex-col gap-3">

            <p className="text-gray-600 font-semibold text-center leading-relaxed
                          text-base md:text-lg mb-2">
              Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu
              sambil membangun usaha yang menguntungkan.
            </p>

            {/* Belum login */}
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 rounded-2xl font-bold text-lg shadow
                           active:scale-95 transition-transform"
                style={{ backgroundColor: '#F1C40F', color: '#333',
                         border: 'none', cursor: 'pointer' }}>
                👤 Masuk
              </button>
            )}

            {/* Sudah login */}
            {user && user.role === 'siswa' && (
              <>
                <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
                  style={{ backgroundColor: '#D5F5E3', color: '#1E8449' }}>
                  Halo, {user.email}! 👋
                </div>

                {/* Tombol Lanjutkan — jika ada sesi aktif */}
                {phaseInfo && (
                  <button
                    onClick={() => navigate(phaseInfo.path)}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg
                               shadow-lg active:scale-95 transition-transform"
                    style={{ backgroundColor: '#F39C12', border: 'none', cursor: 'pointer' }}>
                    ▶️ Lanjutkan — {phaseInfo.label}
                  </button>
                )}

                {/* Tombol Eksplorasi */}
                <button
                  onClick={() => navigate('/eksplorasi/rancangan-usaha')}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg
                             shadow-lg active:scale-95 transition-transform"
                  style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
                  🗺️ Eksplorasi {phaseInfo ? '(Baru)' : ''}
                </button>

                {/* Tombol Tantangan — locked/unlocked */}
                {tantanganUnlocked ? (
                  <button
                    onClick={() => navigate('/tantangan')}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg
                               shadow-lg active:scale-95 transition-transform"
                    style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
                    🚣 Tantangan
                  </button>
                ) : (
                  <div className="w-full py-4 rounded-2xl font-bold text-lg text-center"
                    style={{ backgroundColor: '#ddd', color: '#aaa',
                             cursor: 'not-allowed' }}>
                    🔒 Tantangan
                    <p className="text-xs font-semibold mt-1">
                      Selesaikan semua {produkList.length} produk untuk membuka
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#C0392B' }}>
                      ({allDoneIds.length}/{produkList.length} selesai)
                    </p>
                  </div>
                )}

                {/* Tombol Keluar + Reset */}
                <div className="flex gap-2">
                  <button
                    onClick={logout}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm
                               active:scale-95 transition-transform"
                    style={{ backgroundColor: '#eee', color: '#666',
                             border: 'none', cursor: 'pointer' }}>
                    Keluar
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm
                               active:scale-95 transition-transform"
                    style={{ backgroundColor: '#FADBD8', color: '#C0392B',
                             border: 'none', cursor: 'pointer' }}>
                    🔄 Reset Progress
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
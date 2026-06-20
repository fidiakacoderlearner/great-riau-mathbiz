import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { setSessionValid } from '../hooks/useAntiCheat'

function GameHubPage() {
  const navigate = useNavigate()
  const {
    user, logout,
    totalXp, allDoneIds, budget,
    resetAll,
    runHistory, produkList,
    startNewSession, setGamePhase,
    reviewUnlocked,
  } = useGame()

  const runKe = runHistory.length + 1

  function handleMulai() {
    setSessionValid()
    startNewSession()
    setGamePhase(null)
    navigate('/eksplorasi/rancangan-usaha')
  }

  function handleReset() {
    if (window.confirm(
      'Reset semua progress? XP, produk, budget, dan riwayat run akan dihapus.'
    )) { resetAll() }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
                  backgroundColor: '#FDFBE4' }}>

      {/* ── Desktop: Split Screen (sama seperti sebelumnya) ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">

        {/* Panel Kiri — Branding */}
        <div className="w-2/5 flex flex-col items-center justify-center py-8 px-6"
          style={{ backgroundColor: '#C0392B' }}>
          <img src="/assets/maskot.png" alt="maskot"
            className="w-48 h-48 object-contain drop-shadow-2xl mb-4" />
          <h1 className="text-4xl font-black text-white text-center mb-1">
            The Great Riau
          </h1>
          <h2 className="text-2xl font-bold text-center mb-3"
            style={{ color: '#F1C40F' }}>
            Math-Biz Mania
          </h2>
          <div className="w-32 h-2 rounded-full"
            style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />
          <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
            <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
              Halo, {user?.namaLengkap}! 👋
            </div>
            <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
              ⭐ {totalXp} XP &nbsp;|&nbsp; 📦 {allDoneIds.length}/{produkList.length} produk
            </div>
            {runHistory.length > 0 && (
              <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                💰 Budget: Rp{budget.toLocaleString('id-ID')}
              </div>
            )}
          </div>
        </div>

        {/* Panel Kanan — Menu */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto">
          <div className="w-full max-w-xs flex flex-col gap-3">
            <p className="text-gray-600 font-semibold text-center leading-relaxed mb-2">
              Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu
              sambil membangun usaha yang menguntungkan.
            </p>
            {reviewUnlocked ? (
              // Semua produk selesai — kunci eksplorasi
              <div className="w-full py-4 rounded-2xl text-center font-bold text-lg"
                style={{ backgroundColor: '#ddd', color: '#646464',
                        borderRadius: '1rem' }}>
                Semua Produk Selesai!
                <span style={{ display: 'block', fontSize: '0.75rem',
                              fontWeight: 600, marginTop: '0.25rem' }}>
                  Lihat Review Perjalananmu di bawah
                </span>
              </div>
            ) : (
              <button onClick={handleMulai}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg
                          shadow-lg active:scale-95 transition-transform"
                style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
                Mulai Eksplorasi
                {runHistory.length > 0 && (
                  <span style={{ display: 'block', fontSize: '0.75rem',
                                opacity: 0.85, fontWeight: 600 }}>
                    Run ke-{runKe} — Budget Rp{budget.toLocaleString('id-ID')}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => navigate('/review')}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg
                        shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
              Review Perjalananmu
            </button>
            {/* ── TOMBOL BARU: PACU JALUR (DESKTOP) ── */}
            <button onClick={() => navigate('/pacu-jalur')}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg
                        shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#3498DB', border: 'none', cursor: 'pointer' }}>
              Balap Pacu Jalur
              <span style={{ display: 'block', fontSize: '0.75rem',
                            opacity: 0.9, fontWeight: 600, marginTop: '0.25rem' }}>
                Segera Hadir! Mode Quiz Multiplayer
              </span>
            </button>
            <div className="flex gap-2 mt-1">
              <button onClick={logout}
                className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95"
                style={{ backgroundColor: '#eee', color: '#666',
                        border: 'none', cursor: 'pointer' }}>
                Keluar
              </button>
              <button onClick={handleReset}
                className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95"
                style={{ backgroundColor: '#FADBD8', color: '#C0392B',
                        border: 'none', cursor: 'pointer' }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: Stack — SELURUH HALAMAN BISA SCROLL ── */}
      <div className="md:hidden flex flex-col">

        {/* Panel Branding Mobile */}
        <div className="flex flex-col items-center py-8 px-6"
          style={{ backgroundColor: '#C0392B' }}>
          <img src="/assets/maskot.png" alt="maskot"
            className="w-32 h-32 object-contain drop-shadow-2xl mb-4" />
          <h1 className="text-3xl font-black text-white text-center mb-1">
            The Great Riau
          </h1>
          <h2 className="text-xl font-bold text-center mb-3"
            style={{ color: '#F1C40F' }}>
            Math-Biz Mania
          </h2>
          <div className="w-32 h-2 rounded-full mb-4"
            style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
              Halo, {user?.namaLengkap}! 👋
            </div>
            <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
              ⭐ {totalXp} XP &nbsp;|&nbsp; 📦 {allDoneIds.length}/{produkList.length} produk
            </div>
            {runHistory.length > 0 && (
              <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                💰 Budget: Rp{budget.toLocaleString('id-ID')}
              </div>
            )}
          </div>
        </div>

        {/* Panel Menu Mobile */}
        <div className="flex flex-col items-center px-6 py-8"
          style={{ backgroundColor: '#FDFBE4' }}>
          <div className="w-full max-w-xs flex flex-col gap-3">
            <p className="text-gray-600 font-semibold text-center leading-relaxed mb-2">
              Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu
              sambil membangun usaha yang menguntungkan.
            </p>
            {reviewUnlocked ? (
              // Semua produk selesai — kunci eksplorasi
              <div className="w-full py-4 rounded-2xl text-center font-bold text-lg"
                style={{ backgroundColor: '#ddd', color: '#646464',
                        borderRadius: '1rem' }}>
                Semua Produk Selesai!
                <span style={{ display: 'block', fontSize: '0.75rem',
                              fontWeight: 600, marginTop: '0.25rem' }}>
                  Lihat Review Perjalananmu di bawah
                </span>
              </div>
            ) : (
              <button onClick={handleMulai}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg
                          shadow-lg active:scale-95 transition-transform"
                style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
                Mulai Eksplorasi
                {runHistory.length > 0 && (
                  <span style={{ display: 'block', fontSize: '0.75rem',
                                opacity: 0.85, fontWeight: 600 }}>
                    Run ke-{runKe} — Budget Rp{budget.toLocaleString('id-ID')}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => navigate('/review')}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg
                        shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
              Review Perjalananmu
            </button>
            {/* ── TOMBOL BARU: PACU JALUR (MOBILE) ── */}
            <button onClick={() => navigate('/pacu-jalur')}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg
                        shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#3498DB', border: 'none', cursor: 'pointer' }}>
              Balap Pacu Jalur
              <span style={{ display: 'block', fontSize: '0.75rem',
                            opacity: 0.9, fontWeight: 600, marginTop: '0.25rem' }}>
                Segera Hadir! Mode Quiz Multiplayer
              </span>
            </button>
            <div className="flex gap-2 mt-1">
              <button onClick={logout}
                className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95"
                style={{ backgroundColor: '#eee', color: '#666',
                        border: 'none', cursor: 'pointer' }}>
                Keluar
              </button>
              <button onClick={handleReset}
                className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95"
                style={{ backgroundColor: '#FADBD8', color: '#C0392B',
                        border: 'none', cursor: 'pointer' }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameHubPage
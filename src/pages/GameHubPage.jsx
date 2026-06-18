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
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column',
                  backgroundColor: '#FDFBE4', overflow: 'hidden' }}>

      {/* ── Desktop: split | Mobile: stack ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Panel Kiri — Branding */}
        <div className="md:w-2/5 flex flex-col items-center justify-center
                        py-8 px-6 shrink-0"
          style={{ backgroundColor: '#C0392B' }}>
          <img src="/assets/maskot.png" alt="maskot"
            className="w-32 h-32 md:w-48 md:h-48 object-contain
                       drop-shadow-2xl mb-4" />
          <h1 className="text-2xl md:text-4xl font-black text-white text-center mb-1">
            The Great Riau
          </h1>
          <h2 className="text-lg md:text-2xl font-bold text-center mb-3"
            style={{ color: '#F1C40F' }}>
            Math-Biz Mania
          </h2>
          <div className="w-32 h-2 rounded-full"
            style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />

          {/* Statistik */}
          <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
            <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
              Halo, {user?.namaLengkap}! 👋
            </div>
            <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
              ⭐ {totalXp} XP &nbsp;|&nbsp;
              📦 {allDoneIds.length}/{produkList.length} produk
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
        <div className="flex-1 flex flex-col items-center justify-center
                        px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-xs flex flex-col gap-3">

            <p className="text-gray-600 font-semibold text-center leading-relaxed
                          text-sm md:text-base mb-2">
              Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu
              sambil membangun usaha yang menguntungkan.
            </p>

            {/* Tombol Eksplorasi */}
            <button onClick={handleMulai}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg
                         shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
              🗺️ Mulai Eksplorasi
              {runHistory.length > 0 && (
                <span style={{ display: 'block', fontSize: '0.75rem',
                               opacity: 0.85, fontWeight: 600 }}>
                  Run ke-{runKe} — Budget Rp{budget.toLocaleString('id-ID')}
                </span>
              )}
            </button>

            {/* Review — locked/unlocked */}
            <button onClick={() => navigate('/review')}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg
                        shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
              📊 Review Perjalananmu
            </button>

            {/* Keluar + Reset */}
            <div className="flex gap-2 mt-1">
              <button onClick={logout}
                className="flex-1 py-3 rounded-2xl font-bold text-sm
                           active:scale-95 transition-transform"
                style={{ backgroundColor: '#eee', color: '#666',
                         border: 'none', cursor: 'pointer' }}>
                Keluar
              </button>
              <button onClick={handleReset}
                className="flex-1 py-3 rounded-2xl font-bold text-sm
                           active:scale-95 transition-transform"
                style={{ backgroundColor: '#FADBD8', color: '#C0392B',
                         border: 'none', cursor: 'pointer' }}>
                🔄 Reset
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default GameHubPage
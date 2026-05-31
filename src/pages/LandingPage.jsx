import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { produkList } from '../data/soalData'
import imgMaskot from '../assets/maskot.png'
import { setSessionValid } from '../hooks/useAntiCheat'

function LandingPage() {
  const navigate = useNavigate()
  const {
    user, logout,
    totalXp, allDoneIds, budget,
    reviewUnlocked,
    resetAll, runHistory,
    startNewSession,
    setGamePhase
  } = useGame()

  const runKe = runHistory.length + 1

  function handleReset() {
    if (window.confirm(
      'Reset semua progress? XP, semua produk, budget, dan riwayat run akan dihapus.'
    )) { resetAll() }
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden"
        style={{ backgroundColor: '#FDFBE4' }}>

        {/* Panel Merah */}
        <div className="flex-1 md:w-1/2 flex flex-col items-center justify-center py-8 px-6"
          style={{ backgroundColor: '#C0392B' }}>
          <div className="text-center">
            <img 
              src={imgMaskot} 
              alt="Maskot Koki The Great Riau" 
              className="w-40 h-40 md:w-56 md:h-56 mx-auto mb-4 object-contain drop-shadow-2xl transition-transform hover:scale-105" 
            />
            <h1 className="text-3xl md:text-5xl font-black text-white mb-1">
              The Great Riau
            </h1>
            <h2 className="text-xl md:text-3xl font-bold mb-4" style={{ color: '#F1C40F' }}>
              Math-Biz Mania
            </h2>
            <div className="w-40 h-2 mx-auto rounded-full"
              style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />

            {user && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="px-4 py-2 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  ⭐ {totalXp} XP &nbsp;|&nbsp;
                  📦 {allDoneIds.length}/{produkList.length} produk selesai
                </div>
                {runHistory.length > 0 && (
                  <div className="px-4 py-2 rounded-2xl text-sm font-bold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                    🏃 Run ke-{runKe} dari 5
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel Krem — scrollable */}
        <div className="flex-1 md:w-1/2 flex flex-col px-6 overflow-y-auto"
          style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="w-full max-w-xs flex flex-col gap-3">

              <p className="text-gray-600 font-semibold text-center leading-relaxed text-base md:text-lg mb-2">
                Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu sambil membangun usaha yang menguntungkan.
              </p>

              {/* Belum login */}
              {!user && (
                <button onClick={() => navigate('/login')}
                  className="w-full py-4 rounded-2xl font-bold text-lg shadow active:scale-95 transition-transform"
                  style={{ backgroundColor: '#F1C40F', color: '#333', border: 'none', cursor: 'pointer' }}>
                  👤 Masuk
                </button>
              )}

              {user && user.role === 'siswa' && (
                <>
                  <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center"
                    style={{ backgroundColor: '#D5F5E3', color: '#1E8449' }}>
                    Halo, {user.email}! 👋
                  </div>
              
                  {/* Eksplorasi (Sekarang jadi tombol utama untuk mulai) */}
                  {!reviewUnlocked && (
                    <button 
                      onClick={() => {
                        setSessionValid()    
                        startNewSession()    
                        setGamePhase(null)   
                        navigate('/eksplorasi/rancangan-usaha')
                      }}
                      className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform mt-2"
                      style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
                      🚀 Mulai Eksplorasi
                      {allDoneIds.length > 0 && (
                        <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>
                          Run {runKe} — Budget Rp{budget.toLocaleString('id-ID')}
                        </span>
                      )}
                    </button>
                  )}

                  <button onClick={() => navigate('/review')}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform mt-2"
                    style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
                    📊 Review Perjalananmu
                  </button>

                  {/* Keluar + Reset */}
                  <div className="flex gap-2 pb-4 mt-2">
                    <button onClick={logout}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                      style={{ backgroundColor: '#eee', color: '#666', border: 'none', cursor: 'pointer' }}>
                      Keluar
                    </button>
                    <button onClick={handleReset}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                      style={{ backgroundColor: '#FADBD8', color: '#C0392B', border: 'none', cursor: 'pointer' }}>
                      🔄 Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
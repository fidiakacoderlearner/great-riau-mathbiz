import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { setSessionValid } from '../hooks/useAntiCheat'
import { supabase } from '../lib/supabase'

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

  // ── STATE UNTUK GATEKEEPER KELAS ──
  const [loadingKelas, setLoadingKelas] = useState(true)
  const [isTerdaftar,  setIsTerdaftar]  = useState(false)
  const [kodeKelas,    setKodeKelas]    = useState('')
  const [joinError,    setJoinError]    = useState('')
  const [joining,      setJoining]      = useState(false)

  // ── STATE UNTUK POP-UP RESET ──
  const [modalReset, setModalReset] = useState(false)

  useEffect(() => {
    if (user) cekStatusKelas()
  }, [user])

  async function cekStatusKelas() {
    try {
      setLoadingKelas(true)
      const { data, error } = await supabase
        .from('kelas_siswa')
        .select('kelas_id')
        .eq('siswa_id', user.id)
        .maybeSingle()
      
      if (data) {
        setIsTerdaftar(true)
      } else {
        setIsTerdaftar(false)
      }
    } catch (err) {
      console.error('Error cek kelas:', err)
    } finally {
      setLoadingKelas(false)
    }
  }

  async function handleGabungKelas() {
    if (!kodeKelas.trim()) { setJoinError('Kode kelas tidak boleh kosong!'); return }
    setJoining(true)
    setJoinError('')

    try {
      // 1. Cari kelas berdasarkan kode_kelas
      const { data: kelasBaru, error: errCari } = await supabase
        .from('kelas')
        .select('id')
        .eq('kode_kelas', kodeKelas.trim().toUpperCase())
        .maybeSingle()

      if (!kelasBaru || errCari) {
        throw new Error('Kode kelas tidak ditemukan atau tidak valid.')
      }

      // ── 2. LOGIKA CONDITIONAL WIPE ──
      const { data: gameLama } = await supabase
        .from('permainan').select('kelas_id').eq('siswa_id', user.id).limit(1)
      const { data: sesiLama } = await supabase
        .from('sesi_bermain').select('kelas_id').eq('siswa_id', user.id).limit(1)

      const kelasIdLama = (gameLama?.[0]?.kelas_id) || (sesiLama?.[0]?.kelas_id) || null

      if (kelasIdLama && kelasIdLama !== kelasBaru.id) {
        await supabase.from('sesi_bermain').delete().eq('siswa_id', user.id)
        await supabase.from('permainan').delete().eq('siswa_id', user.id)
      }
      // ───────────────────────────────────────────────

      // 3. Masukkan siswa ke tabel kelas_siswa yang baru
      const { error: errInsert } = await supabase
        .from('kelas_siswa')
        .insert({ kelas_id: kelasBaru.id, siswa_id: user.id })

      if (errInsert) throw errInsert

      setIsTerdaftar(true)
      
      // 4. Reload halaman untuk me-reset state context ke data terbaru
      window.location.reload()
      
    } catch (err) {
      setJoinError(err.message)
    } finally {
      setJoining(false)
    }
  }

  const runKe = runHistory.length + 1

  function handleMulai() {
    setSessionValid()
    startNewSession()
    setGamePhase(null)
    navigate('/eksplorasi/rancangan-usaha')
  }

  // Fungsi untuk membuka modal
  function handleReset() {
    setModalReset(true)
  }

  // Fungsi untuk mengeksekusi reset
  function executeReset() {
    resetAll()
    setModalReset(false)
  }

  // ── 1. RENDER: LOADING CEK KELAS ──
  if (loadingKelas) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDFBE4' }}>
        <p className="font-bold text-gray-500">Mengecek status kelas...</p>
      </div>
    )
  }

  // ── 2. RENDER: JIKA SISWA TIDAK PUNYA KELAS (AKSES TERKUNCI) ──
  if (!isTerdaftar) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#FDFBE4' }}>
        
        {/* Desktop View: Split Screen (Kunci) */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <div className="w-2/5 flex flex-col items-center justify-center py-8 px-6" style={{ backgroundColor: '#C0392B' }}>
            <img src="/assets/maskot.png" alt="maskot" className="w-48 h-48 object-contain drop-shadow-2xl mb-4" />
            <h1 className="text-4xl font-black text-white text-center mb-1">The Great Riau</h1>
            <h2 className="text-2xl font-bold text-center mb-3" style={{ color: '#F1C40F' }}>Math-Biz Mania</h2>
            <div className="w-32 h-2 rounded-full" style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />
            <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
              <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                Halo, {user?.namaLengkap}! 👋
              </div>
              <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                ⭐ {totalXp} XP &nbsp;|&nbsp; 📦 {allDoneIds?.length || 0}/10 produk
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto">
            <div className="w-full max-w-xs flex flex-col text-center">
              <div style={{ fontSize: '3.5rem', marginBottom: '0.25rem' }}>🏫</div>
              <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>Akses Terkunci</h2>
              <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Kamu tidak terdaftar di kelas manapun. Masukkan kode kelas baru untuk memulihkan akses permainan.
              </p>

              <input
                type="text"
                value={kodeKelas}
                onChange={(e) => setKodeKelas(e.target.value.toUpperCase())}
                placeholder="MASUKKAN KODE KELAS"
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
                  border: '2px solid #ddd', fontSize: '1rem', fontWeight: 800,
                  textAlign: 'center', letterSpacing: '0.1em', marginBottom: '0.5rem',
                  outline: 'none', backgroundColor: '#FAFAFA', boxSizing: 'border-box'
                }}
              />
              
              {joinError && (
                <p style={{ color: '#C0392B', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  ❌ {joinError}
                </p>
              )}

              <button onClick={handleGabungKelas} disabled={joining}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
                  backgroundColor: '#1E8449', color: 'white', fontWeight: 800,
                  fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem'
                }}>
                {joining ? 'Mencari Kelas...' : 'Masuk ke Kelas'}
              </button>

              <button onClick={logout}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
                  backgroundColor: 'transparent', color: '#888', fontWeight: 700,
                  fontSize: '0.875rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem'
                }}>
                Keluar Akun
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View: Stack (Kunci) */}
        <div className="md:hidden flex flex-col">
          <div className="flex flex-col items-center py-8 px-6" style={{ backgroundColor: '#C0392B' }}>
            <img src="/assets/maskot.png" alt="maskot" className="w-32 h-32 object-contain drop-shadow-2xl mb-4" />
            <h1 className="text-3xl font-black text-white text-center mb-1">The Great Riau</h1>
            <h2 className="text-xl font-bold text-center mb-3" style={{ color: '#F1C40F' }}>Math-Biz Mania</h2>
            <div className="w-32 h-2 rounded-full mb-4" style={{ background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)' }} />
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                Halo, {user?.namaLengkap}! 👋
              </div>
              <div className="px-4 py-2 rounded-2xl text-sm font-bold text-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                ⭐ {totalXp} XP &nbsp;|&nbsp; 📦 {allDoneIds?.length || 0}/10 produk
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center px-6 py-8" style={{ backgroundColor: '#FDFBE4' }}>
            <div className="w-full max-w-xs flex flex-col text-center">
              <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>🏫</div>
              <h2 style={{ fontWeight: 900, fontSize: '1.35rem', color: '#333', marginBottom: '0.5rem' }}>Akses Terkunci</h2>
              <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Kamu tidak terdaftar di kelas manapun, atau baru saja dikeluarkan oleh guru. Masukkan kode kelas baru untuk memulihkan akses permainan.
              </p>

              <input
                type="text"
                value={kodeKelas}
                onChange={(e) => setKodeKelas(e.target.value.toUpperCase())}
                placeholder="MASUKKAN KODE KELAS"
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
                  border: '2px solid #ddd', fontSize: '1rem', fontWeight: 800,
                  textAlign: 'center', letterSpacing: '0.1em', marginBottom: '0.5rem',
                  outline: 'none', backgroundColor: '#FAFAFA', boxSizing: 'border-box'
                }}
              />
              
              {joinError && (
                <p style={{ color: '#C0392B', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  ❌ {joinError}
                </p>
              )}

              <button onClick={handleGabungKelas} disabled={joining}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
                  backgroundColor: '#1E8449', color: 'white', fontWeight: 800,
                  fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem'
                }}>
                {joining ? 'Mencari Kelas...' : 'Masuk ke Kelas'}
              </button>

              <button onClick={logout}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '0.75rem',
                  backgroundColor: 'transparent', color: '#888', fontWeight: 700,
                  fontSize: '0.875rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem'
                }}>
                Keluar Akun
              </button>
            </div>
          </div>
        </div>

      </div>
    )
  }

  // ── 3. RENDER: JIKA SISWA PUNYA KELAS (TAMPILKAN DASHBOARD NORMAL) ──
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
                  backgroundColor: '#FDFBE4' }}>

      {/* ── Desktop: Split Screen ── */}
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
              ⭐ {totalXp} XP &nbsp;|&nbsp; 📦 {allDoneIds?.length || 0}/10 produk
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

            {/* ── PEMBATAS: MODE EKSPLORASI ── */}
            <div className="flex items-center w-full gap-3 mt-2 mb-1">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mode Eksplorasi</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

            {reviewUnlocked ? (
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

            {/* ── PEMBATAS: MODE KOMPETISI ── */}
            <div className="flex items-center w-full gap-3 mt-4 mb-1">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mode Kompetisi</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

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

            {/* ── PEMBATAS: PENGATURAN AKUN ── */}
            <div className="flex gap-2 mt-4">
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

      {/* ── Mobile: Stack ── */}
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
              ⭐ {totalXp} XP &nbsp;|&nbsp; 📦 {allDoneIds?.length || 0}/10 produk
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

            {/* ── PEMBATAS: MODE EKSPLORASI (MOBILE) ── */}
            <div className="flex items-center w-full gap-3 mt-2 mb-1">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mode Eksplorasi</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

            {reviewUnlocked ? (
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

            {/* ── PEMBATAS: MODE KOMPETISI (MOBILE) ── */}
            <div className="flex items-center w-full gap-3 mt-4 mb-1">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mode Kompetisi</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

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

            {/* ── PEMBATAS: PENGATURAN AKUN (MOBILE) ── */}
            <div className="flex gap-2 mt-4">
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

      {/* ── CUSTOM POP-UP RESET MODAL ── */}
      {modalReset && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem',
            width: '100%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', animation: 'spin 3s linear infinite' }}>🔄</div>
            <h3 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#C0392B', marginBottom: '0.5rem' }}>
              Reset Permainan?
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#555', fontWeight: 600, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Apakah kamu yakin ingin mereset semua progress permainan? XP, produk, budget, dan riwayat run akan <b style={{color: '#C0392B'}}>DIHAPUS PERMANEN</b>.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setModalReset(false)} 
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: '0.75rem',
                  backgroundColor: '#eee', color: '#666', fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', cursor: 'pointer'
                }}>
                Batal
              </button>
              <button 
                onClick={executeReset} 
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: '0.75rem',
                  backgroundColor: '#C0392B', color: 'white', fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', cursor: 'pointer'
                }}>
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default GameHubPage
import { createContext, useContext, useState, useEffect } from 'react'
import { produkList } from '../data/soalData'

const GameContext = createContext()

const LS = {
  XP:          'griau_xp',
  PILIH_IDS:   'griau_produk_pilih_ids',
  SELESAI_IDS: 'griau_produk_selesai_ids',
  ALL_DONE:    'griau_all_completed',
  PHASE:       'griau_phase',
}

function safeLoad(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : fallback
  } catch { return fallback }
}

export function GameProvider({ children }) {
  const [xp,           setXp]           = useState(() => safeLoad(LS.XP, 0))
  const [user,         setUser]         = useState(null)
  const [pilihIds,     setPilihIds]     = useState(() => safeLoad(LS.PILIH_IDS, []))
  const [selesaiIds,   setSelesaiIds]   = useState(() => safeLoad(LS.SELESAI_IDS, []))
  const [allDoneIds,   setAllDoneIds]   = useState(() => safeLoad(LS.ALL_DONE, []))
  const [gamePhase,    setGamePhaseRaw] = useState(() => safeLoad(LS.PHASE, null))

  // Sync ke localStorage setiap state berubah
  useEffect(() => { localStorage.setItem(LS.XP,          JSON.stringify(xp))         }, [xp])
  useEffect(() => { localStorage.setItem(LS.PILIH_IDS,   JSON.stringify(pilihIds))   }, [pilihIds])
  useEffect(() => { localStorage.setItem(LS.SELESAI_IDS, JSON.stringify(selesaiIds)) }, [selesaiIds])
  useEffect(() => { localStorage.setItem(LS.ALL_DONE,    JSON.stringify(allDoneIds)) }, [allDoneIds])
  useEffect(() => {
    if (gamePhase) localStorage.setItem(LS.PHASE, JSON.stringify(gamePhase))
    else           localStorage.removeItem(LS.PHASE)
  }, [gamePhase])

  // Derive produk objects dari IDs
  const produkTerpilih = pilihIds
    .map(id => produkList.find(p => p.id === id))
    .filter(Boolean)

  function setGamePhase(phase) { setGamePhaseRaw(phase) }

  function tambahXP(jumlah) { setXp(prev => prev + Math.max(0, jumlah)) }

  // Tandai produk selesai — simpan ke semua daftar
  function addProdukTerpilih(produk) {
    setPilihIds(prev =>
      prev.includes(produk.id) ? prev : [...prev, produk.id])
    setSelesaiIds(prev =>
      prev.includes(produk.id) ? prev : [...prev, produk.id])
    setAllDoneIds(prev =>
      prev.includes(produk.id) ? prev : [...prev, produk.id])
  }

  // Mulai sesi baru — XP tetap, pilihan direset, progress tetap
  function startNewSession() {
    setPilihIds([])
    setSelesaiIds([])
    setGamePhaseRaw(null)
  }

  // Reset total — semua kembali ke nol
  function resetAll() {
    setXp(0)
    setPilihIds([])
    setSelesaiIds([])
    setAllDoneIds([])
    setGamePhaseRaw(null)
    Object.values(LS).forEach(k => localStorage.removeItem(k))
  }

  function login(u)  { setUser(u) }
  function logout()  { setUser(null) }

  const tantanganUnlocked = allDoneIds.length >= produkList.length

  return (
    <GameContext.Provider value={{
      xp, tambahXP,
      user, login, logout,
      produkTerpilih,
      pilihIds,
      selesaiIds,
      allDoneIds,
      addProdukTerpilih,
      startNewSession,
      resetAll,
      gamePhase, setGamePhase,
      tantanganUnlocked,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() { return useContext(GameContext) }
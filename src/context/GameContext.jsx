import { createContext, useContext, useState, useEffect } from 'react'
import {
  produkList,
  KARYAWAN_DATA,
  getHargaKaryawan,
  MAX_KARYAWAN,
  WAKTU_DASAR,
} from '../data/soalData'

const GameContext = createContext()
const BUDGET_AWAL = 600000

const LS = {
  XP:            'griau_xp',
  USER:          'griau_user',
  PILIH_IDS:     'griau_produk_pilih_ids',
  SELESAI_IDS:   'griau_produk_selesai_ids',
  ALL_DONE:      'griau_all_completed',
  PHASE:         'griau_phase',
  BUDGET:        'griau_budget',
  RUN_HISTORY:   'griau_run_history',
  SESSION_START: 'griau_session_start',
}

function safeLoad(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : fallback
  } catch { return fallback }
}

export function GameProvider({ children }) {
  const [xp,           setXp]           = useState(() => safeLoad(LS.XP,          0))
  const [user,         setUser]         = useState(() => safeLoad(LS.USER,        null))
  const [pilihIds,     setPilihIds]     = useState(() => safeLoad(LS.PILIH_IDS,   []))
  const [selesaiIds,   setSelesaiIds]   = useState(() => safeLoad(LS.SELESAI_IDS, []))
  const [allDoneIds,   setAllDoneIds]   = useState(() => safeLoad(LS.ALL_DONE,    []))
  const [gamePhase,    setGamePhaseRaw] = useState(() => safeLoad(LS.PHASE,       null))
  const [budget,       setBudget]       = useState(() => safeLoad(LS.BUDGET,      BUDGET_AWAL))
  const [runHistory,   setRunHistory]   = useState(() => safeLoad(LS.RUN_HISTORY, []))
  const [sessionStart, setSessionStart] = useState(() => safeLoad(LS.SESSION_START, null))

  // Karyawan — tidak perlu persist, reset tiap sesi
  const [karyawanSesi, setKaryawanSesi] = useState([]) // array of level numbers [1,2,3,...]

  // ── Sync localStorage ───────────────────────────────────────────
  useEffect(() => { localStorage.setItem(LS.XP,          JSON.stringify(xp))         }, [xp])
  useEffect(() => { localStorage.setItem(LS.PILIH_IDS,   JSON.stringify(pilihIds))   }, [pilihIds])
  useEffect(() => { localStorage.setItem(LS.SELESAI_IDS, JSON.stringify(selesaiIds)) }, [selesaiIds])
  useEffect(() => { localStorage.setItem(LS.ALL_DONE,    JSON.stringify(allDoneIds)) }, [allDoneIds])
  useEffect(() => { localStorage.setItem(LS.BUDGET,      JSON.stringify(budget))     }, [budget])
  useEffect(() => { localStorage.setItem(LS.RUN_HISTORY, JSON.stringify(runHistory)) }, [runHistory])
  useEffect(() => {
    if (sessionStart) localStorage.setItem(LS.SESSION_START, JSON.stringify(sessionStart))
    else              localStorage.removeItem(LS.SESSION_START)
  }, [sessionStart])
  useEffect(() => {
    if (gamePhase) localStorage.setItem(LS.PHASE, JSON.stringify(gamePhase))
    else           localStorage.removeItem(LS.PHASE)
  }, [gamePhase])
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS.USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(LS.USER)
    }
  }, [user])

  // ── Derived: Produk ─────────────────────────────────────────────
  const produkTerpilih = pilihIds
    .map(id => produkList.find(p => p.id === id))
    .filter(Boolean)

  // ── Derived: Karyawan ───────────────────────────────────────────
  const runKe = runHistory.length  // 0 = run pertama

  function hitungBiayaKaryawan(levels, runIndex) {
    return levels.reduce((sum, level) => sum + getHargaKaryawan(level, runIndex), 0)
  }

  const totalBiayaKaryawan = hitungBiayaKaryawan(karyawanSesi, runKe)
  const budgetProduksi     = budget - totalBiayaKaryawan
  const waktuTersedia      = WAKTU_DASAR + karyawanSesi.reduce((sum, level) => {
    return sum + (KARYAWAN_DATA.find(k => k.level === level)?.tambahWaktu ?? 0)
  }, 0)

  // ── Karyawan Actions ────────────────────────────────────────────
  function sewaKaryawan(level) {
    if (karyawanSesi.length >= MAX_KARYAWAN) return false
    const harga = getHargaKaryawan(level, runKe)
    if (budgetProduksi - harga < 0) return false  // tidak cukup budget
    setKaryawanSesi(prev => [...prev, level])
    return true
  }

  function lepasKaryawan(index) {
    setKaryawanSesi(prev => prev.filter((_, i) => i !== index))
  }

  // ── Game Actions ────────────────────────────────────────────────
  function setGamePhase(phase) { setGamePhaseRaw(phase) }

  function tambahXP(jumlah) { setXp(prev => prev + Math.max(0, jumlah)) }

  function addProdukTerpilih(produk) {
    // 🟢 HANYA SIMPAN KE MEMORI SEMENTARA (SESI SAAT INI)
    setPilihIds  (prev => prev.includes(produk.id) ? prev : [...prev, produk.id])
    setSelesaiIds(prev => prev.includes(produk.id) ? prev : [...prev, produk.id])
  }

  function startNewSession() {
    const now = Date.now()
    setXp(0)
    setPilihIds([])
    setSelesaiIds([])
    setGamePhaseRaw(null)
    setSessionStart(now)
    setKaryawanSesi([])   // reset karyawan tiap sesi
  }

  function addRunResult({ produkA, produkB, pendapatan, xpRun }) {
    const biayaKaryawan = hitungBiayaKaryawan(karyawanSesi, runKe)
    const waktuBermain  = sessionStart
      ? Math.floor((Date.now() - sessionStart) / 1000)
      : 0

    const runData = {
      run:           runHistory.length + 1,
      produkA:       produkA.nama,
      produkB:       produkB.nama,
      emojiA:        produkA.emoji,
      emojiB:        produkB.emoji,
      budgetAwal:    budget,
      biayaKaryawan,
      budgetProduksi: budget - biayaKaryawan,
      pendapatan,
      waktuBermain,
      waktuTersedia,
      xpRun,
      karyawanDisewa: [...karyawanSesi],
    }

    setRunHistory(prev => [...prev, runData])
    setBudget(prev => prev - biayaKaryawan + pendapatan)
    
    // 🟢 KUNCI PRODUK SECARA PERMANEN KARENA RUN SUDAH SELESAI DENGAN SAH
    setAllDoneIds(prev => {
      const idsBaru = produkTerpilih.map(p => p.id)
      return [...new Set([...prev, ...idsBaru])]
    })

    setKaryawanSesi([])
    setSessionStart(null)
    setXp(0)
  }

  function resetAll() {
    setXp(0)
    setPilihIds([])
    setSelesaiIds([])
    setAllDoneIds([])
    setGamePhaseRaw(null)
    setBudget(BUDGET_AWAL)
    setRunHistory([])
    setSessionStart(null)
    setKaryawanSesi([])
    Object.values(LS).forEach(k => {
      if (k !== LS.USER) {
        localStorage.removeItem(k)
      }
    })
  }

  function login(u)  { setUser(u) }
  function logout()  { setUser(null) }

  const totalXp           = runHistory.reduce((s, r) => s + r.xpRun, 0)
  const reviewUnlocked    = allDoneIds.length >= produkList.length
  const totalPendapatan   = runHistory.reduce((s, r) => s + r.pendapatan, 0)
  const totalWaktuBermain = runHistory.reduce((s, r) => s + r.waktuBermain, 0)

  return (
    <GameContext.Provider value={{
      xp, totalXp, tambahXP,
      user, login, logout,
      produkTerpilih, pilihIds, selesaiIds, allDoneIds,
      addProdukTerpilih, startNewSession, resetAll,
      gamePhase, setGamePhase,
      budget, budgetProduksi, waktuTersedia,
      karyawanSesi, sewaKaryawan, lepasKaryawan,
      runHistory, runKe, addRunResult,
      reviewUnlocked,
      totalPendapatan, totalWaktuBermain,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() { return useContext(GameContext) }
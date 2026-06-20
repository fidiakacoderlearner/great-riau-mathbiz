import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChange, logout as supabaseLogout } from '../lib/auth'
import {
  fetchProduk, fetchKaryawan, fetchKelasIdSiswa, salinProdukKeKelas,
  createSesi, updateSesi, createRun,
} from '../lib/game'
import {
  getHargaKaryawan,
  MAX_KARYAWAN,
  WAKTU_DASAR,
  INFLASI_RATE,
} from '../data/soalData'

const GameContext = createContext()
const BUDGET_AWAL = 600000

const LS = {
  PILIH_IDS:     'griau_produk_pilih_ids',
  SELESAI_IDS:   'griau_produk_selesai_ids',
  ALL_DONE:      'griau_all_completed',
  PHASE:         'griau_phase',
  BUDGET:        'griau_budget',
  RUN_HISTORY:   'griau_run_history',
  SESSION_START: 'griau_session_start',
  PERMAINAN_ID:  'griau_permainan_id',
}

function safeLoad(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : fallback
  } catch { return fallback }
}

export function GameProvider({ children }) {
  // ── Auth ─────────────────────────────────────────────────────────
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── Master Data dari Supabase ─────────────────────────────────────
  const [produkList,   setProdukList]   = useState([])
  const [karyawanList, setKaryawanList] = useState([])
  const [dataLoading,  setDataLoading]  = useState(true)

  // ── Game State ───────────────────────────────────────────────────
  const [xp,           setXp]           = useState(0)
  const [pilihIds,     setPilihIds]     = useState(() => safeLoad(LS.PILIH_IDS,    []))
  const [selesaiIds,   setSelesaiIds]   = useState(() => safeLoad(LS.SELESAI_IDS,  []))
  const [allDoneIds,   setAllDoneIds]   = useState(() => safeLoad(LS.ALL_DONE,     []))
  const [gamePhase,    setGamePhaseRaw] = useState(() => safeLoad(LS.PHASE,        null))
  const [budget,       setBudget]       = useState(() => safeLoad(LS.BUDGET,       BUDGET_AWAL))
  const [runHistory,   setRunHistory]   = useState(() => safeLoad(LS.RUN_HISTORY,  []))
  const [sessionStart, setSessionStart] = useState(() => safeLoad(LS.SESSION_START, null))
  const [karyawanSesi, setKaryawanSesi] = useState([])
  const [jawabanSementara, setJawabanSementara] = useState([])
  const [permainanId, setPermainanId] = useState(
    () => localStorage.getItem('griau_permainan_id') ?? null
  )

  // ── Load Auth ─────────────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (userData) => {

      if (userData) {
        console.log('User login:', userData.email, '| Role:', userData.role)

        // Hanya load progress kalau role-nya siswa
        if (userData.role === 'siswa') {
          try {
            const { fetchGameProgress } = await import('../lib/game')
            const storedPermainanId = localStorage.getItem('griau_permainan_id')
            const progress = await fetchGameProgress(userData.id, storedPermainanId)
            setAllDoneIds(progress.allDoneIds)
            setBudget(progress.budget)
            setRunHistory(progress.runHistory)
            setPermainanId(progress.permainanId)  // bisa null kalau permainan sudah selesai
          } catch (err) {
            console.error('Gagal load progress siswa:', err)
          }
        }
        // Guru tidak perlu load game progress
      }

      setUser(userData)
      setAuthLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Load Produk & Karyawan dari Supabase ─────────────────────────
  useEffect(() => {
    // Hanya load setelah auth selesai dan user diketahui
    if (authLoading) return

    let cancelled = false

    async function loadData() {
      try {
        let kelasId = null

        if (user?.role === 'siswa' && user?.id) {
          kelasId = await fetchKelasIdSiswa(user.id)
          if (kelasId) {
            await salinProdukKeKelas(kelasId)
          }
        }

        if (cancelled) return

        let produk = await fetchProduk(kelasId)

        if (cancelled) return

        // Fallback: kalau produk kelas kosong, pakai template global
        if (produk.length === 0) {
          produk = await fetchProduk(null)
        }

        const karyawan = await fetchKaryawan()

        if (cancelled) return

        setProdukList(produk)
        setKaryawanList(karyawan)
      } catch (err) {
        if (!cancelled) console.error('Gagal load data:', err)
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }

    loadData()

    return () => { cancelled = true }
  }, [user?.id])

  // ── Sync localStorage ────────────────────────────────────────────
  useEffect(() => { localStorage.setItem(LS.PILIH_IDS,    JSON.stringify(pilihIds))    }, [pilihIds])
  useEffect(() => { localStorage.setItem(LS.SELESAI_IDS,  JSON.stringify(selesaiIds))  }, [selesaiIds])
  useEffect(() => { localStorage.setItem(LS.ALL_DONE,     JSON.stringify(allDoneIds))  }, [allDoneIds])
  useEffect(() => { localStorage.setItem(LS.BUDGET,       JSON.stringify(budget))      }, [budget])
  useEffect(() => { localStorage.setItem(LS.RUN_HISTORY,  JSON.stringify(runHistory))  }, [runHistory])
  useEffect(() => {
    if (sessionStart) localStorage.setItem(LS.SESSION_START, JSON.stringify(sessionStart))
    else              localStorage.removeItem(LS.SESSION_START)
  }, [sessionStart])
  useEffect(() => {
    if (gamePhase) localStorage.setItem(LS.PHASE, JSON.stringify(gamePhase))
    else           localStorage.removeItem(LS.PHASE)
  }, [gamePhase])
  useEffect(() => {
    if (permainanId) localStorage.setItem(LS.PERMAINAN_ID, permainanId)
    else             localStorage.removeItem(LS.PERMAINAN_ID)
  }, [permainanId])

  // ── Derived ──────────────────────────────────────────────────────
  const produkTerpilih = pilihIds
    .map(id => produkList.find(p => p.id === id))
    .filter(Boolean)

  const runKe = runHistory.length

  function hitungBiayaKaryawan(levels, runIndex) {
    return levels.reduce((sum, level) => {
      const k = karyawanList.find(k => k.level === level)
      if (!k) return sum
      return sum + Math.round(k.hargaDasar * Math.pow(k.inflasiRate ?? INFLASI_RATE, runIndex))
    }, 0)
  }

  const totalBiayaKaryawan = hitungBiayaKaryawan(karyawanSesi, runKe)
  const budgetProduksi     = budget - totalBiayaKaryawan
  const waktuTersedia      = WAKTU_DASAR + karyawanSesi.reduce((sum, level) => {
    const k = karyawanList.find(k => k.level === level)
    return sum + (k?.tambahWaktu ?? 0)
  }, 0)

  const totalXp           = runHistory.reduce((s, r) => s + r.xpRun, 0)
  const totalPendapatan   = runHistory.reduce((s, r) => s + r.pendapatan, 0)
  const totalWaktuBermain = runHistory.reduce((s, r) => s + r.waktuBermain, 0)
  const reviewUnlocked    = allDoneIds.length >= produkList.length && produkList.length > 0

  // ── XP ───────────────────────────────────────────────────────────
  function tambahXP(jumlah) { setXp(prev => prev + Math.max(0, jumlah)) }

  // ── Karyawan ─────────────────────────────────────────────────────
  function sewaKaryawan(level) {
    if (karyawanSesi.length >= MAX_KARYAWAN) return false
    const k     = karyawanList.find(k => k.level === level)
    const harga = k ? Math.round(k.hargaDasar * Math.pow(k.inflasiRate ?? INFLASI_RATE, runKe)) : 0
    if (budgetProduksi - harga < 0) return false
    setKaryawanSesi(prev => [...prev, level])
    return true
  }

  function lepasKaryawan(index) {
    setKaryawanSesi(prev => prev.filter((_, i) => i !== index))
  }

  // ── Game Phase ───────────────────────────────────────────────────
  function setGamePhase(phase) { setGamePhaseRaw(phase) }

  // ── Produk ───────────────────────────────────────────────────────
  function addProdukTerpilih(produk) {
    setPilihIds  (prev => prev.includes(produk.id) ? prev : [...prev, produk.id])
    setSelesaiIds(prev => prev.includes(produk.id) ? prev : [...prev, produk.id])
  }

  // ── Start Session ────────────────────────────────────────────────
  async function startNewSession() {
    setXp(0)
    setPilihIds([])
    setSelesaiIds([])
    setGamePhaseRaw(null)
    setSessionStart(Date.now())
    setKaryawanSesi([])

    
  }

  // ── Add Run Result ────────────────────────────────────────────────
  async function addRunResult({ produkA, produkB, pendapatan, xpRun, optimal }) {
    const biayaKaryawan = hitungBiayaKaryawan(karyawanSesi, runKe)
    const waktuBermain  = sessionStart
      ? Math.floor((Date.now() - sessionStart) / 1000)
      : 0

    const runData = {
      run:            runHistory.length + 1,
      produkA:        produkA.nama,
      produkB:        produkB.nama,
      imageA:         produkA.image,
      imageB:         produkB.image,
      budgetAwal:     budget,
      biayaKaryawan,
      budgetProduksi: budget - biayaKaryawan,
      pendapatan,
      waktuBermain,
      waktuTersedia,
      xpRun,
      karyawanDisewa: [...karyawanSesi],
    }

    if (user) {
      try {
        const {
          fetchKelasIdSiswa, saveJawaban,
          createPermainan, updatePermainan
        } = await import('../lib/game')

        const kelasId = await fetchKelasIdSiswa(user.id)

        // Buat permainan baru kalau belum ada (run pertama)
        let currentPermainanId = permainanId
        if (!currentPermainanId) {
          const p = await createPermainan({ siswaId: user.id, kelasId })
          currentPermainanId = p.id
          setPermainanId(p.id)
        }

        const sesi = await createSesi({
          siswaId:      user.id,
          kelasId,
          budgetAwal:   budget,
          permainanId:  currentPermainanId,
        })

        await createRun({
          sesiId:            sesi.id,
          runKe:             runHistory.length + 1,
          produkADbId:       produkA.dbId,
          produkBDbId:       produkB.dbId,
          karyawanDisewa:    karyawanSesi,
          biayaKaryawan,
          budgetProduksi:    budget - biayaKaryawan,
          waktuTersedia,
          batchA:            optimal?.batchA ?? 0,
          batchB:            optimal?.batchB ?? 0,
          pendapatan,
          pendapatanOptimal: optimal?.revenue ?? 0,
          batchOptimalA:     optimal?.x ?? 0,
          batchOptimalB:     optimal?.y ?? 0,
          xpRun,
          waktuBermain,
        })

        if (jawabanSementara.length > 0) {
          await Promise.all(
            jawabanSementara.map(j => saveJawaban({
              runId:         runDb.id,
              produkDbId:    j.produkDbId,
              tipeSoal:      j.tipeSoal,
              jawabanBenar:  j.jawabanBenar,
              percobaanKe:   j.percobaanKe,
              hintDipakai:   j.hintDipakai,
              waktuMenjawab: j.waktuMenjawab,
              xpDiperoleh:   j.xpDiperoleh,
            }))
          )
        }

        const newRunCount      = runHistory.length + 1
        const newTotalXp       = totalXp + xpRun
        const newTotalPendapatan = totalPendapatan + pendapatan

        // Cek apakah permainan selesai (semua 10 produk)
        const produkBaru   = [...new Set([
          ...allDoneIds,
          ...produkTerpilih.map(p => p.id)
        ])]
        const permainanSelesai = produkBaru.length >= produkList.length

        await updatePermainan(currentPermainanId, {
          totalRun:        newRunCount,
          totalXp:         newTotalXp,
          totalPendapatan: newTotalPendapatan,
          status:          permainanSelesai ? 'selesai' : 'berjalan',
        })

        // Kalau permainan selesai, hapus dari localStorage
        if (permainanSelesai) {
          setPermainanId(null)
        }

        await updateSesi(sesi.id, {
          totalXp:         newTotalXp,          totalPendapatan: newTotalPendapatan,
          jumlahRun:       newRunCount,
          status:          'selesai',
        })
      } catch (err) {
        console.error('Gagal simpan run:', err)
      }
    }

    setRunHistory(prev => [...prev, runData])
    setBudget(prev => prev - biayaKaryawan + pendapatan)
    setAllDoneIds(prev => {
      const idsBaru = produkTerpilih.map(p => p.id)
      return [...new Set([...prev, ...idsBaru])]
    })
    setKaryawanSesi([])
    setSessionStart(null)
    setXp(0)
  }

  // ── Reset ─────────────────────────────────────────────────────────
  async function resetAll() {
    // Opsi B: hanya simpan kalau sudah ada minimal 1 run
    if (permainanId && user && runHistory.length > 0) {
      try {
        const { updatePermainan } = await import('../lib/game')
        await updatePermainan(permainanId, {
          totalRun:        runHistory.length,
          totalXp:         totalXp,
          totalPendapatan: totalPendapatan,
          status:          'tidak_selesai',
        })
      } catch (err) {
        console.error('Gagal tutup permainan:', err)
      }
    }

    setXp(0)
    setPilihIds([])
    setSelesaiIds([])
    setAllDoneIds([])
    setGamePhaseRaw(null)
    setBudget(BUDGET_AWAL)
    setRunHistory([])
    setSessionStart(null)
    setKaryawanSesi([])
    setPermainanId(null)
    setJawabanSementara([])
    Object.values(LS).forEach(k => localStorage.removeItem(k))
  }

  // ── Auth Actions ──────────────────────────────────────────────────
  async function logout() {
    await supabaseLogout()
    setUser(null)
    setXp(0)
    setPilihIds([])
    setSelesaiIds([])
    setGamePhaseRaw(null)
    setKaryawanSesi([])
    setSessionStart(null)
  }

  return (
  function catatJawaban(jawaban) {
    setJawabanSementara(prev => [...prev, jawaban])
  }

    <GameContext.Provider value={{
      // Auth
      user, authLoading, logout,

      // Data
      produkList, karyawanList, dataLoading,

      // XP
      xp, totalXp, tambahXP,

      // Produk
      produkTerpilih, pilihIds, selesaiIds, allDoneIds,
      addProdukTerpilih,

      // Session
      startNewSession, resetAll,
      gamePhase, setGamePhase,

      // Budget & Waktu
      budget, budgetProduksi, waktuTersedia,

      // Karyawan
      karyawanList, karyawanSesi, sewaKaryawan, lepasKaryawan,

      // Jawaban
      catatJawaban,

      // Run
      runHistory, runKe, addRunResult,

      // Stats
      reviewUnlocked,
      totalPendapatan,
      totalWaktuBermain,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() { return useContext(GameContext) }
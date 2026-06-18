import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import { getModalPerBatch, hitungOptimal } from '../../data/soalData'
import GameHeader from '../../components/GameHeader'
import usePreventBack from '../../hooks/usePreventBack' 
import usePreventRefresh from '../../hooks/usePreventRefresh'
import useAntiCheat from '../../hooks/useAntiCheat'

// ── Timer Hook ────────────────────────────────────────────────────
function useTimerLocal(onHabis, started = true) {
  const [detikSisa, setDetikSisa] = useState(300)
  const ref = useRef(null)

  useEffect(() => {
    if (!started) return
    ref.current = setInterval(() => {
      setDetikSisa(prev => {
        if (prev <= 1) {
          clearInterval(ref.current)
          onHabis()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [started])

  return detikSisa
}

// ── Timer Display ─────────────────────────────────────────────────
function TimerDisplay({ detik }) {
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return (
    <div
      className={`px-3 py-1 rounded-xl border-2 font-black text-sm
                  ${detik <= 60 ? 'animate-pulse' : ''}`}
      style={{
        borderColor: detik <= 60 ? '#C0392B' : '#333',
        color:       detik <= 60 ? '#C0392B' : '#333'
      }}>
      ⏱ {m}:{s.toString().padStart(2, '0')}
    </div>
  )
}

// ── Animasi Pembeli ───────────────────────────────────────────────
function BuyerAnimation({ onSelesai }) {
  const [progress, setProgress] = useState(0)
  const [pesan, setPesan] = useState('Toko Buka! Pembeli mulai berdatangan...')

  // 1. useEffect PERTAMA: Khusus menghitung angka progress bar saja
  useEffect(() => {
    const durasi = 7000 // 7 detik
    const tick = 50
    const increment = (tick / durasi) * 100

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(interval)
          return 100
        }
        return next
      })
    }, tick)

    return () => clearInterval(interval)
  }, [])

  // 2. useEffect KEDUA: Khusus untuk mengubah teks dan pindah halaman
  useEffect(() => {
    if (progress >= 100) {
      onSelesai()
    } else if (progress >= 75) {
      setPesan('Selesai berjualan! Menghitung pendapatan... 💰')
    } else if (progress >= 35) {
      setPesan('Melayani pembeli dengan senyuman... 😊')
    }
  }, [progress, onSelesai])

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#FDFBE4', overflow: 'hidden', padding: '1.5rem'
    }}>
      {/* Pastikan variabel imgTokoBuka sudah di-import di atas */}
      <img 
        src="/assets/toko-buka.png" 
        alt="Toko Jajanan Melayu Buka" 
        className="w-full max-w-3xl mb-8 object-contain drop-shadow-2xl transition-all duration-300 scale-[1.15] md:scale-100"
        style={{ maxHeight: '70vh' }}
      />
      <h2 className="text-xl md:text-2xl font-black mb-6 text-center" style={{ color: '#C0392B' }}>
        {pesan}
      </h2>
      <div style={{
        width: '100%', maxWidth: '20rem', height: '1rem',
        borderRadius: '9999px', backgroundColor: '#FADBD8',
        overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          backgroundColor: '#C0392B', borderRadius: '9999px',
          transition: 'width 50ms linear'
        }} />
      </div>
    </div>
  )
}

// ── Diagram Dinamis ───────────────────────────────────────────────
function DiagramDinamis({ produkA, produkB, batchA, batchB, optimal, budgetProduksi, waktuTersedia }) {
  const W = 280, H = 280, pad = 48
  const mA = getModalPerBatch(produkA)
  const mB = getModalPerBatch(produkB)
  const wA = produkA.waktuPerBatch
  const wB = produkB.waktuPerBatch

  const l1_xi = waktuTersedia / wA
  const l1_yi = waktuTersedia / wB
  const l2_xi = budgetProduksi / mA
  const l2_yi = budgetProduksi / mB

  const maxXD = Math.ceil(Math.max(l1_xi, l2_xi, optimal.x)) + 1
  const maxYD = Math.ceil(Math.max(l1_yi, l2_yi, optimal.y)) + 1

  const sx = (W - pad - 20) / maxXD
  const sy = (H - pad - 20) / maxYD

  function p(x, y) {
    return { x: pad + x * sx, y: H - pad - y * sy }
  }

  const det = wA * mB - wB * mA
  let xInt = -1, yInt = -1
  if (Math.abs(det) > 0.001) {
    xInt = (waktuTersedia * mB - budgetProduksi * wB) / det
    yInt = (wA * budgetProduksi - mA * waktuTersedia) / det
  }

  const corners = [p(0, 0)]
  corners.push(p(Math.min(l1_xi, l2_xi), 0))
  if (xInt >= 0 && yInt >= 0) corners.push(p(xInt, yInt))
  corners.push(p(0, Math.min(l1_yi, l2_yi)))
  const regionPath = corners.map((c, i) =>
    `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ') + ' Z'

  const l1a = p(0, Math.min(l1_yi, maxYD))
  const l1b = p(Math.min(l1_xi, maxXD), 0)
  const l2a = p(0, Math.min(l2_yi, maxYD))
  const l2b = p(Math.min(l2_xi, maxXD), 0)

  const optP     = p(optimal.x, optimal.y)
  const userP    = p(batchA, batchB)
  const userIsOpt = batchA === optimal.x && batchB === optimal.y

  const xTicks = Array.from({ length: maxXD }, (_, i) => i + 1)
  const yTicks = Array.from({ length: maxYD }, (_, i) => i + 1)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {xTicks.map(i => {
        const pt = p(i, 0)
        return <line key={`gx${i}`} x1={pt.x} y1={pad} x2={pt.x} y2={H - pad}
          stroke="#eee" strokeWidth="1"/>
      })}
      {yTicks.map(i => {
        const pt = p(0, i)
        return <line key={`gy${i}`} x1={pad} y1={pt.y} x2={W - 20} y2={pt.y}
          stroke="#eee" strokeWidth="1"/>
      })}

      <path d={regionPath} fill="rgba(30,132,73,0.12)"/>
      <line x1={l1a.x} y1={l1a.y} x2={l1b.x} y2={l1b.y}
        stroke="#C0392B" strokeWidth="2" strokeDasharray="6,3"/>
      <line x1={l2a.x} y1={l2a.y} x2={l2b.x} y2={l2b.y}
        stroke="#1E8449" strokeWidth="2" strokeDasharray="6,3"/>

      <line x1={pad} y1={H - pad} x2={W - 12} y2={H - pad} stroke="#333" strokeWidth="2"/>
      <line x1={pad} y1={H - pad} x2={pad}    y2={12}      stroke="#333" strokeWidth="2"/>
      <polygon points={`${W-12},${H-pad} ${W-19},${H-pad-4} ${W-19},${H-pad+4}`} fill="#333"/>
      <polygon points={`${pad},12 ${pad-4},19 ${pad+4},19`} fill="#333"/>
      <text x={W - 8} y={H - pad + 5} fontSize="11" fontWeight="bold"
        fill="#333" textAnchor="middle">x</text>
      <text x={pad} y={8} fontSize="11" fontWeight="bold"
        fill="#333" textAnchor="middle">y</text>

      {xTicks.filter(i => i < maxXD).map(i => {
        const pt = p(i, 0)
        return (
          <g key={`tx${i}`}>
            <line x1={pt.x} y1={H-pad-3} x2={pt.x} y2={H-pad+3}
              stroke="#555" strokeWidth="1.5"/>
            <text x={pt.x} y={H-pad+14} fontSize="9" fill="#555" textAnchor="middle">{i}</text>
          </g>
        )
      })}
      {yTicks.filter(i => i < maxYD).map(i => {
        const pt = p(0, i)
        return (
          <g key={`ty${i}`}>
            <line x1={pad-3} y1={pt.y} x2={pad+3} y2={pt.y}
              stroke="#555" strokeWidth="1.5"/>
            <text x={pad-6} y={pt.y+4} fontSize="9" fill="#555" textAnchor="end">{i}</text>
          </g>
        )
      })}

      <circle cx={optP.x} cy={optP.y} r="7" fill="#F1C40F" stroke="#333" strokeWidth="2"/>
      <text x={optP.x + 10} y={optP.y - 6} fontSize="8" fontWeight="bold" fill="#333">
        Maks! ({optimal.x},{optimal.y})
      </text>

      {!userIsOpt && batchA >= 0 && batchB >= 0 && (
        <>
          <circle cx={userP.x} cy={userP.y} r="5"
            fill="#C0392B" stroke="white" strokeWidth="2"/>
          <text x={userP.x + 8} y={userP.y - 4}
            fontSize="8" fontWeight="bold" fill="#C0392B">
            Kamu ({batchA},{batchB})
          </text>
        </>
      )}

      <line x1={pad} y1={H-8} x2={pad+16} y2={H-8}
        stroke="#C0392B" strokeWidth="2" strokeDasharray="5,3"/>
      <text x={pad+20} y={H-4} fontSize="7" fill="#C0392B">Waktu</text>
      <line x1={pad+55} y1={H-8} x2={pad+71} y2={H-8}
        stroke="#1E8449" strokeWidth="2" strokeDasharray="5,3"/>
      <text x={pad+75} y={H-4} fontSize="7" fill="#1E8449">Modal</text>
      <circle cx={pad+115} cy={H-9} r="4" fill="#F1C40F" stroke="#333" strokeWidth="1.5"/>
      <text x={pad+122} y={H-4} fontSize="7" fill="#333">Optimal</text>
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────
function BertemuPembeli() {
  const navigate = useNavigate()
  const {
    xp, produkTerpilih, setGamePhase,
    addRunResult, budget,
    budgetProduksi, waktuTersedia,   
  } = useGame()

  usePreventBack()
  usePreventRefresh()
  useAntiCheat()

  useEffect(() => { setGamePhase('pembeli') }, [])

  const [batchA,       setBatchA]       = useState(0)
  const [batchB,       setBatchB]       = useState(0)
  const [step,         setStep]         = useState('setup')
  const [timerHabis,   setTimerHabis]   = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)

  const detikSisa = useTimerLocal(() => setTimerHabis(true), timerStarted)

  const produkA = produkTerpilih[0]
  const produkB = produkTerpilih[1]

  // Fallback jika produk belum ada
  if (!produkA || !produkB) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FDFBE4', padding: '1rem'
      }}>
        <p style={{ fontWeight: 700, color: '#C0392B', marginBottom: '1rem' }}>
          Selesaikan Rancangan Usaha dan Dapur Produksi terlebih dahulu!
        </p>
        <button
          onClick={() => navigate('/eksplorasi/rancangan-usaha')}
          style={{
            padding: '0.75rem 2rem', borderRadius: '1rem',
            backgroundColor: '#C0392B', color: 'white',
            fontWeight: 700, border: 'none', cursor: 'pointer'
          }}>
          Mulai dari Awal
        </button>
      </div>
    )
  }

  const mA          = getModalPerBatch(produkA)
  const mB          = getModalPerBatch(produkB)
  const totalModal  = batchA * mA + batchB * mB
  const totalWaktu  = batchA * produkA.waktuPerBatch + batchB * produkB.waktuPerBatch
  const modalOk     = totalModal <= budgetProduksi
  const waktuOk     = totalWaktu <= waktuTersedia
  const statusOk    = modalOk && waktuOk

  const totalUnitA  = batchA * produkA.isiPerBatch
  const totalUnitB  = batchB * produkB.isiPerBatch
  const pendapatan  = totalUnitA * produkA.hargaJual + totalUnitB * produkB.hargaJual

  const optimal = hitungOptimal(produkA, produkB, budgetProduksi, waktuTersedia)

  const kategori = pendapatan === optimal.revenue
    ? 'maksimum'
    : pendapatan >= optimal.revenue * 0.75 ? 'lumayan' : 'kurang'

  const infoKategori = {
    maksimum: {
      emoji: '🏆', warna: '#1E8449',
      judul: 'Pendapatanmu Maksimal!',
      pesan: 'Luar biasa! Kamu sudah menemukan kombinasi produksi terbaik. Yuk, sajikan dalam bentuk Sistem Pertidaksamaan!'
    },
    lumayan: {
      emoji: '😊', warna: '#F39C12',
      judul: 'Pendapatanmu Sudah Lumayan!',
      pesan: 'Namun belum maksimum. Yuk, lihat bagaimana kita bisa mendapat pendapatan maksimum menggunakan Sistem Pertidaksamaan!'
    },
    kurang: {
      emoji: '😅', warna: '#C0392B',
      judul: 'Pendapatanmu Masih Kurang.',
      pesan: 'Tidak apa-apa! Yuk, lihat bagaimana kita bisa mendapat pendapatan maksimum menggunakan Sistem Pertidaksamaan!'
    }
  }
  const info = infoKategori[kategori]

  function handleSelesai() {
    addRunResult({
      produkA,
      produkB,
      pendapatan,
      xpRun: xp
    })
    setGamePhase(null)
    navigate('/')
  }

  // ── Waktu Habis ───────────────────────────────────────────────────
  if (timerHabis) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FDFBE4', padding: '1rem'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏰</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C0392B' }}>
          Waktu Habis!
        </h2>
        <p style={{ color: '#666', fontWeight: 600, margin: '0.5rem 0 1.5rem' }}>
          Tidak apa-apa, coba lagi ya!
        </p>
        <button
          onClick={() => { setGamePhase(null); navigate('/') }}
          style={{
            padding: '0.75rem 2rem', borderRadius: '1rem',
            backgroundColor: '#C0392B', color: 'white',
            fontWeight: 700, border: 'none', cursor: 'pointer'
          }}>
          Kembali ke Menu
        </button>
      </div>
    )
  }

  // ── Setup ─────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        backgroundColor: '#FDFBE4', overflow: 'hidden'
      }}>
        <GameHeader
          badge="🛒 Bertemu Pembeli"
          badgeWarna="#C0392B"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <p className="text-center font-black text-lg pt-3 px-4" style={{ color: '#333' }}>
          Yuk, berjualan!
        </p>
        <p className="text-center text-sm font-semibold text-gray-400 pb-3 px-4">
          MISI: Tebak Pendapatan Maksimum — atur jumlah batch produksimu!
        </p>
        <p className="text-center text-xs font-bold pb-2 px-4"
          style={{ color: '#1E8449' }}>
          💰 Budget tersedia: Rp{budgetProduksi.toLocaleString('id-ID')}
        </p>

        <div
          className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-8 pb-4"
          style={{
            maxWidth: '56rem', margin: '0 auto', width: '100%',
            overflowY: 'auto', alignItems: 'flex-start'
          }}>

          {/* Kiri: Steppers */}
          <div className="w-full md:flex-1 flex flex-col gap-4">

            {/* Stepper A */}
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border: '2px solid #ddd' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold flex items-center gap-2">
                  <img src={produkA.image} alt={produkA.nama} className="w-5 h-5 md:w-6 md:h-6 object-contain drop-shadow-sm" />
                  Batch {produkA.nama}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {produkA.waktuPerBatch} mnt/batch
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                1 batch = {produkA.isiPerBatch} {produkA.satuan} ×
                Rp{produkA.hargaJual.toLocaleString('id-ID')} =
                Rp{mA.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={() => setBatchA(prev => Math.max(0, prev - 1))}
                  className="w-10 h-10 rounded-full font-black text-xl text-white
                             flex items-center justify-center active:scale-95"
                  style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
                  −
                </button>
                <span className="font-black text-3xl w-8 text-center">{batchA}</span>
                <button
                  onClick={() => setBatchA(prev => prev + 1)}
                  className="w-10 h-10 rounded-full font-black text-xl text-white
                             flex items-center justify-center active:scale-95"
                  style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
                  +
                </button>
              </div>
            </div>

            {/* Stepper B */}
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border: '2px solid #ddd' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold flex items-center gap-2">
                  <img src={produkB.image} alt={produkB.nama} className="w-5 h-5 md:w-6 md:h-6 object-contain drop-shadow-sm" />
                  Batch {produkB.nama}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {produkB.waktuPerBatch} mnt/batch
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                1 batch = {produkB.isiPerBatch} {produkB.satuan} ×
                Rp{produkB.hargaJual.toLocaleString('id-ID')} =
                Rp{mB.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={() => setBatchB(prev => Math.max(0, prev - 1))}
                  className="w-10 h-10 rounded-full font-black text-xl text-white
                             flex items-center justify-center active:scale-95"
                  style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
                  −
                </button>
                <span className="font-black text-3xl w-8 text-center">{batchB}</span>
                <button
                  onClick={() => setBatchB(prev => prev + 1)}
                  className="w-10 h-10 rounded-full font-black text-xl text-white
                             flex items-center justify-center active:scale-95"
                  style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Kanan: Status + Tombol */}
          <div className="w-full md:w-64 flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border: `2px solid ${statusOk ? '#1E8449' : '#C0392B'}` }}>
              <p className="font-black text-center mb-3"
                style={{ color: statusOk ? '#1E8449' : '#C0392B' }}>
                {statusOk ? '✅ Status OK' : '❌ Melewati Batas!'}
              </p>
              <div className="flex flex-col gap-2 text-sm font-semibold">
                <div className="flex justify-between p-2 rounded-xl"
                  style={{ backgroundColor: waktuOk ? '#D5F5E3' : '#FADBD8' }}>
                  <span>⏱ Waktu</span>
                  <span style={{ color: waktuOk ? '#1E8449' : '#C0392B' }}>
                    {totalWaktu}/{waktuTersedia} mnt
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-xl"
                  style={{ backgroundColor: modalOk ? '#D5F5E3' : '#FADBD8' }}>
                  <span>💰 Modal</span>
                  <span style={{ color: modalOk ? '#1E8449' : '#C0392B' }}>
                    Rp{totalModal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setTimerStarted(true); setStep('berjualan') }}
              disabled={!statusOk || (batchA === 0 && batchB === 0)}
              className="w-full py-4 rounded-2xl text-white font-black text-lg
                         active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
              Mulai Berjualan! 🚀
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Animasi ───────────────────────────────────────────────────────
  if (step === 'berjualan') {
    return <BuyerAnimation onSelesai={() => setStep('hasil')} />
  }

  // ── Hasil ─────────────────────────────────────────────────────────
  if (step === 'hasil') {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        backgroundColor: '#FDFBE4', overflow: 'hidden'
      }}>
        <GameHeader
          badge="🛒 Bertemu Pembeli"
          badgeWarna="#C0392B"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div
          className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-8 py-4"
          style={{
            maxWidth: '56rem', margin: '0 auto', width: '100%',
            overflowY: 'auto', alignItems: 'flex-start'
          }}>

          {/* Kiri: Kartu Pendapatan */}
          <div className="w-full md:flex-1 bg-white rounded-3xl p-5 shadow"
            style={{ border: '2px solid #ddd' }}>
            <h3 className="font-black text-center mb-4">
              Total Pendapatanmu Hari Ini
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center p-3 rounded-2xl"
                style={{ backgroundColor: '#EAF4FB' }}>
                <span className="font-bold text-sm flex items-center gap-2">
                  <img src={produkA.image} alt={produkA.nama} className="w-6 h-6 object-contain drop-shadow-sm" />
                  {produkA.nama} terjual
                </span>
                <span className="font-black">{totalUnitA} {produkA.satuan}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl"
                style={{ backgroundColor: '#EAF4FB' }}>
                <span className="font-bold text-sm flex items-center gap-2">
                  <img src={produkB.image} alt={produkB.nama} className="w-6 h-6 object-contain drop-shadow-sm" />
                  {produkB.nama} terjual
                </span>
                <span className="font-black">{totalUnitB} {produkB.satuan}</span>
              </div>
              <div className="p-4 rounded-2xl text-center"
                style={{ backgroundColor: '#D5F5E3', border: '2px solid #1E8449' }}>
                <p className="font-bold text-sm text-gray-600 mb-1">
                  💵 Total Pendapatan
                </p>
                <p className="font-black text-2xl" style={{ color: '#1E8449' }}>
                  Rp{pendapatan.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Kanan: Kategori + XP + Tombol */}
          <div className="w-full md:flex-1 flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border: `2px solid ${info.warna}` }}>
              <div className="text-center text-4xl mb-2">{info.emoji}</div>
              <h3 className="font-black text-center mb-2"
                style={{ color: info.warna }}>
                {info.judul}
              </h3>
              <p className="text-sm font-semibold text-gray-600 text-center leading-relaxed">
                {info.pesan}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-4 text-center shadow"
              style={{ border: '2px solid #F1C40F' }}>
              <p className="font-bold text-gray-400 text-sm">Total XP Sesi Ini</p>
              <p className="font-black text-3xl" style={{ color: '#F1C40F' }}>
                ⭐ {xp} XP
              </p>
            </div>

            <button
              onClick={() => setStep('penjelasan')}
              className="w-full py-4 rounded-2xl text-white font-black text-lg active:scale-95"
              style={{ backgroundColor: info.warna, border: 'none', cursor: 'pointer' }}>
              Yuk Mulai! 📊
            </button>

            <button
              onClick={handleSelesai}
              className="w-full py-3 rounded-2xl font-bold"
              style={{ backgroundColor: '#eee', color: '#666',
                       border: 'none', cursor: 'pointer' }}>
              Simpan & Kembali ke Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Penjelasan + Diagram ──────────────────────────────────────────
  if (step === 'penjelasan') {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        backgroundColor: '#FDFBE4'
      }}>
        <GameHeader
          badge="📊 Sistem Pertidaksamaan"
          badgeWarna="#1E8449"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <h2 className="font-black text-center text-xl px-4 pt-3"
          style={{ color: '#333', flexShrink: 0 }}>
          Bagaimana Mencari Pendapatan Maksimum?
        </h2>

        <div className="flex-1 overflow-y-auto">
          <div
            className="flex flex-col md:flex-row gap-4 px-4 md:px-8 py-4"
            style={{ maxWidth: '64rem', margin: '0 auto', width: '100%' }}>

            {/* Kiri: Sistem + Solusi */}
            <div className="flex flex-col gap-4 md:flex-1">

              <div className="bg-white rounded-3xl p-5 shadow"
                style={{ border: '2px solid #ddd' }}>
                <h3 className="font-black mb-3 text-center" style={{ color: '#1E8449' }}>
                  Sistem Pertidaksamaan
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: '⏱ Kendala Waktu',
                      rumus: `${produkA.waktuPerBatch}x + ${produkB.waktuPerBatch}y ≤ ${waktuTersedia} mnt`
                    },
                    {
                      label: '💰 Kendala Modal',
                      rumus: `${mA.toLocaleString('id-ID')}x + ${mB.toLocaleString('id-ID')}y ≤ ${budgetProduksi.toLocaleString('id-ID')}`
                    },
                    { label: '📦 Non-negatif', rumus: 'x ≥ 0,  y ≥ 0' },
                    {
                      label: '🎯 Fungsi Tujuan',
                      rumus: `Z = ${mA.toLocaleString('id-ID')}x + ${mB.toLocaleString('id-ID')}y (maks)`
                    }
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-2xl"
                      style={{ backgroundColor: '#EAF4FB' }}>
                      <p className="text-xs font-bold text-gray-500">{item.label}</p>
                      <p className="font-black text-sm">{item.rumus}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow"
                style={{ border: '2px solid #F1C40F' }}>
                <h3 className="font-black text-center mb-3">🏆 Solusi Optimal</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Titik Optimal', nilai: `x = ${optimal.x},  y = ${optimal.y}` },
                    {
                      label: (
                        <span className="flex items-center gap-1.5">
                          <img src={produkA.image} alt={produkA.nama} className="w-5 h-5 object-contain drop-shadow-sm" />
                          {produkA.nama}
                        </span>
                      ),
                      nilai: `${optimal.x} batch = ${optimal.x * produkA.isiPerBatch} ${produkA.satuan}`
                    },
                    {
                      label: (
                        <span className="flex items-center gap-1.5">
                          <img src={produkB.image} alt={produkB.nama} className="w-5 h-5 object-contain drop-shadow-sm" />
                          {produkB.nama}
                        </span>
                      ),
                      nilai: `${optimal.y} batch = ${optimal.y * produkB.isiPerBatch} ${produkB.satuan}`
                    },
                    { label: '⏱ Total waktu', nilai: `${optimal.waktuTerpakai} dari ${waktuTersedia} menit` },
                    {
                      label: '💰 Total modal',
                      nilai: `Rp${optimal.modalTerpakai.toLocaleString('id-ID')} dari Rp${budgetProduksi.toLocaleString('id-ID')}`
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-xl"
                      style={{ backgroundColor: '#FEF9E7' }}>
                      <span className="text-xs font-bold text-gray-600">{item.label}</span>
                      <span className="text-xs font-black">{item.nilai}</span>
                    </div>
                  ))}
                  <div className="p-3 rounded-2xl mt-1 text-center"
                    style={{ backgroundColor: '#D5F5E3', border: '2px solid #1E8449' }}>
                    <p className="font-bold text-sm text-gray-600">Pendapatan Maksimum</p>
                    <p className="font-black text-2xl" style={{ color: '#1E8449' }}>
                      Rp{optimal.revenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanan: Diagram + Perbandingan + Tombol */}
            <div className="flex flex-col gap-4 md:flex-1">

              <div className="bg-white rounded-3xl p-4 shadow"
                style={{ border: '2px solid #ddd' }}>
                <h3 className="font-black text-center mb-1" style={{ color: '#1E8449' }}>
                  Grafik Daerah Feasibel
                </h3>
                <p className="text-xs text-center text-gray-400 font-semibold mb-2">
                  x = batch {produkA.nama} | y = batch {produkB.nama}
                </p>
                <DiagramDinamis
                  produkA={produkA}
                  produkB={produkB}
                  batchA={batchA}
                  batchB={batchB}
                  optimal={optimal}
                  budgetProduksi={budgetProduksi}  
                  waktuTersedia={waktuTersedia}  
                />
              </div>

              {kategori !== 'maksimum' && (
                <div className="bg-white rounded-3xl p-4 shadow"
                  style={{ border: '2px solid #C0392B' }}>
                  <p className="font-bold text-center text-sm mb-3"
                    style={{ color: '#C0392B' }}>
                    Perbandingan Pendapatanmu
                  </p>
                  <div className="flex justify-around">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-400">Pilihanmu</p>
                      <p className="font-black text-lg" style={{ color: '#C0392B' }}>
                        Rp{pendapatan.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-400">Maksimum</p>
                      <p className="font-black text-lg" style={{ color: '#1E8449' }}>
                        Rp{optimal.revenue.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSelesai}
                className="w-full py-4 rounded-2xl text-white font-black text-lg active:scale-95"
                style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
                🏠 Selesai & Kembali ke Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default BertemuPembeli
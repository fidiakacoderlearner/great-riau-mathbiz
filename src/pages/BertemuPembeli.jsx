import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import XPBar from '../components/XPBar'

const HARGA_JUAL    = { kemojo: 30000, bangkit: 58000 }
const MODAL_BATCH   = { kemojo: 120000, bangkit: 116000 }
const MODAL_TOTAL   = 600000
const WAKTU_TOTAL   = 360
const WAKTU_BATCH   = { kemojo: 80, bangkit: 60 }
const ISI_BATCH     = { kemojo: 4, bangkit: 2 }
const PENDAPATAN_MAKS = 592000   // optimal di x=3, y=2

// ─── Animasi Pembeli ─────────────────────────────────────────────
function BuyerAnimation({ onSelesai }) {
  useEffect(() => {
    const t = setTimeout(onSelesai, 5000)
    return () => clearTimeout(t)
  }, [])

  const buyers = [
    { emoji: '👩',   produk: '🍰 + 🍪', delay: '0s',   top: 80  },
    { emoji: '👨',   produk: '🍪🍪',    delay: '1s',   top: 140 },
    { emoji: '👴',   produk: '🍰🍰🍰', delay: '2s',   top: 200 },
    { emoji: '👩‍💼', produk: '🍰 + 🍪', delay: '3s',   top: 260 },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{ backgroundColor: '#FDFBE4' }}>

      <style>{`
        @keyframes jalanKanan {
          0%   { transform: translateX(-80px); opacity: 0; }
          15%  { opacity: 1; }
          60%  { transform: translateX(200px); opacity: 1; }
          85%  { transform: translateX(340px); opacity: 1; }
          100% { transform: translateX(420px); opacity: 0; }
        }
      `}</style>

      <h2 className="text-2xl font-black mb-1" style={{ color: '#C0392B' }}>
        🏪 Toko Buka!
      </h2>
      <p className="font-semibold text-gray-500 mb-6">Pembeli berdatangan...</p>

      <div className="relative w-full max-w-xs h-80">
        {buyers.map((b, i) => (
          <div key={i}
            className="absolute flex items-center gap-2"
            style={{
              top: `${b.top - 80}px`,
              left: 0,
              animation: `jalanKanan 3s ease-in-out forwards`,
              animationDelay: b.delay
            }}>
            <span className="text-3xl">{b.emoji}</span>
            <span className="text-sm font-bold bg-white px-2 py-1 rounded-xl shadow">
              {b.produk}
            </span>
          </div>
        ))}
      </div>

      <p className="text-gray-400 font-semibold animate-pulse">
        ⏳ Menghitung pendapatan...
      </p>
    </div>
  )
}

// ─── Diagram Koordinat SVG ────────────────────────────────────────
function DiagramKoordinat({ batchKemojo, batchBangkit }) {
  const W   = 280
  const H   = 280
  const pad = 48
  const sx  = (W - pad - 20) / 6
  const sy  = (H - pad - 20) / 7

  function p(x, y) {
    return { x: pad + x * sx, y: H - pad - y * sy }
  }

  // Titik-titik garis kendala
  const l1a = p(0, 6),      l1b = p(4.5, 0)     // 80x+60y=360
  const l2a = p(0, 5.172),  l2b = p(5, 0)        // 120x+116y=600 (ribuan)

  // Daerah feasibel
  const v0 = p(0, 0)
  const v1 = p(4.5, 0)
  const v2 = p(2.769, 2.308)
  const v3 = p(0, 5.172)
  const region = `M${v0.x},${v0.y} L${v1.x},${v1.y} L${v2.x},${v2.y} L${v3.x},${v3.y} Z`

  const opt  = p(3, 2)
  const user = p(batchKemojo, batchBangkit)
  const userIsOpt = batchKemojo === 3 && batchBangkit === 2

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>

      {/* Grid tipis */}
      {[1,2,3,4,5,6].map(i => {
        const px = p(i,0); const py = p(0,i)
        return (
          <g key={i}>
            <line x1={px.x} y1={pad} x2={px.x} y2={H-pad} stroke="#eee" strokeWidth="1"/>
            {i<=6 && <line x1={pad} y1={py.y} x2={W-20} y2={py.y} stroke="#eee" strokeWidth="1"/>}
          </g>
        )
      })}

      {/* Daerah feasibel */}
      <path d={region} fill="rgba(30,132,73,0.12)" />

      {/* Garis kendala */}
      <line x1={l1a.x} y1={l1a.y} x2={l1b.x} y2={l1b.y}
        stroke="#C0392B" strokeWidth="2" strokeDasharray="6,3"/>
      <line x1={l2a.x} y1={l2a.y} x2={l2b.x} y2={l2b.y}
        stroke="#1E8449" strokeWidth="2" strokeDasharray="6,3"/>

      {/* Sumbu */}
      <line x1={pad} y1={H-pad} x2={W-12} y2={H-pad} stroke="#333" strokeWidth="2"/>
      <line x1={pad} y1={H-pad} x2={pad}   y2={12}    stroke="#333" strokeWidth="2"/>
      {/* Anak panah */}
      <polygon points={`${W-12},${H-pad} ${W-19},${H-pad-4} ${W-19},${H-pad+4}`} fill="#333"/>
      <polygon points={`${pad},12 ${pad-4},19 ${pad+4},19`} fill="#333"/>

      {/* Label sumbu */}
      <text x={W-8}  y={H-pad+5}  fontSize="12" fontWeight="bold" fill="#333" textAnchor="middle">x</text>
      <text x={pad}  y={8}         fontSize="12" fontWeight="bold" fill="#333" textAnchor="middle">y</text>

      {/* Tick & angka sumbu x */}
      {[1,2,3,4,5].map(i => {
        const pt = p(i,0)
        return (
          <g key={`x${i}`}>
            <line x1={pt.x} y1={H-pad-3} x2={pt.x} y2={H-pad+3} stroke="#555" strokeWidth="1.5"/>
            <text x={pt.x} y={H-pad+14} fontSize="9" fill="#555" textAnchor="middle">{i}</text>
          </g>
        )
      })}
      {/* Tick & angka sumbu y */}
      {[1,2,3,4,5,6].map(i => {
        const pt = p(0,i)
        return (
          <g key={`y${i}`}>
            <line x1={pad-3} y1={pt.y} x2={pad+3} y2={pt.y} stroke="#555" strokeWidth="1.5"/>
            <text x={pad-6} y={pt.y+4} fontSize="9" fill="#555" textAnchor="end">{i}</text>
          </g>
        )
      })}

      {/* Titik sudut daerah feasibel */}
      {[v0, v1, v2, v3].map((vt, i) => (
        <circle key={i} cx={vt.x} cy={vt.y} r="3" fill="#888" />
      ))}

      {/* Titik optimal */}
      <circle cx={opt.x} cy={opt.y} r="8" fill="#F1C40F" stroke="#333" strokeWidth="2"/>
      <text x={opt.x+11} y={opt.y-6} fontSize="9" fontWeight="bold" fill="#333">
        Maks! (3,2)
      </text>

      {/* Titik user (kalau beda dari optimal) */}
      {!userIsOpt && batchKemojo >= 0 && batchBangkit >= 0 && (
        <>
          <circle cx={user.x} cy={user.y} r="6"
            fill="#C0392B" stroke="white" strokeWidth="2"/>
          <text x={user.x+9} y={user.y-5} fontSize="9" fontWeight="bold" fill="#C0392B">
            Kamu ({batchKemojo},{batchBangkit})
          </text>
        </>
      )}

      {/* Legenda */}
      <line x1={pad} y1={H-8} x2={pad+18} y2={H-8}
        stroke="#C0392B" strokeWidth="2" strokeDasharray="5,3"/>
      <text x={pad+22} y={H-4} fontSize="8" fill="#C0392B">Waktu</text>
      <line x1={pad+65} y1={H-8} x2={pad+83} y2={H-8}
        stroke="#1E8449" strokeWidth="2" strokeDasharray="5,3"/>
      <text x={pad+87} y={H-4} fontSize="8" fill="#1E8449">Modal</text>
      <circle cx={pad+135} cy={H-9} r="5" fill="#F1C40F" stroke="#333" strokeWidth="1.5"/>
      <text x={pad+143} y={H-4} fontSize="8" fill="#333">Optimal</text>
    </svg>
  )
}

// ─── Halaman Utama ────────────────────────────────────────────────
function BertemuPembeli() {
  const navigate  = useNavigate()
  const { xp }    = useGame()

  const [batchKemojo,  setBatchKemojo]  = useState(0)
  const [batchBangkit, setBatchBangkit] = useState(0)
  const [step, setStep] = useState('setup')

  // Kalkulasi
  const totalModal  = batchKemojo  * MODAL_BATCH.kemojo  + batchBangkit * MODAL_BATCH.bangkit
  const totalWaktu  = batchKemojo  * WAKTU_BATCH.kemojo  + batchBangkit * WAKTU_BATCH.bangkit
  const modalOk     = totalModal  <= MODAL_TOTAL
  const waktuOk     = totalWaktu  <= WAKTU_TOTAL
  const statusOk    = modalOk && waktuOk

  const totalKemojo  = batchKemojo  * ISI_BATCH.kemojo
  const totalBangkit = batchBangkit * ISI_BATCH.bangkit
  const pendapatan   = totalKemojo * HARGA_JUAL.kemojo + totalBangkit * HARGA_JUAL.bangkit

  // Kategori pendapatan
  const kategori = pendapatan === PENDAPATAN_MAKS
    ? 'maksimum'
    : pendapatan >= 350000
      ? 'lumayan'
      : 'kurang'

  const infoKategori = {
    maksimum: {
      emoji: '🏆',
      judul: 'Pendapatanmu Maksimal!',
      pesan: 'Luar biasa! Kamu sudah menemukan kombinasi produksi terbaik. Yuk, sajikan dalam bentuk Sistem Pertidaksamaan!',
      warna: '#1E8449'
    },
    lumayan: {
      emoji: '😊',
      judul: 'Pendapatanmu Sudah Lumayan!',
      pesan: 'Namun belum maksimum. Yuk, lihat bagaimana kita bisa mendapat pendapatan maksimum menggunakan Sistem Pertidaksamaan!',
      warna: '#F39C12'
    },
    kurang: {
      emoji: '😅',
      judul: 'Pendapatanmu Masih Kurang.',
      pesan: 'Tidak apa-apa! Yuk, lihat bagaimana kita bisa mendapat pendapatan maksimum menggunakan Sistem Pertidaksamaan!',
      warna: '#C0392B'
    }
  }

  const info = infoKategori[kategori]

  // ── Setup ─────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FDFBE4' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b-2 mb-4"
          style={{ borderColor: '#ddd' }}>
          <XPBar />
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#C0392B' }}>🛒 Bertemu Pembeli</span>
          <div />
        </div>

        <p className="font-black text-center text-lg mb-1 px-4" style={{ color: '#333' }}>
          Yuk, berjualan! — MISI: Tebak Pendapatan Maksimum
        </p>
        <p className="text-center text-sm font-semibold text-gray-400 mb-4 px-4">
          Atur jumlah batch produksimu. Ingat keterbatasan waktu dan modal!
        </p>

        {/* Desktop: 2 kolom | Mobile: stack */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-8
                        max-w-4xl mx-auto w-full">

          {/* Kiri: Steppers */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Stepper Kemojo */}
            <div className="bg-white rounded-3xl p-5 shadow flex-1"
              style={{ border: '2px solid #ddd' }}>
              <div className="flex justify-between mb-1">
                <span className="font-bold">🍰 Batch Bolu Kemojo</span>
                <span className="text-xs font-semibold text-gray-400">80 mnt/batch</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                1 batch = 4 loyang × Rp30.000 = Rp120.000
              </p>
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => setBatchKemojo(prev => Math.max(0, prev - 1))}
                  className="w-12 h-12 rounded-full font-black text-2xl text-white
                            active:scale-95 transition-transform"
                  style={{ backgroundColor: '#C0392B' }}>−</button>
                <span className="font-black text-4xl w-10 text-center">{batchKemojo}</span>
                <button onClick={() => setBatchKemojo(prev => prev + 1)}
                  className="w-12 h-12 rounded-full font-black text-2xl text-white
                            active:scale-95 transition-transform"
                  style={{ backgroundColor: '#1E8449' }}>+</button>
              </div>
            </div>

            {/* Stepper Bangkit */}
            <div className="bg-white rounded-3xl p-5 shadow flex-1"
              style={{ border: '2px solid #ddd' }}>
              <div className="flex justify-between mb-1">
                <span className="font-bold">🍪 Batch Kue Bangkit</span>
                <span className="text-xs font-semibold text-gray-400">60 mnt/batch</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                1 batch = 2 toples × Rp58.000 = Rp116.000
              </p>
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => setBatchBangkit(prev => Math.max(0, prev - 1))}
                  className="w-12 h-12 rounded-full font-black text-2xl text-white
                            active:scale-95 transition-transform"
                  style={{ backgroundColor: '#C0392B' }}>−</button>
                <span className="font-black text-4xl w-10 text-center">{batchBangkit}</span>
                <button onClick={() => setBatchBangkit(prev => prev + 1)}
                  className="w-12 h-12 rounded-full font-black text-2xl text-white
                            active:scale-95 transition-transform"
                  style={{ backgroundColor: '#1E8449' }}>+</button>
              </div>
            </div>
          </div>

          {/* Kanan: Status + Tombol */}
          <div className="flex flex-col gap-4 md:w-64">
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
                    {totalWaktu}/360 mnt
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
              onClick={() => setStep('berjualan')}
              disabled={!statusOk || (batchKemojo === 0 && batchBangkit === 0)}
              className="w-full py-4 rounded-2xl text-white font-black text-lg
                        active:scale-95 transition-transform disabled:opacity-40"
              style={{ backgroundColor: '#C0392B' }}>
              Mulai Berjualan! 🚀
            </button>
          </div>
        </div>

        {/* Padding bawah mobile */}
        <div className="h-4 md:hidden" />
      </div>
    )
  }

  // ── Animasi Berjualan ─────────────────────────
  if (step === 'berjualan') {
    return <BuyerAnimation onSelesai={() => setStep('hasil')} />
  }

  // ── Hasil ─────────────────────────────────────
  if (step === 'hasil') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FDFBE4' }}>

        <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b-2 mb-4"
          style={{ borderColor: '#ddd' }}>
          <XPBar />
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#C0392B' }}>🛒 Bertemu Pembeli</span>
          <div />
        </div>

        {/* Desktop: 2 kolom | Mobile: stack */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-8
                        max-w-4xl mx-auto w-full items-start">

          {/* Kiri: Pendapatan */}
          <div className="flex-1 bg-white rounded-3xl p-6 shadow"
            style={{ border: '2px solid #ddd' }}>
            <h3 className="font-black text-center mb-4">Total Pendapatanmu Hari Ini</h3>
            <div className="space-y-3">
              {[
                { label: '🍰 Bolu Kemojo terjual', nilai: `${totalKemojo} loyang` },
                { label: '🍪 Kue Bangkit terjual', nilai: `${totalBangkit} toples` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-2xl"
                  style={{ backgroundColor: '#EAF4FB' }}>
                  <span className="font-bold text-sm">{item.label}</span>
                  <span className="font-black">{item.nilai}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 rounded-2xl"
                style={{ backgroundColor: '#D5F5E3', border: '2px solid #1E8449' }}>
                <span className="font-bold text-sm">💵 Total Pendapatan</span>
                <span className="font-black text-xl" style={{ color: '#1E8449' }}>
                  Rp{pendapatan.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Kanan: Kategori + XP + Tombol */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border: `2px solid ${info.warna}` }}>
              <div className="text-center text-5xl mb-3">{info.emoji}</div>
              <h3 className="font-black text-center mb-2" style={{ color: info.warna }}>
                {info.judul}
              </h3>
              <p className="text-sm font-semibold text-gray-600 text-center leading-relaxed">
                {info.pesan}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow text-center"
              style={{ border: '2px solid #F1C40F' }}>
              <p className="font-bold text-gray-400 text-sm">Total XP</p>
              <p className="font-black text-3xl" style={{ color: '#F1C40F' }}>⭐ {xp} XP</p>
            </div>

            <button onClick={() => setStep('penjelasan')}
              className="w-full py-4 rounded-2xl text-white font-black text-lg
                        active:scale-95 transition-transform"
              style={{ backgroundColor: info.warna }}>
              Yuk Mulai! 📊
            </button>

            <button onClick={() => navigate('/')}
              className="w-full py-3 rounded-2xl font-bold"
              style={{ backgroundColor: '#eee', color: '#666' }}>
              Kembali ke Menu
            </button>
          </div>
        </div>

        <div className="h-4 md:hidden" />
      </div>
    )
  }

  // ── Penjelasan + Diagram ──────────────────────
  if (step === 'penjelasan') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FDFBE4' }}>

        <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b-2 mb-4"
          style={{ borderColor: '#ddd' }}>
          <XPBar />
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#1E8449' }}>📊 Sistem Pertidaksamaan</span>
          <div />
        </div>

        <h2 className="font-black text-center text-xl mb-4 px-4" style={{ color: '#333' }}>
          Bagaimana Mencari Pendapatan Maksimum?
        </h2>

        {/* Desktop: 2 kolom | Mobile: stack */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-8
                        max-w-5xl mx-auto w-full overflow-y-auto">

          {/* Kiri: Sistem + Solusi */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border: '2px solid #ddd' }}>
              <h3 className="font-black mb-3 text-center" style={{ color: '#1E8449' }}>
                Sistem Pertidaksamaan
              </h3>
              <div className="space-y-2">
                {[
                  { label: '⏱ Kendala Waktu',  rumus: '80x + 60y ≤ 360'                 },
                  { label: '💰 Kendala Modal',  rumus: '120.000x + 116.000y ≤ 600.000'  },
                  { label: '📦 Non-negatif',    rumus: 'x ≥ 0,  y ≥ 0'                  },
                  { label: '🎯 Fungsi Tujuan',  rumus: 'Z = 120.000x + 116.000y (maks)' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-2xl" style={{ backgroundColor: '#EAF4FB' }}>
                    <p className="text-xs font-bold text-gray-500">{item.label}</p>
                    <p className="font-black text-sm">{item.rumus}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border: '2px solid #F1C40F' }}>
              <h3 className="font-black text-center mb-3">🏆 Solusi Optimal</h3>
              <div className="space-y-2">
                {[
                  { label: 'Titik Optimal',             nilai: 'x = 3,  y = 2'           },
                  { label: '🍰 Bolu Kemojo diproduksi', nilai: '3 batch = 12 loyang'      },
                  { label: '🍪 Kue Bangkit diproduksi', nilai: '2 batch = 4 toples'       },
                  { label: '⏱ Total waktu',             nilai: '80(3)+60(2) = 360 menit'  },
                  { label: '💰 Total modal',             nilai: 'Rp592.000 dari Rp600.000' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-xl"
                    style={{ backgroundColor: '#FEF9E7' }}>
                    <span className="text-xs font-bold text-gray-600">{item.label}</span>
                    <span className="text-xs font-black">{item.nilai}</span>
                  </div>
                ))}
                <div className="p-3 rounded-2xl mt-1"
                  style={{ backgroundColor: '#D5F5E3', border: '2px solid #1E8449' }}>
                  <p className="text-center font-bold text-sm text-gray-600">
                    Pendapatan Maksimum
                  </p>
                  <p className="text-center font-black text-2xl" style={{ color: '#1E8449' }}>
                    Rp592.000
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kanan: Diagram + Perbandingan + Tombol */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="bg-white rounded-3xl p-4 shadow"
              style={{ border: '2px solid #ddd' }}>
              <h3 className="font-black text-center mb-1" style={{ color: '#1E8449' }}>
                Grafik Daerah Feasibel
              </h3>
              <p className="text-xs text-center text-gray-400 font-semibold mb-2">
                x = batch Bolu Kemojo &nbsp;|&nbsp; y = batch Kue Bangkit
              </p>
              <DiagramKoordinat batchKemojo={batchKemojo} batchBangkit={batchBangkit} />
            </div>

            {kategori !== 'maksimum' && (
              <div className="bg-white rounded-3xl p-4 shadow"
                style={{ border: '2px solid #C0392B' }}>
                <p className="font-bold text-center text-sm mb-3" style={{ color: '#C0392B' }}>
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
                      Rp{PENDAPATAN_MAKS.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => navigate('/')}
              className="w-full py-4 rounded-2xl text-white font-black text-lg
                        active:scale-95 transition-transform"
              style={{ backgroundColor: '#1E8449' }}>
              🏠 Selesai & Kembali ke Menu
            </button>
          </div>
        </div>

        <div className="h-4 md:hidden" />
      </div>
    )
  }

  return null
}

export default BertemuPembeli
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import GameHeader from '../../components/GameHeader'
import usePreventBack from '../../hooks/usePreventBack'
import useTimer from '../../hooks/useTimer'

// ── Konstanta ─────────────────────────────────────────────────────
const HARGA_JUAL      = { kemojo: 30000,  bangkit: 58000  }
const MODAL_BATCH     = { kemojo: 120000, bangkit: 116000 }
const MODAL_TOTAL     = 600000
const WAKTU_TOTAL     = 360
const WAKTU_BATCH     = { kemojo: 80, bangkit: 60 }
const ISI_BATCH       = { kemojo: 4,  bangkit: 2  }
const PENDAPATAN_MAKS = 592000

// ── Timer Display ─────────────────────────────────────────────────
function TimerDisplay({ detik }) {
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return (
    <div className={`px-3 py-1 rounded-xl border-2 font-black text-sm
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
  useEffect(() => {
    const t = setTimeout(onSelesai, 5000)
    return () => clearTimeout(t)
  }, [])

  const buyers = [
    { emoji: '👩',   produk: '🍰 + 🍪', delay: '0s'  },
    { emoji: '👨',   produk: '🍪🍪',    delay: '1s'  },
    { emoji: '👴',   produk: '🍰🍰🍰', delay: '2s'  },
    { emoji: '👩‍💼', produk: '🍰 + 🍪', delay: '3s'  },
  ]

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FDFBE4',
      overflow: 'hidden',
      padding: '1rem'
    }}>
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
      <p className="font-semibold text-gray-500 mb-8">Pembeli berdatangan...</p>

      <div className="relative w-full" style={{ maxWidth: '20rem', height: '14rem' }}>
        {buyers.map((b, i) => (
          <div key={i}
            style={{
              position: 'absolute',
              top: `${i * 56}px`,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: `jalanKanan 3s ease-in-out forwards`,
              animationDelay: b.delay
            }}>
            <span style={{ fontSize: '2rem' }}>{b.emoji}</span>
            <span className="text-sm font-bold bg-white px-2 py-1 rounded-xl shadow">
              {b.produk}
            </span>
          </div>
        ))}
      </div>

      <p className="text-gray-400 font-semibold animate-pulse mt-4">
        ⏳ Menghitung pendapatan...
      </p>
    </div>
  )
}

// ── Diagram Koordinat ─────────────────────────────────────────────
function DiagramKoordinat({ batchKemojo, batchBangkit }) {
  const W = 280, H = 280, pad = 48
  const sx = (W - pad - 20) / 6
  const sy = (H - pad - 20) / 7

  function p(x, y) {
    return { x: pad + x * sx, y: H - pad - y * sy }
  }

  const l1a = p(0, 6),     l1b = p(4.5, 0)
  const l2a = p(0, 5.172), l2b = p(5, 0)
  const v0 = p(0, 0), v1 = p(4.5, 0), v2 = p(2.769, 2.308), v3 = p(0, 5.172)
  const region = `M${v0.x},${v0.y} L${v1.x},${v1.y} L${v2.x},${v2.y} L${v3.x},${v3.y} Z`
  const opt  = p(3, 2)
  const user = p(batchKemojo, batchBangkit)
  const userIsOpt = batchKemojo === 3 && batchBangkit === 2

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[1,2,3,4,5,6].map(i => {
        const px = p(i,0), py = p(0,i)
        return (
          <g key={i}>
            <line x1={px.x} y1={pad} x2={px.x} y2={H-pad} stroke="#eee" strokeWidth="1"/>
            {i<=6 && <line x1={pad} y1={py.y} x2={W-20} y2={py.y} stroke="#eee" strokeWidth="1"/>}
          </g>
        )
      })}
      <path d={region} fill="rgba(30,132,73,0.12)" />
      <line x1={l1a.x} y1={l1a.y} x2={l1b.x} y2={l1b.y}
        stroke="#C0392B" strokeWidth="2" strokeDasharray="6,3"/>
      <line x1={l2a.x} y1={l2a.y} x2={l2b.x} y2={l2b.y}
        stroke="#1E8449" strokeWidth="2" strokeDasharray="6,3"/>
      <line x1={pad} y1={H-pad} x2={W-12} y2={H-pad} stroke="#333" strokeWidth="2"/>
      <line x1={pad} y1={H-pad} x2={pad}  y2={12}    stroke="#333" strokeWidth="2"/>
      <polygon points={`${W-12},${H-pad} ${W-19},${H-pad-4} ${W-19},${H-pad+4}`} fill="#333"/>
      <polygon points={`${pad},12 ${pad-4},19 ${pad+4},19`} fill="#333"/>
      <text x={W-8} y={H-pad+5} fontSize="12" fontWeight="bold" fill="#333" textAnchor="middle">x</text>
      <text x={pad} y={8}       fontSize="12" fontWeight="bold" fill="#333" textAnchor="middle">y</text>
      {[1,2,3,4,5].map(i => {
        const pt = p(i,0)
        return (
          <g key={`x${i}`}>
            <line x1={pt.x} y1={H-pad-3} x2={pt.x} y2={H-pad+3} stroke="#555" strokeWidth="1.5"/>
            <text x={pt.x} y={H-pad+14} fontSize="9" fill="#555" textAnchor="middle">{i}</text>
          </g>
        )
      })}
      {[1,2,3,4,5,6].map(i => {
        const pt = p(0,i)
        return (
          <g key={`y${i}`}>
            <line x1={pad-3} y1={pt.y} x2={pad+3} y2={pt.y} stroke="#555" strokeWidth="1.5"/>
            <text x={pad-6} y={pt.y+4} fontSize="9" fill="#555" textAnchor="end">{i}</text>
          </g>
        )
      })}
      {[v0,v1,v2,v3].map((vt,i) => <circle key={i} cx={vt.x} cy={vt.y} r="3" fill="#888"/>)}
      <circle cx={opt.x} cy={opt.y} r="8" fill="#F1C40F" stroke="#333" strokeWidth="2"/>
      <text x={opt.x+11} y={opt.y-6} fontSize="9" fontWeight="bold" fill="#333">Maks! (3,2)</text>
      {!userIsOpt && batchKemojo >= 0 && batchBangkit >= 0 && (
        <>
          <circle cx={user.x} cy={user.y} r="6" fill="#C0392B" stroke="white" strokeWidth="2"/>
          <text x={user.x+9} y={user.y-5} fontSize="9" fontWeight="bold" fill="#C0392B">
            Kamu ({batchKemojo},{batchBangkit})
          </text>
        </>
      )}
      <line x1={pad} y1={H-8} x2={pad+18} y2={H-8} stroke="#C0392B" strokeWidth="2" strokeDasharray="5,3"/>
      <text x={pad+22} y={H-4} fontSize="8" fill="#C0392B">Waktu</text>
      <line x1={pad+65} y1={H-8} x2={pad+83} y2={H-8} stroke="#1E8449" strokeWidth="2" strokeDasharray="5,3"/>
      <text x={pad+87} y={H-4} fontSize="8" fill="#1E8449">Modal</text>
      <circle cx={pad+135} cy={H-9} r="5" fill="#F1C40F" stroke="#333" strokeWidth="1.5"/>
      <text x={pad+143} y={H-4} fontSize="8" fill="#333">Optimal</text>
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────
function BertemuPembeli() {
  const navigate  = useNavigate()
  const { xp }    = useGame()
  usePreventBack()

  const [batchKemojo,  setBatchKemojo]  = useState(0)
  const [batchBangkit, setBatchBangkit] = useState(0)
  const [step,         setStep]         = useState('setup')
  const [timerHabis,   setTimerHabis]   = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)

  const detikSisa  = useTimer(() => setTimerHabis(true), timerStarted)

  const totalModal  = batchKemojo  * MODAL_BATCH.kemojo  + batchBangkit * MODAL_BATCH.bangkit
  const totalWaktu  = batchKemojo  * WAKTU_BATCH.kemojo  + batchBangkit * WAKTU_BATCH.bangkit
  const modalOk     = totalModal  <= MODAL_TOTAL
  const waktuOk     = totalWaktu  <= WAKTU_TOTAL
  const statusOk    = modalOk && waktuOk

  const totalKemojo  = batchKemojo  * ISI_BATCH.kemojo
  const totalBangkit = batchBangkit * ISI_BATCH.bangkit
  const pendapatan   = totalKemojo * HARGA_JUAL.kemojo + totalBangkit * HARGA_JUAL.bangkit

  const kategori = pendapatan === PENDAPATAN_MAKS
    ? 'maksimum' : pendapatan >= 350000 ? 'lumayan' : 'kurang'

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

  // Timer habis
  if (timerHabis) {
    return (
      <div style={{ height:'100dvh', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    backgroundColor:'#FDFBE4', padding:'1rem' }}>
        <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>⏰</div>
        <h2 style={{ fontSize:'1.5rem', fontWeight:900, color:'#C0392B',
                     marginBottom:'0.5rem' }}>Waktu Habis!</h2>
        <p style={{ color:'#666', fontWeight:600, marginBottom:'1.5rem' }}>
          Tidak apa-apa, coba lagi ya!
        </p>
        <button onClick={() => navigate('/')}
          style={{ padding:'0.75rem 2rem', borderRadius:'1rem',
                   backgroundColor:'#C0392B', color:'white',
                   fontWeight:700, border:'none', cursor:'pointer' }}>
          Kembali ke Menu
        </button>
      </div>
    )
  }

  // ── Setup ─────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div style={{ height:'100dvh', display:'flex', flexDirection:'column',
                    backgroundColor:'#FDFBE4', overflow:'hidden' }}>

        <GameHeader
          badge="🛒 Bertemu Pembeli"
          badgeWarna="#C0392B"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <p className="text-center font-black text-lg pt-3 px-4"
          style={{ color:'#333' }}>
          Yuk, berjualan!
        </p>
        <p className="text-center text-sm font-semibold text-gray-400 pb-3 px-4">
          MISI: Tebak Pendapatan Maksimum — atur jumlah batch produksimu!
        </p>

        {/* Desktop: 2 kolom | Mobile: stack */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-8 pb-4"
          style={{ maxWidth:'56rem', margin:'0 auto', width:'100%',
                   overflowY:'auto', alignItems:'flex-start' }}>

          {/* Kiri: Steppers */}
          <div className="w-full md:flex-1 flex flex-col gap-4">

            {/* Stepper Kemojo */}
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border:'2px solid #ddd' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">🍰 Batch Bolu Kemojo</span>
                <span className="text-xs font-semibold text-gray-400">80 mnt/batch</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                1 batch = 4 loyang × Rp30.000 = Rp120.000
              </p>
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={() => setBatchKemojo(prev => Math.max(0, prev - 1))}
                  className="w-10 h-10 rounded-full font-black text-xl text-white
                             flex items-center justify-center active:scale-95"
                  style={{ backgroundColor:'#C0392B', border:'none', cursor:'pointer' }}>
                  −
                </button>
                <span className="font-black text-3xl w-8 text-center">{batchKemojo}</span>
                <button
                  onClick={() => setBatchKemojo(prev => prev + 1)}
                  className="w-10 h-10 rounded-full font-black text-xl text-white
                             flex items-center justify-center active:scale-95"
                  style={{ backgroundColor:'#1E8449', border:'none', cursor:'pointer' }}>
                  +
                </button>
              </div>
            </div>

            {/* Stepper Bangkit */}
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border:'2px solid #ddd' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">🍪 Batch Kue Bangkit</span>
                <span className="text-xs font-semibold text-gray-400">60 mnt/batch</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                1 batch = 2 toples × Rp58.000 = Rp116.000
              </p>
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={() => setBatchBangkit(prev => Math.max(0, prev - 1))}
                  className="w-10 h-10 rounded-full font-black text-xl text-white
                             flex items-center justify-center active:scale-95"
                  style={{ backgroundColor:'#C0392B', border:'none', cursor:'pointer' }}>
                  −
                </button>
                <span className="font-black text-3xl w-8 text-center">{batchBangkit}</span>
                <button
                  onClick={() => setBatchBangkit(prev => prev + 1)}
                  className="w-10 h-10 rounded-full font-black text-xl text-white
                             flex items-center justify-center active:scale-95"
                  style={{ backgroundColor:'#1E8449', border:'none', cursor:'pointer' }}>
                  +
                </button>
              </div>
            </div>

          </div>

          {/* Kanan: Status + Tombol */}
          <div className="w-full md:w-64 flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border:`2px solid ${statusOk ? '#1E8449' : '#C0392B'}` }}>
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
              onClick={() => {
                setTimerStarted(true)  
                setStep('berjualan')
              }}
              disabled={!statusOk || (batchKemojo === 0 && batchBangkit === 0)}
              className="w-full py-4 rounded-2xl text-white font-black text-lg
                         active:scale-95 disabled:opacity-40"
              style={{ backgroundColor:'#C0392B', border:'none', cursor:'pointer' }}>
              Mulai Berjualan! 🚀
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ── Animasi Berjualan ─────────────────────────────────────────────
  if (step === 'berjualan') {
    return <BuyerAnimation onSelesai={() => setStep('hasil')} />
  }

  // ── Hasil ─────────────────────────────────────────────────────────
  if (step === 'hasil') {
    return (
      <div style={{ height:'100dvh', display:'flex', flexDirection:'column',
                    backgroundColor:'#FDFBE4', overflow:'hidden' }}>

        <GameHeader
          badge="🛒 Bertemu Pembeli"
          badgeWarna="#C0392B"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        {/* Desktop: 2 kolom | Mobile: scroll */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 md:px-8 py-4"
          style={{ maxWidth:'56rem', margin:'0 auto', width:'100%',
                   overflowY:'auto', alignItems:'flex-start' }}>

          {/* Kiri: Kartu Pendapatan */}
          <div className="w-full md:flex-1 bg-white rounded-3xl p-5 shadow"
            style={{ border:'2px solid #ddd' }}>
            <h3 className="font-black text-center mb-4">
              Total Pendapatanmu Hari Ini
            </h3>
            <div className="flex flex-col gap-3">

              <div className="flex justify-between items-center p-3 rounded-2xl"
                style={{ backgroundColor:'#EAF4FB' }}>
                <span className="font-bold text-sm">🍰 Bolu Kemojo terjual</span>
                <span className="font-black">{totalKemojo} loyang</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl"
                style={{ backgroundColor:'#EAF4FB' }}>
                <span className="font-bold text-sm">🍪 Kue Bangkit terjual</span>
                <span className="font-black">{totalBangkit} toples</span>
              </div>

              {/* Total Pendapatan — teks di atas, nominal di bawah */}
              <div className="p-4 rounded-2xl text-center"
                style={{ backgroundColor:'#D5F5E3', border:'2px solid #1E8449' }}>
                <p className="font-bold text-sm text-gray-600 mb-1">
                  💵 Total Pendapatan
                </p>
                <p className="font-black text-2xl" style={{ color:'#1E8449' }}>
                  Rp{pendapatan.toLocaleString('id-ID')}
                </p>
              </div>

            </div>
          </div>

          {/* Kanan: Kategori + XP + Tombol */}
          <div className="w-full md:flex-1 flex flex-col gap-4">

            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border:`2px solid ${info.warna}` }}>
              <div className="text-center text-4xl mb-2">{info.emoji}</div>
              <h3 className="font-black text-center mb-2" style={{ color:info.warna }}>
                {info.judul}
              </h3>
              <p className="text-sm font-semibold text-gray-600 text-center leading-relaxed">
                {info.pesan}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-4 text-center shadow"
              style={{ border:'2px solid #F1C40F' }}>
              <p className="font-bold text-gray-400 text-sm">Total XP</p>
              <p className="font-black text-3xl" style={{ color:'#F1C40F' }}>
                ⭐ {xp} XP
              </p>
            </div>

            <button onClick={() => setStep('penjelasan')}
              className="w-full py-4 rounded-2xl text-white font-black text-lg
                         active:scale-95"
              style={{ backgroundColor:info.warna, border:'none', cursor:'pointer' }}>
              Yuk Mulai! 📊
            </button>

            <button onClick={() => navigate('/')}
              className="w-full py-3 rounded-2xl font-bold"
              style={{ backgroundColor:'#eee', color:'#666',
                       border:'none', cursor:'pointer' }}>
              Kembali ke Menu
            </button>

          </div>
        </div>
      </div>
    )
  }

  // ── Penjelasan + Diagram ──────────────────────────────────────────
  if (step === 'penjelasan') {
    return (
      <div style={{ height:'100dvh', display:'flex', flexDirection:'column',
                    backgroundColor:'#FDFBE4' }}>

        <GameHeader
          badge="📊 Sistem Pertidaksamaan"
          badgeWarna="#1E8449"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <h2 className="font-black text-center text-xl px-4 pt-3"
          style={{ color:'#333', flexShrink:0 }}>
          Bagaimana Mencari Pendapatan Maksimum?
        </h2>

        {/* Area scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4 px-4 md:px-8 py-4"
            style={{ maxWidth:'64rem', margin:'0 auto', width:'100%' }}>

            {/* Kiri: Sistem + Solusi */}
            <div className="flex flex-col gap-4 md:flex-1">

              <div className="bg-white rounded-3xl p-5 shadow"
                style={{ border:'2px solid #ddd' }}>
                <h3 className="font-black mb-3 text-center" style={{ color:'#1E8449' }}>
                  Sistem Pertidaksamaan
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label:'⏱ Kendala Waktu',  rumus:'80x + 60y ≤ 360'                },
                    { label:'💰 Kendala Modal',  rumus:'120.000x + 116.000y ≤ 600.000' },
                    { label:'📦 Non-negatif',    rumus:'x ≥ 0,  y ≥ 0'                 },
                    { label:'🎯 Fungsi Tujuan',  rumus:'Z = 120.000x + 116.000y (maks)'},
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-2xl"
                      style={{ backgroundColor:'#EAF4FB' }}>
                      <p className="text-xs font-bold text-gray-500">{item.label}</p>
                      <p className="font-black text-sm">{item.rumus}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow"
                style={{ border:'2px solid #F1C40F' }}>
                <h3 className="font-black text-center mb-3">🏆 Solusi Optimal</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label:'Titik Optimal',             nilai:'x = 3,  y = 2'           },
                    { label:'🍰 Bolu Kemojo diproduksi', nilai:'3 batch = 12 loyang'      },
                    { label:'🍪 Kue Bangkit diproduksi', nilai:'2 batch = 4 toples'       },
                    { label:'⏱ Total waktu',             nilai:'80(3)+60(2) = 360 menit'  },
                    { label:'💰 Total modal',             nilai:'Rp592.000 dari Rp600.000' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-xl"
                      style={{ backgroundColor:'#FEF9E7' }}>
                      <span className="text-xs font-bold text-gray-600">{item.label}</span>
                      <span className="text-xs font-black">{item.nilai}</span>
                    </div>
                  ))}
                  <div className="p-3 rounded-2xl mt-1 text-center"
                    style={{ backgroundColor:'#D5F5E3', border:'2px solid #1E8449' }}>
                    <p className="font-bold text-sm text-gray-600">Pendapatan Maksimum</p>
                    <p className="font-black text-2xl" style={{ color:'#1E8449' }}>
                      Rp592.000
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Kanan: Diagram + Perbandingan + Tombol */}
            <div className="flex flex-col gap-4 md:flex-1">

              <div className="bg-white rounded-3xl p-4 shadow"
                style={{ border:'2px solid #ddd' }}>
                <h3 className="font-black text-center mb-1" style={{ color:'#1E8449' }}>
                  Grafik Daerah Feasibel
                </h3>
                <p className="text-xs text-center text-gray-400 font-semibold mb-2">
                  x = batch Bolu Kemojo | y = batch Kue Bangkit
                </p>
                <DiagramKoordinat
                  batchKemojo={batchKemojo}
                  batchBangkit={batchBangkit}
                />
              </div>

              {kategori !== 'maksimum' && (
                <div className="bg-white rounded-3xl p-4 shadow"
                  style={{ border:'2px solid #C0392B' }}>
                  <p className="font-bold text-center text-sm mb-3"
                    style={{ color:'#C0392B' }}>
                    Perbandingan Pendapatanmu
                  </p>
                  <div className="flex justify-around">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-400">Pilihanmu</p>
                      <p className="font-black text-lg" style={{ color:'#C0392B' }}>
                        Rp{pendapatan.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-400">Maksimum</p>
                      <p className="font-black text-lg" style={{ color:'#1E8449' }}>
                        Rp{PENDAPATAN_MAKS.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => navigate('/')}
                className="w-full py-4 rounded-2xl text-white font-black text-lg
                           active:scale-95"
                style={{ backgroundColor:'#1E8449', border:'none', cursor:'pointer' }}>
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
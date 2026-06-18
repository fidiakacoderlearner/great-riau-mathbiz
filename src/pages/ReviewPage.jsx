import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import usePreventBack from '../hooks/usePreventBack'

// ── Format Waktu ─────────────────────────────────────────────────
function formatWaktu(detik) {
  if (detik < 60) return `${detik} detik`
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return s > 0 ? `${m} mnt ${s} dtk` : `${m} menit`
}

// ── Bar Chart SVG ─────────────────────────────────────────────────
function BarChart({ runHistory }) {
  const W     = 340
  const H     = 180
  const pad   = { top: 20, bottom: 50, left: 20, right: 20 }
  const inner = { w: W - pad.left - pad.right, h: H - pad.top - pad.bottom }

  if (!runHistory.length) return null

  const maxVal = Math.max(...runHistory.map(r => r.pendapatan), 1)
  const barW   = Math.floor(inner.w / runHistory.length) - 8

  const barColor = ['#C0392B', '#E67E22', '#F1C40F', '#27AE60', '#1E8449']

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => {
        const y = pad.top + inner.h * (1 - f)
        return (
          <g key={f}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y}
              stroke="#eee" strokeWidth="1" strokeDasharray="4,2"/>
            <text x={pad.left - 2} y={y + 4} fontSize="7" fill="#aaa" textAnchor="end">
              {(maxVal * f / 1000).toFixed(0)}k
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {runHistory.map((run, i) => {
        const x      = pad.left + i * (inner.w / runHistory.length) + 4
        const barH   = (run.pendapatan / maxVal) * inner.h
        const y      = pad.top + inner.h - barH
        const color  = barColor[i % barColor.length]

        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH}
              fill={color} rx="4"/>
            {/* Nilai di atas bar */}
            <text x={x + barW / 2} y={y - 4} fontSize="7" fontWeight="bold"
              fill={color} textAnchor="middle">
              {(run.pendapatan / 1000).toFixed(0)}k
            </text>
            {/* Label run */}
            <text x={x + barW / 2} y={H - pad.bottom + 12} fontSize="7"
              fill="#666" textAnchor="middle">
              Run {run.run}
            </text>
            {/* Produk */}
            <text x={x + barW / 2} y={H - pad.bottom + 22} fontSize="6"
              fill="#999" textAnchor="middle">
              {run.produkA?.split(' ')[0]} {run.produkA?.split(' ')[1]} & {run.produkB?.split(' ')[0]} {run.produkB?.split(' ')[1]}
            </text>
          </g>
        )
      })}

      {/* Axis */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom}
        stroke="#ddd" strokeWidth="1.5"/>
      <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom}
        stroke="#ddd" strokeWidth="1.5"/>
    </svg>
  )
}

// ── Waktu Chart SVG ───────────────────────────────────────────────
function WaktuChart({ runHistory }) {
  const W     = 340
  const H     = 160
  const pad   = { top: 20, bottom: 50, left: 20, right: 20 }
  const inner = { w: W - pad.left - pad.right, h: H - pad.top - pad.bottom }

  if (!runHistory.length) return null

  const maxVal = Math.max(...runHistory.map(r => r.waktuBermain), 1)
  const barW   = Math.floor(inner.w / runHistory.length) - 8

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[0.5, 1].map(f => {
        const y = pad.top + inner.h * (1 - f)
        return (
          <g key={f}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y}
              stroke="#eee" strokeWidth="1" strokeDasharray="4,2"/>
            <text x={pad.left - 2} y={y + 4} fontSize="7" fill="#aaa" textAnchor="end">
              {Math.floor(maxVal * f / 60)}m
            </text>
          </g>
        )
      })}

      {runHistory.map((run, i) => {
        const x     = pad.left + i * (inner.w / runHistory.length) + 4
        const barH  = (run.waktuBermain / maxVal) * inner.h
        const y     = pad.top + inner.h - barH

        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH}
              fill="#3498DB" rx="4" opacity={0.8}/>
            <text x={x + barW / 2} y={y - 4} fontSize="7" fontWeight="bold"
              fill="#3498DB" textAnchor="middle">
              {formatWaktu(run.waktuBermain)}
            </text>
            <text x={x + barW / 2} y={H - pad.bottom + 12} fontSize="7"
              fill="#666" textAnchor="middle">
              Run {run.run}
            </text>
            <text x={x + barW / 2} y={H - pad.bottom + 22} fontSize="6"
              fill="#999" textAnchor="middle">
              {run.produkA?.split(' ')[0]} {run.produkA?.split(' ')[1]} & {run.produkB?.split(' ')[0]} {run.produkB?.split(' ')[1]}
            </text>
          </g>
        )
      })}

      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom}
        stroke="#ddd" strokeWidth="1.5"/>
      <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom}
        stroke="#ddd" strokeWidth="1.5"/>
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────
function ReviewPage() {
  const navigate = useNavigate()
  const {
    totalXp, runHistory,
    totalPendapatan, totalWaktuBermain,
    budget, allDoneIds, resetAll,
    produkList,
  } = useGame()

  const rataRataWaktu = runHistory.length
    ? Math.floor(totalWaktuBermain / runHistory.length)
    : 0

  const rataRataPendapatan = runHistory.length
    ? Math.floor(totalPendapatan / runHistory.length)
    : 0

  const bestRun = runHistory.reduce((best, r) => {
    if (!best) return r
    
    // Prioritas 1: Bandingkan XP terlebih dahulu
    if (r.xpRun > best.xpRun) return r
    
    // Prioritas 2: Jika XP seri, baru bandingkan Pendapatan
    if (r.xpRun === best.xpRun && r.pendapatan > best.pendapatan) return r
    
    return best
  }, null)

  function handleReset() {
    if (window.confirm('Reset semua progress dan mulai dari awal?')) {
      resetAll()
      navigate('/')
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#FDFBE4'
    }}>

      {/* Header */}
      <div style={{
        backgroundColor: '#1E8449', padding: '1.5rem 1rem 1rem',
        textAlign: 'center', flexShrink: 0
      }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.75rem', color: 'white',
                    marginBottom: '0.25rem' }}>
          Review Perjalananmu!
        </h1>
        
        <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
          {runHistory.length === 0 
            ? 'Belum ada data produksi. Yuk, mulai eksplorasi pertamamu! ' 
            : allDoneIds.length >= 10 // Sesuaikan dengan jumlah total produkmu
            ? 'Luar biasa! Kamu telah menyelesaikan semua produk khas Melayu Riau! '
            : 'Pantau terus statistik dan riwayat bisnis kue tradisionalmu! '}
        </p>
      </div>

      {/* Konten scroll */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}
        className="md:px-8">
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>

          {/* ── Ringkasan Utama ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              // warnaUtama diambil dari warna asli masing-masing kartu sebelumnya
              // Khusus XP saya ubah sedikit ke #F39C12 (oranye-kuning) agar teksnya jelas terbaca di atas putih
              { label: 'Total XP',         nilai: `⭐ ${totalXp}`,                         warnaUtama: '#F39C12' },
              { label: 'Total Pendapatan', nilai: `Rp${totalPendapatan.toLocaleString('id-ID')}`, warnaUtama: '#1E8449' },
              { label: 'Total Waktu',      nilai: formatWaktu(totalWaktuBermain),       warnaUtama: '#3498DB' },
              { label: 'Budget Akhir',     nilai: `Rp${budget.toLocaleString('id-ID')}`, warnaUtama: '#C0392B' },
            ].map((item, i) => (
              <div key={i} className="shadow-sm" style={{
                backgroundColor: 'white', 
                borderRadius: '1.25rem',
                padding: '1rem', 
                textAlign: 'center',
                border: `2px solid ${item.warnaUtama}` // Menjadikan warna utama sebagai border
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700,
                            color: '#888', // Semua judul (label) diseragamkan jadi abu-abu
                            marginBottom: '0.25rem' }}>
                  {item.label}
                </p>
                <p style={{ fontWeight: 900, fontSize: '1.125rem',
                            color: item.warnaUtama, // Nilai teks menggunakan warna utama
                            lineHeight: 1.2 }}>
                  {item.nilai}
                </p>
              </div>
            ))}
          </div>

          {/* ── Statistik Lanjutan ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">

            <div className="bg-white rounded-3xl p-5 shadow"
              style={{ border: '2px solid #ddd' }}>
              <h3 className="font-black mb-3 text-center" style={{ color: '#333' }}>
                📈 Statistik Rata-rata
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Waktu per Run',       nilai: formatWaktu(rataRataWaktu)                    },
                  { label: 'Pendapatan per Run',   nilai: `Rp${rataRataPendapatan.toLocaleString('id-ID')}` },
                  { label: 'Total Run',            nilai: `${runHistory.length} kali`                   },
                  { label: 'Produk Diselesaikan',  nilai: `${allDoneIds.length} produk`                 },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-xl"
                    style={{ backgroundColor: '#EAF4FB' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#666' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#333' }}>
                      {item.nilai}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Run */}
            {bestRun && (
              <div className="bg-white rounded-3xl p-5 shadow"
                style={{ border: '2px solid #F1C40F' }}>
                <h3 className="font-black mb-3 text-center" style={{ color: '#333' }}>
                  🌟 Run Terbaik
                </h3>
                <div className="flex justify-center gap-2 mb-3">
                  <img src={bestRun.imageA} alt={bestRun.produkA}
                    style={{ width: '3rem', height: '3rem', objectFit: 'contain' }} />
                  <img src={bestRun.imageB} alt={bestRun.produkB}
                    style={{ width: '3rem', height: '3rem', objectFit: 'contain' }} />
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Produk', nilai: `${bestRun.produkA} + ${bestRun.produkB}` },
                    { label: 'Pendapatan', nilai: `Rp${bestRun.pendapatan.toLocaleString('id-ID')}` },
                    { label: 'Waktu Bermain', nilai: formatWaktu(bestRun.waktuBermain) },
                    { label: 'XP Diperoleh', nilai: `⭐ ${bestRun.xpRun}` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-xl"
                      style={{ backgroundColor: '#FEF9E7' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#666' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#333' }}>
                        {item.nilai}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Grafik Pendapatan ── */}
          <div className="bg-white rounded-3xl p-5 shadow mb-4"
            style={{ border: '2px solid #ddd' }}>
            <h3 className="font-black mb-1 text-center" style={{ color: '#1E8449' }}>
              📊 Pendapatan per Run
            </h3>
            <p className="text-xs text-center text-gray-400 font-semibold mb-3">
              Setiap run = 2 produk yang diselesaikan
            </p>
            <BarChart runHistory={runHistory} />
          </div>

          {/* ── Grafik Waktu Bermain ── */}
          <div className="bg-white rounded-3xl p-5 shadow mb-4"
            style={{ border: '2px solid #ddd' }}>
            <h3 className="font-black mb-1 text-center" style={{ color: '#3498DB' }}>
              ⏱ Waktu Bermain per Run
            </h3>
            <p className="text-xs text-center text-gray-400 font-semibold mb-3">
              Dari klik "Siap Memulai" sampai selesai berjualan
            </p>
            <WaktuChart runHistory={runHistory} />
          </div>

          {/* ── Riwayat Run ── */}
          <div className="bg-white rounded-3xl p-5 shadow mb-4"
            style={{ border: '2px solid #ddd' }}>
            <h3 className="font-black mb-3 text-center" style={{ color: '#333' }}>
              📋 Riwayat Semua Run
            </h3>
            <div className="flex flex-col gap-2">
              {runHistory.map((run, i) => (
                <div key={i} className="p-3 rounded-2xl"
                  style={{ backgroundColor: '#EAF4FB' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <img src={run.imageA} alt={run.produkA}
                      style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} />
                    <img src={run.imageB} alt={run.produkB}
                      style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} />
                    <span style={{ fontWeight: 900, fontSize: '0.875rem' }}>
                      {run.produkA} + {run.produkB}
                    </span>
                    <span style={{ fontWeight: 900, color: '#1E8449', fontSize: '0.875rem',
                                  marginLeft: 'auto' }}>
                      Rp{run.pendapatan.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>
                      ⏱ {formatWaktu(run.waktuBermain)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>
                      ⭐ {run.xpRun} XP
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>
                      💰 Modal Rp{run.budgetAwal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tombol ── */}
          <div className="flex flex-col md:flex-row gap-3 pb-6">
            <button onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-2xl text-white font-black text-lg
                         active:scale-95"
              style={{ backgroundColor: '#1E8449', border: 'none', cursor: 'pointer' }}>
              🏠 Kembali ke Menu
            </button>
            <button onClick={handleReset}
              className="flex-1 py-4 rounded-2xl font-bold"
              style={{ backgroundColor: '#FADBD8', color: '#C0392B',
                       border: 'none', cursor: 'pointer' }}>
              🔄 Reset & Main Lagi
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ReviewPage
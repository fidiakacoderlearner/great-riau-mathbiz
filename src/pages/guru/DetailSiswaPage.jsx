import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchPermainanBySiswa } from '../../lib/game'
import { supabase } from '../../lib/supabase'

function formatWaktu(detikAsli) {
  if (!detikAsli) return '0 dtk'
  // Bulatkan detik agar tidak ada desimal panjang (floating-point issue)
  const detik = Math.round(detikAsli) 
  
  if (detik < 60) return `${detik} dtk`
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return s > 0 ? `${m}m ${s}d` : `${m} menit`
}

function StatusPermainan({ status }) {
  const config = {
    berjalan:      { label: 'Sedang Berjalan', bg: '#ffe894', color: '#F39C12' },
    selesai:       { label: 'Selesai',       bg: '#D5F5E3', color: '#1E8449' },
    tidak_selesai: { label: 'Tidak Selesai',    bg: '#FADBD8', color: '#C0392B' },
  }
  const c = config[status] ?? config.berjalan
  return (
    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.5rem',
                   backgroundColor: c.bg, color: c.color,
                   fontSize: '0.7rem', fontWeight: 700 }}>
      {c.label}
    </span>
  )
}

function BarChartSVG({ data, warna, labelKey, nilaiKey, satuan = '' }) {
  const W = 320, H = 160
  const pad = { top: 24, bottom: 36, left: 20, right: 16 }
  const inner = { w: W - pad.left - pad.right, h: H - pad.top - pad.bottom }
  if (!data.length) return null
  const maxVal = Math.max(...data.map(d => d[nilaiKey]), 1)
  const barW   = Math.floor(inner.w / data.length) - 6
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[0.5, 1].map(f => {
        const y = pad.top + inner.h * (1 - f)
        return (
          <g key={f}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y}
              stroke="#eee" strokeWidth="1" strokeDasharray="4,2"/>
            <text x={pad.left - 2} y={y + 3}
              fontSize="7" fill="#bbb" textAnchor="end">
              {Math.round(maxVal * f)}{satuan}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const x    = pad.left + i * (inner.w / data.length) + 3
        const barH = Math.max((d[nilaiKey] / maxVal) * inner.h, 2)
        const y    = pad.top + inner.h - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH}
              fill={warna} rx="3" opacity={0.85}/>
            <text x={x + barW / 2} y={y - 4}
              fontSize="7" fontWeight="bold" fill={warna} textAnchor="middle">
              {d[nilaiKey]}{satuan}
            </text>
            <text x={x + barW / 2} y={H - pad.bottom + 14}
              fontSize="7" fill="#999" textAnchor="middle">
              {d[labelKey]}
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

function RadarChart({ kecepatan, akurasi, kemandirian, pemahamanLP, konsistensi }) {
  const cx = 160, cy = 130, r = 80
  const labels = ['Kecepatan', 'Akurasi', 'Mandiri', 'Pemahaman SPtLDV', 'Konsistensi']
  const values = [kecepatan, akurasi, kemandirian, pemahamanLP, konsistensi]
  const n = labels.length

  function getPoint(index, value, radius) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle) * (value / 100),
      y: cy + radius * Math.sin(angle) * (value / 100),
    }
  }

  function getAxisPoint(index, radius) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  const dataPoints = values.map((v, i) => getPoint(i, v, r))
  const dataPath   = dataPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  ).join(' ') + ' Z'

  return (
    <svg width="100%" viewBox="0 0 320 250">
      {[25, 50, 75, 100].map(level => {
        const pts  = labels.map((_, i) => getAxisPoint(i, r * level / 100))
        const path = pts.map((p, i) =>
          `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
        ).join(' ') + ' Z'
        return <path key={level} d={path} fill="none" stroke="#eee" strokeWidth="1"/>
      })}

      {labels.map((_, i) => {
        const end = getAxisPoint(i, r)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
          stroke="#ddd" strokeWidth="1"/>
      })}

      <path d={dataPath} fill="rgba(30,132,73,0.2)" stroke="#1E8449" strokeWidth="2" />

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4"
          fill="#1E8449" stroke="white" strokeWidth="1.5"/>
      ))}

      {labels.map((label, i) => {
        const pt     = getAxisPoint(i, r + 24)
        const anchor = pt.x < cx - 5 ? 'end' : pt.x > cx + 5 ? 'start' : 'middle'
        const words  = label.split(' ')
        return (
          <text key={i} x={pt.x} y={pt.y}
            fontSize="9" fontWeight="bold" fill="#555" textAnchor={anchor}>
            <tspan x={pt.x} dy="0">{words[0]}</tspan>
            {words[1] && <tspan x={pt.x} dy="11">{words[1]}</tspan>}
          </text>
        )
      })}

      {dataPoints.map((p, i) => (
        <text key={i} x={p.x} y={p.y - 7}
          fontSize="8" fontWeight="bold" fill="#1E8449" textAnchor="middle">
          {values[i]}
        </text>
      ))}
    </svg>
  )
}

// ── Komponen Analisa AI (Dari Remote) ─────────────────────────────
function AnalisaAI({ namaSiswa, stats }) {
  const [hasil,    setHasil]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [sudahDi,  setSudahDi]  = useState(false)

  async function handleAnalisa() {
    setLoading(true)
    setError('')
    setHasil('')

    const prompt = `Kamu adalah asisten pendidikan matematika yang membantu guru menganalisis kemampuan siswa.

    Berikut adalah data performa siswa bernama "${namaSiswa}" dalam permainan edukatif matematika bisnis (program linear / pertidaksamaan linear):

    - Total Run: ${stats.totalRun} putaran (Setiap putaran mengelola 2 produk UMKM)
    - Total Produk Dikelola: ${stats.produkSelesai} produk
    - Total XP: ${stats.totalXp}
    - Total Pendapatan: Rp${stats.totalPendapatan.toLocaleString('id-ID')}
    - Akurasi Jawaban: ${stats.akurasi}%
    - Hint Dipakai: ${stats.hintDipakai} dari ${stats.totalJawaban} soal (${stats.persenHint}%)
    - Rata-rata Waktu per Putaran: ${formatWaktu(stats.rataWaktu)}

    Detail 5 Aspek Profil Belajar (Masing-masing metrik bernilai 0-100):
    - Skor Kecepatan: ${stats.kecepatan}/100
    - Skor Akurasi: ${stats.akurasi}/100
    - Skor Kemandirian (tanpa hint): ${stats.kemandirian}/100
    - Skor Pemahaman Program Linear: ${stats.pemahamanLP}/100
    - Skor Konsistensi Performa: ${stats.konsistensi}/100

    Berikan analisis kemampuan siswa ini secara personal dalam Bahasa Indonesia yang mudah dipahami guru. 
    Strukturkan jawabanmu dengan:
    1. **Ringkasan Kemampuan** — Paragraf singkat berisi pujian atau evaluasi umum (Sebutkan jumlah putaran dan total produknya agar akurat).
    2. **Kekuatan Utama** — 2 aspek yang sudah sangat baik.
    3. **Area Perbaikan** — 2 aspek yang paling lemah dan butuh perhatian.
    4. **Rekomendasi Tindakan** — 2 saran konkret untuk guru ke depannya.

    ATURAN KERAS UNTUK AI: 
    - Jangan pernah mengarang data selain yang diberikan di atas.
    - JANGAN menyimpulkan, merata-ratakan, atau membuat "skor total" untuk Profil Belajar. Jika kamu menyebut angka skor, sebutkan secara spesifik nama metriknya (contoh: "memiliki Skor Kecepatan 97/100", BUKAN "skor total 97/100").
    - Gunakan bahasa yang hangat, profesional, dan tidak bertele-tele.`

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message ?? `HTTP ${res.status}`)
      }

      const data = await res.json()
      const teks = data?.choices?.[0]?.message?.content ?? ''
      setHasil(teks)
      setSudahDi(true)
    } catch (err) {
      setError('Gagal mendapatkan analisis: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function renderTeks(teks) {
    return teks.split('\n').map((baris, i) => {
      const headingMatch = baris.match(/^\*\*(.+)\*\*$/)
      if (headingMatch) {
        return (
          <p key={i} style={{ fontWeight: 900, color: '#1E8449', marginTop: '1rem', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
            {headingMatch[1]}
          </p>
        )
      }
      const parts = baris.split(/\*\*(.+?)\*\*/)
      const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part )
      const isList = baris.trim().startsWith('-') || /^\d+\./.test(baris.trim())
      return baris.trim() === '' ? <br key={i} /> : (
        <p key={i} style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.7, fontWeight: 500, paddingLeft: isList ? '0.75rem' : 0, marginBottom: '0.15rem' }}>
          {rendered}
        </p>
      )
    })
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.25rem', border: '2px solid #8E44AD', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontWeight: 900, color: '#8E44AD', marginBottom: '0.1rem' }}>🤖 Analisis AI</h3>
          <p style={{ fontSize: '0.72rem', color: '#bbb', fontWeight: 600 }}>Menggunakan AI untuk menganalisis performa murid pada permainan ini</p>
        </div>
        <button onClick={handleAnalisa} disabled={loading} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', backgroundColor: loading ? '#ddd' : '#8E44AD', color: loading ? '#aaa' : 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
          {loading ? '⏳ Menganalisis...' : sudahDi ? '🔄 Analisis Ulang' : '✨ Analisis Sekarang'}
        </button>
      </div>

      {loading && (
        <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#FAF5FF', borderRadius: '0.75rem' }}>
          <p style={{ color: '#8E44AD', fontWeight: 700, fontSize: '0.875rem' }}>🧠 AI sedang menganalisis data siswa...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '1rem', backgroundColor: '#FADBD8', borderRadius: '0.75rem', border: '1.5px solid #C0392B' }}>
          <p style={{ color: '#C0392B', fontWeight: 700, fontSize: '0.85rem' }}>❌ {error}</p>
        </div>
      )}

      {hasil && !loading && (
        <div style={{ padding: '1rem', backgroundColor: '#FAF5FF', borderRadius: '0.75rem', border: '1.5px solid #D2B4DE' }}>
          {renderTeks(hasil)}
        </div>
      )}

      {!hasil && !loading && !error && (
        <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#FAF5FF', borderRadius: '0.75rem', border: '1.5px dashed #D2B4DE' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🤖</p>
          <p style={{ color: '#8E44AD', fontWeight: 700, fontSize: '0.875rem' }}>Klik "Analisis Sekarang" untuk mendapatkan insight mendalam</p>
        </div>
      )}
    </div>
  )
}

// ── Hitung Statistik (Modifikasi Lokal + Integrasi AI) ────────────
function hitungStatistik(permainan) {
  const semuaRun     = permainan.sesi_bermain?.flatMap(s => s.run ?? [])
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) ?? []
  const semuaJawaban = semuaRun.flatMap(r => r.jawaban_soal ?? [])

  const totalXp         = semuaRun.reduce((s, r) => s + (r.xp_run ?? 0), 0)
  const totalPendapatan = semuaRun.reduce((s, r) => s + (r.pendapatan ?? 0), 0)
  const totalWaktu      = semuaRun.reduce((s, r) => s + (r.waktu_bermain ?? 0), 0)
  const jawabanBenar    = semuaJawaban.filter(j => j.jawaban_benar).length
  const hintDipakai     = semuaJawaban.filter(j => j.hint_dipakai).length
  const totalJawaban    = semuaJawaban.length
  const akurasi         = totalJawaban > 0 ? Math.round((jawabanBenar / totalJawaban) * 100) : 0

  const rataWaktu       = semuaRun.length > 0 ? totalWaktu / semuaRun.length : 0
  const rataWaktuMenjawab = totalJawaban > 0
    ? Math.round(semuaJawaban.reduce((s, j) => s + (j.waktu_menjawab ?? 0), 0) / totalJawaban)
    : 0

  const rataAktual  = semuaRun.length > 0 ? Math.round(totalPendapatan / semuaRun.length) : 0
  const rataOptimal = semuaRun.length > 0 ? Math.round(semuaRun.reduce((s, r) => s + (r.pendapatan_optimal ?? 0), 0) / semuaRun.length) : 0

  const kecepatanScore = semuaRun.length === 0 || totalJawaban === 0 ? 0
    : Math.max(0, Math.min(100, Math.round(100 - (rataWaktuMenjawab / 300) * 100)))

  const akurasiScore = totalJawaban === 0 ? 0 : akurasi

  const kemandirianScore = totalJawaban === 0 ? 0
    : Math.round(100 - (hintDipakai / totalJawaban) * 100)

  const pemahamanLPScore = semuaRun.length === 0 ? 0
    : Math.round(
        semuaRun.reduce((s, r) => {
          const opt = r.pendapatan_optimal ?? 0
          const act = r.pendapatan ?? 0
          return s + (opt > 0 ? (act / opt) * 100 : 0)
        }, 0) / semuaRun.length
      )

  const konsistensiScore = semuaRun.length === 0 ? 0
    : semuaRun.length === 1 ? 100
    : (() => {
        const xpArr  = semuaRun.map(r => r.xp_run ?? 0)
        const avg    = xpArr.reduce((a, b) => a + b, 0) / xpArr.length
        if (avg === 0) return 0
        const stddev = Math.sqrt(xpArr.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / xpArr.length)
        return Math.max(0, Math.min(100, Math.round(100 - (stddev / avg) * 100)))
      })()

  // Format data untuk dikirim ke Komponen AnalisaAI
  const statsAI = {
    totalRun: semuaRun.length,
    produkSelesai: semuaRun.length * 2, // Asumsi sederhana
    totalXp,
    totalPendapatan,
    totalJawaban,
    akurasi,
    hintDipakai,
    persenHint: totalJawaban > 0 ? Math.round((hintDipakai / totalJawaban) * 100) : 0,
    rataWaktu,
    kecepatan: kecepatanScore,
    kemandirian: kemandirianScore,
    pemahamanLP: pemahamanLPScore,
    konsistensi: konsistensiScore,
  }

  return {
    semuaRun, semuaJawaban, totalXp, totalPendapatan, totalWaktu, akurasi,
    jawabanBenar, totalJawaban, hintDipakai, rataWaktuMenjawab, rataAktual, rataOptimal,
    kecepatanScore, akurasiScore, kemandirianScore, pemahamanLPScore, konsistensiScore,
    statsAI // Dikembalikan untuk dipakai AnalisaAI
  }
}

// ── Halaman Utama ─────────────────────────────────────────────────
function DetailSiswaPage() {
  const { kelasId, siswaId } = useParams()
  const navigate = useNavigate()

  const [namaSiswa,     setNamaSiswa]     = useState('')
  const [permainanList, setPermainanList] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [tabAktif,      setTabAktif]      = useState(0)

  useEffect(() => { loadData() }, [siswaId])

  async function loadData() {
    try {
      setLoading(true)
      const { data: profile } = await supabase
        .from('profiles')
        .select('nama_lengkap')
        .eq('id', siswaId)
        .single()
      setNamaSiswa(profile?.nama_lengkap ?? '')

      const data = await fetchPermainanBySiswa(siswaId)
      setPermainanList(data)
      setTabAktif(data.length > 0 ? data.length - 1 : 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const permainanAktif = permainanList[tabAktif]
  const stats = permainanAktif ? hitungStatistik(permainanAktif) : null

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#FDFBE4' }}>
      
      {/* ── KELOMPOK HEADER & TAB STICKY ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        {/* Header */}
        <div style={{ backgroundColor: '#3498DB', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(`/dashboard-guru/kelas/${kelasId}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>
            ←
          </button>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'white' }}>{namaSiswa}</h1>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{permainanList.length} kali permainan</p>
          </div>
        </div>

        {/* Tab Permainan (Ikut menempel tepat di bawah header jika data sudah siap) */}
        {!loading && permainanList.length > 0 && (
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderBottom: '2px solid #eee' }}>
            <div style={{ display: 'flex', padding: '0.5rem 1rem', gap: '0.5rem', minWidth: 'max-content' }}>
              {permainanList.map((p, i) => (
                <button key={p.id} onClick={() => setTabAktif(i)}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    backgroundColor: tabAktif === i ? '#3498DB' : '#eee', color: tabAktif === i ? 'white' : '#666', transition: 'all 0.15s'
                  }}>
                  Permainan {p.permainan_ke}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── KONTEN UTAMA (DI BAWAH HEADER & TAB) ── */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem', fontWeight: 600 }}>Memuat data...</p>
      ) : permainanList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮</p>
          <p style={{ fontWeight: 700, color: '#aaa' }}>Siswa ini belum pernah bermain.</p>
        </div>
      ) : (
        stats && (
          <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
            
            {/* Status + Info Permainan */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <StatusPermainan status={permainanAktif.status} />
              <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 600 }}>
                {stats.semuaRun.length} run selesai
                {permainanAktif.started_at && ` · Mulai: ${new Date(permainanAktif.started_at).toLocaleDateString('id-ID')}`}
                {permainanAktif.finished_at && ` · Selesai: ${new Date(permainanAktif.finished_at).toLocaleDateString('id-ID')}`}
              </span>
            </div>

            {stats.semuaRun.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '1.25rem', border: '2px dashed #ddd' }}>
                <p style={{ fontWeight: 700, color: '#aaa' }}>Belum ada run yang diselesaikan pada permainan ini.</p>
              </div>
            ) : (
              <>
                {/* Statistik Utama */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }} className="md:grid-cols-4">
                  {[
                    { label: 'Total XP',         nilai: `⭐ ${stats.totalXp}`, warna: '#F39C12' },
                    { label: 'Total Pendapatan',  nilai: `Rp${(stats.totalPendapatan/1000).toFixed(0)}k`, warna: '#1E8449' },
                    { label: 'Akurasi Jawaban',   nilai: `${stats.akurasi}%`, warna: '#3498DB' },
                    { label: 'Run Selesai',       nilai: `${stats.semuaRun.length}/5`, warna: '#C0392B' },
                  ].map((item, i) => (
                    <div key={i} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1rem', textAlign: 'center', border: `2px solid ${item.warna}` }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', marginBottom: '0.25rem' }}>{item.label}</p>
                      <p style={{ fontWeight: 900, fontSize: '1.25rem', color: item.warna }}>{item.nilai}</p>
                    </div>
                  ))}
                </div>

                {/* ── INTEGRASI ANALISA AI ── */}
                <AnalisaAI namaSiswa={namaSiswa} stats={stats.statsAI} />

                {/* Radar + Metrik */}
                <div className="flex flex-col md:flex-row gap-3 mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.25rem', border: '2px solid #ddd' }}>
                    <h3 style={{ fontWeight: 900, color: '#333', marginBottom: '0.5rem' }}>📊 Profil Belajar</h3>
                    <RadarChart kecepatan={stats.kecepatanScore} akurasi={stats.akurasiScore} kemandirian={stats.kemandirianScore} pemahamanLP={stats.pemahamanLPScore} konsistensi={stats.konsistensiScore} />
                  </div>

                  <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.25rem', border: '2px solid #ddd' }}>
                    <h3 style={{ fontWeight: 900, color: '#333', marginBottom: '0.75rem' }}>📋 Detail Metrik</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        { label: 'Kecepatan', nilai: stats.kecepatanScore, ket: 'Kecepatan menjawab soal', detail: `Rata-rata ${stats.rataWaktuMenjawab} detik per soal` },
                        { label: 'Akurasi', nilai: stats.akurasiScore, ket: '% jawaban burners', detail: `${stats.jawabanBenar} benar dari ${stats.totalJawaban} soal` },
                        { label: 'Mandiri', nilai: stats.kemandirianScore, ket: 'Jarang pakai hint', detail: `${stats.hintDipakai} hint dipakai dari ${stats.totalJawaban} hint tersedia` },
                        { label: 'Pemahaman SPtLDV', nilai: stats.pemahamanLPScore, ket: 'Pendapatan vs optimal', detail: `Aktual Rp${stats.rataAktual.toLocaleString('id-ID')} dari potensi Rp${stats.rataOptimal.toLocaleString('id-ID')}` },
                        { label: 'Konsistensi', nilai: stats.konsistensiScore, ket: 'Stabilitas antar run', detail: `Berdasarkan variansi XP` },
                      ].map((item, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#555' }}>{item.label}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1E8449' }}>{item.nilai}/100</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '3px', backgroundColor: item.nilai >= 70 ? '#1E8449' : item.nilai >= 40 ? '#F39C12' : '#C0392B', width: `${item.nilai}%`, transition: 'width 0.5s ease' }} />
                          </div>
                          <p style={{ fontSize: '0.65rem', color: '#3498DB', fontWeight: 600, marginTop: '0.15rem' }}>{item.detail}</p>
                          <p style={{ fontSize: '0.6rem', color: '#bbb', fontWeight: 600, marginTop: '0.05rem' }}>{item.ket}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grafik Pendapatan */}
                <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.25rem', border: '2px solid #ddd', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: 900, color: '#1E8449', marginBottom: '0.25rem' }}>📈 Pendapatan per Run</h3>
                  <BarChartSVG data={stats.semuaRun.map((r, i) => ({ labelKey: `R${i + 1}`, nilaiKey: Math.round((r.pendapatan ?? 0) / 1000) }))} warna="#1E8449" labelKey="labelKey" nilaiKey="nilaiKey" satuan="k" />
                </div>

                {/* Riwayat Run */}
                <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', padding: '1.25rem', border: '2px solid #ddd' }}>
                  <h3 style={{ fontWeight: 900, color: '#333', marginBottom: '0.75rem' }}>📋 Riwayat Run</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {stats.semuaRun.map((run, i) => (
                      <div key={run.id} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: '#EAF4FB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>Run {i + 1} — {run.produk_a?.nama} + {run.produk_b?.nama}</span>
                          <span style={{ fontWeight: 900, color: '#1E8449', fontSize: '0.875rem' }}>Rp{(run.pendapatan ?? 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {[
                            { label: '⏱', nilai: formatWaktu(run.waktu_bermain) },
                            { label: '⭐', nilai: `${run.xp_run} XP` },
                            { label: '🎯', nilai: `Optimal: Rp${(run.pendapatan_optimal ?? 0).toLocaleString('id-ID')}` },
                          ].map((item, j) => (
                            <span key={j} style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>{item.label} {item.nilai}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )
      )}
    </div>
  )
}

export default DetailSiswaPage
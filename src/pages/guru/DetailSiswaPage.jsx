import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchProgressSiswa } from '../../lib/game'
import { supabase } from '../../lib/supabase'

function formatWaktu(detik) {
  if (!detik) return '0 dtk'
  if (detik < 60) return `${detik} dtk`
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return s > 0 ? `${m}m ${s}d` : `${m} menit`
}

// ── Bar Chart SVG ─────────────────────────────────────────────────
function BarChartSVG({ data, warna, labelKey, nilaiKey, satuan = '' }) {
  const W = 320, H = 160
  const pad = { top: 24, bottom: 36, left: 16, right: 16 }
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
              stroke="#eee" strokeWidth="1" strokeDasharray="4,2" />
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
              fill={warna} rx="3" opacity={0.85} />
            <text x={x + barW / 2} y={y - 4}
              fontSize="7" fontWeight="bold" fill={warna} textAnchor="middle">
              {d[nilaiKey]}{satuan}
            </text>
            <text x={x + barW / 2} y={H - pad.bottom + 12}
              fontSize="7" fill="#999" textAnchor="middle">
              {d[labelKey]}
            </text>
          </g>
        )
      })}

      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom}
        stroke="#ddd" strokeWidth="1.5" />
      <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom}
        stroke="#ddd" strokeWidth="1.5" />
    </svg>
  )
}

// ── Radar Chart SVG ───────────────────────────────────────────────
function RadarChart({ kecepatan, akurasi, kemandirian, pemahamanLP, konsistensi }) {
  const cx = 160, cy = 130, r = 80
  const labels = ['Kecepatan', 'Akurasi', 'Kemandirian', 'Pemahaman', 'Konsistensi']
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

  const gridLevels = [25, 50, 75, 100]

  return (
    <svg width="100%" viewBox="0 0 320 250">
      {/* Grid */}
      {gridLevels.map(level => {
        const pts = labels.map((_, i) => getAxisPoint(i, r * level / 100))
        const path = pts.map((p, i) =>
          `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
        ).join(' ') + ' Z'
        return <path key={level} d={path} fill="none"
          stroke="#eee" strokeWidth="1" />
      })}

      {labels.map((_, i) => {
        const end = getAxisPoint(i, r)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
          stroke="#ddd" strokeWidth="1" />
      })}

      <path d={dataPath}
        fill="rgba(30,132,73,0.2)" stroke="#1E8449" strokeWidth="2" />

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4"
          fill="#1E8449" stroke="white" strokeWidth="1.5" />
      ))}

      {labels.map((label, i) => {
        const pt     = getAxisPoint(i, r + 20)
        const anchor = pt.x < cx - 5 ? 'end' : pt.x > cx + 5 ? 'start' : 'middle'
        return (
          <text key={i} x={pt.x} y={pt.y + 4}
            fontSize="9" fontWeight="bold" fill="#555" textAnchor={anchor}>
            {label}
          </text>
        )
      })}

      {dataPoints.map((p, i) => (
        <text key={i} x={p.x} y={p.y - 8}
          fontSize="8" fontWeight="bold" fill="#1E8449" textAnchor="middle">
          {values[i]}
        </text>
      ))}
    </svg>
  )
}

// ── Komponen Analisa AI ───────────────────────────────────────────
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

- Total Run Selesai: ${stats.totalRun} run
- Produk Diselesaikan: ${stats.produkSelesai}/10 produk
- Total XP: ${stats.totalXp}
- Total Pendapatan: Rp${stats.totalPendapatan.toLocaleString('id-ID')}
- Akurasi Jawaban: ${stats.akurasi}%
- Hint Dipakai: ${stats.hintDipakai} dari ${stats.totalJawaban} soal (${stats.persenHint}%)
- Rata-rata Waktu per Run: ${formatWaktu(stats.rataWaktu)}

Skor Profil Belajar (0-100):
- Kecepatan: ${stats.kecepatan}/100
- Akurasi: ${stats.akurasi}/100
- Kemandirian (tidak pakai hint): ${stats.kemandirian}/100
- Pemahaman Program Linear: ${stats.pemahamanLP}/100
- Konsistensi: ${stats.konsistensi}/100

Berikan analisis kemampuan siswa ini dalam Bahasa Indonesia yang mudah dipahami guru. Strukturkan jawabanmu dengan:
1. **Ringkasan Kemampuan** — gambaran umum performa siswa
2. **Kekuatan** — aspek yang sudah baik (minimal 2 poin)
3. **Area yang Perlu Ditingkatkan** — aspek yang masih lemah (minimal 2 poin)
4. **Rekomendasi untuk Guru** — langkah konkret yang bisa dilakukan guru (minimal 2 saran)

Gunakan bahasa yang hangat, konstruktif, dan mendorong. Jangan terlalu teknis.`

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

  // Render teks markdown sederhana (bold + list)
  function renderTeks(teks) {
    return teks.split('\n').map((baris, i) => {
      // Heading **teks**
      const headingMatch = baris.match(/^\*\*(.+)\*\*$/)
      if (headingMatch) {
        return (
          <p key={i} style={{ fontWeight: 900, color: '#1E8449',
                              marginTop: '1rem', marginBottom: '0.25rem',
                              fontSize: '0.95rem' }}>
            {headingMatch[1]}
          </p>
        )
      }
      // Bold inline **x**
      const parts = baris.split(/\*\*(.+?)\*\*/)
      const rendered = parts.map((part, j) =>
        j % 2 === 1
          ? <strong key={j}>{part}</strong>
          : part
      )
      // List item
      const isList = baris.trim().startsWith('-') || /^\d+\./.test(baris.trim())
      return baris.trim() === '' ? (
        <br key={i} />
      ) : (
        <p key={i} style={{
          fontSize: '0.85rem', color: '#444', lineHeight: 1.7,
          fontWeight: 500,
          paddingLeft: isList ? '0.75rem' : 0,
          marginBottom: '0.15rem'
        }}>
          {rendered}
        </p>
      )
    })
  }

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '1.25rem',
      padding: '1.25rem', border: '2px solid #8E44AD',
      marginBottom: '0.75rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontWeight: 900, color: '#8E44AD', marginBottom: '0.1rem' }}>
            🤖 Analisis AI
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#bbb', fontWeight: 600 }}>
            Menggunakan Artificial Intelligence (AI) untuk menganalisis performa siswa
          </p>
        </div>
        <button
          onClick={handleAnalisa}
          disabled={loading}
          style={{
            padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
            backgroundColor: loading ? '#ddd' : '#8E44AD',
            color: loading ? '#aaa' : 'white',
            fontWeight: 700, fontSize: '0.875rem',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}>
          {loading ? '⏳ Menganalisis...' : sudahDi ? '🔄 Analisis Ulang' : '✨ Analisis Sekarang'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          padding: '1.5rem', textAlign: 'center',
          backgroundColor: '#FAF5FF', borderRadius: '0.75rem'
        }}>
          <p style={{ color: '#8E44AD', fontWeight: 700, fontSize: '0.875rem' }}>
            🧠 AI sedang menganalisis data siswa...
          </p>
          <p style={{ color: '#bbb', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem' }}>
            Mohon tunggu sebentar
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{
          padding: '1rem', backgroundColor: '#FADBD8',
          borderRadius: '0.75rem', border: '1.5px solid #C0392B'
        }}>
          <p style={{ color: '#C0392B', fontWeight: 700, fontSize: '0.85rem' }}>
            ❌ {error}
          </p>
          <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem' }}>
            Pastikan VITE_GROQ_API_KEY sudah diset di file .env
          </p>
        </div>
      )}

      {/* Hasil analisa */}
      {hasil && !loading && (
        <div style={{
          padding: '1rem', backgroundColor: '#FAF5FF',
          borderRadius: '0.75rem', border: '1.5px solid #D2B4DE'
        }}>
          {renderTeks(hasil)}
        </div>
      )}

      {/* Empty state */}
      {!hasil && !loading && !error && (
        <div style={{
          padding: '1.5rem', textAlign: 'center',
          backgroundColor: '#FAF5FF', borderRadius: '0.75rem',
          border: '1.5px dashed #D2B4DE'
        }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🤖</p>
          <p style={{ color: '#8E44AD', fontWeight: 700, fontSize: '0.875rem' }}>
            Klik "Analisis Sekarang" untuk mendapatkan
          </p>
          <p style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: 600 }}>
            insight mendalam tentang kemampuan siswa ini
          </p>
        </div>
      )}
    </div>
  )
}

// ── Halaman Utama ─────────────────────────────────────────────────
function DetailSiswaPage() {
  const { kelasId, siswaId } = useParams()
  const navigate = useNavigate()

  const [namaSiswa,    setNamaSiswa]    = useState('')
  const [sesiList,     setSesiList]     = useState([])
  const [loading,      setLoading]      = useState(true)

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

      const data = await fetchProgressSiswa(siswaId)
      setSesiList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const semuaRun     = sesiList.flatMap(s => s.run ?? [])
  const semuaJawaban = semuaRun.flatMap(r => r.jawaban_soal ?? [])

  const totalXp         = semuaRun.reduce((s, r) => s + (r.xp_run ?? 0), 0)
  const totalPendapatan = semuaRun.reduce((s, r) => s + (r.pendapatan ?? 0), 0)
  const totalWaktu      = semuaRun.reduce((s, r) => s + (r.waktu_bermain ?? 0), 0)
  const jawabanBenar    = semuaJawaban.filter(j => j.jawaban_benar).length
  const hintDipakai     = semuaJawaban.filter(j => j.hint_dipakai).length
  const akurasi         = semuaJawaban.length > 0
    ? Math.round((jawabanBenar / semuaJawaban.length) * 100) : 0

  const produkSelesai = new Set(semuaRun.flatMap(r => [
    r.produk_a?.slug, r.produk_b?.slug
  ].filter(Boolean))).size

  const rataWaktu       = semuaRun.length > 0 ? totalWaktu / semuaRun.length : 0
  const kecepatanScore  = semuaRun.length === 0 ? 0
    : Math.max(0, Math.min(100, Math.round(100 - (rataWaktu / 600) * 100)))
  const akurasiScore    = Math.round(akurasi)
  const kemandirianScore = semuaJawaban.length === 0 ? 0
    : Math.round(100 - (hintDipakai / semuaJawaban.length) * 100)
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
        const stddev = Math.sqrt(
          xpArr.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / xpArr.length
        )
        return Math.max(0, Math.min(100,
          Math.round(100 - (stddev / avg) * 100)))
      })()

  // Objek stats untuk dikirim ke AnalisaAI
  const statsAI = {
    totalRun:      semuaRun.length,
    produkSelesai,
    totalXp,
    totalPendapatan,
    totalJawaban:  semuaJawaban.length,
    akurasi,
    hintDipakai,
    persenHint:    semuaJawaban.length > 0
      ? Math.round((hintDipakai / semuaJawaban.length) * 100) : 0,
    rataWaktu,
    kecepatan:     kecepatanScore,
    kemandirian:   kemandirianScore,
    pemahamanLP:   pemahamanLPScore,
    konsistensi:   konsistensiScore,
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#FDFBE4' }}>

      {/* Header */}
      <div style={{
        backgroundColor: '#3498DB', padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <button
          onClick={() => navigate(`/dashboard-guru/kelas/${kelasId}`)}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', color: 'white',
            fontSize: '1.25rem', fontWeight: 700
          }}>
          ←
        </button>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'white' }}>
            {namaSiswa}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)',
                      fontWeight: 600 }}>
            {semuaRun.length} run selesai · {produkSelesai}/10 produk
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#aaa',
                      fontWeight: 600, padding: '2rem' }}>
            Memuat data...
          </p>
        ) : (
          <>
            {/* Statistik Utama */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem', marginBottom: '1.25rem'
            }}>
              {[
                { label: 'Total XP',         nilai: `⭐ ${totalXp}`,                             warna: '#F39C12' },
                { label: 'Total Pendapatan', nilai: `Rp${(totalPendapatan/1000).toFixed(0)}k`,   warna: '#1E8449' },
                { label: 'Akurasi Jawaban',  nilai: `${akurasi}%`,                               warna: '#3498DB' },
                { label: 'Produk Selesai',   nilai: `${produkSelesai}/10`,                        warna: '#C0392B' },
              ].map((item, i) => (
                <div key={i} style={{
                  backgroundColor: 'white', borderRadius: '1rem',
                  padding: '1rem', textAlign: 'center',
                  border: `2px solid ${item.warna}`
                }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700,
                              color: '#888', marginBottom: '0.25rem' }}>
                    {item.label}
                  </p>
                  <p style={{ fontWeight: 900, fontSize: '1.25rem', color: item.warna }}>
                    {item.nilai}
                  </p>
                </div>
              ))}
            </div>

            {/* Radar + Metrik */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{
                flex: 1, backgroundColor: 'white', borderRadius: '1.25rem',
                padding: '1.25rem', border: '2px solid #ddd'
              }}>
                <h3 style={{ fontWeight: 900, color: '#333', marginBottom: '0.5rem' }}>
                  📊 Profil Belajar
                </h3>
                <RadarChart
                  kecepatan={kecepatanScore}
                  akurasi={akurasiScore}
                  kemandirian={kemandirianScore}
                  pemahamanLP={pemahamanLPScore}
                  konsistensi={konsistensiScore}
                />
              </div>

              <div style={{
                flex: 1, backgroundColor: 'white', borderRadius: '1.25rem',
                padding: '1.25rem', border: '2px solid #ddd'
              }}>
                <h3 style={{ fontWeight: 900, color: '#333', marginBottom: '0.75rem' }}>
                  📋 Detail Metrik
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Kecepatan',   nilai: kecepatanScore,   ket: 'Seberapa cepat menjawab soal' },
                    { label: 'Akurasi',     nilai: akurasiScore,     ket: 'Persentase jawaban benar' },
                    { label: 'Kemandirian', nilai: kemandirianScore, ket: 'Jarang pakai hint = skor tinggi' },
                    { label: 'Pemahaman',   nilai: pemahamanLPScore, ket: 'Pendapatan aktual vs optimal' },
                    { label: 'Konsistensi', nilai: konsistensiScore, ket: 'Stabilitas performa antar run' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                                    marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#555' }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1E8449' }}>
                          {item.nilai}/100
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#eee',
                                    borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          backgroundColor: item.nilai >= 70 ? '#1E8449'
                            : item.nilai >= 40 ? '#F39C12' : '#C0392B',
                          width: `${item.nilai}%`,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                      <p style={{ fontSize: '0.65rem', color: '#bbb',
                                  fontWeight: 600, marginTop: '0.1rem' }}>
                        {item.ket}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ANALISA AI ── */}
            <AnalisaAI namaSiswa={namaSiswa} stats={statsAI} />

            {/* Grafik Pendapatan */}
            {semuaRun.length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: '1.25rem',
                padding: '1.25rem', border: '2px solid #ddd',
                marginBottom: '0.75rem'
              }}>
                <h3 style={{ fontWeight: 900, color: '#1E8449', marginBottom: '0.25rem' }}>
                  📈 Pendapatan per Run
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#aaa',
                            fontWeight: 600, marginBottom: '0.75rem' }}>
                  dalam ribuan rupiah
                </p>
                <BarChartSVG
                  data={semuaRun.map((r, i) => ({
                    labelKey: `R${i + 1}`,
                    nilaiKey: Math.round((r.pendapatan ?? 0) / 1000),
                  }))}
                  warna="#1E8449"
                  labelKey="labelKey"
                  nilaiKey="nilaiKey"
                  satuan="k"
                />
              </div>
            )}

            {/* Grafik Waktu */}
            {semuaRun.length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: '1.25rem',
                padding: '1.25rem', border: '2px solid #ddd',
                marginBottom: '0.75rem'
              }}>
                <h3 style={{ fontWeight: 900, color: '#3498DB', marginBottom: '0.25rem' }}>
                  ⏱ Waktu Bermain per Run
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#aaa',
                            fontWeight: 600, marginBottom: '0.75rem' }}>
                  dalam menit
                </p>
                <BarChartSVG
                  data={semuaRun.map((r, i) => ({
                    labelKey: `R${i + 1}`,
                    nilaiKey: Math.round((r.waktu_bermain ?? 0) / 60),
                  }))}
                  warna="#3498DB"
                  labelKey="labelKey"
                  nilaiKey="nilaiKey"
                  satuan="m"
                />
              </div>
            )}

            {/* Riwayat Run */}
            {semuaRun.length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: '1.25rem',
                padding: '1.25rem', border: '2px solid #ddd'
              }}>
                <h3 style={{ fontWeight: 900, color: '#333', marginBottom: '0.75rem' }}>
                  📋 Riwayat Run
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {semuaRun.map((run, i) => (
                    <div key={run.id} style={{
                      padding: '0.75rem 1rem', borderRadius: '0.75rem',
                      backgroundColor: '#EAF4FB'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                                    marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>
                          Run {i + 1} — {run.produk_a?.nama} + {run.produk_b?.nama}
                        </span>
                        <span style={{ fontWeight: 900, color: '#1E8449', fontSize: '0.875rem' }}>
                          Rp{(run.pendapatan ?? 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {[
                          { label: '⏱', nilai: formatWaktu(run.waktu_bermain) },
                          { label: '⭐', nilai: `${run.xp_run} XP` },
                          { label: '🎯', nilai: `Optimal: Rp${(run.pendapatan_optimal ?? 0).toLocaleString('id-ID')}` },
                        ].map((item, j) => (
                          <span key={j} style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>
                            {item.label} {item.nilai}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {semuaRun.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '2rem',
                backgroundColor: 'white', borderRadius: '1.5rem',
                border: '2px dashed #ddd'
              }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮</p>
                <p style={{ fontWeight: 700, color: '#aaa' }}>
                  Siswa ini belum mulai bermain.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DetailSiswaPage
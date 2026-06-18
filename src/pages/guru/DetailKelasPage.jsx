import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import { fetchSiswaByKelas, fetchStatistikKelas } from '../../lib/game'

function formatWaktu(detik) {
  if (!detik) return '0 dtk'
  if (detik < 60) return `${detik} dtk`
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return s > 0 ? `${m}m ${s}d` : `${m} menit`
}

function StatusBadge({ produkSelesai }) {
  if (produkSelesai === 0)
    return (
      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.5rem',
                     backgroundColor: '#eee', color: '#aaa',
                     fontSize: '0.7rem', fontWeight: 700 }}>
        Belum Mulai
      </span>
    )
  if (produkSelesai >= 10)
    return (
      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.5rem',
                     backgroundColor: '#D5F5E3', color: '#1E8449',
                     fontSize: '0.7rem', fontWeight: 700 }}>
        Selesai ✅
      </span>
    )
  return (
    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.5rem',
                   backgroundColor: '#FEF9E7', color: '#F39C12',
                   fontSize: '0.7rem', fontWeight: 700 }}>
      Sedang Bermain
    </span>
  )
}

function DetailKelasPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useGame()

  const [progressList, setProgressList] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [sortBy,       setSortBy]       = useState('nama')

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      setLoading(true)
      const data = await fetchStatistikKelas(id)
      setProgressList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Statistik kelas
  const totalSiswa    = progressList.length
  const rataXp        = totalSiswa > 0
    ? Math.round(progressList.reduce((s, p) => s + p.totalXp, 0) / totalSiswa)
    : 0
  const rataAkurasi   = totalSiswa > 0
    ? Math.round(progressList.reduce((s, p) => s + p.akurasi, 0) / totalSiswa)
    : 0
  const sudahSelesai  = progressList.filter(p => p.produkSelesai >= 10).length

  // Sort
  const sorted = [...progressList].sort((a, b) => {
    if (sortBy === 'nama')       return a.siswa.nama_lengkap.localeCompare(b.siswa.nama_lengkap)
    if (sortBy === 'xp')         return b.totalXp - a.totalXp
    if (sortBy === 'pendapatan') return b.totalPendapatan - a.totalPendapatan
    if (sortBy === 'akurasi')    return b.akurasi - a.akurasi
    if (sortBy === 'produk')     return b.produkSelesai - a.produkSelesai
    return 0
  })

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#FDFBE4' }}>

      {/* Header */}
      <div style={{
        backgroundColor: '#1E8449', padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <button onClick={() => navigate('/dashboard-guru')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'white', fontSize: '1.25rem', fontWeight: 700
          }}>
          ←
        </button>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'white' }}>
            Detail Kelas
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)',
                      fontWeight: 600 }}>
            {totalSiswa} siswa terdaftar
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Statistik Kelas */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem', marginBottom: '1.25rem'
        }}
          className="md:grid-cols-4">
          {[
            { label: 'Total Siswa',    nilai: totalSiswa,          warna: '#3498DB' },
            { label: 'Rata-rata XP',   nilai: `⭐ ${rataXp}`,      warna: '#F39C12' },
            { label: 'Rata-rata Akurasi', nilai: `${rataAkurasi}%`, warna: '#1E8449' },
            { label: 'Sudah Selesai',  nilai: `${sudahSelesai}/${totalSiswa}`, warna: '#C0392B' },
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
              <p style={{ fontWeight: 900, fontSize: '1.25rem',
                          color: item.warna }}>
                {item.nilai}
              </p>
            </div>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem',
                      flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700,
                         color: '#888', alignSelf: 'center' }}>
            Urutkan:
          </span>
          {[
            { key: 'nama',       label: 'Nama' },
            { key: 'xp',         label: 'XP' },
            { key: 'pendapatan', label: 'Pendapatan' },
            { key: 'akurasi',    label: 'Akurasi' },
            { key: 'produk',     label: 'Produk' },
          ].map(s => (
            <button key={s.key}
              onClick={() => setSortBy(s.key)}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: '0.5rem',
                backgroundColor: sortBy === s.key ? '#1E8449' : '#eee',
                color: sortBy === s.key ? 'white' : '#666',
                fontWeight: 700, fontSize: '0.75rem',
                border: 'none', cursor: 'pointer'
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: 'center', color: '#aaa',
                      fontWeight: 600, padding: '2rem' }}>
            Memuat data siswa...
          </p>
        )}

        {/* Tabel Siswa */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sorted.map(({ siswa, totalRun, totalXp, totalPendapatan,
                           akurasi, produkSelesai, rataWaktuRun, persenHint }) => (
              <div key={siswa.id}
                style={{
                  backgroundColor: 'white', borderRadius: '1rem',
                  padding: '1rem', border: '2px solid #ddd',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  flexWrap: 'wrap'
                }}>

                {/* Info Siswa */}
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem',
                               color: '#333', marginBottom: '0.2rem',
                               whiteSpace: 'nowrap', overflow: 'hidden',
                               textOverflow: 'ellipsis' }}>
                    {siswa.nama_lengkap}
                  </p>
                  <StatusBadge produkSelesai={produkSelesai} />
                </div>

                {/* Statistik */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap',
                              flex: '2 1 300px' }}>
                  {[
                    { label: 'XP',         nilai: `⭐ ${totalXp}`                            },
                    { label: 'Pendapatan', nilai: `Rp${(totalPendapatan/1000).toFixed(0)}k`   },
                    { label: 'Akurasi',    nilai: `${akurasi}%`                               },
                    { label: 'Produk',     nilai: `${produkSelesai}/10`                       },
                    { label: 'Run',        nilai: `${totalRun}x`                              },
                    { label: 'Hint',       nilai: `${persenHint}%`                            },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', minWidth: '50px' }}>
                      <p style={{ fontSize: '0.65rem', color: '#aaa',
                                  fontWeight: 700 }}>{item.label}</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 900,
                                  color: '#333' }}>{item.nilai}</p>
                    </div>
                  ))}
                </div>

                {/* Tombol Detail */}
                <button
                  onClick={() => navigate(
                    `/dashboard-guru/kelas/${id}/siswa/${siswa.id}`
                  )}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.75rem',
                    backgroundColor: '#EAF4FB', color: '#3498DB',
                    fontWeight: 700, fontSize: '0.8rem',
                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                  Detail →
                </button>
              </div>
            ))}

            {sorted.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '3rem',
                backgroundColor: 'white', borderRadius: '1.5rem',
                border: '2px dashed #ddd'
              }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</p>
                <p style={{ fontWeight: 700, color: '#aaa' }}>
                  Belum ada siswa di kelas ini.
                </p>
                <p style={{ fontSize: '0.8rem', color: '#bbb',
                            fontWeight: 600, marginTop: '0.25rem' }}>
                  Bagikan kode kelas ke siswa untuk bergabung.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DetailKelasPage
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import { fetchKelasByGuru, createKelas, deleteKelas } from '../../lib/game'

function DashboardGuruPage() {
  const navigate  = useNavigate()
  const { user, logout } = useGame()

  const [kelasList,   setKelasList]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [namaKelas,   setNamaKelas]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [copied,      setCopied]      = useState(null)

  useEffect(() => {
    if (user) loadKelas()
  }, [user])

  async function loadKelas() {
    try {
      setLoading(true)
      const data = await fetchKelasByGuru(user.id)
      setKelasList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleBuatKelas() {
    if (!namaKelas.trim()) { setError('Nama kelas tidak boleh kosong.'); return }
    setSubmitting(true)
    setError('')
    try {
      await createKelas({ guruId: user.id, namaKelas: namaKelas.trim() })
      setNamaKelas('')
      setShowForm(false)
      loadKelas()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleHapusKelas(kelasId, namaKelas) {
    if (!window.confirm(
      `Hapus kelas "${namaKelas}"? Semua data siswa di kelas ini akan terputus.`
    )) return
    try {
      await deleteKelas(kelasId)
      loadKelas()
    } catch (err) {
      alert('Gagal menghapus kelas: ' + err.message)
    }
  }

  function handleCopyKode(kode) {
    navigator.clipboard.writeText(kode)
    setCopied(kode)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#FDFBE4' }}>

      {/* KELOMPOK HEADER STICKY */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1E8449', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '1.25rem', color: 'white' }}>
              📚 Dashboard Guru
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)',
                        fontWeight: 600 }}>
              Halo, {user?.namaLengkap}!
            </p>
          </div>
          <button onClick={logout}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
              fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer'
            }}>
            Keluar
          </button>
        </div>

        {/* Navigasi Cepat Guru */}
        <div style={{ backgroundColor: '#166635', padding: '0.6rem 1.5rem',
                      display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          <button
            onClick={() => navigate('/dashboard-guru/soal')}
            style={{
              padding: '0.4rem 1rem', borderRadius: '0.65rem',
              backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
              fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}>
            📝 Manajemen Soal
          </button>
          
          {/* ── TOMBOL BARU: HOST PACU JALUR ── */}
          <button
            onClick={() => navigate('/dashboard-guru/pacu-jalur')}
            style={{
              padding: '0.4rem 1rem', borderRadius: '0.65rem',
              backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', // Warna biru khas Pacu Jalur
              fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}>
            🚣‍♂️ Host Pacu Jalur
          </button>
        </div>
      </div>
      {/* AKHIR KELOMPOK HEADER STICKY */}

      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Tombol Buat Kelas */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.125rem', color: '#333' }}>
            Kelas Saya ({kelasList.length})
          </h2>
          <button
            onClick={() => { setShowForm(true); setError('') }}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
              backgroundColor: '#1E8449', color: 'white',
              fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer'
            }}>
            + Buat Kelas
          </button>
        </div>

        {/* Form Buat Kelas */}
        {showForm && (
          <div style={{
            backgroundColor: 'white', borderRadius: '1.25rem',
            padding: '1.25rem', marginBottom: '1rem',
            border: '2px solid #1E8449',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <p style={{ fontWeight: 800, marginBottom: '0.75rem', color: '#333' }}>
              Buat Kelas Baru
            </p>
            <input
              type="text" value={namaKelas}
              onChange={e => setNamaKelas(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBuatKelas()}
              placeholder="contoh: X-IPA-1"
              style={{
                width: '100%', padding: '0.75rem 1rem',
                borderRadius: '0.75rem', border: '2px solid #ddd',
                fontSize: '0.875rem', fontWeight: 600,
                backgroundColor: '#FAFAFA', outline: 'none',
                boxSizing: 'border-box', marginBottom: '0.75rem'
              }}
            />
            {error && (
              <p style={{ color: '#C0392B', fontSize: '0.8rem',
                          fontWeight: 700, marginBottom: '0.5rem' }}>
                {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleBuatKelas} disabled={submitting}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                  backgroundColor: '#1E8449', color: 'white',
                  fontWeight: 700, border: 'none', cursor: 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}>
                {submitting ? 'Membuat...' : 'Buat Kelas'}
              </button>
              <button onClick={() => { setShowForm(false); setNamaKelas('') }}
                style={{
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  backgroundColor: '#eee', color: '#666',
                  fontWeight: 700, border: 'none', cursor: 'pointer'
                }}>
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: 'center', color: '#aaa',
                      fontWeight: 600, padding: '2rem' }}>
            Memuat kelas...
          </p>
        )}

        {/* Kosong */}
        {!loading && kelasList.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem',
            backgroundColor: 'white', borderRadius: '1.5rem',
            border: '2px dashed #ddd'
          }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</p>
            <p style={{ fontWeight: 700, color: '#aaa' }}>
              Belum ada kelas. Buat kelas pertamamu!
            </p>
          </div>
        )}

        {/* Daftar Kelas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {kelasList.map(kelas => (
            <div key={kelas.id}
              style={{
                backgroundColor: 'white', borderRadius: '1.25rem',
                padding: '1.25rem', border: '2px solid #ddd',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '1.125rem',
                               color: '#333', marginBottom: '0.25rem' }}>
                    {kelas.nama}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 600 }}>
                    {new Date(kelas.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleHapusKelas(kelas.id, kelas.nama)}
                  style={{
                    padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
                    backgroundColor: '#FADBD8', color: '#C0392B',
                    fontWeight: 700, fontSize: '0.75rem',
                    border: 'none', cursor: 'pointer'
                  }}>
                  Hapus
                </button>
              </div>

              {/* Kode Kelas */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  padding: '0.4rem 1rem', borderRadius: '0.5rem',
                  backgroundColor: '#EAF4FB', fontWeight: 900,
                  fontSize: '1.1rem', letterSpacing: '0.15rem', color: '#333'
                }}>
                  {kelas.kode_kelas}
                </div>
                <button
                  onClick={() => handleCopyKode(kelas.kode_kelas)}
                  style={{
                    padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                    backgroundColor: copied === kelas.kode_kelas ? '#D5F5E3' : '#eee',
                    color: copied === kelas.kode_kelas ? '#1E8449' : '#666',
                    fontWeight: 700, fontSize: '0.75rem',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                  {copied === kelas.kode_kelas ? '✅ Tersalin!' : '📋 Salin'}
                </button>
                <p style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600 }}>
                  Bagikan ke siswa
                </p>
              </div>

              {/* Tombol Lihat Detail */}
              <button
                onClick={() => navigate(`/dashboard-guru/kelas/${kelas.id}`)}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                  backgroundColor: '#1E8449', color: 'white',
                  fontWeight: 700, fontSize: '0.875rem',
                  border: 'none', cursor: 'pointer'
                }}>
                Lihat Detail Kelas →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardGuruPage
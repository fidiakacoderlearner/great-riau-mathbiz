import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import { produkList } from '../../data/soalData'
import SoalCard from '../../components/SoalCard'
import XPBar from '../../components/XPBar'
import TransisiPage from '../../components/TransisiPage'
import GameHeader from '../../components/GameHeader'
import useTimer from '../../hooks/useTimer'
import usePreventBack from '../../hooks/usePreventBack'

const MAX_PRODUK = 2

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

function RancanganUsahaPage() {
  const navigate = useNavigate()
  const {
    xp, selesaiIds, addProdukTerpilih,
    startNewSession, setGamePhase, gamePhase,
    allDoneIds
  } = useGame()
  usePreventBack()

  // Jika ada sesi aktif (phase=rancangan), skip welcome
  const isResuming = gamePhase === 'rancangan' && selesaiIds.length > 0

  const [step,         setStep]         = useState(isResuming ? 'pilih-produk' : 'welcome')
  const [produkSelesai, setProdukSelesai] = useState(isResuming ? selesaiIds : [])
  const [produkDipilih, setProdukDipilih] = useState(null)
  const [timerHabis,   setTimerHabis]   = useState(false)
  const [timerStarted, setTimerStarted] = useState(isResuming)

  const detikSisa = useTimer(() => setTimerHabis(true), timerStarted)

  // Set phase saat masuk halaman
  useEffect(() => {
    if (!isResuming) return  // belum start, jangan set phase dulu
    setGamePhase('rancangan')
  }, [])

  function handlePilihProduk(produk) {
    if (produkSelesai.includes(produk.id)) return
    if (produkSelesai.length >= MAX_PRODUK) return
    setProdukDipilih(produk)
    setStep('soal')
  }

  function handleSoalSelesai() {
    addProdukTerpilih(produkDipilih)
    const baru = [...produkSelesai, produkDipilih.id]
    setProdukSelesai(baru)
    setProdukDipilih(null)

    if (baru.length >= MAX_PRODUK) {
      // Tepat 2 selesai — langsung ke dapur produksi
      setGamePhase('dapur')
      setStep('transisi-dapur')
    } else {
      // Masih perlu 1 lagi
      setStep('pilih-produk')
    }
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C0392B',
                     marginBottom: '0.5rem' }}>Waktu Habis!</h2>
        <p style={{ color: '#666', fontWeight: 600, marginBottom: '1.5rem' }}>
          Tidak apa-apa, coba lagi ya!
        </p>
        <button onClick={() => { setGamePhase(null); navigate('/') }}
          style={{ padding: '0.75rem 2rem', borderRadius: '1rem',
                   backgroundColor: '#C0392B', color: 'white',
                   fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Kembali ke Menu
        </button>
      </div>
    )
  }

  // ── Welcome ───────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FDFBE4', padding: '1.5rem', overflow: 'hidden'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>👨‍🍳</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textAlign: 'center',
                     color: '#C0392B', marginBottom: '1rem' }}>
          Selamat Datang,<br />Pengusaha Muda!
        </h1>
        <div style={{
          backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.5rem',
          maxWidth: '32rem', width: '100%', border: '2px solid #ddd', marginBottom: '2rem'
        }}>
          <p style={{ fontWeight: 600, color: '#555', textAlign: 'center', lineHeight: 1.7 }}>
            Kamu akan memulai perjalanan sebagai{' '}
            <span style={{ fontWeight: 900, color: '#C0392B' }}>
              Pengusaha Kue Tradisional Riau
            </span>.
            Pilih <span style={{ fontWeight: 900 }}>tepat 2 produk</span> untuk
            dihitung modalnya, lalu lanjut ke Dapur Produksi!
          </p>
        </div>
        <button
          onClick={() => {
            startNewSession()  // reset sesi (XP tetap)
            setGamePhase('rancangan')
            setProdukSelesai([])
            setTimerStarted(true)
            setStep('transisi-rancangan')
          }}
          style={{
            padding: '1rem 2.5rem', borderRadius: '1rem',
            backgroundColor: '#C0392B', color: 'white',
            fontWeight: 900, fontSize: '1.125rem', border: 'none', cursor: 'pointer'
          }}>
          Siap Memulai! 🚀
        </button>
      </div>
    )
  }

  // ── Transisi ──────────────────────────────────────────────────────
  if (step === 'transisi-rancangan') {
    return (
      <TransisiPage judul="Rancangan Usaha" emoji="📋" warna="#C0392B"
        onLanjut={() => setStep('pilih-produk')} />
    )
  }

  if (step === 'transisi-dapur') {
    return (
      <TransisiPage judul="Dapur Produksi" emoji="🏭" warna="#1E8449"
        onLanjut={() => navigate('/eksplorasi/dapur-produksi')} />
    )
  }

  // ── Pilih Produk ──────────────────────────────────────────────────
  if (step === 'pilih-produk') {
    const sudahPilih2 = produkSelesai.length >= MAX_PRODUK

    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        backgroundColor: '#FDFBE4', overflow: 'hidden'
      }}>
        <GameHeader
          badge="📋 Rancangan Usaha"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

          {/* Instruksi */}
          <div style={{
            backgroundColor: produkSelesai.length === 0 ? '#FEF9E7' : '#D5F5E3',
            border: `2px solid ${produkSelesai.length === 0 ? '#F1C40F' : '#1E8449'}`,
            borderRadius: '1rem', padding: '0.75rem',
            textAlign: 'center', marginBottom: '1rem',
            maxWidth: '40rem', margin: '0 auto 1rem'
          }}>
            {produkSelesai.length === 0 && (
              <p style={{ fontWeight: 700, color: '#666', fontSize: '0.875rem' }}>
                Pilih <span style={{ fontWeight: 900, color: '#C0392B' }}>2 produk</span> yang
                ingin kamu jadikan usaha!
              </p>
            )}
            {produkSelesai.length === 1 && (
              <p style={{ fontWeight: 700, color: '#1E8449', fontSize: '0.875rem' }}>
                ✅ 1 produk selesai! Pilih{' '}
                <span style={{ fontWeight: 900 }}>1 produk lagi</span> untuk lanjut ke Dapur Produksi.
              </p>
            )}
          </div>

          {/* Grid 10 produk */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3"
            style={{ maxWidth: '64rem', margin: '0 auto 1rem' }}>
            {produkList.map(produk => {
              const selesai = allDoneIds.includes(produk.id)

              return (
                <button
                  key={produk.id}
                  onClick={() => handlePilihProduk(produk)}
                  disabled={selesai}
                  style={{
                    backgroundColor: selesai ? '#D5F5E3' : 'white',
                    border: `2px solid ${selesai ? '#1E8449' : '#ddd'}`,
                    borderRadius: '1.25rem',
                    padding: '1rem 0.75rem',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '0.5rem',
                    cursor: selesai ? 'default' : 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    opacity: selesai ? 0.6 : 1,
                    transition: 'transform 0.1s'
                  }}>
                  <span style={{ fontSize: '2rem' }}>
                    {produk.emoji}
                  </span>
                  <p style={{
                    fontWeight: 800, fontSize: '0.8rem', textAlign: 'center',
                    color: selesai ? '#1E8449' : '#333', lineHeight: 1.3
                  }}>
                    {produk.nama}
                  </p>
                  <p style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    color: selesai ? '#1E8449' : '#aaa'
                  }}>
                    {selesai ? '✅ Sudah Dikerjakan' : 'Tap untuk mulai'}
                  </p>
                  <p style={{ fontSize: '0.65rem', fontWeight: 600,
                    color: selesai ? '#1E8449' : '#bbb' }}>
                    {selesai
                      ? `HJ Rp${produk.hargaJual.toLocaleString('id-ID')}`
                      : `Modal Rp${produk.biayaPerUnit.toLocaleString('id-ID')}`}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Soal ──────────────────────────────────────────────────────────
  if (step === 'soal' && produkDipilih) {
    const soalObj = {
      id:            produkDipilih.id,
      produk:        produkDipilih.nama,
      biayaProduksi: produkDipilih.biayaPerUnit,
      resep:         produkDipilih.resep,
      soal:          produkDipilih.soal,
      pilihan:       produkDipilih.pilihan,
      jawaban:       produkDipilih.jawaban,
      feedbackBenar: produkDipilih.feedbackBenar,
      feedbackSalah: produkDipilih.feedbackSalah,
      hint:          produkDipilih.hint,
      penjelasan:    produkDipilih.penjelasan
    }

    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        backgroundColor: '#FDFBE4', overflow: 'hidden'
      }}>
        <GameHeader
          badge={`📋 ${produkDipilih.nama}`}
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}
          className="md:px-8">
          <p style={{
            textAlign: 'center', fontSize: '0.875rem', fontWeight: 600,
            color: '#aaa', marginTop: '0.75rem', marginBottom: '1rem'
          }}>
            Produk ke-{produkSelesai.length + 1} dari {MAX_PRODUK}
          </p>
          <SoalCard key={produkDipilih.id} soal={soalObj} onSelesai={handleSoalSelesai} />
        </div>
      </div>
    )
  }

  return null
}

export default RancanganUsahaPage
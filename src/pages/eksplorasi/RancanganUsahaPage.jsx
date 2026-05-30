import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import { soalRancanganUsaha } from '../../data/soalData'
import SoalCard from '../../components/SoalCard'
import XPBar from '../../components/XPBar'
import TransisiPage from '../../components/TransisiPage'
import GameHeader from '../../components/GameHeader'
import usePreventBack from '../../hooks/usePreventBack'
import useTimer from '../../hooks/useTimer'

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

// ── Main Component ────────────────────────────────────────────────
function EksplorasiPage() {
  const navigate = useNavigate()
  const { xp, resetXP } = useGame()

  const [step,                setStep]                = useState('welcome')
  const [produkDiselesaikan,  setProdukDiselesaikan]  = useState([])
  const [produkDipilih,       setProdukDipilih]       = useState(null)
  const [indexSoal,           setIndexSoal]           = useState(0)
  const [timerHabis,          setTimerHabis]          = useState(false)
  const [timerStarted,        setTimerStarted]  = useState(false)

  const detikSisa     = useTimer(() => setTimerHabis(true), timerStarted)
  const soalProdukIni = soalRancanganUsaha.filter(s => s.produk === produkDipilih)
  const soalSaatIni   = soalProdukIni[indexSoal]

  usePreventBack()

  function handlePilihProduk(produk) {
    setProdukDipilih(produk)
    setIndexSoal(0)
    setStep('soal')
  }

  function handleSoalSelesai() {
    const berikutnya = indexSoal + 1
    if (berikutnya >= soalProdukIni.length) {
      const baru = [...produkDiselesaikan, produkDipilih]
      setProdukDiselesaikan(baru)
      if (baru.length >= 2) {
        setStep('rancangan-selesai')
      } else {
        setProdukDipilih(null)
        setStep('pilih-produk')
      }
    } else {
      setIndexSoal(berikutnya)
    }
  }

  // ── Waktu Habis ─────────────────────────────────────────────────
  if (timerHabis) {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDFBE4',
        padding: '1rem'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏰</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C0392B', marginBottom: '0.5rem' }}>
          Waktu Habis!
        </h2>
        <p style={{ color: '#666', fontWeight: 600, marginBottom: '1.5rem' }}>
          Tidak apa-apa, coba lagi ya!
        </p>
        <button onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '1rem',
            backgroundColor: '#C0392B',
            color: 'white',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer'
          }}>
          Kembali ke Menu
        </button>
      </div>
    )
  }

  // ── Welcome ─────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDFBE4',
        padding: '1.5rem',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>👨‍🍳</div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 900,
          textAlign: 'center',
          color: '#C0392B',
          marginBottom: '1rem'
        }}>
          Selamat Datang,<br />Pengusaha Muda!
        </h1>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          maxWidth: '28rem',
          width: '100%',
          border: '2px solid #ddd',
          marginBottom: '2rem'
        }}>
          <p style={{
            fontWeight: 600,
            color: '#555',
            textAlign: 'center',
            lineHeight: 1.7
          }}>
            Kamu akan memulai perjalanan sebagai{' '}
            <span style={{ fontWeight: 900, color: '#C0392B' }}>
              Pengusaha Kue Tradisional Riau
            </span>.
            Dengan resep andalan dan modal, yuk asah insting usahamu biar makin cuan!
          </p>
        </div>
        <button
          onClick={() => { resetXP(); setStep('transisi-rancangan') }}
          style={{
            padding: '1rem 2.5rem',
            borderRadius: '1rem',
            backgroundColor: '#C0392B',
            color: 'white',
            fontWeight: 900,
            fontSize: '1.125rem',
            border: 'none',
            cursor: 'pointer'
          }}>
          Siap Memulai! 🚀
        </button>
      </div>
    )
  }

  // ── Transisi ─────────────────────────────────────────────────────
  if (step === 'transisi-rancangan') {
    return (
      <TransisiPage
        judul="Rancangan Usaha"
        emoji="📋"
        warna="#C0392B"
        onLanjut={() => {
          setTimerStarted(true)   // ← timer baru mulai setelah transisi selesai
          setStep('pilih-produk')
        }}
      />
    )
  }

  if (step === 'transisi-dapur') {
    return <TransisiPage judul="Dapur Produksi" emoji="🏭" warna="#1E8449"
      onLanjut={() => navigate('/eksplorasi/dapur-produksi')}/>
  }

  // ── Pilih Produk ─────────────────────────────────────────────────
  if (step === 'pilih-produk') {
    const kemojoDone  = produkDiselesaikan.includes('Bolu Kemojo')
    const bangkitDone = produkDiselesaikan.includes('Kue Bangkit')

    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FDFBE4',
        overflow: 'hidden'
      }}>
        <GameHeader
          badge="📋 Rancangan Usaha"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        {/* Konten tengah */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <p style={{
            fontWeight: 700,
            textAlign: 'center',
            color: '#444',
            lineHeight: 1.7,
            marginBottom: '2rem',
            maxWidth: '36rem'
          }}>
            Kamu memulai usaha Bolu Kemojo dan Kue Bangkit. Untuk itu, kamu menghitung
            biaya produksi masing-masing bolu dan kue.
          </p>

          {/* Kartu Produk */}
          <div className="flex flex-col md:flex-row gap-4 w-full"
            style={{ maxWidth: '40rem' }}>

            {/* Bolu Kemojo */}
            <button
              onClick={() => !kemojoDone && handlePilihProduk('Bolu Kemojo')}
              disabled={kemojoDone}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '1.25rem',
                border: `2px solid ${kemojoDone ? '#1E8449' : '#ddd'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: kemojoDone ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'transform 0.1s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
              <span style={{ fontSize: '3rem' }}>🍰</span>
              <div>
                <p style={{ fontWeight: 900, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  Modal Bolu Kemojo
                </p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600,
                  color: kemojoDone ? '#1E8449' : '#999' }}>
                  {kemojoDone ? '✅ Selesai' : 'Tap untuk mulai'}
                </p>
              </div>
            </button>

            {/* Kue Bangkit */}
            <button
              onClick={() => !bangkitDone && handlePilihProduk('Kue Bangkit')}
              disabled={bangkitDone}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '1.25rem',
                border: `2px solid ${bangkitDone ? '#1E8449' : '#ddd'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: bangkitDone ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'transform 0.1s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
              <span style={{ fontSize: '3rem' }}>🍪</span>
              <div>
                <p style={{ fontWeight: 900, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  Modal Kue Bangkit
                </p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600,
                  color: bangkitDone ? '#1E8449' : '#999' }}>
                  {bangkitDone ? '✅ Selesai' : 'Tap untuk mulai'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Soal ─────────────────────────────────────────────────────────
  if (step === 'soal') {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FDFBE4',
        overflow: 'hidden'
      }}>
        <GameHeader
          badge={`📋 Rancangan Usaha — ${produkDipilih}`}
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 1rem'
        }}
          className="md:px-8">
          <p style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#aaa',
            marginBottom: '1rem'
          }}>
            Soal {indexSoal + 1} dari {soalProdukIni.length}
          </p>
          {soalSaatIni && (
            <SoalCard key={soalSaatIni.id} soal={soalSaatIni}
              onSelesai={handleSoalSelesai} />
          )}
        </div>
      </div>
    )
  }

  // ── Rancangan Selesai ─────────────────────────────────────────────
  if (step === 'rancangan-selesai') {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDFBE4',
        padding: '1.5rem',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E8449',
          marginBottom: '0.5rem', textAlign: 'center' }}>
          Rancangan Usaha Selesai!
        </h2>
        <p style={{ color: '#888', fontWeight: 600, marginBottom: '1.5rem',
          textAlign: 'center' }}>
          Kamu sudah mendapatkan harga jual untuk produk-produkmu!
        </p>

        {/* Rekap Harga */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '32rem',
          border: '2px solid #ddd',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ fontWeight: 900, textAlign: 'center', marginBottom: '1rem' }}>
            Harga Jual Produkmu
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            {[
              { emoji: '🍰', nama: 'Bolu Kemojo', harga: 'Rp30.000' },
              { emoji: '🍪', nama: 'Kue Bangkit',  harga: 'Rp58.000' }
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                borderRadius: '1rem',
                backgroundColor: '#EAF4FB'
              }}>
                <span style={{ fontWeight: 700 }}>{item.emoji} {item.nama}</span>
                <span style={{ fontWeight: 900, color: '#1E8449' }}>{item.harga}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tombol */}
        <div className="flex flex-col md:flex-row gap-3 w-full"
          style={{ maxWidth: '32rem' }}>
          <button
            onClick={() => setStep('transisi-dapur')}
            style={{
              flex: 1, padding: '1rem', borderRadius: '1rem',
              backgroundColor: '#1E8449', color: 'white',
              fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer'
            }}>
            🏭 Lanjut ke Dapur Produksi
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1, padding: '1rem', borderRadius: '1rem',
              backgroundColor: '#F1C40F', color: '#333',
              fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer'
            }}>
            Kembali ke Menu
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default EksplorasiPage
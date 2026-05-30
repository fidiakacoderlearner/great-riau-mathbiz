import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { soalDapurProduksi } from '../../data/soalData'
import PertidaksamaanCard from '../../components/PertidaksamaanCard'
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
function DapurProduksiPage() {
  const navigate = useNavigate()
  usePreventBack()

  const [step,       setStep]       = useState('intro')
  const [indexSoal,  setIndexSoal]  = useState(0)
  const [timerHabis, setTimerHabis] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)

  const detikSisa   = useTimer(() => setTimerHabis(true), timerStarted)
  const soalSaatIni = soalDapurProduksi[indexSoal]

  function handleSoalSelesai() {
    if (indexSoal + 1 >= soalDapurProduksi.length) {
      setStep('selesai')
    } else {
      setIndexSoal(prev => prev + 1)
    }
  }

  // ── Waktu Habis ───────────────────────────────────────────────────
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C0392B',
                     marginBottom: '0.5rem' }}>
          Waktu Habis!
        </h2>
        <p style={{ color: '#666', fontWeight: 600, marginBottom: '1.5rem' }}>
          Tidak apa-apa, coba lagi ya!
        </p>
        <button
          onClick={() => navigate('/')}
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

  // ── Intro ─────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FDFBE4',
        overflow: 'hidden'
      }}>
        <GameHeader
          badge="🏭 Dapur Produksi"
          badgeWarna="#1E8449"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="flex flex-col md:flex-row gap-4 w-full"
            style={{ maxWidth: '40rem', marginBottom: '2rem' }}>

            <div className="flex-1 bg-white rounded-3xl p-5 shadow"
              style={{ border: '2px solid #ddd' }}>
              <p className="font-bold text-gray-700 leading-relaxed">
                Waktumu sangat berharga! Dalam sehari, kamu hanya punya waktu{' '}
                <span className="font-black" style={{ color: '#C0392B' }}>6 jam</span>{' '}
                untuk memproduksi usahamu.
              </p>
            </div>

            <div className="flex-1 bg-white rounded-3xl p-5 shadow"
              style={{ border: '2px solid #ddd' }}>
              <p className="font-bold text-gray-700 leading-relaxed">
                Sekali jalan, usahamu mampu membuat{' '}
                <span className="font-black" style={{ color: '#C0392B' }}>
                  4 loyang Bolu Kemojo
                </span>{' '}
                dalam <span className="font-black">80 menit</span> dan{' '}
                <span className="font-black" style={{ color: '#1E8449' }}>
                  2 toples Kue Bangkit
                </span>{' '}
                dalam <span className="font-black">60 menit</span>.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setTimerStarted(true)
              setStep('permisalan')
            }}
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
            Buat Pertidaksamaan dan Atur Strategi →
          </button>
        </div>
      </div>
    )
  }

  // ── Permisalan ────────────────────────────────────────────────────
  if (step === 'permisalan') {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FDFBE4',
        overflow: 'hidden'
      }}>
        <GameHeader
          badge="🏭 Dapur Produksi"
          badgeWarna="#1E8449"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <p className="font-black text-center text-xl mb-8" style={{ color: '#333' }}>
            Yuk, kita misalkan terlebih dahulu!
          </p>

          <div className="flex flex-col md:flex-row gap-4 w-full"
            style={{ maxWidth: '40rem', marginBottom: '2rem' }}>

            <div className="flex-1 bg-white rounded-3xl p-5 shadow flex items-center gap-4"
              style={{ border: '2px solid #ddd' }}>
              <div style={{ fontSize: '2.5rem' }}>🍰🍰🍰🍰</div>
              <div>
                <p className="font-black text-3xl" style={{ color: '#C0392B' }}>x</p>
                <p className="font-semibold text-sm text-gray-600">
                  = banyak batch produksi Bolu Kemojo
                </p>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl p-5 shadow flex items-center gap-4"
              style={{ border: '2px solid #ddd' }}>
              <div style={{ fontSize: '2.5rem' }}>🍪🍪</div>
              <div>
                <p className="font-black text-3xl" style={{ color: '#1E8449' }}>y</p>
                <p className="font-semibold text-sm text-gray-600">
                  = banyak batch produksi Kue Bangkit
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('soal')}
            style={{
              padding: '1rem 2.5rem',
              borderRadius: '1rem',
              backgroundColor: '#1E8449',
              color: 'white',
              fontWeight: 900,
              fontSize: '1.125rem',
              border: 'none',
              cursor: 'pointer'
            }}>
            Lanjut →
          </button>
        </div>
      </div>
    )
  }

  // ── Soal ──────────────────────────────────────────────────────────
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
          badge="🏭 Dapur Produksi"
          badgeWarna="#1E8449"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem'
        }}
          className="md:px-8">
          <p style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#aaa',
            marginTop: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            Soal {indexSoal + 1} dari {soalDapurProduksi.length}
          </p>

          <p className="font-black text-center text-lg mb-4" style={{ color: '#333' }}>
            {soalSaatIni.judul}
          </p>

          <PertidaksamaanCard
            key={soalSaatIni.id}
            soal={soalSaatIni}
            onSelesai={handleSoalSelesai}
          />
        </div>
      </div>
    )
  }

  // ── Selesai ───────────────────────────────────────────────────────
  if (step === 'selesai') {
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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏭✅</div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          color: '#1E8449',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Dapur Produksi Selesai!
        </h2>
        <p style={{
          color: '#888',
          fontWeight: 600,
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Kamu sudah berhasil membuat sistem pertidaksamaan produksimu!
        </p>

        <div className="bg-white rounded-3xl p-6 w-full shadow"
          style={{
            maxWidth: '36rem',
            border: '2px solid #ddd',
            marginBottom: '1.5rem'
          }}>
          <p className="font-black text-center mb-4">Sistem Pertidaksamaanmu</p>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 p-3 rounded-2xl font-bold text-sm"
              style={{ backgroundColor: '#EAF4FB' }}>
              ⏱ Waktu:{' '}
              <span className="font-black">80x + 60y ≤ 360</span>
            </div>
            <div className="flex-1 p-3 rounded-2xl font-bold text-sm"
              style={{ backgroundColor: '#EAF4FB' }}>
              💰 Modal:{' '}
              <span className="font-black">120.000x + 116.000y ≤ 600.000</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full"
          style={{ maxWidth: '36rem' }}>
          <button
            onClick={() => setStep('transisi-pembeli')}
            className="flex-1"
            style={{
              padding: '1rem',
              borderRadius: '1rem',
              backgroundColor: '#1E8449',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer'
            }}>
            🛒 Lanjut ke Bertemu Pembeli
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1"
            style={{
              padding: '1rem',
              borderRadius: '1rem',
              backgroundColor: '#F1C40F',
              color: '#333',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer'
            }}>
            Kembali ke Menu
          </button>
        </div>
      </div>
    )
  }

  // ── Transisi ke Bertemu Pembeli ───────────────────────────────────
  if (step === 'transisi-pembeli') {
    return (
      <TransisiPage
        judul="Bertemu Pembeli"
        emoji="🛒"
        warna="#C0392B"
        onLanjut={() => navigate('/eksplorasi/bertemu-pembeli')}
      />
    )
  }

  return null
}

export default DapurProduksiPage
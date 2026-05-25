import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { soalDapurProduksi } from '../data/soalData'
import PertidaksamaanCard from '../components/PertidaksamaanCard'
import XPBar from '../components/XPBar'
import Timer from '../components/Timer'
import TransisiPage from '../components/TransisiPage'

function DapurProduksiPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('intro') // intro → permisalan → soal → selesai → transisi-pembeli
  const [indexSoal, setIndexSoal] = useState(0)
  const [timerHabis, setTimerHabis] = useState(false)

  const soalSaatIni = soalDapurProduksi[indexSoal]

  function handleSoalSelesai() {
    if (indexSoal + 1 >= soalDapurProduksi.length) {
      setStep('selesai')
    } else {
      setIndexSoal(prev => prev + 1)
    }
  }

  // ── Waktu habis ──────────────────────────────
  if (timerHabis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: '#FDFBE4' }}>
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#C0392B' }}>
          Waktu Habis!
        </h2>
        <p className="text-gray-600 mb-6 text-center font-semibold">
          Tidak apa-apa, coba lagi ya!
        </p>
        <button
          onClick={() => navigate('/')}
          className="py-3 px-8 rounded-2xl text-white font-bold"
          style={{ backgroundColor: '#C0392B' }}>
          Kembali ke Menu
        </button>
      </div>
    )
  }

  // ── Intro ─────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-screen flex flex-col px-4 py-4"
        style={{ backgroundColor: '#FDFBE4' }}>

        <div className="flex items-center justify-between mb-6">
          <XPBar />
          <Timer onHabis={() => setTimerHabis(true)} />
        </div>

        <div className="text-center mb-6">
          <span className="px-4 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: '#1E8449' }}>
            🏭 Dapur Produksi
          </span>
        </div>

        <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
          <div className="bg-white rounded-3xl p-5 shadow"
            style={{ border: '2px solid #ddd' }}>
            <p className="font-bold text-gray-700 leading-relaxed">
              Waktumu sangat berharga! Dalam sehari, kamu hanya punya waktu{' '}
              <span className="font-black" style={{ color: '#C0392B' }}>
                6 jam
              </span>{' '}
              untuk memproduksi usahamu.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow"
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

          <button
            onClick={() => setStep('permisalan')}
            className="py-4 rounded-2xl text-white font-black text-lg mt-2
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#C0392B' }}>
            Buat Pertidaksamaan dan Atur Strategi →
          </button>
        </div>
      </div>
    )
  }

  // ── Permisalan ────────────────────────────────
  if (step === 'permisalan') {
    return (
      <div className="min-h-screen flex flex-col px-4 py-4"
        style={{ backgroundColor: '#FDFBE4' }}>

        <div className="flex items-center justify-between mb-6">
          <XPBar />
          <Timer onHabis={() => setTimerHabis(true)} />
        </div>

        <p className="font-black text-center text-lg mb-6" style={{ color: '#333' }}>
          Yuk, kita misalkan terlebih dahulu!
        </p>

        <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
          <div className="bg-white rounded-3xl p-5 shadow flex items-center gap-4"
            style={{ border: '2px solid #ddd' }}>
            <div className="text-3xl">🍰🍰🍰🍰</div>
            <div>
              <p className="font-black text-2xl" style={{ color: '#C0392B' }}>x</p>
              <p className="font-semibold text-sm text-gray-600">
                = banyak batch produksi Bolu Kemojo
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow flex items-center gap-4"
            style={{ border: '2px solid #ddd' }}>
            <div className="text-3xl">🍪🍪</div>
            <div>
              <p className="font-black text-2xl" style={{ color: '#1E8449' }}>y</p>
              <p className="font-semibold text-sm text-gray-600">
                = banyak batch produksi Kue Bangkit
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep('soal')}
            className="py-4 rounded-2xl text-white font-black text-lg mt-2
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#1E8449' }}>
            Lanjut →
          </button>
        </div>
      </div>
    )
  }

  // ── Soal Pertidaksamaan ───────────────────────
  if (step === 'soal') {
    return (
      <div className="min-h-screen px-4 py-4"
        style={{ backgroundColor: '#FDFBE4' }}>

        <div className="flex items-center justify-between mb-4">
          <XPBar />
          <Timer onHabis={() => setTimerHabis(true)} />
        </div>

        <div className="text-center mb-3">
          <span className="px-4 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: '#1E8449' }}>
            🏭 Dapur Produksi
          </span>
        </div>

        <p className="text-center text-sm font-semibold text-gray-400 mb-2">
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
    )
  }

  // ── Selesai ───────────────────────────────────
  if (step === 'selesai') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: '#FDFBE4' }}>
        <div className="text-6xl mb-4">🏭✅</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#1E8449' }}>
          Dapur Produksi Selesai!
        </h2>
        <p className="text-gray-500 font-semibold mb-4 text-center">
          Kamu sudah berhasil membuat sistem pertidaksamaan produksimu!
        </p>

        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow mb-6">
          <h3 className="font-black text-center mb-4">Sistem Pertidaksamaanmu</h3>
          <div className="p-3 rounded-2xl mb-2 font-bold text-sm"
            style={{ backgroundColor: '#EAF4FB' }}>
            ⏱ Waktu:{' '}
            <span className="font-black">80x + 60y ≤ 360</span>
          </div>
          <div className="p-3 rounded-2xl font-bold text-sm"
            style={{ backgroundColor: '#EAF4FB' }}>
            💰 Modal:{' '}
            <span className="font-black">120.000x + 116.000y ≤ 600.000</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={() => setStep('transisi-pembeli')}
            className="py-4 rounded-2xl text-white font-bold text-lg
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#1E8449' }}>
            🛒 Lanjut ke Bertemu Pembeli
          </button>
          <button
            onClick={() => navigate('/')}
            className="py-4 rounded-2xl font-bold text-lg"
            style={{ backgroundColor: '#F1C40F', color: '#333' }}>
            Kembali ke Menu
          </button>
        </div>
      </div>
    )
  }

  // ── Transisi Bertemu Pembeli ──────────────────
  if (step === 'transisi-pembeli') {
    return (
      <TransisiPage
        judul="Bertemu Pembeli"
        emoji="🛒"
        warna="#C0392B"
        onLanjut={() => navigate('/bertemu-pembeli')}
      />
    )
  }

  return null
}

export default DapurProduksiPage
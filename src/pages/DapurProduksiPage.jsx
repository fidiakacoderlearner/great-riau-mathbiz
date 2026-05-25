import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { soalDapurProduksi } from '../data/soalData'
import PertidaksamaanCard from '../components/PertidaksamaanCard'
import XPBar from '../components/XPBar'
import Timer from '../components/Timer'
import TransisiPage from '../components/TransisiPage'

function DapurProduksiPage() {
  const navigate = useNavigate()
  const [step,       setStep]       = useState('intro')
  const [indexSoal,  setIndexSoal]  = useState(0)
  const [timerHabis, setTimerHabis] = useState(false)

  const soalSaatIni = soalDapurProduksi[indexSoal]

  function handleSoalSelesai() {
    if (indexSoal + 1 >= soalDapurProduksi.length) setStep('selesai')
    else setIndexSoal(prev => prev + 1)
  }

  // Waktu habis
  if (timerHabis) {
    return (
      <div className="min-h-screen md:h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: '#FDFBE4' }}>
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#C0392B' }}>Waktu Habis!</h2>
        <p className="text-gray-600 mb-6 font-semibold">Tidak apa-apa, coba lagi ya!</p>
        <button onClick={() => navigate('/')}
          className="py-3 px-8 rounded-2xl text-white font-bold"
          style={{ backgroundColor: '#C0392B' }}>
          Kembali ke Menu
        </button>
      </div>
    )
  }

  // Header game
  const GameHeader = ({ badge }) => (
    <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4
                    border-b-2 mb-4 md:mb-6"
      style={{ borderColor: '#ddd' }}>
      <XPBar />
      <span className="px-3 py-1 rounded-full text-xs md:text-sm font-bold text-white"
        style={{ backgroundColor: '#1E8449' }}>
        {badge}
      </span>
      <Timer onHabis={() => setTimerHabis(true)} />
    </div>
  )

  // Intro
  if (step === 'intro') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FDFBE4' }}>
        <GameHeader badge="🏭 Dapur Produksi" />

        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
          {/* Desktop: dua box side by side | Mobile: stack */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl mb-8">
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

          <button onClick={() => setStep('permisalan')}
            className="py-4 px-10 rounded-2xl text-white font-black text-lg
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#C0392B' }}>
            Buat Pertidaksamaan dan Atur Strategi →
          </button>
        </div>
      </div>
    )
  }

  // Permisalan
  if (step === 'permisalan') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FDFBE4' }}>
        <GameHeader badge="🏭 Dapur Produksi" />

        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
          <p className="font-black text-center text-xl mb-8" style={{ color: '#333' }}>
            Yuk, kita misalkan terlebih dahulu!
          </p>

          <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl mb-8">
            <div className="flex-1 bg-white rounded-3xl p-5 shadow flex items-center gap-4"
              style={{ border: '2px solid #ddd' }}>
              <div className="text-4xl">🍰🍰🍰🍰</div>
              <div>
                <p className="font-black text-3xl" style={{ color: '#C0392B' }}>x</p>
                <p className="font-semibold text-sm text-gray-600">
                  = banyak batch produksi Bolu Kemojo
                </p>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-3xl p-5 shadow flex items-center gap-4"
              style={{ border: '2px solid #ddd' }}>
              <div className="text-4xl">🍪🍪</div>
              <div>
                <p className="font-black text-3xl" style={{ color: '#1E8449' }}>y</p>
                <p className="font-semibold text-sm text-gray-600">
                  = banyak batch produksi Kue Bangkit
                </p>
              </div>
            </div>
          </div>

          <button onClick={() => setStep('soal')}
            className="py-4 px-10 rounded-2xl text-white font-black text-lg
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#1E8449' }}>
            Lanjut →
          </button>
        </div>
      </div>
    )
  }

  // Soal
  if (step === 'soal') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FDFBE4' }}>
        <GameHeader badge="🏭 Dapur Produksi" />

        <div className="flex-1 flex flex-col px-4 md:px-8 overflow-y-auto">
          <p className="text-center text-sm font-semibold text-gray-400 mb-2">
            Soal {indexSoal + 1} dari {soalDapurProduksi.length}
          </p>
          <p className="font-black text-center text-lg mb-4" style={{ color: '#333' }}>
            {soalSaatIni.judul}
          </p>
          <PertidaksamaanCard key={soalSaatIni.id} soal={soalSaatIni}
            onSelesai={handleSoalSelesai} />
        </div>
      </div>
    )
  }

  // Selesai
  if (step === 'selesai') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col
                      items-center justify-center px-4"
        style={{ backgroundColor: '#FDFBE4' }}>
        <div className="text-6xl mb-4">🏭✅</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#1E8449' }}>
          Dapur Produksi Selesai!
        </h2>

        <div className="bg-white rounded-3xl p-6 w-full max-w-sm md:max-w-lg shadow mb-6">
          <h3 className="font-black text-center mb-4">Sistem Pertidaksamaanmu</h3>
          {/* Desktop: side by side | Mobile: stack */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 p-3 rounded-2xl font-bold text-sm"
              style={{ backgroundColor: '#EAF4FB' }}>
              ⏱ Waktu: <span className="font-black">80x + 60y ≤ 360</span>
            </div>
            <div className="flex-1 p-3 rounded-2xl font-bold text-sm"
              style={{ backgroundColor: '#EAF4FB' }}>
              💰 Modal: <span className="font-black">120.000x + 116.000y ≤ 600.000</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full max-w-sm md:max-w-lg">
          <button onClick={() => setStep('transisi-pembeli')}
            className="flex-1 py-4 rounded-2xl text-white font-bold text-lg
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#1E8449' }}>
            🛒 Lanjut ke Bertemu Pembeli
          </button>
          <button onClick={() => navigate('/')}
            className="flex-1 py-4 rounded-2xl font-bold"
            style={{ backgroundColor: '#F1C40F', color: '#333' }}>
            Kembali ke Menu
          </button>
        </div>
      </div>
    )
  }

  // Transisi
  if (step === 'transisi-pembeli') {
    return <TransisiPage judul="Bertemu Pembeli" emoji="🛒" warna="#C0392B"
      onLanjut={() => navigate('/bertemu-pembeli')} />
  }

  return null
}

export default DapurProduksiPage
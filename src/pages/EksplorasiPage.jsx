import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { soalRancanganUsaha } from '../data/soalData'
import SoalCard from '../components/SoalCard'
import XPBar from '../components/XPBar'
import Timer from '../components/Timer'

function EksplorasiPage() {
  const navigate = useNavigate()
  const { xp } = useGame()

  const [indexSoal, setIndexSoal] = useState(0)
  const [fase, setFase] = useState('rancangan_usaha')
  const [selesai, setSelesai] = useState(false)
  const [timerHabis, setTimerHabis] = useState(false)

  const soalSaatIni = soalRancanganUsaha[indexSoal]

  function handleSoalSelesai() {
    const soalBerikutnya = indexSoal + 1

    if (soalBerikutnya >= soalRancanganUsaha.length) {
      // Semua soal rancangan usaha selesai
      setSelesai(true)
    } else {
      setIndexSoal(soalBerikutnya)
    }
  }

  // Tampilan ketika waktu habis
  if (timerHabis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: '#FDFBE4' }}>
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#C0392B' }}>
          Waktu Habis!
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Tidak apa-apa, latihan lagi yuk!
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

  // Tampilan ketika semua soal selesai
  if (selesai) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: '#FDFBE4' }}>
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#1E8449' }}>
          Rancangan Usaha Selesai!
        </h2>

        {/* Rekap harga jual */}
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow mb-6 mt-4">
          <h3 className="font-black text-center mb-4">Harga Jual Produkmu</h3>
          <div className="flex items-center justify-between mb-3 p-3 rounded-2xl"
            style={{ backgroundColor: '#EAF4FB' }}>
            <span className="font-bold">🍰 Bolu Kemojo</span>
            <span className="font-black" style={{ color: '#1E8449' }}>Rp30.000</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl"
            style={{ backgroundColor: '#EAF4FB' }}>
            <span className="font-bold">🍪 Kue Bangkit</span>
            <span className="font-black" style={{ color: '#1E8449' }}>Rp58.000</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            className="py-4 rounded-2xl text-white font-bold text-lg"
            style={{ backgroundColor: '#1E8449' }}>
            🏭 Lanjut ke Dapur Produksi
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

  // Tampilan utama game
  return (
    <div className="min-h-screen px-4 py-4"
      style={{ backgroundColor: '#FDFBE4' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <XPBar />
        <Timer onHabis={() => setTimerHabis(true)} />
      </div>

      {/* Label fase */}
      <div className="text-center mb-4">
        <span className="px-4 py-1 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: '#C0392B' }}>
          📋 Rancangan Usaha
        </span>
      </div>

      {/* Progress soal */}
      <p className="text-center text-sm font-semibold text-gray-500 mb-4">
        Soal {indexSoal + 1} dari {soalRancanganUsaha.length}
      </p>

      {/* Soal */}
      {soalSaatIni && (
        <SoalCard
          key={soalSaatIni.id}
          soal={soalSaatIni}
          onSelesai={handleSoalSelesai}
        />
      )}

    </div>
  )
}

export default EksplorasiPage
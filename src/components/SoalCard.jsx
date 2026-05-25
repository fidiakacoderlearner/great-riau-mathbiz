import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { XP_CONFIG } from '../data/soalData'
import HintModal from './HintModal'
import FeedbackCard from './FeedbackCard'

function SoalCard({ soal, onSelesai }) {
  const { tambahXP, kurangiXP, isFirstTry, setIsFirstTry } = useGame()

  const [percobaan, setPercobaan] = useState(XP_CONFIG.maxAttempts)
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [hintSudahDibuka, setHintSudahDibuka] = useState(false)
  const [showPenjelasan, setShowPenjelasan] = useState(false)
  const [sudahBenar, setSudahBenar] = useState(false)
  const [pilihanDipilih, setPilihanDipilih] = useState(null)

  function handlePilihJawaban(nilai) {
    if (sudahBenar || percobaan === 0) return

    setPilihanDipilih(nilai)

    if (nilai === soal.jawaban) {
      // Jawaban benar
      setFeedback({ pesan: soal.feedbackBenar, benar: true })
      setSudahBenar(true)

      // Hitung XP
      let xpDapat = XP_CONFIG.waktuCepat // nanti timer yang tentukan ini
      if (isFirstTry) xpDapat += XP_CONFIG.firstTryBonus
      if (hintSudahDibuka) {
        kurangiXP(XP_CONFIG.hintPenaltyRatio)
      }
      tambahXP(xpDapat)

      // Tunggu 1.5 detik lalu lanjut ke soal berikutnya
      setTimeout(() => {
        onSelesai()
      }, 1500)

    } else {
      // Jawaban salah
      setIsFirstTry(false)
      const sisaPercobaan = percobaan - 1
      setPercobaan(sisaPercobaan)
      setFeedback({ pesan: soal.feedbackSalah, benar: false })

      if (sisaPercobaan === 0) {
        setShowPenjelasan(true)
      }
    }
  }

  function handleBukaHint() {
    if (hintSudahDibuka) return
    setShowHint(true)
    setHintSudahDibuka(true)
  }

  function getWarnaTombol(nilai) {
    if (!sudahBenar && pilihanDipilih !== nilai) {
      return { backgroundColor: 'white', color: '#333', border: '2px solid #333' }
    }
    if (nilai === soal.jawaban && sudahBenar) {
      return { backgroundColor: '#1E8449', color: 'white', border: '2px solid #1E8449' }
    }
    if (nilai === pilihanDipilih && nilai !== soal.jawaban) {
      return { backgroundColor: '#C0392B', color: 'white', border: '2px solid #C0392B' }
    }
    return { backgroundColor: 'white', color: '#333', border: '2px solid #333' }
  }

  return (
    <div className="w-full">

      {/* Kartu Resep */}
      <div className="bg-white rounded-3xl p-5 mb-4 shadow"
        style={{ border: '2px solid #ddd' }}>
        <h3 className="font-black text-center mb-3"
          style={{ color: '#333' }}>
          Resep {soal.produk}
        </h3>
        <ul className="text-sm text-gray-600 space-y-1 mb-3">
          {soal.resep.map((bahan, i) => (
            <li key={i}>• {bahan}</li>
          ))}
        </ul>
        <p className="font-bold text-sm italic"
          style={{ color: '#C0392B' }}>
          Biaya Produksi: Rp{soal.biayaProduksi.toLocaleString('id-ID')}
        </p>
      </div>

      {/* Pertanyaan */}
      <p className="font-bold text-center text-lg mb-4" style={{ color: '#333' }}>
        {soal.soal}
      </p>

      {/* Pilihan Jawaban */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {soal.pilihan.map((pilihan) => (
          <button
            key={pilihan.nilai}
            onClick={() => handlePilihJawaban(pilihan.nilai)}
            disabled={sudahBenar || percobaan === 0}
            className="py-3 px-4 rounded-2xl font-bold text-lg
                       active:scale-95 transition-all disabled:opacity-60"
            style={getWarnaTombol(pilihan.nilai)}>
            {pilihan.label}
          </button>
        ))}
      </div>

      {/* Baris bawah: feedback + hint + percobaan */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: '#666' }}>
          {!sudahBenar && percobaan > 0 && `Kesempatan: ${percobaan}x`}
        </p>
        <button
          onClick={handleBukaHint}
          disabled={hintSudahDibuka || sudahBenar}
          className="px-4 py-2 rounded-xl font-bold text-sm
                     disabled:opacity-40 active:scale-95 transition-transform"
          style={{ backgroundColor: '#F1C40F', color: '#333' }}>
          💡 {hintSudahDibuka ? 'Hint terpakai' : 'Hint'}
        </button>
      </div>

      {/* Feedback */}
      {feedback && <FeedbackCard pesan={feedback.pesan} benar={feedback.benar} />}

      {/* Penjelasan jika gagal 3x */}
      {showPenjelasan && (
        <div className="mt-4 p-5 rounded-3xl"
          style={{ backgroundColor: '#EAF4FB', border: '2px solid #1E8449' }}>
          <h4 className="font-black mb-3 text-center" style={{ color: '#1E8449' }}>
            Penjelasan
          </h4>
          {soal.penjelasan.map((langkah, i) => (
            <p key={i} className="text-sm mb-1 font-semibold text-gray-700">
              {langkah}
            </p>
          ))}
          <button
            onClick={onSelesai}
            className="w-full mt-4 py-3 rounded-2xl text-white font-bold"
            style={{ backgroundColor: '#1E8449' }}>
            Mengerti, Lanjut →
          </button>
        </div>
      )}

      {/* Hint Modal */}
      {showHint && (
        <HintModal
          teks={soal.hint}
          onTutup={() => setShowHint(false)}
        />
      )}

    </div>
  )
}

export default SoalCard
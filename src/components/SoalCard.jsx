import { useState, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { XP_CONFIG } from '../data/soalData'
import HintModal from './HintModal'
import PenjelasanModal from './PenjelasanModal'
import FeedbackPopup from './FeedbackPopup'

function SoalCard({ soal, onSelesai }) {
  const { tambahXP } = useGame()

  // Track waktu mulai soal ini
  const soalMulai = useRef(Date.now())

  const [percobaan, setPercobaan] = useState(XP_CONFIG.maxAttempts)
  const [isFirstTry, setIsFirstTry] = useState(true)
  const [hintSudahDibuka, setHintSudahDibuka] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)

  const [showPenjelasan, setShowPenjelasan] = useState(false)
  const [sudahBenar, setSudahBenar] = useState(false)

  const [pilihanDipilih, setPilihanDipilih] = useState(null)
  const [inputDisabled, setInputDisabled] = useState(false)

  function hitungXP() {
    const elapsedDetik = (Date.now() - soalMulai.current) / 1000
    const timeXP = elapsedDetik <= 300
      ? XP_CONFIG.waktuCepat
      : XP_CONFIG.waktuLambat
    const firstTryBonus = isFirstTry ? XP_CONFIG.firstTryBonus : 0
    let total = timeXP + firstTryBonus
    if (hintSudahDibuka) {
      total = total - Math.floor(total * XP_CONFIG.hintPenaltyRatio)
    }
    return Math.max(0, total)
  }

  function tampilkanFeedbackLaluAction(isCorrect, sisaPercobaan, pesan) {
    setFeedbackData({ pesan, benar: isCorrect })
    setShowFeedback(true)

    setTimeout(() => {
      setShowFeedback(false)
      if (isCorrect || sisaPercobaan === 0) {
        // Selalu tampilkan penjelasan
        setShowPenjelasan(true)
      } else {
        // Reset untuk percobaan berikutnya
        setInputDisabled(false)
        setPilihanDipilih(null)
      }
    }, 1500)
  }

  function handlePilihJawaban(nilai) {
    if (sudahBenar || inputDisabled || percobaan === 0) return

    setPilihanDipilih(nilai)
    setInputDisabled(true)

    if (nilai === soal.jawaban) {
      setSudahBenar(true)
      tambahXP(hitungXP())
      tampilkanFeedbackLaluAction(true, percobaan, soal.feedbackBenar)
    } else {
      setIsFirstTry(false)
      const sisa = percobaan - 1
      setPercobaan(sisa)
      tampilkanFeedbackLaluAction(false, sisa, soal.feedbackSalah)
    }
  }

  function getWarnaTombol(nilai) {
    if (nilai === soal.jawaban && sudahBenar) {
      return { backgroundColor: '#1E8449', color: 'white', border: '2px solid #1E8449' }
    }
    if (nilai === pilihanDipilih && nilai !== soal.jawaban && inputDisabled) {
      return { backgroundColor: '#C0392B', color: 'white', border: '2px solid #C0392B' }
    }
    return { backgroundColor: 'white', color: '#333', border: '2px solid #ddd' }
  }

  return (
    <div className="w-full">

      {/* Kartu Resep */}
      <div className="bg-white rounded-3xl p-5 mb-4 shadow"
        style={{ border: '2px solid #ddd' }}>
        <h3 className="font-black text-center mb-3">Resep {soal.produk}</h3>
        <ul className="text-sm text-gray-600 space-y-1 mb-3">
          {soal.resep.map((bahan, i) => <li key={i}>• {bahan}</li>)}
        </ul>
        <p className="font-bold text-sm italic" style={{ color: '#C0392B' }}>
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
            disabled={inputDisabled || percobaan === 0}
            className="py-3 px-4 rounded-2xl font-bold text-lg
                       active:scale-95 transition-all disabled:cursor-not-allowed"
            style={getWarnaTombol(pilihan.nilai)}>
            {pilihan.label}
          </button>
        ))}
      </div>

      {/* Baris bawah */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: '#666' }}>
          {!sudahBenar && percobaan > 0 && `Kesempatan: ${percobaan}x`}
          {percobaan === 0 && !sudahBenar && 'Kesempatan habis'}
        </p>
        <button
          onClick={() => { if (!hintSudahDibuka) { setShowHint(true); setHintSudahDibuka(true) } }}
          disabled={hintSudahDibuka || sudahBenar || percobaan === 0}
          className="px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-40"
          style={{ backgroundColor: '#F1C40F', color: '#333' }}>
          💡 {hintSudahDibuka ? 'Hint terpakai' : 'Hint'}
        </button>
      </div>

      {/* Feedback Popup */}
      {showFeedback && feedbackData && (
        <FeedbackPopup
          pesan={feedbackData.pesan}
          benar={feedbackData.benar}
          onHide={() => setShowFeedback(false)}
        />
      )}

      {/* Hint Modal */}
      {showHint && (
        <HintModal teks={soal.hint} onTutup={() => setShowHint(false)} />
      )}

      {/* Penjelasan Modal — selalu muncul setelah menjawab */}
      {showPenjelasan && (
        <PenjelasanModal
          langkahLangkah={soal.penjelasan}
          benar={sudahBenar}
          onTutup={onSelesai}
        />
      )}

    </div>
  )
}

export default SoalCard
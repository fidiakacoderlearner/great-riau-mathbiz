import { useState, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { XP_CONFIG } from '../data/soalData'
import HintModal from './HintModal'
import PenjelasanModal from './PenjelasanModal'
import FeedbackPopup from './FeedbackPopup'

function SlotBox({ nilai, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-24 h-10 rounded-xl font-black text-sm border-2 border-dashed
                 transition-all active:scale-95"
      style={{
        backgroundColor: nilai ? '#1E8449' : 'white',
        color: nilai ? 'white' : '#bbb',
        borderColor: nilai ? '#1E8449' : '#ccc'
      }}>
      {nilai || '___'}
    </button>
  )
}

function PertidaksamaanCard({ soal, onSelesai }) {
  const { tambahXP } = useGame()

  const soalMulai = useRef(Date.now())

  const [slots, setSlots] = useState({ a: null, b: null, c: null })
  const [tokens, setTokens] = useState([...soal.tokens])
  const [percobaan, setPercobaan] = useState(XP_CONFIG.maxAttempts)
  const [isFirstTry, setIsFirstTry] = useState(true)
  const [hintSudahDibuka, setHintSudahDibuka] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)

  const [showPenjelasan, setShowPenjelasan] = useState(false)
  const [sudahBenar, setSudahBenar] = useState(false)
  const [cekDisabled, setCekDisabled] = useState(false)

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
    setCekDisabled(true)

    setTimeout(() => {
      setShowFeedback(false)
      if (isCorrect || sisaPercobaan === 0) {
        setShowPenjelasan(true)
      } else {
        // Reset untuk percobaan berikutnya
        setSlots({ a: null, b: null, c: null })
        setTokens([...soal.tokens])
        setCekDisabled(false)
      }
    }, 1500)
  }

  function handleClickToken(token, index) {
    if (sudahBenar || cekDisabled) return
    const slotOrder = ['a', 'b', 'c']
    const emptySlot = slotOrder.find(s => slots[s] === null)
    if (!emptySlot) return
    setSlots(prev => ({ ...prev, [emptySlot]: token }))
    setTokens(prev => prev.filter((_, i) => i !== index))
  }

  function handleRemoveSlot(slotId) {
    if (sudahBenar || cekDisabled) return
    const token = slots[slotId]
    if (!token) return
    setSlots(prev => ({ ...prev, [slotId]: null }))
    setTokens(prev => [...prev, token])
  }

  function handleCek() {
    if (cekDisabled) return
    const semuaIsi = Object.values(slots).every(v => v !== null)
    if (!semuaIsi) {
      setFeedbackData({ pesan: 'Isi semua kotak terlebih dahulu!', benar: false })
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 1500)
      return
    }

    const benar = Object.keys(soal.jawaban).every(k => slots[k] === soal.jawaban[k])

    if (benar) {
      setSudahBenar(true)
      tambahXP(hitungXP())
      tampilkanFeedbackLaluAction(true, percobaan, 'Keren, pertidaksamaanmu tepat sekali!')
    } else {
      setIsFirstTry(false)
      const sisa = percobaan - 1
      setPercobaan(sisa)
      tampilkanFeedbackLaluAction(false, sisa, 'Hmm, belum pas! Coba lagi!')
    }
  }

  return (
    <div className="w-full">

      {/* Konteks */}
      <div className="bg-white rounded-3xl p-4 mb-4 shadow text-sm font-semibold
                      text-gray-600 leading-relaxed"
        style={{ border: '2px solid #ddd' }}>
        {soal.konteks}
      </div>

      <p className="font-black text-center mb-4" style={{ color: '#333' }}>
        Mari buat pertidaksamaannya!
      </p>

      {/* Equation Builder */}
      <div className="bg-white rounded-3xl p-5 mb-4 shadow"
        style={{ border: '2px solid #ddd' }}>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <SlotBox nilai={slots.a} onClick={() => handleRemoveSlot('a')} disabled={sudahBenar} />
          <span className="font-black text-lg">x  +</span>
          <SlotBox nilai={slots.b} onClick={() => handleRemoveSlot('b')} disabled={sudahBenar} />
          <span className="font-black text-lg">y</span>
          <SlotBox nilai={slots.c} onClick={() => handleRemoveSlot('c')} disabled={sudahBenar} />
          <span className="font-black text-lg">{soal.kanan}</span>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          Klik kotak untuk mengembalikan token
        </p>
      </div>

      {/* Token Pool */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {tokens.map((token, i) => (
          <button
            key={i}
            onClick={() => handleClickToken(token, i)}
            disabled={sudahBenar || cekDisabled}
            className="px-4 py-2 rounded-xl font-bold text-sm
                       active:scale-95 transition-transform disabled:opacity-40"
            style={{ backgroundColor: '#F1C40F', color: '#333', border: '2px solid #e0a800' }}>
            {token}
          </button>
        ))}
      </div>

      {/* Baris bawah */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: '#666' }}>
          {!sudahBenar && percobaan > 0 && `Kesempatan: ${percobaan}x`}
        </p>
        <button
          onClick={() => { if (!hintSudahDibuka) { setShowHint(true); setHintSudahDibuka(true) } }}
          disabled={hintSudahDibuka || sudahBenar}
          className="px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-40"
          style={{ backgroundColor: '#F1C40F', color: '#333' }}>
          💡 {hintSudahDibuka ? 'Hint terpakai' : 'Hint'}
        </button>
      </div>

      {/* Tombol Cek */}
      {!sudahBenar && percobaan > 0 && (
        <button
          onClick={handleCek}
          disabled={cekDisabled}
          className="w-full py-3 rounded-2xl text-white font-bold mb-3
                     disabled:opacity-60"
          style={{ backgroundColor: '#C0392B' }}>
          Cek Jawaban
        </button>
      )}

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

export default PertidaksamaanCard
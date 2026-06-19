import { useState, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { XP_CONFIG } from '../data/soalData'
import HintModal from './HintModal'
import PenjelasanModal from './PenjelasanModal'
import FeedbackPopup from './FeedbackPopup'

function SlotBox({ nilai, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
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
  const { tambahXP, catatJawaban } = useGame()

  // Ref — selalu baca nilai terbaru
  const hintRef     = useRef(false)
  const firstTryRef = useRef(true)
  const waktuMulai  = useRef(Date.now())

  // State — hanya untuk UI
  const [slots,           setSlots]           = useState({ a: null, b: null, c: null })
  const [tokens,          setTokens]          = useState([...soal.tokens])
  const [percobaan,       setPercobaan]       = useState(XP_CONFIG.maxAttempts)
  const [hintSudahDibuka, setHintSudahDibuka] = useState(false)
  const [showHint,        setShowHint]        = useState(false)
  const [showFeedback,    setShowFeedback]    = useState(false)
  const [feedbackData,    setFeedbackData]    = useState(null)
  const [showPenjelasan,  setShowPenjelasan]  = useState(false)
  const [sudahBenar,      setSudahBenar]      = useState(false)
  const [cekDisabled,     setCekDisabled]     = useState(false)

  function hitungXP() {
    const elapsed = (Date.now() - waktuMulai.current) / 1000
    const timeXP  = elapsed <= 300 ? XP_CONFIG.waktuCepat : XP_CONFIG.waktuLambat
    const bonus   = firstTryRef.current ? XP_CONFIG.firstTryBonus : 0
    const total   = timeXP + bonus
    const potong  = hintRef.current
      ? Math.floor(total * XP_CONFIG.hintPenaltyRatio)
      : 0
    return Math.max(0, total - potong)
  }

  function tampilkanFeedback(isCorrect, sisaPercobaan, pesan) {
    setFeedbackData({ pesan, benar: isCorrect })
    setShowFeedback(true)
    setCekDisabled(true)
    setTimeout(() => {
      setShowFeedback(false)
      if (isCorrect || sisaPercobaan === 0) {
        setShowPenjelasan(true)
      } else {
        setSlots({ a: null, b: null, c: null })
        setTokens([...soal.tokens])
        setCekDisabled(false)
      }
    }, 1500)
  }

  function handleClickToken(token, index) {
    if (sudahBenar || cekDisabled) return
    const emptySlot = ['a', 'b', 'c'].find(s => slots[s] === null)
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

  function handleBukaHint() {
    if (hintRef.current) return
    hintRef.current = true         // ← ref langsung diupdate
    setHintSudahDibuka(true)
    setShowHint(true)
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

    const waktuMenjawab = Math.floor((Date.now() - waktuMulai.current) / 1000)
    const percobaanKe   = XP_CONFIG.maxAttempts - percobaan + 1
    const tipeSoal      = soal.id === 'waktu' ? 'pertidaksamaan_waktu' : 'pertidaksamaan_modal'
    const benar = Object.keys(soal.jawaban).every(k => slots[k] === soal.jawaban[k])

    if (benar) {
      setSudahBenar(true)
      const xpDapat = hitungXP()
      tambahXP(xpDapat)

      // ← catat jawaban benar
      catatJawaban({
        produkDbId:    null,
        tipeSoal,
        jawabanBenar:  true,
        percobaanKe,
        hintDipakai:   hintRef.current,
        waktuMenjawab,
        xpDiperoleh:   xpDapat,
      })

      tampilkanFeedback(true, percobaan, 'Keren, pertidaksamaanmu tepat sekali!')
    } else {
      firstTryRef.current = false
      const sisa = percobaan - 1
      setPercobaan(sisa)

      // ← catat jawaban salah saat percobaan habis
      if (sisa === 0) {
        catatJawaban({
          produkDbId:    null,
          tipeSoal,
          jawabanBenar:  false,
          percobaanKe:   XP_CONFIG.maxAttempts,
          hintDipakai:   hintRef.current,
          waktuMenjawab,
          xpDiperoleh:   0,
        })
      }

      tampilkanFeedback(false, sisa, 'Hmm, belum pas! Coba lagi!')
    }
  }

  return (
    <>
      <div className="w-full flex flex-col md:grid md:grid-cols-2 md:gap-6 md:items-start">

        {/* Kolom Kiri */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-4 shadow text-sm font-semibold
                          text-gray-600 leading-relaxed"
            style={{ border: '2px solid #ddd' }}>
            {soal.konteks}
          </div>

          <p className="font-black text-center" style={{ color: '#333' }}>
            Mari buat pertidaksamaannya!
          </p>

          <div className="bg-white rounded-3xl p-5 shadow"
            style={{ border: '2px solid #ddd' }}>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <SlotBox nilai={slots.a} onClick={() => handleRemoveSlot('a')} disabled={sudahBenar} />
              <span className="font-black text-lg">x +</span>
              <SlotBox nilai={slots.b} onClick={() => handleRemoveSlot('b')} disabled={sudahBenar} />
              <span className="font-black text-lg">y</span>
              <SlotBox nilai={slots.c} onClick={() => handleRemoveSlot('c')} disabled={sudahBenar} />
              <span className="font-black text-lg">{soal.kanan}</span>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              Klik kotak untuk mengembalikan token
            </p>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col gap-3 mt-4 md:mt-0">
          <p className="font-bold text-sm text-center text-gray-500">
            Pilih token dan susun pertidaksamaannya
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            {tokens.map((token, i) => (
              <button key={i}
                onClick={() => handleClickToken(token, i)}
                disabled={sudahBenar || cekDisabled}
                className="px-4 py-2 rounded-xl font-bold text-sm
                           active:scale-95 transition-transform disabled:opacity-40"
                style={{ backgroundColor: '#F1C40F', color: '#333', border: '2px solid #e0a800' }}>
                {token}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: '#666' }}>
              {!sudahBenar && percobaan > 0 && `Kesempatan: ${percobaan}x`}
            </p>
            <button onClick={handleBukaHint}
              disabled={hintSudahDibuka || sudahBenar}
              className="px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-40"
              style={{ backgroundColor: '#F1C40F', color: '#333' }}>
              💡 {hintSudahDibuka ? 'Hint terpakai' : 'Hint'}
            </button>
          </div>

          {!sudahBenar && percobaan > 0 && (
            <button onClick={handleCek} disabled={cekDisabled}
              className="w-full py-3 rounded-2xl text-white font-bold disabled:opacity-60"
              style={{ backgroundColor: '#C0392B' }}>
              Cek Jawaban
            </button>
          )}
        </div>
      </div>

      {showFeedback && feedbackData && (
        <FeedbackPopup pesan={feedbackData.pesan} benar={feedbackData.benar}
          onHide={() => setShowFeedback(false)} />
      )}
      {showHint && (
        <HintModal teks={soal.hint} onTutup={() => setShowHint(false)} />
      )}
      {showPenjelasan && (
        <PenjelasanModal langkahLangkah={soal.penjelasan} benar={sudahBenar}
          onTutup={onSelesai} />
      )}
    </>
  )
}

export default PertidaksamaanCard
import { useState, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { XP_CONFIG } from '../data/soalData'
import HintModal from './HintModal'
import PenjelasanModal from './PenjelasanModal'
import FeedbackPopup from './FeedbackPopup'

function SoalCard({ soal, onSelesai }) {
  const { tambahXP, catatJawaban } = useGame()

  // Ref — selalu baca nilai terbaru
  const hintRef      = useRef(false)
  const firstTryRef  = useRef(true)
  const waktuMulai   = useRef(Date.now())

  // State — hanya untuk tampilan UI
  const [percobaan,       setPercobaan]       = useState(XP_CONFIG.maxAttempts)
  const [hintSudahDibuka, setHintSudahDibuka] = useState(false)
  const [showHint,        setShowHint]        = useState(false)
  const [showFeedback,    setShowFeedback]    = useState(false)
  const [feedbackData,    setFeedbackData]    = useState(null)
  const [showPenjelasan,  setShowPenjelasan]  = useState(false)
  const [sudahBenar,      setSudahBenar]      = useState(false)
  const [pilihanDipilih,  setPilihanDipilih]  = useState(null)
  const [inputDisabled,   setInputDisabled]   = useState(false)

  function hitungXP() {
    const elapsed    = (Date.now() - waktuMulai.current) / 1000
    const timeXP     = elapsed <= 300 ? XP_CONFIG.waktuCepat : XP_CONFIG.waktuLambat
    const bonus      = firstTryRef.current ? XP_CONFIG.firstTryBonus : 0
    const total      = timeXP + bonus
    const potong     = hintRef.current
      ? Math.floor(total * XP_CONFIG.hintPenaltyRatio)
      : 0
    return Math.max(0, total - potong)
  }

  function tampilkanFeedback(isCorrect, sisaPercobaan, pesan) {
    setFeedbackData({ pesan, benar: isCorrect })
    setShowFeedback(true)
    setTimeout(() => {
      setShowFeedback(false)
      if (isCorrect || sisaPercobaan === 0) {
        setShowPenjelasan(true)
      } else {
        setInputDisabled(false)
        setPilihanDipilih(null)
      }
    }, 1500)
  }

  function handlePilihJawaban(nilai) {
    if (sudahBenar || inputDisabled || percobaan === 0) return
    setPilihanDipilih(nilai)
    setInputDisabled(true)

    const waktuMenjawab = Math.floor((Date.now() - waktuMulai.current) / 1000)
    const percobaanKe   = XP_CONFIG.maxAttempts - percobaan + 1

    if (nilai === soal.jawaban) {
      setSudahBenar(true)
      const xpDapat = hitungXP()
      tambahXP(xpDapat)

      // ← catat jawaban benar
      catatJawaban({
        produkDbId:    soal.dbId ?? null,
        tipeSoal:      soal.tipeSoal === 'A' ? 'rancangan_a' : 'rancangan_b',
        jawabanBenar:  true,
        percobaanKe,
        hintDipakai:   hintRef.current,
        waktuMenjawab,
        xpDiperoleh:   xpDapat,
      })

      tampilkanFeedback(true, percobaan, soal.feedbackBenar)
    } else {
      firstTryRef.current = false
      const sisa = percobaan - 1
      setPercobaan(sisa)

      // ← catat jawaban salah saat percobaan habis
      if (sisa === 0) {
        catatJawaban({
          produkDbId:    soal.dbId ?? null,
          tipeSoal:      soal.tipeSoal === 'A' ? 'rancangan_a' : 'rancangan_b',
          jawabanBenar:  false,
          percobaanKe:   XP_CONFIG.maxAttempts,
          hintDipakai:   hintRef.current,
          waktuMenjawab,
          xpDiperoleh:   0,
        })
      }

      tampilkanFeedback(false, sisa, soal.feedbackSalah)
    }
  }

  function handleBukaHint() {
    if (hintRef.current) return
    hintRef.current = true        // ← ref langsung diupdate
    setHintSudahDibuka(true)
    setShowHint(true)
  }

  function getWarnaTombol(nilai) {
    if (nilai === soal.jawaban && sudahBenar)
      return { backgroundColor: '#1E8449', color: 'white', border: '2px solid #1E8449' }
    if (nilai === pilihanDipilih && nilai !== soal.jawaban && inputDisabled)
      return { backgroundColor: '#C0392B', color: 'white', border: '2px solid #C0392B' }
    return { backgroundColor: 'white', color: '#333', border: '2px solid #ddd' }
  }

  return (
    <>
      <div className="w-full flex flex-col md:grid md:grid-cols-2 md:gap-6 md:items-start">

        {/* Kolom Kiri — Resep */}
        <div className="bg-white rounded-3xl p-5 mb-4 md:mb-0 shadow"
          style={{ border: '2px solid #ddd' }}>
          <h3 className="font-black text-center mb-3">Resep {soal.produk}</h3>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            {soal.resep.map((bahan, i) => <li key={i}>• {bahan}</li>)}
          </ul>
          <p className="font-bold text-sm italic" style={{ color: '#C0392B' }}>
            Biaya Produksi: Rp{soal.biayaProduksi.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Kolom Kanan — Soal + Jawaban */}
        <div className="flex flex-col">
          <p className="font-bold text-center text-base mb-4" style={{ color: '#333' }}>
            {soal.soal}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {soal.pilihan.map((pilihan) => (
              <button
                key={pilihan.nilai}
                onClick={() => handlePilihJawaban(pilihan.nilai)}
                disabled={inputDisabled || percobaan === 0}
                className="py-3 px-4 rounded-2xl font-bold text-base
                           active:scale-95 transition-all disabled:cursor-not-allowed"
                style={getWarnaTombol(pilihan.nilai)}>
                {pilihan.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: '#666' }}>
              {!sudahBenar && percobaan > 0 && `Kesempatan: ${percobaan}x`}
              {percobaan === 0 && !sudahBenar && 'Kesempatan habis'}
            </p>
            <button
              onClick={handleBukaHint}
              disabled={hintSudahDibuka || sudahBenar || percobaan === 0}
              className="px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-40"
              style={{ backgroundColor: '#F1C40F', color: '#333' }}>
              💡 {hintSudahDibuka ? 'Hint terpakai' : 'Hint'}
            </button>
          </div>
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

export default SoalCard
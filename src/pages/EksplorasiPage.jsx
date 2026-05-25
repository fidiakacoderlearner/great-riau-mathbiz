import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { soalRancanganUsaha } from '../data/soalData'
import SoalCard from '../components/SoalCard'
import XPBar from '../components/XPBar'
import TransisiPage from '../components/TransisiPage'

function useTimer(onHabis) {
  const [detikSisa, setDetikSisa] = useState(300)
  const intervalRef = useRef(null)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDetikSisa(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onHabis(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])
  return detikSisa
}

function TimerDisplay({ detik }) {
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return (
    <div className={`px-4 py-1 rounded-xl border-2 font-black text-sm ${detik <= 60 ? 'animate-pulse' : ''}`}
      style={{ borderColor: detik <= 60 ? '#C0392B' : '#333', color: detik <= 60 ? '#C0392B' : '#333' }}>
      ⏱ {m}:{s.toString().padStart(2, '0')}
    </div>
  )
}

// Header konsisten untuk semua step game
function GameHeader({ detikSisa, badge }) {
  return (
    <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4
                    border-b-2 mb-4 md:mb-6"
      style={{ borderColor: '#ddd', backgroundColor: '#FDFBE4' }}>
      <XPBar />
      <span className="px-3 py-1 rounded-full text-xs md:text-sm font-bold text-white"
        style={{ backgroundColor: '#C0392B' }}>
        {badge}
      </span>
      <TimerDisplay detik={detikSisa} />
    </div>
  )
}

function EksplorasiPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('welcome')
  const [produkDiselesaikan, setProdukDiselesaikan] = useState([])
  const [produkDipilih, setProdukDipilih] = useState(null)
  const [indexSoal, setIndexSoal] = useState(0)
  const [timerHabis, setTimerHabis] = useState(false)

  const detikSisa = useTimer(() => setTimerHabis(true))

  const soalProdukIni = soalRancanganUsaha.filter(s => s.produk === produkDipilih)

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

  const soalSaatIni = soalProdukIni[indexSoal]

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

  // Welcome
  if (step === 'welcome') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col
                      items-center justify-center px-4"
        style={{ backgroundColor: '#FDFBE4' }}>
        <div className="text-7xl mb-6">👨‍🍳</div>
        <h1 className="text-2xl md:text-3xl font-black text-center mb-4"
          style={{ color: '#C0392B' }}>
          Selamat Datang,<br />Pengusaha Muda!
        </h1>
        <div className="bg-white rounded-3xl p-6 max-w-sm md:max-w-md w-full shadow mb-8"
          style={{ border: '2px solid #ddd' }}>
          <p className="font-semibold text-gray-700 text-center leading-relaxed">
            Kamu akan memulai perjalanan sebagai{' '}
            <span className="font-black" style={{ color: '#C0392B' }}>
              Pengusaha Kue Tradisional Riau
            </span>.
            Dengan resep andalan dan modal, yuk asah insting usahamu biar makin cuan!
          </p>
        </div>
        <button onClick={() => setStep('transisi-rancangan')}
          className="py-4 px-10 rounded-2xl text-white font-black text-lg
                     active:scale-95 transition-transform"
          style={{ backgroundColor: '#C0392B' }}>
          Siap Memulai! 🚀
        </button>
      </div>
    )
  }

  // Transisi
  if (step === 'transisi-rancangan') {
    return <TransisiPage judul="Rancangan Usaha" emoji="📋" warna="#C0392B"
      onLanjut={() => setStep('pilih-produk')} />
  }

  // Pilih Produk
  if (step === 'pilih-produk') {
    const kemojoDone  = produkDiselesaikan.includes('Bolu Kemojo')
    const bangkitDone = produkDiselesaikan.includes('Kue Bangkit')
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FDFBE4' }}>

        <GameHeader detikSisa={detikSisa} badge="📋 Rancangan Usaha" />

        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
          <p className="font-bold text-center text-gray-700 leading-relaxed mb-8
                        max-w-lg px-2">
            Kamu memulai usaha Bolu Kemojo dan Kue Bangkit. Untuk itu, kamu menghitung
            biaya produksi masing-masing bolu dan kue.
          </p>

          {/* Mobile: stack | Desktop: side by side */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
            <button
              onClick={() => !kemojoDone && handlePilihProduk('Bolu Kemojo')}
              disabled={kemojoDone}
              className="flex-1 bg-white rounded-3xl p-6 shadow flex items-center
                         gap-4 active:scale-95 transition-transform text-left"
              style={{ border: `2px solid ${kemojoDone ? '#1E8449' : '#ddd'}` }}>
              <div className="text-5xl">🍰</div>
              <div>
                <p className="font-black text-lg">Modal Bolu Kemojo</p>
                <p className="text-sm font-semibold"
                  style={{ color: kemojoDone ? '#1E8449' : '#999' }}>
                  {kemojoDone ? '✅ Selesai' : 'Tap untuk mulai'}
                </p>
              </div>
            </button>

            <button
              onClick={() => !bangkitDone && handlePilihProduk('Kue Bangkit')}
              disabled={bangkitDone}
              className="flex-1 bg-white rounded-3xl p-6 shadow flex items-center
                         gap-4 active:scale-95 transition-transform text-left"
              style={{ border: `2px solid ${bangkitDone ? '#1E8449' : '#ddd'}` }}>
              <div className="text-5xl">🍪</div>
              <div>
                <p className="font-black text-lg">Modal Kue Bangkit</p>
                <p className="text-sm font-semibold"
                  style={{ color: bangkitDone ? '#1E8449' : '#999' }}>
                  {bangkitDone ? '✅ Selesai' : 'Tap untuk mulai'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Soal
  if (step === 'soal') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col"
        style={{ backgroundColor: '#FDFBE4' }}>

        <GameHeader detikSisa={detikSisa}
          badge={`📋 Rancangan Usaha — ${produkDipilih}`} />

        <div className="flex-1 flex flex-col px-4 md:px-8 overflow-y-auto">
          <p className="text-center text-sm font-semibold text-gray-400 mb-4">
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

  // Rancangan Selesai
  if (step === 'rancangan-selesai') {
    return (
      <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col
                      items-center justify-center px-4"
        style={{ backgroundColor: '#FDFBE4' }}>
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#1E8449' }}>
          Rancangan Usaha Selesai!
        </h2>
        <p className="font-semibold text-gray-500 mb-4 text-center">
          Kamu sudah mendapatkan harga jual untuk produk-produkmu!
        </p>

        <div className="bg-white rounded-3xl p-6 w-full max-w-sm md:max-w-md shadow mb-6">
          <h3 className="font-black text-center mb-4">Harga Jual Produkmu</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center justify-between p-3 rounded-2xl"
              style={{ backgroundColor: '#EAF4FB' }}>
              <span className="font-bold">🍰 Bolu Kemojo</span>
              <span className="font-black" style={{ color: '#1E8449' }}>Rp30.000</span>
            </div>
            <div className="flex-1 flex items-center justify-between p-3 rounded-2xl"
              style={{ backgroundColor: '#EAF4FB' }}>
              <span className="font-bold">🍪 Kue Bangkit</span>
              <span className="font-black" style={{ color: '#1E8449' }}>Rp58.000</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full max-w-sm md:max-w-md">
          <button onClick={() => setStep('transisi-dapur')}
            className="flex-1 py-4 rounded-2xl text-white font-bold text-lg
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#1E8449' }}>
            🏭 Lanjut ke Dapur Produksi
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

  // Transisi Dapur
  if (step === 'transisi-dapur') {
    return <TransisiPage judul="Dapur Produksi" emoji="🏭" warna="#1E8449"
      onLanjut={() => navigate('/dapur-produksi')} />
  }

  return null
}

export default EksplorasiPage
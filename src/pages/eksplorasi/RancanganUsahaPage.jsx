import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import SoalCard from '../../components/SoalCard'
import XPBar from '../../components/XPBar'
import TransisiPage from '../../components/TransisiPage'
import GameHeader from '../../components/GameHeader'
import useTimer from '../../hooks/useTimer'
import usePreventBack from '../../hooks/usePreventBack'
import usePreventRefresh from '../../hooks/usePreventRefresh'
import useAntiCheat from '../../hooks/useAntiCheat'
import {
  MAX_KARYAWAN,
  WAKTU_DASAR,
  getHargaKaryawan,
  XP_CONFIG,
} from '../../data/soalData'

const MAX_PRODUK = 2

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

function RancanganUsahaPage() {
  const navigate = useNavigate()
  const {
    selesaiIds, addProdukTerpilih,
    startNewSession, setGamePhase, gamePhase,
    allDoneIds,
    sewaKaryawan, lepasKaryawan,
    karyawanSesi, budgetProduksi, waktuTersedia,
    budget, runKe,
    produkList,
    karyawanList,
  } = useGame()
  usePreventBack()
  usePreventRefresh()
  useAntiCheat()

  // Jika ada sesi aktif (phase=rancangan), skip welcome
  const isResuming = gamePhase === 'rancangan' && selesaiIds.length > 0

  const [step,         setStep]         = useState(isResuming ? 'pilih-produk' : 'welcome')
  const [produkSelesai, setProdukSelesai] = useState(isResuming ? selesaiIds : [])
  const [produkDipilih, setProdukDipilih] = useState(null)
  const [timerHabis,   setTimerHabis]   = useState(false)
  const [timerStarted, setTimerStarted] = useState(isResuming)

  const detikSisa = useTimer(() => setTimerHabis(true), timerStarted)

  // Set phase saat masuk halaman
  useEffect(() => {
    if (!isResuming) return  // belum start, jangan set phase dulu
    setGamePhase('rancangan')
  }, [])

  function handlePilihProduk(produk) {
    if (produkSelesai.includes(produk.id)) return
    if (produkSelesai.length >= MAX_PRODUK) return
    setProdukDipilih(produk)
    setStep('soal')
  }

  function handleSoalSelesai() {
    addProdukTerpilih(produkDipilih)
    const baru = [...produkSelesai, produkDipilih.id]
    setProdukSelesai(baru)
    setProdukDipilih(null)

    if (baru.length >= MAX_PRODUK) {
      // Tepat 2 selesai — langsung ke dapur produksi
      setGamePhase('dapur')
      setStep('transisi-dapur')
    } else {
      // Masih perlu 1 lagi
      setStep('pilih-produk')
    }
  }

  // ── Waktu Habis ───────────────────────────────────────────────────
  if (timerHabis) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FDFBE4', padding: '1rem'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏰</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C0392B',
                     marginBottom: '0.5rem' }}>Waktu Habis!</h2>
        <p style={{ color: '#666', fontWeight: 600, marginBottom: '1.5rem' }}>
          Tidak apa-apa, coba lagi ya!
        </p>
        <button onClick={() => { setGamePhase(null); navigate('/') }}
          style={{ padding: '0.75rem 2rem', borderRadius: '1rem',
                   backgroundColor: '#C0392B', color: 'white',
                   fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Kembali ke Menu
        </button>
      </div>
    )
  }

  // ── Welcome ───────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FDFBE4', padding: '1.5rem', overflow: 'hidden'
      }}>
        <img 
          src="/assets/maskot.png" 
          alt="Maskot Koki Pengusaha" 
          className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-xl mb-4" 
        />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textAlign: 'center',
                     color: '#C0392B', marginBottom: '1rem' }}>
          Selamat Datang,<br />Pengusaha Muda!
        </h1>
        <div style={{
          backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.5rem',
          maxWidth: '32rem', width: '100%', border: '2px solid #ddd', marginBottom: '2rem'
        }}>
          <p style={{ fontWeight: 600, color: '#555', textAlign: 'center', lineHeight: 1.7 }}>
            Kamu akan memulai perjalanan sebagai{' '}
            <span style={{ fontWeight: 900, color: '#C0392B' }}>
              Pengusaha Kue Tradisional Riau
            </span>.
            Pilih <span style={{ fontWeight: 900 }}>tepat 2 produk</span> untuk
            dihitung modalnya, lalu lanjut ke Dapur Produksi!
          </p>
        </div>
        <button
          onClick={() => {
            startNewSession()  // reset sesi (XP tetap)
            setGamePhase('rancangan')
            setProdukSelesai([])
            setStep('transisi-rancangan')
          }}
          style={{
            padding: '1rem 2.5rem', borderRadius: '1rem',
            backgroundColor: '#C0392B', color: 'white',
            fontWeight: 900, fontSize: '1.125rem', border: 'none', cursor: 'pointer'
          }}>
          Siap Memulai! 🚀
        </button>
      </div>
    )
  }

  // ── Transisi ──────────────────────────────────────────────────────
  if (step === 'transisi-rancangan') {
    return (
      <TransisiPage 
        judul="Rancangan Usaha" 
        image="/assets/transisi-rancangan.png"
        warna="#C0392B"
        onLanjut={() => { setStep('atur-tim') }} 
      />   
    )
  }

  if (step === 'transisi-dapur') {
    return (
      <TransisiPage 
        judul="Dapur Produksi" 
        image="/assets/transisi-dapur.png"     
        warna="#1E8449"
        onLanjut={() => navigate('/eksplorasi/dapur-produksi')} 
      />
    )
  }

  // ── Atur Tim ──────────────────────────────────────────────────────
  if (step === 'atur-tim') {
    const jamTersedia = Math.floor(waktuTersedia / 60)
    const menitSisa   = waktuTersedia % 60

    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        backgroundColor: '#FDFBE4', overflow: 'hidden'
      }}>
        <GameHeader
          badge="👥 Atur Tim Produksi"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}
          className="md:px-8">
          <div style={{ maxWidth: '48rem', margin: '0 auto' }}>

            {/* Info Budget & Waktu */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-2xl p-4 text-center shadow"
                style={{ border: '2px solid #1E8449' }}>
                <p className="text-xs font-bold text-gray-400 mb-1">💰 Budget Tersedia</p>
                <p className="font-black text-lg" style={{ color: '#1E8449' }}>
                  Rp{budgetProduksi.toLocaleString('id-ID')}
                </p>
                {karyawanSesi.length > 0 && (
                  <p className="text-xs font-semibold mt-1" style={{ color: '#C0392B' }}>
                    dari Rp{budget.toLocaleString('id-ID')}
                  </p>
                )}
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow"
                style={{ border: '2px solid #3498DB' }}>
                <p className="text-xs font-bold text-gray-400 mb-1">⏱ Waktu Produksi</p>
                <p className="font-black text-lg" style={{ color: '#3498DB' }}>
                  {jamTersedia} jam
                  {menitSisa > 0 && ` ${menitSisa} mnt`}
                </p>
                {karyawanSesi.length > 0 && (
                  <p className="text-xs font-semibold mt-1" style={{ color: '#1E8449' }}>
                    +{waktuTersedia - WAKTU_DASAR} mnt dari karyawan
                  </p>
                )}
              </div>
            </div>

            {/* Slot Karyawan Tersewa */}
            {karyawanSesi.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow mb-4"
                style={{ border: '2px solid #F1C40F' }}>
                <p className="font-black text-sm mb-2" style={{ color: '#333' }}>
                  👥 Tim Kamu ({karyawanSesi.length}/{MAX_KARYAWAN} slot)
                </p>
                <div className="flex flex-wrap gap-2">
                  {karyawanSesi.map((level, i) => {
                    const k = karyawanList.find(k => k.level === level)
                    return (
                      <div key={i} className="flex items-center gap-1 px-3 py-1 rounded-xl"
                        style={{ backgroundColor: '#EAF4FB' }}>
                        <img src={k.image} alt={k.nama} className="w-5 h-5 object-contain" />
                        <span className="text-xs font-bold">{k.nama}</span>
                        <button
                          onClick={() => lepasKaryawan(i)}
                          style={{
                            marginLeft: '4px', fontSize: '0.7rem',
                            color: '#C0392B', fontWeight: 900,
                            background: 'none', border: 'none', cursor: 'pointer'
                          }}>
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Kartu 3 Level Karyawan */}
            <p className="font-black text-center mb-3" style={{ color: '#333' }}>
              Sewa Karyawan (Opsional)
            </p>

            {karyawanSesi.length >= MAX_KARYAWAN && (
              <div className="text-center text-sm font-bold mb-3"
                style={{ color: '#F39C12' }}>
                ⚠️ Slot karyawan penuh (maksimal {MAX_KARYAWAN})
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              {karyawanList.map(k => {
                const harga       = getHargaKaryawan(k.level, runKe)
                const bisa        = karyawanSesi.length < MAX_KARYAWAN &&
                                    budgetProduksi - harga >= 0
                const sudahPenuh  = karyawanSesi.length >= MAX_KARYAWAN
                const tidakCukup  = budgetProduksi - harga < 0

                return (
                  <div key={k.level}
                    className="flex-1 bg-white rounded-3xl p-5 shadow"
                    style={{
                      border: `2px solid ${bisa ? '#ddd' : '#eee'}`,
                      opacity: sudahPenuh || tidakCukup ? 0.6 : 1
                    }}>
                    {/* Badge level */}
                    <div className="relative flex justify-center items-center mb-4 mt-2">
                      <span className="absolute -top-2 -left-2 text-xs font-black px-2 py-1 rounded-full text-white shadow-sm z-10"
                        style={{ backgroundColor:
                          k.level === 1 ? '#95A5A6' :
                          k.level === 2 ? '#E67E22' : '#F1C40F',
                          color: k.level === 3 ? '#333' : 'white'
                        }}>
                        Level {k.level}
                      </span>
                      <img 
                        src={k.image} 
                        alt={k.nama} 
                        // Ukuran diperbesar drastis: HP ke 24 (96px), Desktop XL ke 40 (160px)
                        className="w-24 h-24 md:w-32 md:h-32 xl:w-40 xl:h-40 object-contain drop-shadow-md transition-all duration-300" 
                      />
                    </div>

                    <p className="font-black text-base mb-1">{k.nama}</p>
                    <p className="text-xs text-gray-400 font-semibold mb-3">
                      {k.deskripsi}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500">⏱ Tambah Waktu</span>
                        <span style={{ color: '#3498DB' }}>+{k.tambahWaktu} menit</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500">💰 Upah</span>
                        <span style={{ color: '#C0392B' }}>
                          Rp{harga.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {runKe > 0 && (
                        <div className="flex justify-between text-xs font-semibold"
                          style={{ color: '#aaa' }}>
                          <span>📈 Inflasi</span>
                          <span>+{Math.round((Math.pow(1.2, runKe) - 1) * 100)}%</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => sewaKaryawan(k.level)}
                      disabled={!bisa}
                      className="w-full py-2 rounded-xl font-bold text-sm
                                active:scale-95 transition-transform disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: bisa ? '#1E8449' : '#eee',
                        color:           bisa ? 'white'   : '#aaa',
                        border: 'none',
                        cursor: bisa ? 'pointer' : 'not-allowed'
                      }}>
                      {sudahPenuh    ? 'Slot Penuh'    :
                      tidakCukup   ? 'Budget Kurang'  :
                      '+ Sewa'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Tombol */}
            <div className="flex flex-col gap-3 pb-6">
              <button
                onClick={() => {
                  setTimerStarted(true)
                  setStep('pilih-produk')
                }}
                className="w-full py-4 rounded-2xl text-white font-black text-lg
                          active:scale-95"
                style={{ backgroundColor: '#C0392B', border: 'none', cursor: 'pointer' }}>
                Mulai Pilih Produk →
              </button>
              {karyawanSesi.length > 0 && (
                <p className="text-center text-xs font-semibold text-gray-400">
                  Total upah: Rp{
                    karyawanSesi.reduce((s, l) =>
                      s + getHargaKaryawan(l, runKe), 0
                    ).toLocaleString('id-ID')
                  } | Budget produksi: Rp{budgetProduksi.toLocaleString('id-ID')} |
                  Waktu: {waktuTersedia} menit
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    )
  }

  // ── Pilih Produk ──────────────────────────────────────────────────
  if (step === 'pilih-produk') {
    const sudahPilih2 = produkSelesai.length >= MAX_PRODUK

    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        backgroundColor: '#FDFBE4', overflow: 'hidden'
      }}>
        <GameHeader
          badge="📋 Rancangan Usaha"
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

          {/* Instruksi */}
          <div style={{
            backgroundColor: produkSelesai.length === 0 ? '#FEF9E7' : '#D5F5E3',
            border: `2px solid ${produkSelesai.length === 0 ? '#F1C40F' : '#1E8449'}`,
            borderRadius: '1rem', padding: '0.75rem',
            textAlign: 'center', marginBottom: '1rem',
            maxWidth: '40rem', margin: '0 auto 1rem'
          }}>
            {produkSelesai.length === 0 && (
              <p style={{ fontWeight: 700, color: '#666', fontSize: '0.875rem' }}>
                Pilih <span style={{ fontWeight: 900, color: '#C0392B' }}>2 produk</span> yang
                ingin kamu jadikan usaha!
              </p>
            )}
            {produkSelesai.length === 1 && (
              <p style={{ fontWeight: 700, color: '#1E8449', fontSize: '0.875rem' }}>
                ✅ 1 produk selesai! Pilih{' '}
                <span style={{ fontWeight: 900 }}>1 produk lagi</span> untuk lanjut ke Dapur Produksi.
              </p>
            )}
          </div>

          {/* Grid 10 produk */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3"
            style={{ maxWidth: '64rem', margin: '0 auto 1rem' }}>
            {produkList.map(produk => {
              const selesai = allDoneIds.includes(produk.id) || produkSelesai.includes(produk.id)

              return (
                <button
                  key={produk.id}
                  onClick={() => handlePilihProduk(produk)}
                  disabled={selesai}
                  style={{
                    backgroundColor: selesai ? '#D5F5E3' : 'white',
                    border: `2px solid ${selesai ? '#1E8449' : '#ddd'}`,
                    borderRadius: '1.25rem',
                    padding: '1rem 0.75rem',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '0.5rem',
                    cursor: selesai ? 'default' : 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    opacity: selesai ? 0.6 : 1,
                    transition: 'transform 0.1s'
                  }}>
                  <img 
                    src={produk.image} 
                    alt={produk.nama} 
                    className="w-30 h-30 md:w-32 md:h-32 xl:w-36 xl:h-36 mb-2 transition-all duration-200"
                    style={{ 
                      objectFit: 'contain', 
                      filter: selesai ? 'grayscale(0)' : 'none' // Opsional: efek visual jika sudah selesai
                    }} 
                  />
                  <p style={{
                    fontWeight: 800, fontSize: '0.8rem', textAlign: 'center',
                    color: selesai ? '#1E8449' : '#333', lineHeight: 1.3
                  }}>
                    {produk.nama}
                  </p>
                  <p style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    color: selesai ? '#1E8449' : '#aaa'
                  }}>
                    {selesai ? '✅ Sudah Dikerjakan' : 'Tap untuk mulai'}
                  </p>
                  <p style={{ fontSize: '0.65rem', fontWeight: 600,
                    color: selesai ? '#1E8449' : '#bbb' }}>
                    {selesai
                      ? `HJ Rp${produk.hargaJual.toLocaleString('id-ID')}`
                      : `Modal Rp${produk.biayaPerUnit.toLocaleString('id-ID')}`}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Soal ──────────────────────────────────────────────────────────
  if (step === 'soal' && produkDipilih) {
    const soalObj = {
      id:            produkDipilih.id,
      produk:        produkDipilih.nama,
      biayaProduksi: produkDipilih.biayaPerUnit,
      resep:         produkDipilih.resep,
      soal:          produkDipilih.soal,
      pilihan:       produkDipilih.pilihan,
      jawaban:       produkDipilih.jawaban,
      feedbackBenar: produkDipilih.feedbackBenar,
      feedbackSalah: produkDipilih.feedbackSalah,
      hint:          produkDipilih.hint,
      penjelasan:    produkDipilih.penjelasan
    }

    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        backgroundColor: '#FDFBE4', overflow: 'hidden'
      }}>
        <GameHeader
          badge={`📋 ${produkDipilih.nama}`}
          timerEl={<TimerDisplay detik={detikSisa} />}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}
          className="md:px-8">
          <p style={{
            textAlign: 'center', fontSize: '0.875rem', fontWeight: 600,
            color: '#aaa', marginTop: '0.75rem', marginBottom: '1rem'
          }}>
            Produk ke-{produkSelesai.length + 1} dari {MAX_PRODUK}
          </p>
          <SoalCard key={produkDipilih.id} soal={soalObj} onSelesai={handleSoalSelesai} />
        </div>
      </div>
    )
  }

  return null
}

export default RancanganUsahaPage
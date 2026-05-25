import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#FDFBE4' }}>

      {/* Dekorasi atas */}
      <div className="w-full h-3 mb-8"
        style={{ background: 'repeating-linear-gradient(90deg, #C0392B 0px, #C0392B 20px, #F1C40F 20px, #F1C40F 40px, #1E8449 40px, #1E8449 60px)' }}>
      </div>

      {/* Konten utama */}
      <div className="flex flex-col items-center text-center max-w-lg">

        {/* Emoji sebagai placeholder ilustrasi */}
        <div className="text-8xl mb-4">🍰</div>

        {/* Judul */}
        <h1 className="text-4xl font-black mb-2"
          style={{ color: '#C0392B' }}>
          The Great Riau
        </h1>
        <h2 className="text-2xl font-bold mb-4"
          style={{ color: '#1E8449' }}>
          Math-Biz Mania
        </h2>

        {/* Deskripsi */}
        <p className="text-gray-600 mb-8 text-lg">
          Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu
          sambil membangun usaha yang menguntungkan.
        </p>

        {/* Tombol */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => navigate('/eksplorasi')}
            className="py-4 px-8 rounded-2xl text-white font-bold text-lg shadow-lg
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#C0392B' }}>
            🗺️ Eksplorasi
          </button>

          <button
            onClick={() => navigate('/tantangan')}
            className="py-4 px-8 rounded-2xl text-white font-bold text-lg shadow-lg
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#1E8449' }}>
            🚣 Tantangan
          </button>

          <button
            onClick={() => navigate('/login')}
            className="py-4 px-8 rounded-2xl font-bold text-lg shadow
                       active:scale-95 transition-transform"
            style={{ backgroundColor: '#F1C40F', color: '#333' }}>
            👤 Masuk Akun
          </button>
        </div>
      </div>

      {/* Dekorasi bawah */}
      <div className="w-full h-3 mt-8"
        style={{ background: 'repeating-linear-gradient(90deg, #1E8449 0px, #1E8449 20px, #F1C40F 20px, #F1C40F 40px, #C0392B 40px, #C0392B 60px)' }}>
      </div>

    </div>
  )
}

export default LandingPage
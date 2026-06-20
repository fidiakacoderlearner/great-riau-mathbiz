import { useNavigate } from 'react-router-dom'

function PacuJalurGuruPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#EAF4FB', // Biru air sungai yang lembut
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* ── Ornamen Latar Belakang ── */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '300px', height: '300px', borderRadius: '50%',
        backgroundColor: '#3498DB', opacity: 0.15, filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        backgroundColor: '#1E8449', opacity: 0.1, filter: 'blur(50px)'
      }} />

      {/* ── Konten Utama ── */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center max-w-lg w-full"
        style={{ border: '4px solid #3498DB', zIndex: 10 }}>

        <div style={{
          backgroundColor: '#F1C40F', color: '#C0392B',
          padding: '0.4rem 1rem', borderRadius: '1rem',
          fontWeight: 900, fontSize: '0.875rem', letterSpacing: '0.1em',
          marginBottom: '1.5rem', textTransform: 'uppercase'
        }}>
          Mode Guru: Segera Hadir
        </div>

        <h1 style={{ fontWeight: 900, fontSize: '2rem', color: '#333', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          Host Balapan <br />
          <span style={{ color: '#3498DB' }}>Pacu Jalur</span>
        </h1>
        
        <p style={{ color: '#666', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Persiapkan kelas Anda! Fitur <i style={{ color: '#C0392B' }}>Live Host</i> sedang dibangun. Nantinya, Anda bisa memulai balapan kuis, mengatur timer, dan memantau pergerakan kapal siswa secara real-time di layar proyektor kelas!
        </p>

        {/* Fitur Highlights Guru */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {['📺 Tampilan Proyektor Live', '🕹️ Kontrol Kuis', '📊 Analisis Pasca-Balapan'].map((fitur, i) => (
            <span key={i} style={{
              backgroundColor: '#f8f9fa', color: '#555',
              padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
              fontSize: '0.75rem', fontWeight: 700, border: '1px solid #ddd'
            }}>
              {fitur}
            </span>
          ))}
        </div>

        {/* Tombol Kembali */}
        <button onClick={() => navigate(-1)}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition-transform shadow-lg"
          style={{ backgroundColor: '#3498DB', border: 'none', cursor: 'pointer' }}>
          Kembali ke Dashboard
        </button>
      </div>

    </div>
  )
}

export default PacuJalurGuruPage
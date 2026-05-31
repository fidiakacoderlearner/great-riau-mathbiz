import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import imgMaskot from '../assets/maskot.png'

const STRIPE_ATAS  = 'repeating-linear-gradient(90deg,#C0392B 0,#C0392B 20px,#F1C40F 20px,#F1C40F 40px,#1E8449 40px,#1E8449 60px)'
const STRIPE_BAWAH = 'repeating-linear-gradient(90deg,#1E8449 0,#1E8449 20px,#F1C40F 20px,#F1C40F 40px,#C0392B 40px,#C0392B 60px)'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useGame()

  const [role,     setRole]     = useState('siswa')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const akunDemo = {
    siswa: { email: 'siswa@demo.com', password: 'siswa123' },
    guru:  { email: 'guru@demo.com',  password: 'guru123'  }
  }

  function handleLogin() {
    setError('')
    if (!email || !password) { setError('Email dan password tidak boleh kosong.'); return }
    setLoading(true)
    setTimeout(() => {
      const akun = akunDemo[role]
      if (email === akun.email && password === akun.password) {
        login({ email, role })
        navigate(role === 'siswa' ? '/' : '/dashboard-guru')
      } else {
        setError('Email atau password salah. Coba lagi.')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Stripe atas */}
      <div style={{ height: 12, background: STRIPE_ATAS, flexShrink: 0 }} />

      {/* Konten tengah */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8"
        style={{ backgroundColor: '#FDFBE4', overflowY: 'auto' }}>

        {/* Header */}
        <div className="text-center mb-6">
          <img 
            src={imgMaskot} 
            alt="Maskot Koki The Great Riau" 
            className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-3 object-contain drop-shadow-md" 
          />
          <h1 className="text-2xl font-black" style={{ color: '#C0392B' }}>
            The Great Riau
          </h1>
          <p className="text-gray-500 font-semibold">Masuk ke akunmu</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 w-full max-w-sm md:max-w-md shadow-lg">

          {/* Toggle Role */}
          <div className="flex rounded-2xl overflow-hidden mb-5"
            style={{ border: '2px solid #ddd' }}>
            {['siswa', 'guru'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className="flex-1 py-3 font-bold text-sm transition-colors"
                style={{
                  backgroundColor: role === r ? (r === 'siswa' ? '#C0392B' : '#1E8449') : 'white',
                  color: role === r ? 'white' : '#333'
                }}>
                {r === 'siswa' ? '🎒 Siswa' : '📚 Guru'}
              </button>
            ))}
          </div>

          {/* Hint demo */}
          <div className="mb-4 p-3 rounded-2xl text-xs font-semibold text-center"
            style={{ backgroundColor: '#FEF9E7', color: '#666' }}>
            Demo: <span className="font-black">{akunDemo[role].email}</span>
            {' / '}
            <span className="font-black">{akunDemo[role].password}</span>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Email</label>
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="masukkan email..."
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none"
              style={{ border: '2px solid #ddd', backgroundColor: '#FAFAFA' }} />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Password</label>
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="masukkan password..."
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none"
              style={{ border: '2px solid #ddd', backgroundColor: '#FAFAFA' }} />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl text-sm font-bold text-center"
              style={{ backgroundColor: '#FADBD8', color: '#C0392B' }}>
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-black text-lg
                       active:scale-95 transition-transform disabled:opacity-60"
            style={{ backgroundColor: role === 'siswa' ? '#C0392B' : '#1E8449' }}>
            {loading ? '⏳ Memuat...' : 'Masuk'}
          </button>
        </div>

        <button onClick={() => navigate('/')}
          className="mt-5 text-sm font-bold" style={{ color: '#666' }}>
          ← Kembali ke Menu
        </button>
      </div>

      {/* Stripe bawah */}
      <div style={{ height: 12, background: STRIPE_BAWAH, flexShrink: 0 }} />

    </div>
  )
}

export default LoginPage
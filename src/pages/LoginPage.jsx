import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useGame()

  const [role, setRole] = useState('siswa')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Akun dummy untuk demo — nanti diganti Firebase
  const akunDemo = {
    siswa: { email: 'siswa@demo.com', password: 'siswa123' },
    guru: { email: 'guru@demo.com', password: 'guru123' }
  }

  function handleLogin() {
    setError('')

    if (!email || !password) {
      setError('Email dan password tidak boleh kosong.')
      return
    }

    setLoading(true)

    setTimeout(() => {
      const akun = akunDemo[role]
      if (email === akun.email && password === akun.password) {
        // Simpan info user ke context
        login({ email, role })

        // Redirect berdasarkan role
        navigate(role === 'siswa' ? '/' : '/dashboard-guru')
      } else {
        setError('Email atau password salah. Coba lagi.')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#FDFBE4' }}>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🍰</div>
        <h1 className="text-2xl font-black" style={{ color: '#C0392B' }}>
          The Great Riau
        </h1>
        <p className="text-gray-500 font-semibold">Masuk ke akunmu</p>
      </div>

      {/* Card Login */}
      <div className="bg-white rounded-3xl p-6 md:p-10 w-full max-w-sm md:max-w-lg shadow-lg">

        {/* Toggle Role */}
        <div className="flex rounded-2xl overflow-hidden mb-6"
          style={{ border: '2px solid #ddd' }}>
          <button
            onClick={() => setRole('siswa')}
            className="flex-1 py-3 font-bold text-sm transition-colors"
            style={{
              backgroundColor: role === 'siswa' ? '#C0392B' : 'white',
              color: role === 'siswa' ? 'white' : '#333'
            }}>
            🎒 Siswa
          </button>
          <button
            onClick={() => setRole('guru')}
            className="flex-1 py-3 font-bold text-sm transition-colors"
            style={{
              backgroundColor: role === 'guru' ? '#1E8449' : 'white',
              color: role === 'guru' ? 'white' : '#333'
            }}>
            📚 Guru
          </button>
        </div>

        {/* Hint akun demo */}
        <div className="mb-4 p-3 rounded-2xl text-xs font-semibold text-center"
          style={{ backgroundColor: '#FEF9E7', color: '#666' }}>
          Demo {role}: <span className="font-black">{akunDemo[role].email}</span>
          {' / '}
          <span className="font-black">{akunDemo[role].password}</span>
        </div>

        {/* Input Email */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1" style={{ color: '#333' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="masukkan email..."
            className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none"
            style={{ border: '2px solid #ddd', backgroundColor: '#FAFAFA' }}
          />
        </div>

        {/* Input Password */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1" style={{ color: '#333' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="masukkan password..."
            className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none"
            style={{ border: '2px solid #ddd', backgroundColor: '#FAFAFA' }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl text-sm font-bold text-center"
            style={{ backgroundColor: '#FADBD8', color: '#C0392B' }}>
            {error}
          </div>
        )}

        {/* Tombol Login */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-black text-lg
                     active:scale-95 transition-transform disabled:opacity-60"
          style={{ backgroundColor: role === 'siswa' ? '#C0392B' : '#1E8449' }}>
          {loading ? '⏳ Memuat...' : 'Masuk'}
        </button>

      </div>

      {/* Tombol kembali */}
      <button
        onClick={() => navigate('/')}
        className="mt-6 text-sm font-bold"
        style={{ color: '#666' }}>
        ← Kembali ke Menu
      </button>

    </div>    
  )
}

export default LoginPage
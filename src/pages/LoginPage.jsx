import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { login, registerSiswa, registerGuru } from '../lib/auth'

function parseError(message) {
  if (message.includes('Invalid login credentials'))
    return 'Email atau password salah.'
  if (message.includes('Email not confirmed'))
    return 'Email belum dikonfirmasi.'
  if (message.includes('User already registered'))
    return 'Email ini sudah terdaftar.'
  if (message.includes('Password should be'))
    return 'Password minimal 6 karakter.'
  if (message.includes('Kode kelas tidak ditemukan'))
    return 'Kode kelas tidak valid.'
  return message
}

function LoginPage() {
  const { login: loginCtx } = useGame()

  const [mode,      setMode]      = useState('login')
  const [role,      setRole]      = useState('siswa')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [nama,      setNama]      = useState('')
  const [kodeKelas, setKodeKelas] = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sukses,    setSukses]    = useState('')

  async function handleLogin() {
    setError('')
    if (!email || !password) { setError('Email dan password wajib diisi.'); return }
    setLoading(true)
    try {
      await login({ email, password })
      // Redirect dihandle otomatis oleh RootRoute di App.jsx
    } catch (err) {
      setError(parseError(err.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    setError('')
    if (!nama || !email || !password) { setError('Semua kolom wajib diisi.'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return }
    if (role === 'siswa' && !kodeKelas) { setError('Kode kelas wajib diisi.'); return }
    setLoading(true)
    try {
      if (role === 'siswa') {
        await registerSiswa({ email, password, namaLengkap: nama,
                               kodeKelas: kodeKelas.trim().toUpperCase() })
      } else {
        await registerGuru({ email, password, namaLengkap: nama })
      }
      setSukses('Registrasi berhasil! Silakan login.')
      setMode('login')
      setPassword(''); setNama(''); setKodeKelas('')
    } catch (err) {
      setError(parseError(err.message))
    } finally {
      setLoading(false)
    }
  }

  function switchMode(m) {
    setMode(m); setError(''); setSukses(''); setShowPass(false)
  }

  // ── Form Section ──────────────────────────────────────────────────
  const FormSection = (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">

      {/* Toggle Login/Register */}
      <div className="flex rounded-2xl overflow-hidden"
        style={{ border: '2px solid #ddd' }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className="flex-1 py-3 font-bold text-sm transition-colors"
            style={{
              backgroundColor: mode === m ? '#C0392B' : 'white',
              color: mode === m ? 'white' : '#333',
              border: 'none', cursor: 'pointer'
            }}>
            {m === 'login' ? '🔑 Masuk' : '📝 Daftar'}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl p-5 shadow-lg">

        {/* Toggle Role — register saja */}
        {mode === 'register' && (
          <div className="flex rounded-2xl overflow-hidden mb-4"
            style={{ border: '2px solid #ddd' }}>
            {['siswa', 'guru'].map(r => (
              <button key={r} onClick={() => { setRole(r); setError('') }}
                className="flex-1 py-2 font-bold text-sm transition-colors"
                style={{
                  backgroundColor: role === r
                    ? (r === 'siswa' ? '#C0392B' : '#1E8449') : 'white',
                  color: role === r ? 'white' : '#333',
                  border: 'none', cursor: 'pointer'
                }}>
                {r === 'siswa' ? '🎒 Siswa' : '📚 Guru'}
              </button>
            ))}
          </div>
        )}

        {/* Nama */}
        {mode === 'register' && (
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">Nama Lengkap</label>
            <input type="text" value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="masukkan nama lengkap..."
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none"
              style={{ border: '2px solid #ddd', backgroundColor: '#FAFAFA' }} />
          </div>
        )}

        {/* Kode Kelas — siswa register saja */}
        {mode === 'register' && role === 'siswa' && (
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">Kode Kelas</label>
            <input type="text" value={kodeKelas}
              onChange={e => setKodeKelas(e.target.value.toUpperCase())}
              placeholder="contoh: ABC123"
              maxLength={6}
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold
                         outline-none tracking-widest"
              style={{ border: '2px solid #ddd', backgroundColor: '#FAFAFA' }} />
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Minta kode kelas dari gurumu
            </p>
          </div>
        )}

        {/* Email */}
        <div className="mb-3">
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
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="masukkan password..."
              onKeyDown={e => e.key === 'Enter' &&
                (mode === 'login' ? handleLogin() : handleRegister())}
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold
                         outline-none pr-12"
              style={{ border: '2px solid #ddd', backgroundColor: '#FAFAFA' }} />
            <button type="button"
              onClick={() => setShowPass(p => !p)}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#aaa',
                display: 'flex', alignItems: 'center'
              }}>
              {showPass ? (
                // Ikon "sembunyikan" — mata dengan garis coret
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
                          a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
                          a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                // Ikon "tampilkan" — mata normal
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error & Sukses */}
        {error && (
          <div className="mb-3 p-3 rounded-2xl text-sm font-bold text-center"
            style={{ backgroundColor: '#FADBD8', color: '#C0392B' }}>
            {error}
          </div>
        )}
        {sukses && (
          <div className="mb-3 p-3 rounded-2xl text-sm font-bold text-center"
            style={{ backgroundColor: '#D5F5E3', color: '#1E8449' }}>
            {sukses}
          </div>
        )}

        {/* Tombol Submit */}
        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-black text-lg
                     active:scale-95 transition-transform disabled:opacity-60"
          style={{
            backgroundColor: mode === 'register' && role === 'guru'
              ? '#1E8449' : '#C0392B',
            border: 'none', cursor: 'pointer'
          }}>
          {loading ? '⏳ Memuat...' : mode === 'login' ? 'Masuk' : 'Daftar'}
        </button>
      </div>
    </div>
  )

  // ── Main Render ───────────────────────────────────────────────────
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column',
                  backgroundColor: '#FDFBE4' }}>

      {/* ── Desktop: Split Screen ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">

        {/* Kiri — Branding */}
        <div className="w-2/5 flex flex-col items-center justify-center px-8"
          style={{ backgroundColor: '#C0392B' }}>
          <img src="/assets/maskot.png" alt="maskot"
            style={{ width: '12rem', height: '12rem',
                     objectFit: 'contain', marginBottom: '1.5rem',
                     filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900,
                       color: 'white', textAlign: 'center',
                       marginBottom: '0.25rem' }}>
            The Great Riau
          </h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700,
                       color: '#F1C40F', textAlign: 'center',
                       marginBottom: '1rem' }}>
            Math-Biz Mania
          </h2>
          <div style={{
            width: '8rem', height: '0.5rem', borderRadius: '9999px',
            background: 'repeating-linear-gradient(90deg,#F1C40F 0,#F1C40F 12px,white 12px,white 24px)'
          }} />
          <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.8)',
                      fontWeight: 600, textAlign: 'center',
                      fontSize: '0.9rem', lineHeight: 1.6,
                      maxWidth: '18rem' }}>
            Jadilah Pengusaha Kue Tradisional Riau! Asah kemampuan matematikamu
            sambil membangun usaha yang menguntungkan.
          </p>
        </div>

        {/* Kanan — Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900,
                       color: '#333', marginBottom: '1.5rem' }}>
            {mode === 'login' ? 'Masuk ke Akunmu' : 'Buat Akun Baru'}
          </h2>
          {FormSection}
        </div>
      </div>

      {/* ── Mobile: Stack ── */}
      <div className="md:hidden flex flex-col flex-1 overflow-y-auto">

        {/* Header mobile */}
        <div className="flex flex-col items-center pt-6 pb-4 px-4"
          style={{ backgroundColor: '#C0392B' }}>
          <img src="/assets/maskot.png" alt="maskot"
            style={{ width: '6rem', height: '6rem',
                     objectFit: 'contain', marginBottom: '0.75rem' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900,
                       color: 'white', textAlign: 'center' }}>
            The Great Riau
          </h1>
          <h2 style={{ fontSize: '1rem', fontWeight: 700,
                       color: '#F1C40F', textAlign: 'center' }}>
            Math-Biz Mania
          </h2>
        </div>

        {/* Form mobile */}
        <div className="flex-1 px-4 py-6"
          style={{ backgroundColor: '#FDFBE4' }}>
          {FormSection}
        </div>

      </div>

    </div>
  )
}

export default LoginPage
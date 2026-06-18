import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useGame } from './context/GameContext'

import LoginPage          from './pages/LoginPage'
import GameHubPage        from './pages/GameHubPage'
import ReviewPage         from './pages/ReviewPage'

import RancanganUsahaPage from './pages/eksplorasi/RancanganUsahaPage'
import DapurProduksiPage  from './pages/eksplorasi/DapurProduksiPage'
import BertemuPembeli     from './pages/eksplorasi/BertemuPembeli'

import DashboardGuruPage from './pages/guru/DashboardGuruPage'
import DetailKelasPage   from './pages/guru/DetailKelasPage'
import DetailSiswaPage   from './pages/guru/DetailSiswaPage'

// ── Guard untuk halaman yang butuh login ─────────────────────────
function RequireAuth({ children, allowedRole }) {
  const { user, authLoading } = useGame()

  if (authLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />

  return children
}

// ── Loading Screen ────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#FDFBE4'
    }}>
      <div className="text-center">
        <img src="/assets/maskot.png" alt="maskot"
          style={{ width: '6rem', height: '6rem',
                   objectFit: 'contain', marginBottom: '1rem' }} />
        <p className="font-bold text-gray-400">Memuat...</p>
      </div>
    </div>
  )
}

// ── Root Route — smart berdasarkan auth state ─────────────────────
function RootRoute() {
  const { user, authLoading } = useGame()

  if (authLoading) return <LoadingScreen />
  if (!user) return <LoginPage />
  if (user.role === 'guru') return <Navigate to="/dashboard-guru" replace />
  return <GameHubPage />
}

function App() {
  const { dataLoading } = useGame()

  if (dataLoading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>
        {/* Root — smart route */}
        <Route path="/" element={<RootRoute />} />

        {/* Siswa */}
        <Route path="/review" element={
          <RequireAuth allowedRole="siswa"><ReviewPage /></RequireAuth>
        } />
        <Route path="/eksplorasi/rancangan-usaha" element={
          <RequireAuth allowedRole="siswa"><RancanganUsahaPage /></RequireAuth>
        } />
        <Route path="/eksplorasi/dapur-produksi" element={
          <RequireAuth allowedRole="siswa"><DapurProduksiPage /></RequireAuth>
        } />
        <Route path="/eksplorasi/bertemu-pembeli" element={
          <RequireAuth allowedRole="siswa"><BertemuPembeli /></RequireAuth>
        } />

        {/* Guru */}
        <Route path="/dashboard-guru" element={
          <RequireAuth allowedRole="guru"><DashboardGuruPage /></RequireAuth>
        } />
        <Route path="/dashboard-guru/kelas/:id" element={
          <RequireAuth allowedRole="guru"><DetailKelasPage /></RequireAuth>
        } />
        <Route path="/dashboard-guru/kelas/:kelasId/siswa/:siswaId" element={
          <RequireAuth allowedRole="guru"><DetailSiswaPage /></RequireAuth>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
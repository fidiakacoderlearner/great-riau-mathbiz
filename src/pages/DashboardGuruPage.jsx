import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

function DashboardGuruPage() {
  const navigate = useNavigate()
  const { user, logout } = useGame()

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#FDFBE4' }}>
      <h1 className="text-2xl font-black mb-2" style={{ color: '#1E8449' }}>
        📚 Dashboard Guru
      </h1>
      <p className="font-semibold text-gray-500 mb-2">
        Halo, {user?.namaLengkap}!
      </p>
      <p className="text-sm text-gray-400 mb-6">Segera hadir.</p>
      <button onClick={logout}
        className="py-3 px-8 rounded-2xl font-bold text-sm"
        style={{ backgroundColor: '#eee', color: '#666',
                 border: 'none', cursor: 'pointer' }}>
        Keluar
      </button>
    </div>
  )
}

export default DashboardGuruPage
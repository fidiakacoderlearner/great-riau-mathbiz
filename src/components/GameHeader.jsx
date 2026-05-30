import { useNavigate } from 'react-router-dom'
import XPBar from './XPBar'

function GameHeader({ badge, badgeWarna = '#C0392B', timerEl = null }) {
  const navigate = useNavigate()

  return (
    <div className="shrink-0 px-4 pt-3 pb-2 border-b-2"
      style={{ borderColor: '#ddd', backgroundColor: '#FDFBE4' }}>

      {/* Mobile: 2 baris | Desktop: 1 baris */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">

        {/* Baris 1 (mobile) / Kiri (desktop): XP */}
        <div className="flex items-center justify-between">
          <XPBar />
          {/* Tombol home mobile — hanya tampil di mobile */}
          <button
            onClick={() => navigate('/')}
            className="md:hidden px-3 py-1 rounded-xl text-sm font-bold"
            style={{ backgroundColor: '#eee', color: '#666',
                     border: 'none', cursor: 'pointer' }}>
            🏠
          </button>
        </div>

        {/* Baris 2 (mobile) / Kanan (desktop): Badge + Timer + Menu */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: badgeWarna }}>
            {badge}
          </span>
          <div className="flex items-center gap-2">
            {/* Slot timer — diisi dari parent */}
            {timerEl}
            {/* Tombol menu desktop */}
            <button
              onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-1 px-3 py-1
                         rounded-xl text-sm font-bold"
              style={{ backgroundColor: '#eee', color: '#666',
                       border: 'none', cursor: 'pointer' }}>
              🏠 Menu
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default GameHeader
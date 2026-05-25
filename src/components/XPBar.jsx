import { useGame } from '../context/GameContext'

function XPBar() {
  const { xp } = useGame()

  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-xl"
      style={{ backgroundColor: '#FEF9E7', border: '2px solid #F1C40F' }}>
      <span className="text-lg">⭐</span>
      <span className="font-black text-sm" style={{ color: '#333' }}>
        {xp} XP
      </span>
    </div>
  )
}

export default XPBar
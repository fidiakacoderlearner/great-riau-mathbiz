import { useGame } from '../context/GameContext'

function XPBar() {
  const { xp } = useGame()

  const maxXP = 65 // 50 (waktu) + 15 (first try)
  const persentase = Math.min((xp / maxXP) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <span className="font-black text-sm" style={{ color: '#C0392B' }}>XP</span>
      <div className="w-32 h-4 rounded-full overflow-hidden"
        style={{ backgroundColor: '#ddd' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${persentase}%`,
            backgroundColor: '#F1C40F'
          }}>
        </div>
      </div>
      <span className="text-sm font-bold">{xp}</span>
    </div>
  )
}

export default XPBar
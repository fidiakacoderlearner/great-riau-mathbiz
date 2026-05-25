import { createContext, useContext, useState } from 'react'

const GameContext = createContext()

export function GameProvider({ children }) {
  const [xp, setXp] = useState(0)
  const [hintDigunakan, setHintDigunakan] = useState(false)
  const [isFirstTry, setIsFirstTry] = useState(true)
  const [soalSelesai, setSoalSelesai] = useState([])

  // Auth state
  const [user, setUser] = useState(null)
  // user = null artinya belum login
  // user = { email, role } artinya sudah login

  function login(userData) {
    setUser(userData)
  }

  function logout() {
    setUser(null)
  }

  function tambahXP(jumlah) {
    setXp(prev => prev + jumlah)
  }

  function kurangiXP(ratio) {
    setXp(prev => Math.floor(prev - (prev * ratio)))
  }

  function resetSoal() {
    setHintDigunakan(false)
    setIsFirstTry(true)
  }

  function tandaiSelesai(soalId) {
    setSoalSelesai(prev => [...prev, soalId])
  }

  return (
    <GameContext.Provider value={{
      xp, tambahXP, kurangiXP,
      hintDigunakan, setHintDigunakan,
      isFirstTry, setIsFirstTry,
      soalSelesai, tandaiSelesai,
      resetSoal,
      user, login, logout
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
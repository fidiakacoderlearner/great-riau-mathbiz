import { createContext, useContext, useState } from 'react'

const GameContext = createContext()

export function GameProvider({ children }) {
  const [xp, setXp]   = useState(0)
  const [user, setUser] = useState(null)

  function tambahXP(jumlah) {
    setXp(prev => prev + Math.max(0, jumlah))
  }

  function login(userData)  { setUser(userData) }
  function logout()         { setUser(null) }

  return (
    <GameContext.Provider value={{ xp, tambahXP, user, login, logout }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
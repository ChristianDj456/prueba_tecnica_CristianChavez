import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

type User = { id: string; email: string; role: 'ADMIN' | 'OPERATOR' }
type AuthCtx = {
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('auth')
    if (saved) {
      try {
        const { token, user } = JSON.parse(saved)
        setToken(token ?? null)
        setUser(user ?? null)
      } catch { }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify({ token, user }))
  }, [token, user])

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.access_token)
    setUser(data.user)
    const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${data.access_token}` }})
    setUser(prev => ({ ...prev!, ...me.data }))
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth')
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

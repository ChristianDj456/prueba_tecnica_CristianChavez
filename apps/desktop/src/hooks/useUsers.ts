import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { type UserRow, getUsers } from '../lib/api'

export function useUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true); setError(null)
    try { setUsers(await getUsers(token)) }
    catch (e: any) { setError(e?.response?.data?.message || 'Error cargando usuarios') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (token) fetchUsers() }, [token])

  return { users, loading, error, refresh: fetchUsers }
}

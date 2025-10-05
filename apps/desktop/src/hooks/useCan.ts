import { useAuth } from '../context/AuthContext'
import { type Action, canByRole } from '../auth/permissions'

export function useCan(action: Action) {
  const { user } = useAuth()
  return canByRole(user?.role as any, action)
}

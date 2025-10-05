import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext'
import type { Role } from '../auth/permissions';

export default function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { user } = useAuth()
  if (!user || !allow.includes(user.role)) return null
  return <>{children}</>
}

export type Role = 'ADMIN' | 'OPERATOR'

export type Action =
  | 'employee.create'
  | 'employee.update'
  | 'employee.delete'
  | 'user.read'
  | 'user.create'
  | 'user.update'
  | 'user.delete'

const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  ADMIN: [
    'employee.create', 'employee.update', 'employee.delete',
    'user.read', 'user.create', 'user.update', 'user.delete',
  ],
  OPERATOR: [
    'employee.create', 'employee.update',
  ],
}

export function canByRole(role: Role | null | undefined, action: Action): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false
}

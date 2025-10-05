import { useState, useMemo } from 'react'
import { useUsers } from '../hooks/useUsers'
import { useAuth } from '../context/AuthContext'
import { createUserApi, updateUserApi, deleteUserApi, type UserRow } from '../lib/api'
import UserForm from './users/UserForm'
import toast from 'react-hot-toast'
import RoleGate from '../components/RoleGate'
import type { Role } from '../auth/permissions'

import Table from '../components/Table'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PlusIcon, Loader2 } from 'lucide-react'

export default function UsersPage() {
  const { users, loading, error, refresh } = useUsers()
  const { token } = useAuth()
  const [editing, setEditing] = useState<UserRow | null>(null)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  async function handleCreate(v: any) {
    await toast.promise(createUserApi(token, v), { loading: 'Creando...', success: 'Usuario creado', error: 'Error creando' })
    setIsAddModalOpen(false)
    refresh()
  }
  async function handleUpdate(v: any) {
    if (!editing) return
    await toast.promise(updateUserApi(token, editing.id, v), { loading: 'Actualizando...', success: 'Usuario actualizado', error: 'Error actualizando' })
    setEditing(null)
    setIsEditModalOpen(false)
    refresh()
  }
  async function handleDelete(id: string) {
    await toast.promise(deleteUserApi(token, id), { loading: 'Eliminando...', success: 'Usuario eliminado', error: 'Error eliminando' })
    refresh()
  }

  const confirmDelete = async () => {
    if (!selectedUser) return
    await handleDelete(selectedUser.id)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }

  const cols = useMemo(() => ([
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Rol' },
    { key: 'createdAt', header: 'Creado', render: (u: UserRow) => new Date(u.createdAt).toLocaleString() },
    {
      key: 'actions', header: 'Acciones', render: (u: UserRow) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => {
              setEditing(u)
              setIsEditModalOpen(true)
            }}
          >Editar</Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => {
              setSelectedUser(u)
              setIsDeleteModalOpen(true)
            }}
          >
            Eliminar</Button>
        </div>
      )
    },
  ]), [])

  return (
    <RoleGate allow={['ADMIN' as Role]}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>

          <div className="overflow-hidden rounded-lg bg-white shadow-md">

            <div className="border-b border-gray-200 p-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setIsAddModalOpen(true)
                  }}
                  className="flex items-center"
                >
                  <PlusIcon size={16} className="mr-2" />
                  Nuevo usuario
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg bg-white shadow-md">

              {loading && (
                <div className="absolute inset-0 z-[5] bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="inline-flex items-center text-gray-700">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Cargando…
                  </span>
                </div>
              )}

              {error && <div className="p-4 font-medium text-red-600">{String(error)}</div>}

              {users.length > 0 ? (
                <Table
                columns={cols as any}
                rows={users}
              />
              ) : (
                !loading && <div className="p-6 text-gray-600">No hay usuarios</div>
              )}
            </div>
          </div>
        </div>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
          }}
          title="Crear usuario"
        >
          <UserForm onSubmit={handleCreate} onCancel={() => setIsAddModalOpen(false)} />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditing(null)
          }}
          title="Editar usuario"
        >
          {editing && (
            <UserForm
              isEdit
              defaultValues={{ email: editing.email, role: editing.role }}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false)
                setEditing(null)
              }}
            />
          )}
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedUser(null)
          }}
          title="Eliminar usuario"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Eliminar
              </Button>
            </>
          }
        >
          <p>
            ¿Está seguro que desea eliminar al usuario{' '}
            <strong>{selectedUser?.email}</strong>? Esta acción no se puede deshacer.
          </p>
        </Modal>
      </div>
    </RoleGate>
  )
}

import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, SearchIcon, FileSpreadsheetIcon, Loader2, FileTextIcon } from 'lucide-react'

import Table from '../components/Table'
import EmployeeForm from './employees/EmployeeForm'
import { DeductionsView } from '../pages/employees/DeductionsView'
import { useEmployees } from '../hooks/useEmployees'
import { useAuth } from '../context/AuthContext'
import { createEmployee, updateEmployee, deleteEmployee } from '../lib/api'
import type { EmployeeFormValues } from './employees/employee.schema'
import { useCan } from '../hooks/useCan'

import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { formatCurrency } from '../utils/calculations'



export default function EmployeesPage() {
  const { data, loading, error, search, setSearch, page, setPage, size, setSize, exportExcel, refresh,
    openCertificate, closeCertificate, certOpen, certUrl, certFilename, certEmployeeName, openingId } = useEmployees(10)

  const { token } = useAuth();
  const [editing, setEditing] = useState<{ id: string; defaults: Partial<EmployeeFormValues> } | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleting, setDeleting] = useState<null | { id: string; fullName: string }>(null)

  const [isDeductionsOpen, setIsDeductionsOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)

  const canCreate = useCan('employee.create')
  const canUpdate = useCan('employee.update')
  const canDelete = useCan('employee.delete')



  async function handleCreate(values: EmployeeFormValues) {
    await toast.promise(createEmployee(token, values), {
      loading: 'Guardando empleado...',
      success: 'Empleado creado',
      error: 'No se pudo crear',
    });
    setIsAddOpen(false)
    setPage(1)
    refresh()
  }

  async function handleUpdate(values: EmployeeFormValues) {
    if (!editing) return;
    await toast.promise(updateEmployee(token, editing.id, values), {
      loading: 'Actualizando empleado...',
      success: 'Empleado actualizado',
      error: 'No se pudo actualizar',
    });
    setEditing(null)
    setPage(1)
    refresh()
  }

  async function confirmDelete() {
    if (!deleting) return
    await toast.promise(deleteEmployee(token, deleting.id), {
      loading: 'Eliminando...',
      success: 'Empleado eliminado',
      error: 'No se pudo eliminar',
    })
    setDeleting(null)
    setPage(1)
    refresh()
  }


  const cols = useMemo(() => ([
    { key: 'firstName', header: 'Nombre' },
    { key: 'lastName', header: 'Apellido' },
    { key: 'nationalId', header: 'Cédula' },
    { key: 'bloodType', header: 'Sangre' },
    { key: 'phone', header: 'Teléfono' },
    { key: 'salary', header: 'Salario', render: (r: any) => formatCurrency(r.salary) },
    { key: 'arl', header: 'ARL', render: (r: any) => r.arl?.name },
    { key: 'eps', header: 'EPS', render: (r: any) => r.eps?.name },
    { key: 'pensionFund', header: 'Fondo', render: (r: any) => r.pensionFund?.name },

    {
      key: 'status',
      header: 'Estado',
      render: (r: any) => {
        const t = r.terminationDate ? new Date(r.terminationDate) : null;
        const today = new Date();
        const inactive = t && t <= new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return <span className={inactive ? 'text-red-600' : 'text-green-700'}>
          {inactive ? 'Inactivo' : 'Activo'}
        </span>;
      }
    },

    {
      key: 'terminationDate',
      header: 'Fecha retiro',
      render: (r: any) => r.terminationDate
        ? new Date(r.terminationDate).toLocaleDateString('es-CO')
        : '—'
    },

    {
      key: 'actions', header: 'Acciones', render: (r: any) => (
        <div className="flex space-x-2">
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing({
                id: r.id,
                defaults: {
                  firstName: r.firstName,
                  lastName: r.lastName,
                  nationalId: r.nationalId,
                  bloodType: r.bloodType,
                  phone: r.phone,
                  salary: String(r.salary),
                  arlId: r.arl?.id,
                  epsId: r.eps?.id,
                  pensionFundId: r.pensionFund?.id,
                  terminationDate: r.terminationDate ? String(r.terminationDate).slice(0, 10) : '',
                }
              })}
            >Editar</Button>
          )}
          {/* {canDelete && <button onClick={() => handleDelete(r.id)}>Eliminar</button>} */}
          <Button
            variant="outline"
            size="sm"
            disabled={!canDelete}
            title={!canDelete ? 'No tienes permiso' : ''}
            onClick={() => setDeleting({ id: r.id, fullName: `${r.firstName} ${r.lastName}` })}
          >Eliminar</Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSelectedEmployee(r); setIsDeductionsOpen(true) }}
          >
            Ver deducciones
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={openingId === r.id}
            onClick={() => openCertificate(r.id, token ?? '', `${r.firstName} ${r.lastName}`)}
            title="Ver certificado laboral"
          >
            <FileTextIcon className="mr-2 h-4 w-4" />
            {openingId === r.id ? 'Abriendo…' : 'Certificado'}
          </Button>
        </div>
      )
    },
  ]), [canDelete, canUpdate])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Gestión de Empleados</h1>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="relative w-full max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input className="w-full pl-9" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <select value={size} onChange={e => setSize(Number(e.target.value))} className="rounded-md border border-gray-300 bg-white py-1.5 px-2 text-sm shadow-sm focus:border-red-600 focus:ring-1 focus:ring-red-600">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>

            <Button onClick={exportExcel} variant="outline" className="inline-flex items-center" disabled={loading}>
              <FileSpreadsheetIcon size={16} className="mr-1" />Exportar Excel
            </Button>

            {canCreate && (
              <Button onClick={() => setIsAddOpen(true)} className="inline-flex items-center" disabled={loading}>
                <PlusIcon size={16} className="mr-2" /> Nuevo
              </Button>
            )}
          </div>
        </div>

        {error && <div className="font-medium text-red-600">{String(error)}</div>}

        <div className="relative overflow-hidden rounded-lg bg-white shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-[5] bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="inline-flex items-center text-gray-700">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando…
              </span>
            </div>
          )}

          {data ? (
            <Table columns={cols as any} rows={data.items} />
          ) : (
            !loading && <div className="p-6 text-gray-500">No hay datos</div>
          )}
        </div>



        {data && <>
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-white p-4 shadow-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-700">Página {page} / {data.pages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
            <span style={{ marginLeft: 'auto' }}>{data.total} resultados</span>
          </div>
        </>}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nuevo empleado">
        <EmployeeForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} />
      </Modal>


      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar empleado">
        {editing && (
          <EmployeeForm defaultValues={editing.defaults} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        )}
      </Modal>


      <Modal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        title="Eliminar empleado"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
          </div>
        }
      >
        <p className="text-gray-700">
          ¿Está seguro que desea eliminar a <strong>{deleting?.fullName}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>

      <Modal
        isOpen={certOpen}
        onClose={closeCertificate}
        title={`Certificado laboral – ${certEmployeeName || ''}`}
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!certUrl) return;
                const a = document.createElement('a');
                a.href = certUrl;
                a.download = certFilename;  // ← nombre desde backend
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
            >
              Descargar
            </Button>
            <Button variant="outline" onClick={closeCertificate}>Cerrar</Button>
          </div>
        }
      >
        <div className="h-[80vh] w-full">
          {certUrl ? (
            <iframe
              src={certUrl}
              title="Certificado laboral"
              className="h-full w-full rounded-md border"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Cargando…
            </div>
          )}
        </div>
      </Modal>

      <DeductionsView
        isOpen={isDeductionsOpen}
        onClose={() => setIsDeductionsOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  )
}

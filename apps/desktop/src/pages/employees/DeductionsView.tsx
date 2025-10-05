import { useEffect, useState, useMemo } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../utils/calculations'
import { useAuth } from '../../context/AuthContext'
import { getPayrollPreview } from '../../lib/api'

interface DeductionsViewProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: any | null
}
export const DeductionsView = ({
  isOpen,
  onClose,
  employee
}: DeductionsViewProps) => {

  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<null | {
    salaryGross: number
    employeeEps: number
    employerEps: number
    employeePension: number
    employerPension: number
    netSalary: number
  }>(null)

  const first = employee?.firstName ?? employee?.nombre ?? ''
  const last = employee?.lastName ?? employee?.apellido ?? ''

  const doc = employee?.nationalId ?? employee?.cedula ?? ''
  const rawSalary = employee?.salary ?? employee?.salario
  const salaryNum = typeof rawSalary === 'number'
    ? rawSalary
    : parseFloat(String(rawSalary ?? '').replace(/\D/g, '')) || 0

  const employeeId = employee?.id

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isOpen || !employeeId) return
      setLoading(true)
      setError(null)
      setData(null)
      try {
        const res = await getPayrollPreview(token, employeeId)
        if (!cancelled) setData(res)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'No se pudo calcular las deducciones (usando cálculo local).')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isOpen, employeeId, token])

  const values = useMemo(() => {
    if (data) {
      return {
        salaryGross: data.salaryGross,
        epsEmp: data.employeeEps,
        epsEr: data.employerEps,
        penEmp: data.employeePension,
        penEr: data.employerPension,
        net: data.netSalary,
      }
    }
    const epsEmp = salaryNum * 0.04
    const penEmp = salaryNum * 0.04
    const epsEr = salaryNum * 0.04
    const penEr = salaryNum * 0.04
    const net = Math.max(0, salaryNum - (epsEmp + penEmp))
    return {
      salaryGross: salaryNum,
      epsEmp,
      epsEr,
      penEmp,
      penEr,
      net,
    }
  }, [data, salaryNum])

  const safeTitle =
    `Deducciones${first || last ? ` — ${first} ${last}` : ''}`

  if (!employee) return null

  return <Modal isOpen={isOpen} onClose={onClose} title={safeTitle} footer={<Button onClick={onClose}>Cerrar</Button>}>
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium">Información del empleado</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nombre completo</p>
            <p className="font-medium">{[first, last].filter(Boolean).join(' ') || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cédula</p>
            <p className="font-medium">{doc || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Salario base</p>
            <p className="font-medium">{formatCurrency(values.salaryGross)}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Cálculo de deducciones</h3>

        <div className="rounded-md bg-gray-50 p-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm font-medium">EPS (4%)</p>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Aporte empleado</p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(values.epsEmp)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aporte empleador</p>
                  <p className="font-medium">{formatCurrency(values.epsEr)}</p>
                </div>
              </div>
            </div>

            <div className="col-span-2 mt-4">
              <p className="text-sm font-medium">Pensión (4%)</p>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Aporte empleado</p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(values.penEmp)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aporte empleador</p>
                  <p className="font-medium">{formatCurrency(values.penEr)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            {loading && (
              <div className="mb-2 text-sm text-gray-600">Calculando deducciones…</div>
            )}
            {error && (
              <div className="mb-2 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
            <div className="flex justify-between">
              <p className="font-medium">Total deducciones empleado:</p>
              <p className="font-medium text-red-600">
                {formatCurrency(values.epsEmp + values.penEmp)}
              </p>
            </div>
            <div className="mt-2 flex justify-between">
              <p className="font-medium">Salario neto a pagar:</p>
              <p className="text-lg font-bold">{formatCurrency(values.net)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
}
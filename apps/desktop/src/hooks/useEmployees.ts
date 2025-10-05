import { useEffect, useMemo, useState } from 'react'
import { api, authHeaders } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export type Employee = {
    id: string
    firstName: string
    lastName: string
    nationalId: string
    bloodType: string
    phone: string
    salary: string
    arl: { id: string; name: string }
    eps: { id: string; name: string }
    pensionFund: { id: string; name: string }
    createdAt: string
}

type ListResponse = {
    items: Employee[]
    total: number
    page: number
    size: number
    pages: number
}

export function useEmployees(initialSize = 10) {
    const { token } = useAuth()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(initialSize)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<ListResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const params = useMemo(() => ({ search, page, size }), [search, page, size])

    async function fetchEmployees() {
        setLoading(true); setError(null)
        try {
            const { data } = await api.get<ListResponse>('/employees', {
                params,
                headers: authHeaders(token)
            })
            setData(data)
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Error cargando empleados')
        } finally { setLoading(false) }
    }

    useEffect(() => {
        if (token) fetchEmployees() 
    }, [search, page, size, token])

    async function exportExcel() {
        await toast.promise(
            (async () => {
                const res = await api.get('/employees/export', {
                    params: { search },
                    headers: authHeaders(token),
                    responseType: 'blob'
                });
                const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `empleados_${new Date().toISOString().slice(0, 10)}.xlsx`;
                document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            })(),
            { loading: 'Generando Excel...', success: 'Descarga iniciada', error: 'No se pudo exportar' }
        );
    }

    return { data, loading, error, search, setSearch, page, setPage, size, setSize, exportExcel, refresh: fetchEmployees }
}
